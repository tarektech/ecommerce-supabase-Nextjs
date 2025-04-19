import { useState, useEffect } from 'react';
import { ProductType } from '@/types';
import { productService } from '@/services/product/productService';

export function useProducts(user: any) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          )
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Filter products based on user authentication
  const displayProducts = user
    ? filteredProducts
    : filteredProducts.filter(
        (product) =>
          !['clothing', 'accessories'].includes(
            product.category_id?.toString() || ''
          )
      );

  return {
    displayProducts,
    loading,
    searchTerm,
    setSearchTerm,
  };
}
