import { AddressType, OrderType } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface OrderItemInput {
  product_id: string;
  quantity: number;
  price: number;
}

interface CreateOrderParams {
  userId: string;
  items: OrderItemInput[];
  shippingAddress: AddressType;
  totalAmount: number;
  paymentIntentId?: string;
}

export const orderService = {
  async createOrder({
    userId,
    items,
    shippingAddress,
    totalAmount,
    paymentIntentId,
  }: CreateOrderParams) {
    try {
      // Validate input parameters
      if (!userId) {
        throw new Error("User ID is required");
      }
      if (!items || items.length === 0) {
        throw new Error("Order items are required");
      }
      if (!shippingAddress || !shippingAddress.id) {
        throw new Error("Shipping address is required");
      }
      if (!totalAmount || totalAmount <= 0) {
        throw new Error("Total amount must be greater than 0");
      }

      console.log("Creating order with params:", {
        userId,
        itemsCount: items.length,
        totalAmount,
        shippingAddressId: shippingAddress.id,
        paymentIntentId,
      });

      // Idempotency: if a paymentId exists, try to find an existing order first
      let existingOrder: OrderType | null = null;
      if (paymentIntentId) {
        const { data: foundOrders, error: findError } = await supabase
          .from("orders")
          .select("*")
          .eq("payment_id", paymentIntentId)
          .eq("user_id", userId)
          .limit(1);
        if (
          !findError &&
          Array.isArray(foundOrders) &&
          foundOrders.length > 0
        ) {
          existingOrder = foundOrders[0];
        }
      }

      if (existingOrder) {
        console.log(
          "Existing order found for payment_id, returning existing order",
        );
        return existingOrder;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            total: totalAmount,
            status: "pending",
            payment_id: paymentIntentId,
            shipping_address_id: shippingAddress.id,
          },
        ])
        .select()
        .single();

      if (orderError) {
        // Handle duplicate key (unique constraint) gracefully by fetching existing
        const maybeCode = orderError?.code;
        if (maybeCode === "23505" && paymentIntentId) {
          const { data: foundOrders } = await supabase
            .from("orders")
            .select("*")
            .eq("payment_id", paymentIntentId)
            .eq("user_id", userId)
            .limit(1);
          if (Array.isArray(foundOrders) && foundOrders.length > 0) {
            console.warn(
              "Duplicate payment_id detected. Returning existing order",
            );
            return foundOrders[0];
          }
        }

        console.error("Order creation error", {
          message: orderError?.message,
          code: orderError?.code,
          details: orderError?.details,
          hint: orderError?.hint,
        });
        toast.error(
          `Failed to create order: ${orderError?.message ?? "Unknown error"}`,
        );
        throw new Error(
          `Order creation failed: ${orderError?.message ?? "Unknown error"}`,
        );
      }

      if (!order) {
        throw new Error("Order was not created - no data returned");
      }

      console.log("Order created successfully:", order);

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      console.log("Creating order items:", orderItems);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        toast.error(`Failed to create order items: ${itemsError.message}`);

        // Try to clean up the order if items creation failed
        try {
          await supabase.from("orders").delete().eq("id", order.id);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup order after items error:",
            cleanupError,
          );
        }

        throw new Error(`Order items creation failed: ${itemsError.message}`);
      }

      console.log("Order and items created successfully");
      return order;
    } catch (error) {
      console.error("Error in createOrder:", error);

      // Re-throw with better error context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          `Unknown error occurred while creating order: ${JSON.stringify(error)}`,
        );
      }
    }
  },

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_address:addresses!shipping_address_id (*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch orders");
      throw error;
    }
    return data;
  },

  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_address:addresses!shipping_address_id (*)
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      toast.error("Failed to fetch order");
      throw error;
    }
    return data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update order status");
      throw error;
    }
    return data;
  },

  async deleteOrder(orderId: string) {
    // Attempt to delete order; assuming foreign keys handle cascade for order_items
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      toast.error("Failed to delete order");
      throw error;
    }
    return true;
  },
};
