import { productService } from '@/services/product/productService';
import { ProductType } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  category: (categoryId: number) =>
    [...productKeys.lists(), { categoryId }] as const,
};

// Get all products
export function useProducts(options?: UseQueryOptions<ProductType[]>) {
  const [searchTerm, setSearchTerm] = useState('');

  const query = useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productService.getProducts(),
    ...options,
  });

  const filteredProducts = useMemo(() => {
    if (!query.data) return [];
    if (searchTerm.trim() === '') return query.data;

    return query.data.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(
          searchTerm.toLowerCase()
        )
    );
  }, [searchTerm, query.data]);

  // Filter products based on user authentication
  const getFilteredProductsForUser = (user: unknown) => {
    if (!user) {
      return filteredProducts.filter(
        (product) =>
          !['clothing', 'accessories'].includes(
            product.category_id?.toString() || ''
          )
      );
    }
    return filteredProducts;
  };

  return {
    ...query,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    getFilteredProductsForUser,
  };
}

// Get product by ID
export function useProduct(
  productId: string,
  options?: UseQueryOptions<ProductType | null>
) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productService.getProductById(productId),
    ...options,
  });
}

// Get products by category
export function useProductsByCategory(
  categoryId: number,
  options?: UseQueryOptions<ProductType[]>
) {
  return useQuery({
    queryKey: productKeys.category(categoryId),
    queryFn: () => productService.getProductsByCategory(categoryId),
    ...options,
  });
}
