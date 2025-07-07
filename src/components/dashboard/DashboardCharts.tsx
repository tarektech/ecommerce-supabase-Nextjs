"use client";
import { OrderType } from "@/types";
import { OrderHistoryChart } from "./OrderHistoryChart";
import { PaymentDistributionChart } from "./PaymentDistributionChart";
import { OrderStatusChart } from "./OrderStatusChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardChartsProps {
  orders: OrderType[];
}

export function DashboardCharts({ orders }: DashboardChartsProps) {
  // Calculate summary metrics
  const totalOrderAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length
    ? totalOrderAmount / orders.length
    : 0;
  const lastMonthOrders = orders.filter((order) => {
    if (!order.created_at) return false;
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);
    return orderDate >= lastMonth;
  });
  const lastMonthTotal = lastMonthOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalOrderAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Last 30 Days Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${lastMonthTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderHistoryChart orders={orders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentDistributionChart orders={orders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart orders={orders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
