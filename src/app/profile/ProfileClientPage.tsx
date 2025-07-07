"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileCard } from "@/components/ProfileCard";
import { OrderCard } from "@/components/OrderCard";
import { EmptyOrdersState } from "@/components/EmptyOrdersState";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { OrderType, ProfileType } from "@/types";

interface ProfileClientPageProps {
  initialProfile: ProfileType | null;
  initialOrders: OrderType[];
  user: User;
}

export default function ProfileClientPage({
  initialProfile,
  initialOrders,
  user,
}: ProfileClientPageProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  // Initialize state with server-fetched data
  const [username, setUsername] = useState(initialProfile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [email, setEmail] = useState(initialProfile?.email || user.email || "");
  const [orders, setOrders] = useState<OrderType[]>(initialOrders);
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving profile data
  const handleSaveProfile = async (
    usernameInput: string,
    emailInput: string,
    avatarUrlInput: string,
  ) => {
    try {
      setIsSaving(true);

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          username: usernameInput,
          email: emailInput,
          avatar_url: avatarUrlInput,
        })
        .eq("profile_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setUsername(updatedProfile.username || "");
      setEmail(updatedProfile.email || "");
      setAvatarUrl(updatedProfile.avatar_url || "");

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a handler for auth email updates
  const handleUpdateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success(
        "Verification email sent! Please check your inbox and click the verification link.",
      );
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update email",
      );
      throw error;
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Remove order from state immediately after deletion (optimistic UI)
  //the UI is updated immediately without waiting for the server to confirm the deletion
  const handleOrderDeleted = (deletedOrderId: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== deletedOrderId));
  };

  // Subscribe to realtime order updates
  useEffect(() => {
    let orderSubscription: ReturnType<typeof supabase.channel> | null = null;
    let profileSubscription: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscriptions = async () => {
      try {
        // Subscribe to orders with error handling
        orderSubscription = supabase
          .channel("orders", {
            config: {
              presence: {
                key: user.id,
              },
            },
          })
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              try {
                // Fetch updated orders
                if (payload.new) {
                  const order = payload.new as OrderType;
                  setOrders((prevOrders) => {
                    const index = prevOrders.findIndex(
                      (o) => o.id === order.id,
                    );
                    if (index !== -1) {
                      // Replace existing order
                      const updated = [...prevOrders];
                      updated[index] = order;
                      return updated;
                    }
                    // Add new order
                    return [...prevOrders, order];
                  });
                }
                if (payload.old) {
                  const order = payload.old as OrderType;
                  setOrders((prevOrders) =>
                    prevOrders.filter((o) => o.id !== order.id),
                  );
                }
              } catch (error) {
                console.error(
                  "Error handling order subscription update:",
                  error,
                );
              }
            },
          )
          .on("presence", { event: "sync" }, () => {
            // Handle presence sync
          })
          .on("presence", { event: "join" }, () => {
            // Handle presence join
          })
          .on("presence", { event: "leave" }, () => {
            // Handle presence leave
          })
          .subscribe((status, err) => {
            if (status === "SUBSCRIBED") {
              console.log("Orders subscription established");
            } else if (status === "CHANNEL_ERROR") {
              console.error("Orders subscription error:", err);
            } else if (status === "TIMED_OUT") {
              console.warn("Orders subscription timed out, retrying...");
            }
          });

        // Subscribe to profile updates with error handling
        profileSubscription = supabase
          .channel("profiles", {
            config: {
              presence: {
                key: user.id,
              },
            },
          })
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "profiles",
              filter: `profile_id=eq.${user.id}`,
            },
            async (payload) => {
              try {
                if (payload.new) {
                  const profile = payload.new as ProfileType;
                  setUsername(profile.username || "");
                  setEmail(profile.email || "");
                  setAvatarUrl(profile.avatar_url || "");
                }
              } catch (error) {
                console.error(
                  "Error handling profile subscription update:",
                  error,
                );
              }
            },
          )
          .on("presence", { event: "sync" }, () => {
            // Handle presence sync
          })
          .subscribe((status, err) => {
            if (status === "SUBSCRIBED") {
              console.log("Profile subscription established");
              toast.success("Profile subscription established");
            } else if (status === "CHANNEL_ERROR") {
              console.error("Profile subscription error:", err);
              toast.error("Profile subscription error");
            } else if (status === "TIMED_OUT") {
              console.warn("Profile subscription timed out, retrying...");
              toast.error("Profile subscription timed out, retrying...");
            }
          });
      } catch (error) {
        console.error("Error setting up subscriptions:", error);
      }
    };

    setupSubscriptions();

    return () => {
      try {
        if (orderSubscription) {
          supabase.removeChannel(orderSubscription);
        }
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
        }
      } catch (error) {
        console.error("Error cleaning up subscriptions:", error);
      }
    };
  }, [user.id]);

  return (
    <div className="container mx-auto px-4 py-6">
      <ProfileCard
        user={user}
        username={username}
        setUsername={setUsername}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        email={email}
        setEmail={setEmail}
        createdAt={initialProfile?.created_at || null}
        isSaving={isSaving}
        onSaveProfile={handleSaveProfile}
        onSignOut={handleSignOut}
        onUpdateEmail={handleUpdateEmail}
      />

      <h2 className="mb-4 text-2xl font-bold">My Orders</h2>

      {orders.length === 0 ? (
        <EmptyOrdersState onBrowseProducts={() => router.push("/")} />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onDelete={handleOrderDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
