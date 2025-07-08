import { supabase } from "@/lib/supabase/client";

/**
 * Admin role management utilities
 */

export interface AdminUser {
  profile_id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("profile_id, username, email, role, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get admin users:", err);
    return [];
  }
}

/**
 * Promote user to admin role
 */
export async function promoteToAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("profile_id", userId);

    if (error) {
      console.error("Error promoting user to admin:", error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Failed to promote user to admin:", err);
    return false;
  }
}

/**
 * Demote admin to regular user
 */
export async function demoteFromAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "user" })
      .eq("profile_id", userId);

    if (error) {
      console.error("Error demoting admin to user:", error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Failed to demote admin to user:", err);
    return false;
  }
}

/**
 * Check if operation requires admin privileges
 */
export function requiresAdminAccess(operation: string): boolean {
  const adminOperations = [
    "product.create",
    "product.update",
    "product.delete",
    "order.updateStatus",
    "order.viewAll",
    "user.manage",
    "category.create",
    "category.update",
    "category.delete",
  ];

  return adminOperations.includes(operation);
}

/**
 * Admin operation permissions map
 */
export const AdminPermissions = {
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",
  ORDER_UPDATE_STATUS: "order.updateStatus",
  ORDER_VIEW_ALL: "order.viewAll",
  USER_MANAGE: "user.manage",
  CATEGORY_CREATE: "category.create",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",
} as const;

export type AdminPermission =
  (typeof AdminPermissions)[keyof typeof AdminPermissions];
