import { useState, useEffect, useMemo } from 'react';
import { ProductType } from '@/types';
import { productService } from '@/services/product/productService';
import { FilterOptions } from '@/hooks/queries/use-products';

interface UseProductsReturn {
  displayProducts: ProductType[];
  loading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  retry: () => void;
}

// Helper function to map category names to category_id
const getCategoryId = (categoryName: string): number | null => {
  const categoryMap: { [key: string]: number } = {
    electronics: 3,
    clothing: 1,
    accessories: 2,
  };
  return categoryMap[categoryName] || null;
};

// Helper function to sort products
const sortProducts = (
  products: ProductType[],
  sortBy: FilterOptions['sortBy']
): ProductType[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
};

// Helper function to filter products
const filterProducts = (
  products: ProductType[],
  filters: FilterOptions
): ProductType[] => {
  let filtered = [...products];

  // Filter by stock
  if (filters.stockFilter === 'in-stock') {
    filtered = filtered.filter((product) => product.stock > 0);
  } else if (filters.stockFilter === 'out-of-stock') {
    filtered = filtered.filter((product) => product.stock === 0);
  }

  // Filter by category
  if (filters.categoryFilter !== 'all') {
    const categoryId = getCategoryId(filters.categoryFilter);
    if (categoryId !== null) {
      filtered = filtered.filter(
        (product) => product.category_id === categoryId
      );
    }
  }

  return filtered;
};

export function useProducts(user: unknown): UseProductsReturn {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'default',
    stockFilter: 'all',
    categoryFilter: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();

      // Check if we got data or if this is an error scenario
      if (data && Array.isArray(data)) {
        setProducts(data);
      } else {
        // This shouldn't happen with current implementation, but handle it
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch products');
      setError(error);
      console.error('Error fetching products:', error);
      // Don't set products to empty array on error to maintain previous state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply search, filters, and sorting
  const processedProducts = useMemo(() => {
    // Start with all products
    let processed = [...products];

    // Apply search filter
    if (searchTerm.trim() !== '') {
      processed = processed.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          )
      );
    }

    // Apply filters
    processed = filterProducts(processed, filters);

    // Apply sorting
    processed = sortProducts(processed, filters.sortBy);

    return processed;
  }, [products, searchTerm, filters]);

  // Filter products based on user authentication
  const displayProducts = user
    ? processedProducts
    : processedProducts.filter(
        (product) => ![1, 2].includes(product.category_id || 0) // 1 = clothing, 2 = accessories
      );

  return {
    displayProducts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    retry: fetchProducts,
  };
}
