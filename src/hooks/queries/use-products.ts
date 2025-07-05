import { productService } from '@/services/product/productService';
import { getProducts } from '@/services/product/getProducts';
import { ProductType } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

// Filter Options Interface
export interface FilterOptions {
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'default';
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  categoryFilter: 'all' | 'electronics' | 'clothing' | 'accessories';
}

// Query Keys - Following TanStack Query key factory pattern
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  category: (categoryId: number) =>
    [...productKeys.lists(), { categoryId }] as const,
  filtered: (filters: FilterOptions, searchTerm: string) =>
    [...productKeys.lists(), { filters, searchTerm }] as const,
};

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

// Enhanced error handling for product queries
const handleProductError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error('Failed to fetch products');
};

// Get all products with improved caching and error handling
export function useProducts(options?: UseQueryOptions<ProductType[]>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'default',
    stockFilter: 'all',
    categoryFilter: 'all',
  });

  const query = useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const data = await getProducts();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 404 or permission errors
      if (
        error instanceof Error &&
        (error.message.includes('404') ||
          error.message.includes('permission') ||
          error.message.includes('unauthorized'))
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false, // Don't throw errors, handle them in component
    ...options,
  });

  // Enhanced filtered products with sorting and filtering
  const processedProducts = useMemo(() => {
    if (!query.data) return [];

    // Start with all products
    let processed = [...query.data];

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
  }, [searchTerm, filters, query.data]);

  // Filter products based on user authentication
  const getFilteredProductsForUser = (user: unknown) => {
    if (!user) {
      return processedProducts.filter(
        (product) => ![1, 2].includes(product.category_id || 0) // 1 = clothing, 2 = accessories
      );
    }
    return processedProducts;
  };

  return {
    ...query,
    products: query.data || [],
    processedProducts,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    getFilteredProductsForUser,
    // Enhanced error handling
    hasError: !!query.error,
    errorMessage: query.error ? handleProductError(query.error).message : null,
    // For backward compatibility
    filteredProducts: processedProducts,
  };
}

// Get product by ID with enhanced error handling
export function useProduct(
  productId: string,
  options?: UseQueryOptions<ProductType | null>
) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const data = await productService.getProductById(productId);
      return data;
    },
    enabled: !!productId, // Only fetch when productId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or permission errors
      if (
        error instanceof Error &&
        (error.message.includes('404') ||
          error.message.includes('not found') ||
          error.message.includes('permission'))
      ) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    ...options,
  });
}

// Get products by category with enhanced error handling
export function useProductsByCategory(
  categoryId: number,
  options?: UseQueryOptions<ProductType[]>
) {
  return useQuery({
    queryKey: productKeys.category(categoryId),
    queryFn: async () => {
      const data = await productService.getProductsByCategory(categoryId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!categoryId && categoryId > 0, // Only fetch when valid categoryId
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or permission errors
      if (
        error instanceof Error &&
        (error.message.includes('404') ||
          error.message.includes('permission') ||
          error.message.includes('unauthorized'))
      ) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    ...options,
  });
}

// Enhanced hook for filtered products with TanStack Query
export function useFilteredProducts(
  user: unknown,
  initialFilters?: Partial<FilterOptions>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'default',
    stockFilter: 'all',
    categoryFilter: 'all',
    ...initialFilters,
  });

  // Use the base products query without additional filtering
  const productsQuery = useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const data = await getProducts();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes('404') ||
          error.message.includes('permission') ||
          error.message.includes('unauthorized'))
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,
  });

  const processedProducts = useMemo(() => {
    if (!productsQuery.data) return [];

    // Start with all products
    let processed = [...productsQuery.data];

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
  }, [searchTerm, filters, productsQuery.data]);

  // Filter products based on user authentication
  const displayProducts = useMemo(() => {
    if (!user) {
      return processedProducts.filter(
        (product) => ![1, 2].includes(product.category_id || 0) // 1 = clothing, 2 = accessories
      );
    }
    return processedProducts;
  }, [user, processedProducts]);

  return {
    displayProducts,
    loading: productsQuery.isLoading,
    error: productsQuery.error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    retry: productsQuery.refetch,
    // Additional TanStack Query properties
    isRefetching: productsQuery.isRefetching,
    isStale: productsQuery.isStale,
    dataUpdatedAt: productsQuery.dataUpdatedAt,
  };
}
