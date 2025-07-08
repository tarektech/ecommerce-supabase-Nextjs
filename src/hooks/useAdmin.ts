"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface AdminData {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to check if the current user has admin privileges
 * Uses the admin_users view which filters profiles where role='admin'
 */
export function useAdmin(): AdminData {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user exists in admin_users view
        const { data, error: queryError } = await supabase
          .from("admin_users")
          .select("profile_id")
          .eq("profile_id", user.id)
          .single();

        if (queryError) {
          // If no rows returned, user is not admin
          if (queryError.code === "PGRST116") {
            setIsAdmin(false);
          } else {
            console.error("Error checking admin status:", queryError);
            setError("Failed to verify admin status");
            setIsAdmin(false);
          }
        } else {
          // User found in admin_users view
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Unexpected error checking admin status:", err);
        setError("Unexpected error occurred");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading, error };
}

/**
 * Utility function to check admin status without hooks
 * Useful for server-side or one-time checks
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("profile_id")
      .eq("profile_id", userId)
      .single();

    if (error) {
      // If no rows returned, user is not admin
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking admin status:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Unexpected error checking admin status:", err);
    return false;
  }
}
