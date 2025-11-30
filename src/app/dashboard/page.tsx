"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProducts, useOrders } from "@/hooks/queries";
import Link from "next/link";
import { OrderCard } from "@/components/OrderCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "analytics" | "products" | "orders"
  >("analytics");

  // Use query hooks instead of manual state management
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders(user?.id || "");

  const loading = productsLoading || ordersLoading;

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You need to be signed in to view your dashboard.
            </p>
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`hover:text-primary cursor-pointer px-4 py-2 font-medium transition-colors ${
              activeTab === "analytics"
                ? "border-primary text-primary border-b-2"
                : "text-muted-foreground"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`hover:text-primary cursor-pointer px-4 py-2 font-medium transition-colors ${
              activeTab === "products"
                ? "border-primary text-primary border-b-2"
                : "text-muted-foreground"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`hover:text-primary cursor-pointer px-4 py-2 font-medium transition-colors ${
              activeTab === "orders"
                ? "border-primary text-primary border-b-2"
                : "text-muted-foreground"
            }`}
          >
            Order History
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <DashboardCharts orders={orders || []} />
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <Card key={product.product_id} className="overflow-hidden">
                      <div className="h-48 bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image || ""}
                            alt={product.title}
                            width={400}
                            height={192}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                            No image
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          {product.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                          {product.description}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            ${product.price.toFixed(2)}
                          </span>
                          <Link href={`/products/${product.product_id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-12">
                    <p className="mb-4 text-xl font-medium">No orders yet</p>
                    <p className="text-muted-foreground mb-6">
                      You haven&apos;t placed any orders yet.
                    </p>
                    <Link href="/">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
