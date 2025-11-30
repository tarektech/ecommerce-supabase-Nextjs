"use client";

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
import { User, MapPin, Calendar, Package, DollarSign } from "lucide-react";
import { OrderWithDetails } from "@/services/admin/adminOrderService";
import { useOrder } from "@/hooks/queries";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import Image from "next/image";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithDetails;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
    case "shipped":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  // Use the query hook to fetch order details
  const { data: orderDetails, isLoading: loading } = useOrder(
    isOpen && order ? order.id.toString() : "",
  );

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{order.id}
          </DialogTitle>
          <DialogDescription>
            View detailed order information, customer details, and items
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Order Date
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.created_at
                      ? format(
                          new Date(order.created_at),
                          "MMM dd, yyyy 'at' HH:mm",
                        )
                      : "Unknown date"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Status</p>
                  <Badge className={`${getStatusColor(order.status)} border`}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Payment Method
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.payment_method || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-sm text-slate-600">
                    {order.profile?.username || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Email</p>
                  <p className="text-sm text-slate-600">
                    {order.profile?.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            {order.shipping_address && (
              <>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="bg-card rounded-lg border p-4">
                    <p className="text-foreground font-medium">
                      {order.shipping_address.street}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state}{" "}
                      {order.shipping_address.zip_code}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {order.shipping_address.country}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Order Items */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5" />
                Order Items
              </h3>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="text-muted-foreground text-sm">
                    Loading items...
                  </div>
                </div>
              ) : orderDetails?.order_items ? (
                <div className="space-y-3">
                  {orderDetails.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card flex items-center gap-4 rounded-lg border p-4 shadow-sm"
                    >
                      <div className="bg-muted h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product?.title || "Product"}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="text-muted-foreground h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-foreground font-medium">
                          {item.product?.title || "Product"}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Unit Price: {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-foreground font-semibold">
                          {formatCurrency(item.quantity * item.price)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Total */}
                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="text-foreground text-lg font-semibold">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-8 text-center">
                  <Package className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    No items found for this order
                  </p>
                </div>
              )}
            </div>
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
