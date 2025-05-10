'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductType, OrderType } from '@/types';
import { productService } from '@/services/product/productService';
import { orderService } from '@/services/order/orderService';
import Link from 'next/link';
import { OrderCard } from '@/components/OrderCard';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'orders'
  >('analytics');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch products
        const productsData = await productService.getProducts();
        setProducts(productsData);

        // Fetch orders
        const ordersData = await orderService.getOrders(user.id);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'analytics'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Order History
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === 'analytics' && <DashboardCharts orders={orders} />}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <Card key={product.product_id} className="overflow-hidden">
                      <div className="h-48 bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
                        <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
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
                  <div className="col-span-full flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <p className="text-xl font-medium mb-4">No orders yet</p>
                    <p className="text-muted-foreground mb-6">
                      You haven't placed any orders yet.
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
