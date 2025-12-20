"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Printer,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

const OrderDetail = ({ params }: OrderDetailProps) => {
  const [id, setId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await params;
        if (mounted) setId(p?.id || "");
      } catch {
        if (mounted) setId("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  const order = {
    id: id || "WO-A1B2C3",
    status: "Processing",
    date: "Dec 14, 2024",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Avenue, Apt 12, Los Angeles, CA 90001",
    },
    items: [
      { name: "Classic Premium Cotton T-Shirt", size: "M", color: "Black", qty: 2, price: 49.99 },
      { name: "Denim Jacket", size: "L", color: "Blue", qty: 1, price: 89.99 },
      { name: "Canvas Sneakers", size: "42", color: "White", qty: 1, price: 64.99 },
    ],
    subtotal: 254.96,
    shipping: 0,
    total: 254.96,
    paymentMethod: "Credit Card (•••• 4242)",
    timeline: [
      { status: "Order Placed", date: "Dec 14, 2024 10:30 AM", complete: true },
      { status: "Payment Confirmed", date: "Dec 14, 2024 10:31 AM", complete: true },
      { status: "Processing", date: "Dec 14, 2024 11:00 AM", complete: true, current: true },
      { status: "Shipped", date: "Pending", complete: false },
      { status: "Delivered", date: "Pending", complete: false },
    ],
  };

  return (
    <DashboardLayout>

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Link */}
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Status */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-foreground">Order Status</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {order.status}
                    </span>
                  </div>

                  <div className="relative">
                    {order.timeline.map((step, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center z-10",
                              step.complete
                                ? step.current
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-teal text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {step.complete && !step.current ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : index === 3 ? (
                              <Truck className="w-4 h-4" />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>

                          {index < order.timeline.length - 1 && (
                            <div
                              className={cn(
                                "absolute top-8 w-0.5 h-full",
                                step.complete ? "bg-teal" : "bg-border"
                              )}
                            />
                          )}
                        </div>

                        <div className="flex-1 pt-1">
                          <p className="font-medium text-foreground">{step.status}</p>
                          <p className="text-sm text-muted-foreground">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-semibold text-foreground">Order Items</h2>
                  </div>

                  <div className="divide-y divide-border">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4">
                        <div className="w-16 h-16 bg-muted rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.color} / {item.size}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${item.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-muted/30 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-teal">Free</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-foreground">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Customer</h2>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">SJ</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {order.customer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Customer</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {order.customer.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {order.customer.phone}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Send WhatsApp
                  </Button>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Shipping Address</h2>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-foreground">
                      {order.customer.address}
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Payment</h2>
                  <p className="text-sm text-foreground">
                    {order.paymentMethod}
                  </p>
                  <span className="inline-block px-2 py-1 bg-teal/10 text-teal text-xs rounded-lg">
                    Paid
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
  );
};

export default OrderDetail;
