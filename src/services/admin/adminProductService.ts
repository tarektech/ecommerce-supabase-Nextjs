import { supabase } from "@/lib/supabase/client";
import { ProductType } from "@/types";

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  sku?: string;
  category_id?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  updated_at?: string;
}

export interface ProductWithDetails extends ProductType {
  category?: {
    id: number;
    name: string;
  };
  total_reviews?: number;
  average_rating?: number;
}

/**
 * Admin service for product management
 * Requires admin privileges for all operations
 */
export const adminProductService = {
  /**
   * Get all products with additional details for admin view
   */
  async getAllProducts(): Promise<ProductWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
					*,
					categories!products_category_id_fkey (
						id,
						name
					)
				`,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }

      // Get review statistics for each product
      const productsWithStats = await Promise.all(
        (data || []).map(async (product) => {
          const { data: reviewStats } = await supabase
            .from("reviews")
            .select("rating")
            .eq("product_id", product.product_id);

          const reviews = reviewStats || [];
          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          return {
            ...product,
            category: product.categories,
            total_reviews: totalReviews,
            average_rating: Number(averageRating.toFixed(1)),
          };
        }),
      );

      return productsWithStats;
    } catch (err) {
      console.error("Failed to get all products:", err);
      throw err;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductData): Promise<ProductType> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create product:", err);
      throw err;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: string,
    productData: UpdateProductData,
  ): Promise<ProductType> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .select()
        .single();

      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update product:", err);
      throw err;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  },

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<ProductType> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .select()
        .single();

      if (error) {
        console.error("Error updating product stock:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update product stock:", err);
      throw err;
    }
  },

  /**
   * Get products with low stock (below threshold)
   */
  async getLowStockProducts(threshold: number = 10): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lt("stock", threshold)
        .order("stock", { ascending: true });

      if (error) {
        console.error("Error fetching low stock products:", error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get low stock products:", err);
      return [];
    }
  },

  /**
   * Get product analytics data
   */
  async getProductAnalytics() {
    try {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get products by category
      const { data: categoryCounts } = await supabase.from("products").select(`
					category_id,
					categories!products_category_id_fkey (
						name
					)
				`);

      // Count products by category
      const categoryStats = (categoryCounts || []).reduce(
        (acc, product) => {
          const categoryName =
            (product.categories as any)?.name || "Uncategorized";
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Get low stock count
      const { count: lowStockCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock", 10);

      // Get total inventory value
      const { data: products } = await supabase
        .from("products")
        .select("price, stock");

      const totalInventoryValue = (products || []).reduce(
        (sum, product) => sum + product.price * product.stock,
        0,
      );

      return {
        totalProducts: totalProducts || 0,
        categoryStats,
        lowStockCount: lowStockCount || 0,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      };
    } catch (err) {
      console.error("Failed to get product analytics:", err);
      return {
        totalProducts: 0,
        categoryStats: {},
        lowStockCount: 0,
        totalInventoryValue: 0,
      };
    }
  },

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    updates: Array<{ productId: string; data: UpdateProductData }>,
  ): Promise<boolean> {
    try {
      const promises = updates.map(({ productId, data }) =>
        this.updateProduct(productId, data),
      );

      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error("Failed to bulk update products:", err);
      throw err;
    }
  },
};
