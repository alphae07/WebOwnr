"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Types ---------------- */

type OrderItem = {
  id: string;
  name: string;
  size?: string;
  color?: string;
  qty: number;
  price: number;
};

type TimelineStep = {
  status: string;
  date?: string;
  complete: boolean;
  current?: boolean;
};

type Order = {
  id: string;
  status: string;
  date?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  timeline: TimelineStep[];
};

interface OrderDetailProps {
  params: { id: string };
}

const OrderDetail = ({ params }: OrderDetailProps) => {
  const { id } = params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch Later ---------------- */
  useEffect(() => {
    if (!id) return;

    // TODO:
    // fetchOrderById(id).then(setOrder)
    // setLoading(false)

    setLoading(false);
  }, [id]);

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          {loading ? (
            <Empty text="Loading order…" />
          ) : !order ? (
            <Empty text="Order not found" />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* ---------------- Main ---------------- */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status */}
                <Card title="Order Status">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {order.status}
                    </span>
                  </div>

                  <div className="relative">
                    {order.timeline.map((step, index) => (
                      <TimelineStepRow
                        key={index}
                        step={step}
                        index={index}
                        total={order.timeline.length}
                      />
                    ))}
                  </div>
                </Card>

                {/* Items */}
                <Card title="Order Items">
                  {order.items.length === 0 ? (
                    <Empty text="No items in this order" />
                  ) : (
                    <>
                      <div className="divide-y divide-border">
                        {order.items.map((item) => (
                          <ItemRow key={item.id} item={item} />
                        ))}
                      </div>

                      <div className="p-6 bg-muted/30 space-y-2">
                        <Row label="Subtotal" value={`₦${order.subtotal}`} />
                        <Row label="Shipping" value={`₦${order.shipping}`} />
                        <Row
                          label="Total"
                          value={`₦${order.total}`}
                          bold
                        />
                      </div>
                    </>
                  )}
                </Card>
              </div>

              {/* ---------------- Sidebar ---------------- */}
              <div className="space-y-6">
                <Card title="Customer">
                  {order.customer ? (
                    <>
                      <p className="font-medium">{order.customer.name}</p>

                      {order.customer.email && (
                        <Info icon={<Mail />} text={order.customer.email} />
                      )}
                      {order.customer.phone && (
                        <Info icon={<Phone />} text={order.customer.phone} />
                      )}

                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Send WhatsApp
                      </Button>
                    </>
                  ) : (
                    <Empty text="No customer info" />
                  )}
                </Card>

                <Card title="Shipping Address">
                  {order.customer?.address ? (
                    <Info
                      icon={<MapPin />}
                      text={order.customer.address}
                    />
                  ) : (
                    <Empty text="No shipping address" />
                  )}
                </Card>

                <Card title="Payment">
                  {order.paymentMethod ? (
                    <>
                      <p className="text-sm">{order.paymentMethod}</p>
                      <span className="inline-block px-2 py-1 bg-teal/10 text-teal text-xs rounded-lg">
                        Paid
                      </span>
                    </>
                  ) : (
                    <Empty text="No payment info" />
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

/* ---------------- Small Components ---------------- */

const Card = ({ title, children }: any) => (
  <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
    <h2 className="font-semibold">{title}</h2>
    {children}
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div className="p-6 text-center text-sm text-muted-foreground">
    {text}
  </div>
);

const Row = ({ label, value, bold }: any) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={bold ? "font-bold" : ""}>{value}</span>
  </div>
);

const Info = ({ icon, text }: any) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-muted-foreground">{icon}</span>
    <span>{text}</span>
  </div>
);

const ItemRow = ({ item }: { item: OrderItem }) => (
  <div className="flex gap-4 p-4">
    <div className="w-16 h-16 bg-muted rounded-lg" />
    <div className="flex-1">
      <p className="font-medium">{item.name}</p>
      <p className="text-sm text-muted-foreground">
        {item.color} {item.size && `· ${item.size}`}
      </p>
      <p className="text-sm">Qty: {item.qty}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">
        ₦{(item.price * item.qty).toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        ₦{item.price} each
      </p>
    </div>
  </div>
);

const TimelineStepRow = ({ step, index, total }: any) => (
  <div className="flex gap-4 pb-6 last:pb-0">
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
        ) : index === total - 2 ? (
          <Truck className="w-4 h-4" />
        ) : (
          <Package className="w-4 h-4" />
        )}
      </div>

      {index < total - 1 && (
        <div
          className={cn(
            "absolute top-8 w-0.5 h-full",
            step.complete ? "bg-teal" : "bg-border"
          )}
        />
      )}
    </div>

    <div className="flex-1 pt-1">
      <p className="font-medium">{step.status}</p>
      <p className="text-sm text-muted-foreground">{step.date ?? "Pending"}</p>
    </div>
  </div>
);

export default OrderDetail;
