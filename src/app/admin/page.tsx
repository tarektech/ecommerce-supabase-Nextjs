"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Settings,
} from "lucide-react";
import { adminProductService } from "@/services/admin/adminProductService";
import { adminOrderService } from "@/services/admin/adminOrderService";
import { adminUserService } from "@/services/admin/adminUserService";
import { formatCurrency } from "@/utils/formatCurrency";
import Link from "next/link";

interface DashboardStats {
  products: {
    total: number;
    lowStock: number;
    totalValue: number;
  };
  orders: {
    total: number;
    revenue: number;
    averageValue: number;
    pending: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
    newThisMonth: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdmin();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, adminLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [productAnalytics, orderAnalytics, userAnalytics] =
        await Promise.all([
          adminProductService.getProductAnalytics(),
          adminOrderService.getOrderAnalytics(),
          adminUserService.getUserAnalytics(),
        ]);

      setStats({
        products: {
          total: productAnalytics.totalProducts,
          lowStock: productAnalytics.lowStockCount,
          totalValue: productAnalytics.totalInventoryValue,
        },
        orders: {
          total: orderAnalytics.totalOrders,
          revenue: orderAnalytics.totalRevenue,
          averageValue: orderAnalytics.averageOrderValue,
          pending: orderAnalytics.ordersByStatus.pending || 0,
        },
        users: {
          total: userAnalytics.totalUsers,
          active: userAnalytics.activeUsers,
          admins: userAnalytics.totalAdmins,
          newThisMonth: userAnalytics.newUsersThisMonth,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (adminError || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You don&apos;t have admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button>Go to User Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Unable to load dashboard data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        <Badge variant="secondary" className="bg-primary/15 text-primary">
          <Settings className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.orders.revenue)}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.orders.total} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.total}</div>
            <p className="text-muted-foreground text-xs">
              {stats.products.lowStock} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-muted-foreground text-xs">
              {stats.users.active} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.pending}</div>
            <p className="text-muted-foreground text-xs">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/admin/products">
              <Button className="w-full cursor-pointer" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="w-full cursor-pointer" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Manage Orders
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full cursor-pointer" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Average Order Value
              </span>
              <span className="font-medium">
                {formatCurrency(stats.orders.averageValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Inventory Value
              </span>
              <span className="font-medium">
                {formatCurrency(stats.products.totalValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                New Users This Month
              </span>
              <span className="font-medium">{stats.users.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Admin Users</span>
              <span className="font-medium">{stats.users.admins}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.products.lowStock > 0 && (
              <div className="flex items-center rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Low Stock Alert
                  </p>
                  <p className="text-xs text-yellow-600">
                    {stats.products.lowStock} products are running low on stock
                  </p>
                </div>
              </div>
            )}

            {stats.orders.pending > 0 && (
              <div className="border-primary/30 bg-primary/10 flex items-center rounded-lg border p-3">
                <Activity className="text-primary mr-2 h-4 w-4" />
                <div>
                  <p className="text-primary text-sm font-medium">
                    Pending Orders
                  </p>
                  <p className="text-primary text-xs">
                    {stats.orders.pending} orders are waiting for processing
                  </p>
                </div>
              </div>
            )}

            {stats.products.lowStock === 0 && stats.orders.pending === 0 && (
              <div className="flex items-center rounded-lg border border-green-200 bg-green-50 p-3">
                <Activity className="mr-2 h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    All Clear
                  </p>
                  <p className="text-xs text-green-600">
                    No immediate attention required
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
