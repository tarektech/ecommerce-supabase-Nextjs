import { supabase } from "@/lib/supabase/client";
import { OrderType } from "@/types";

// Strongly-typed helper interfaces
interface OrderItemWithProductFromSupabase {
  id: number;
  order_id: number;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    product_id: string;
    title: string;
    image: string;
  };
}

interface CustomerStat {
  userId: string;
  username: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderWithDetails extends Omit<OrderType, "order_items"> {
  profile?: {
    username: string;
    email: string;
  };
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  order_items?: Array<{
    id: number;
    order_id: number;
    product_id: string;
    quantity: number;
    price: number;
    product: {
      product_id: string;
      title: string;
      image: string;
    };
  }>;
}

export interface OrderFilters {
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: OrderWithDetails[];
  topCustomers: CustomerStat[];
}

/**
 * Admin service for order management
 * Requires admin privileges for all operations
 */
export const adminOrderService = {
  /**
   * Get all orders with filters and pagination
   */
  async getAllOrders(
    filters: OrderFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ orders: OrderWithDetails[]; total: number }> {
    try {
      let query = supabase.from("orders").select(`
					*,
					profiles!orders_user_id_fkey (
						username,
						email
					),
					addresses!orders_shipping_address_id_fkey (
						street,
						city,
						state,
						zip_code,
						country
					)
				`);

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }
      if (filters.minAmount) {
        query = query.gte("total", filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte("total", filters.maxAmount);
      }

      // Get total count for pagination
      const countQuery = supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      const { count } = await countQuery;

      // Get paginated results
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching all orders:", error);
        throw error;
      }

      // Format the data
      const orders: OrderWithDetails[] = (data || []).map((order) => ({
        ...order,
        profile: order.profiles,
        shipping_address: order.addresses,
      }));

      return {
        orders,
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all orders:", err);
      throw err;
    }
  },

  /**
   * Get order details with items
   */
  async getOrderDetails(orderId: number): Promise<OrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
					*,
					profiles!orders_user_id_fkey (
						username,
						email
					),
					addresses!orders_shipping_address_id_fkey (
						street,
						city,
						state,
						zip_code,
						country
					),
					order_items (
						id,
						quantity,
						price,
						products (
							product_id,
							title,
							image
						)
					)
				`,
        )
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching order details:", error);
        throw error;
      }

      return {
        ...data,
        profile: data.profiles,
        shipping_address: data.addresses,
        order_items: (
          data.order_items as OrderItemWithProductFromSupabase[] | undefined
        )?.map((item) => ({
          ...item,
          product: item.products,
        })),
      };
    } catch (err) {
      console.error("Failed to get order details:", err);
      return null;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<OrderType> {
    try {
      const validStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update order status:", err);
      throw err;
    }
  },

  /**
   * Get order analytics
   */
  async getOrderAnalytics(): Promise<OrderAnalytics> {
    try {
      // Get all orders for analytics
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
					*,
					profiles (
						username,
						email
					)
				`,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders for analytics:", error);
        throw error;
      }

      const allOrders = orders || [];

      // Calculate basic metrics
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + order.total,
        0,
      );
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Orders by status
      const ordersByStatus = allOrders.reduce(
        (acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Recent orders (last 10)
      const recentOrders = allOrders.slice(0, 10).map((order) => ({
        ...order,
        profile: order.profiles,
      }));

      // Top customers
      const customerStats = allOrders.reduce<Record<string, CustomerStat>>(
        (acc, order) => {
          const userId = order.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              username: order.profiles?.username || "Unknown",
              email: order.profiles?.email || "Unknown",
              totalOrders: 0,
              totalSpent: 0,
            };
          }
          acc[userId].totalOrders += 1;
          acc[userId].totalSpent += order.total;
          return acc;
        },
        {},
      );

      const topCustomers: CustomerStat[] = Object.values(customerStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      return {
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        ordersByStatus,
        recentOrders,
        topCustomers,
      };
    } catch (err) {
      console.error("Failed to get order analytics:", err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
        recentOrders: [],
        topCustomers: [],
      };
    }
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: number): Promise<OrderType> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Error cancelling order:", error);
        throw error;
      }

      // Optionally restore product stock
      const orderDetails = await this.getOrderDetails(orderId);
      if (orderDetails?.order_items) {
        await Promise.all(
          orderDetails.order_items.map(async (item) => {
            // Get current stock
            const { data: product } = await supabase
              .from("products")
              .select("stock")
              .eq("product_id", item.product.product_id)
              .single();

            if (product) {
              // Restore stock
              await supabase
                .from("products")
                .update({
                  stock: product.stock + item.quantity,
                  updated_at: new Date().toISOString(),
                })
                .eq("product_id", item.product.product_id);
            }
          }),
        );
      }

      return data;
    } catch (err) {
      console.error("Failed to cancel order:", err);
      throw err;
    }
  },

  /**
   * Get orders requiring attention (pending for too long, payment issues, etc.)
   */
  async getOrdersRequiringAttention(): Promise<OrderWithDetails[]> {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
					*,
					profiles (
						username,
						email
					)
				`,
        )
        .or(
          `status.eq.pending.and.created_at.lt.${threeDaysAgo.toISOString()},status.eq.processing.and.created_at.lt.${threeDaysAgo.toISOString()}`,
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching orders requiring attention:", error);
        throw error;
      }

      return (data || []).map((order) => ({
        ...order,
        profile: order.profiles,
      }));
    } catch (err) {
      console.error("Failed to get orders requiring attention:", err);
      return [];
    }
  },
};
