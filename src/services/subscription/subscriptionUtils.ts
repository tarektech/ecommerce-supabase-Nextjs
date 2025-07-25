import { toast } from "sonner";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface SubscriptionStatus {
  status: string;
  error?: unknown;
}

/**
 * Handle subscription status changes with appropriate logging and user feedback
 */
export function handleSubscriptionStatus(
  subscriptionName: string,
  status: string,
  error?: unknown,
) {
  console.log(`${subscriptionName} subscription status:`, status, error);

  if (status === "SUBSCRIBED") {
    console.log(`✅ ${subscriptionName} subscription established`);
    // Show success notification for profile subscriptions to maintain existing UX
    if (subscriptionName.includes("Profile")) {
      toast.success(`${subscriptionName} subscription established`);
    }
  } else if (status === "CHANNEL_ERROR") {
    console.error(`❌ ${subscriptionName} subscription error:`, error);

    // Handle undefined or empty errors
    if (!error || error === undefined) {
      console.error(
        "Error is undefined - this usually indicates realtime authentication issues",
      );
      toast.error(
        `${subscriptionName} connection failed - please check your connection and try refreshing`,
      );
      return;
    }

    toast.error(`${subscriptionName} subscription error`);

    // Handle specific Supabase error codes
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = (error as { message: string }).message;
      if (errorMessage.includes("Unauthorized")) {
        console.error("Realtime authorization failed - check JWT token");
        toast.error("Authentication failed - please sign in again");
      } else if (errorMessage.includes("RealtimeDisabledForTenant")) {
        console.error("Realtime is disabled for this project");
        toast.error("Real-time features are not available");
      } else if (errorMessage.includes("ConnectionRateLimitReached")) {
        console.error("Too many concurrent connections - rate limit reached");
        toast.error("Too many connections - please try again later");
      } else {
        console.error("Subscription error message:", errorMessage);
      }
    } else {
      console.error(
        "Subscription error without message:",
        JSON.stringify(error, null, 2),
      );
    }
  } else if (status === "TIMED_OUT") {
    console.warn(`⏰ ${subscriptionName} subscription timed out, retrying...`);
    toast.error(`${subscriptionName} subscription timed out, retrying...`);
  } else if (status === "CLOSED") {
    console.log(`🔒 ${subscriptionName} subscription closed`);
  } else {
    console.warn(
      `⚠️ ${subscriptionName} subscription status: ${status}`,
      error,
    );
    if (error) {
      console.error("Status error details:", JSON.stringify(error, null, 2));
    }
  }
}

/**
 * Setup default presence handlers for a subscription
 */
export function setupPresenceHandlers() {
  return {
    onSync: () => {
      console.log("Presence sync");
    },
    onJoin: () => {
      console.log("Presence join");
    },
    onLeave: () => {
      console.log("Presence leave");
    },
  };
}

/**
 * Clean up multiple subscriptions with improved error handling
 */
export function cleanupSubscriptions(
  supabase: SupabaseClient,
  subscriptions: (RealtimeChannel | null)[],
) {
  try {
    let cleanedCount = 0;
    subscriptions.forEach((subscription) => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
          cleanedCount++;
        } catch (error) {
          console.error("Error removing individual subscription:", error);
        }
      }
    });
    console.log(`Successfully cleaned up ${cleanedCount} subscriptions`);
  } catch (error) {
    console.error("Error cleaning up subscriptions:", error);
  }
}

/**
 * Validate subscription configuration before setup
 */
export function validateSubscriptionConfig(
  userId: string,
  tableName: string,
): boolean {
  if (!userId || typeof userId !== "string") {
    console.error("Invalid userId for subscription:", userId);
    return false;
  }

  if (!tableName || typeof tableName !== "string") {
    console.error("Invalid table name for subscription:", tableName);
    return false;
  }

  return true;
}
