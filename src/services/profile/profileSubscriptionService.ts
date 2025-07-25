import { supabase } from "@/lib/supabase/client";
import { ProfileType } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  handleSubscriptionStatus,
  validateSubscriptionConfig,
} from "../subscription";

export interface ProfileSubscriptionCallbacks {
  onProfileUpdate: (profile: ProfileType) => void;
}

/**
 * Subscribe to real-time profile updates for a specific user
 */
export function subscribeToUserProfile(
  userId: string,
  callbacks: ProfileSubscriptionCallbacks,
): RealtimeChannel {
  // Validate configuration
  if (!validateSubscriptionConfig(userId, "profiles")) {
    throw new Error("Invalid subscription configuration for user profile");
  }

  try {
    console.log(`Setting up profile subscription for user: ${userId}`);

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

    const profileSubscription = supabase
      .channel(`user-profile-${userId}`, {
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
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `profile_id=eq.${userId}`,
        },
        async (payload) => {
          try {
            console.log("Profile update received:", payload);
            if (payload.new) {
              const profile = payload.new as ProfileType;
              callbacks.onProfileUpdate(profile);
            }
          } catch (error) {
            console.error("Error handling profile subscription update:", error);
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        console.log("Profile subscription presence sync");
      })
      .on("presence", { event: "join" }, () => {
        console.log("Profile subscription presence join");
      })
      .on("presence", { event: "leave" }, () => {
        console.log("Profile subscription presence leave");
      })
      .subscribe((status, err) => {
        handleSubscriptionStatus("User Profile", status, err);
      });

    console.log("Profile subscription channel created:", profileSubscription);
    return profileSubscription;
  } catch (error) {
    console.error("Error creating profile subscription:", error);
    throw error;
  }
}

/**
 * Unsubscribe from profile updates
 */
export function unsubscribeFromUserProfile(
  subscription: RealtimeChannel | null,
) {
  try {
    if (subscription) {
      console.log("Unsubscribing from user profile");
      supabase.removeChannel(subscription);
    }
  } catch (error) {
    console.error("Error unsubscribing from profile:", error);
  }
}
