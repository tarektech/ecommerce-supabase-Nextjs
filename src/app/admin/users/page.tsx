import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  Mail,
  Shield,
  UserCheck,
} from "lucide-react";

import { format } from "date-fns";
import { AdminUsersClient } from "./AdminUsersClient";
import { getCurrentUser } from "@/services/auth/authServerService";
import {
  adminUserServerService,
  UserFilters,
} from "@/services/admin/adminUserServerService";

interface AdminUsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "user":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper to safely extract a single string value from query param
const getParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  // Await the async props
  const resolvedSearchParams = await searchParams;

  // Server-side auth check
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/signin");
  }

  // Parse search params safely on server
  const filters: UserFilters = {
    searchTerm: getParam(resolvedSearchParams.search),
    role: getParam(resolvedSearchParams.role) as "admin" | "user" | undefined,
    dateFrom: getParam(resolvedSearchParams.dateFrom),
  };

  const currentPage = parseInt(getParam(resolvedSearchParams.page) || "1", 10);
  const pageLimit = 20;

  // Fetch data on server side (already sanitized)
  const { users: sanitizedUsers, total } =
    await adminUserServerService.getAllUsers(filters, currentPage, pageLimit);

  const totalPages = Math.ceil(total / pageLimit);

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {total} total users
          </span>
        </div>
      </div>

      {/* Server-rendered search/filter form */}
      <Card>
        <CardContent className="pt-6">
          <AdminUsersClient
            currentFilters={filters}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>

      {/* Server-rendered users list with sanitized data */}
      <div className="space-y-4">
        {sanitizedUsers.length > 0 ? (
          sanitizedUsers.map((user) => (
            <Card key={user.profile_id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">
                        {user.username}
                      </h3>
                      <div className="flex flex-col gap-1 text-sm text-gray-600 sm:gap-2">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined{" "}
                            {format(new Date(user.created_at), "MMM dd, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {user.order_count_range}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {user.spending_tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        <Shield className="mr-1 h-3 w-3" />
                        {user.role}
                      </Badge>
                      {user.is_active && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <UserCheck className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium text-gray-600">
                No users found
              </h3>
              <p className="mt-2 text-gray-500">
                No users match your current filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground text-center text-sm sm:text-left">
                Showing {(currentPage - 1) * pageLimit + 1} to{" "}
                {Math.min(currentPage * pageLimit, total)} of {total} users
              </span>
              {/* Pagination controls handled by client component */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
