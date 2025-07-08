"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Calendar,
  ShoppingCart,
  DollarSign,
  Shield,
  UserCheck,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  UserWithStats,
  adminUserService,
} from "@/services/admin/adminUserService";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithStats;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800";
    case "user":
      return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
  }
};

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = useState<UserWithStats | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails();
    }
  }, [isOpen, user]);

  const fetchUserDetails = async () => {
    try {
      const details = await adminUserService.getUserDetails(user.profile_id);
      setUserDetails(details);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (!user) return null;

  const displayUser = userDetails || user;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details - {user.username}
          </DialogTitle>
          <DialogDescription>
            View comprehensive user information and statistics
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* User Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-gray-600">
                    {displayUser.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{displayUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge className={getRoleColor(displayUser.role)}>
                    {displayUser.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-gray-600">
                    {displayUser.created_at
                      ? format(new Date(displayUser.created_at), "MMM dd, yyyy")
                      : "No date"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* User Stats */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5" />
                User Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {displayUser.total_orders || 0}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Total Orders
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {formatCurrency(displayUser.total_spent || 0)}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Total Spent
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-900/20">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <div>
                      <p className="text-sm font-bold text-violet-900 dark:text-violet-100">
                        {displayUser.is_active ? "ACTIVE" : "INACTIVE"}
                      </p>
                      <p className="text-sm text-violet-600 dark:text-violet-400">
                        Status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                        {displayUser.last_order_date
                          ? format(
                              new Date(displayUser.last_order_date),
                              "MMM dd",
                            )
                          : "Never"}
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Last Order
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Account Information
              </h3>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Profile ID
                    </p>
                    <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
                      {displayUser.profile_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Account Created
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {format(
                        new Date(displayUser.created_at),
                        "MMM dd, yyyy 'at' HH:mm",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Last Updated
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {displayUser.updated_at
                        ? format(
                            new Date(displayUser.updated_at),
                            "MMM dd, yyyy 'at' HH:mm",
                          )
                        : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Activity Status
                    </p>
                    <div className="flex items-center gap-2">
                      {displayUser.is_active ? (
                        <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      )}
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {displayUser.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {(displayUser.total_orders || 0) > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </h3>
                  <div className="rounded-lg border p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {displayUser.total_orders || 0}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total Orders
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(displayUser.total_spent || 0)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total Spent
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                          {displayUser.total_orders && displayUser.total_spent
                            ? formatCurrency(
                                displayUser.total_spent /
                                  displayUser.total_orders,
                              )
                            : formatCurrency(0)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Average Order
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
