import { supabase } from "@/lib/supabase/client";
import { OrderType } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  handleSubscriptionStatus,
  validateSubscriptionConfig,
} from "../subscription";

export interface OrderSubscriptionCallbacks {
  onOrderUpdate: (order: OrderType) => void;
  onOrderDelete: (order: OrderType) => void;
}

/**
 * Subscribe to real-time order updates for a specific user
 */
export function subscribeToUserOrders(
  userId: string,
  callbacks: OrderSubscriptionCallbacks,
): RealtimeChannel {
  // Validate configuration
  if (!validateSubscriptionConfig(userId, "orders")) {
    throw new Error("Invalid subscription configuration for user orders");
  }

  try {
    console.log(`Setting up order subscription for user: ${userId}`);

    // Ensure user is authenticated before setting up realtime
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("No authenticated session found for realtime");
        return;
      }
      console.log("Session found for realtime, setting auth...");
      // Set authentication for realtime (recommended by Supabase docs)
      supabase.realtime.setAuth(session.access_token);
    });

    const orderSubscription = supabase
      .channel(`user-orders-${userId}`, {
        config: {
          presence: {
            key: userId,
          },
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          try {
            console.log("Order update received:", payload);
            // Handle order updates
            if (payload.new) {
              const order = payload.new as OrderType;
              callbacks.onOrderUpdate(order);
            }
          } catch (error) {
            console.error("Error handling order subscription update:", error);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          try {
            console.log("Order delete received:", payload);
            // Handle order deletions
            if (payload.old) {
              const order = payload.old as OrderType;
              callbacks.onOrderDelete(order);
            }
          } catch (error) {
            console.error("Error handling order subscription delete:", error);
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        console.log("Order subscription presence sync");
      })
      .on("presence", { event: "join" }, () => {
        console.log("Order subscription presence join");
      })
      .on("presence", { event: "leave" }, () => {
        console.log("Order subscription presence leave");
      })
      .subscribe((status, err) => {
        handleSubscriptionStatus("User Orders", status, err);
      });

    console.log("Order subscription channel created:", orderSubscription);
    return orderSubscription;
  } catch (error) {
    console.error("Error creating order subscription:", error);
    throw error;
  }
}

/**
 * Unsubscribe from order updates
 */
export function unsubscribeFromUserOrders(
  subscription: RealtimeChannel | null,
) {
  try {
    if (subscription) {
      console.log("Unsubscribing from user orders");
      supabase.removeChannel(subscription);
    }
  } catch (error) {
    console.error("Error unsubscribing from orders:", error);
  }
}
