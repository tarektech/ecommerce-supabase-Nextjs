"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth/authServerService";
import { adminUserServerService } from "@/services/admin/adminUserServerService";

/**
 * Server action to update user role
 * Only accessible by admin users
 */
export async function updateUserRoleAction(
  userId: string,
  role: "admin" | "user",
) {
  try {
    // Verify current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update user role
    const result = await adminUserServerService.updateUserRole(userId, role);

    if (!result) {
      throw new Error("Failed to update user role");
    }

    // Revalidate the admin users page to show updated data
    revalidatePath("/admin/users");

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

/**
 * Server action to delete user
 * Only accessible by admin users
 */
export async function deleteUserAction(userId: string) {
  try {
    // Verify current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Prevent admin from deleting themselves
    if (currentUser.profile_id === userId) {
      throw new Error("Cannot delete your own account");
    }

    // Delete user
    const success = await adminUserServerService.deleteUser(userId);

    if (!success) {
      throw new Error("Failed to delete user");
    }

    // Revalidate the admin users page to show updated data
    revalidatePath("/admin/users");

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
