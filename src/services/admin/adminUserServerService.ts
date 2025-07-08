import { createServerSupabase } from "@/lib/supabase/server";
import { ProfileType } from "@/types";

export interface UserFilters {
  role?: "admin" | "user";
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
}

export interface SanitizedUserWithStats {
  profile_id: string;
  username: string;
  email: string; // Sanitized email (masked)
  role: string;
  created_at: string;
  has_orders: boolean;
  order_count_range: string;
  spending_tier: string;
  is_active: boolean;
}

/**
 * Server-side admin service for user management
 * Sanitizes sensitive data before sending to client
 */
export const adminUserServerService = {
  /**
   * Get all users with filters and pagination - Server-side sanitized version
   */
  async getAllUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ users: SanitizedUserWithStats[]; total: number }> {
    try {
      const supabase = await createServerSupabase();
      let query = supabase.from("profiles").select("*");

      // Apply filters
      if (filters.role) {
        query = query.eq("role", filters.role);
      }
      if (filters.searchTerm) {
        query = query.or(
          `username.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`,
        );
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Get total count for pagination
      const countQuery = supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const { count } = await countQuery;

      // Get paginated results
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }

      // Get additional stats for each user and sanitize data
      const sanitizedUsers = await Promise.all(
        (data || []).map(async (user) => {
          // Get order stats (but don't expose detailed spending data)
          const { data: orders } = await supabase
            .from("orders")
            .select("total, created_at")
            .eq("user_id", user.profile_id);

          const userOrders = orders || [];
          const totalOrders = userOrders.length;
          const totalSpent = userOrders.reduce(
            (sum, order) => sum + order.total,
            0,
          );

          // Determine if user is active (has ordered in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const isActive = userOrders.some(
            (order) => new Date(order.created_at) > thirtyDaysAgo,
          );

          // Sanitize sensitive data
          return {
            profile_id: user.profile_id,
            username: user.username,
            // Mask email for privacy
            email: maskEmail(user.email),
            role: user.role,
            created_at: user.created_at,
            // Use ranges instead of exact values
            has_orders: totalOrders > 0,
            order_count_range: getOrderCountRange(totalOrders),
            spending_tier: getSpendingTier(totalSpent),
            is_active: isActive,
          };
        }),
      );

      return {
        users: sanitizedUsers,
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all users:", err);
      throw err;
    }
  },

  /**
   * Update user role - Server action
   */
  async updateUserRole(
    userId: string,
    role: "admin" | "user",
  ): Promise<ProfileType | null> {
    try {
      const supabase = await createServerSupabase();

      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("profile_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user role:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update user role:", err);
      return null;
    }
  },

  /**
   * Delete user - Server action (only for admin)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const supabase = await createServerSupabase();

      // This would need proper cascade handling in production
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("profile_id", userId);

      if (error) {
        console.error("Error deleting user:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete user:", err);
      return false;
    }
  },
};

// Helper functions to sanitize sensitive data
function maskEmail(email: string): string {
  const [username, domain] = email.split("@");
  if (username.length <= 3) {
    return `${username.substring(0, 1)}***@${domain}`;
  }
  return `${username.substring(0, 3)}***@${domain}`;
}

function getOrderCountRange(count: number): string {
  if (count === 0) return "No orders";
  if (count <= 5) return "1-5 orders";
  if (count <= 10) return "6-10 orders";
  if (count <= 25) return "11-25 orders";
  return "25+ orders";
}

function getSpendingTier(amount: number): string {
  if (amount === 0) return "No purchases";
  if (amount <= 100) return "Low spender";
  if (amount <= 500) return "Medium spender";
  if (amount <= 1000) return "High spender";
  return "Premium customer";
}
