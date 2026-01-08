"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path to your firebase config

/* ---------------- Types ---------------- */

type OrderItem = {
  id: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
};

type TimelineStep = {
  status: string;
  date?: string;
  complete: boolean;
  current?: boolean;
};

type Address = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type Order = {
  id: string;
  status: string;
  date?: string;
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  shippingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  timeline: TimelineStep[];
};

const OrderDetail = () => {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const statusOptions = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  /* ---------------- Fetch from Firebase ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", id));
        if (!snap.exists()) {
          setOrder(null);
          return;
        }
        const data = snap.data();

        // Build timeline
        const timeline: TimelineStep[] = statusOptions.map((s) => {
          const complete = data.statusTimeline?.[s];
          return {
            status: s,
            date: complete ? (complete as Timestamp).toDate().toISOString() : undefined,
            complete: !!complete,
            current: s === data.status,
          };
        });

        const items: OrderItem[] = (data.items || []).map((it: any) => ({
          id: it.id || "",
          name: it.name || "",
          size: it.size,
          color: it.color,
          quantity: it.quantity || 0,
          price: it.price || 0,
        }));

        setOrder({
          id,
          status: data.status || "Order Placed",
          date: data.createdAt?.toDate().toISOString(),
          customerInfo: data.customerInfo
            ? {
                name: data.customerInfo.name || "",
                email: data.customerInfo.email,
                phone: data.customerInfo.phone,
                address: data.shippingAddress,
              }
            : undefined,
          shippingAddress: data.shippingAddress,
          items,
          subtotal: data.pricing.subtotal || 0,
          shipping: data.pricing.shipping || 0,
          total: data.pricing.total || 0,
          paymentMethod: data.paymentMethod,
          timeline,
        });
      } catch (err) {
        console.error(err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ---------------- Update Status ---------------- */
  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    try {
      const updates: any = {
        status: newStatus,
        [`statusTimeline.${newStatus}`]: Timestamp.now(),
      };
      await updateDoc(doc(db, "orders", id), updates);

      // Recompute local timeline
      const newTimeline = statusOptions.map((s) => {
        const complete = order.timeline.find((t) => t.status === s)?.complete || false;
        return {
          status: s,
          date:
            s === newStatus
              ? new Date().toISOString()
              : complete
              ? order.timeline.find((t) => t.status === s)?.date
              : undefined,
          complete: complete || s === newStatus,
          current: s === newStatus,
        };
      });

      setOrder({ ...order, status: newStatus, timeline: newTimeline });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
      setOpenStatus(false);
    }
  };

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
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updating}
                        onClick={() => setOpenStatus((o) => !o)}
                        className="inline-flex items-center gap-2"
                      >
                        {order.status}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      {openStatus && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-popover border rounded-lg shadow-lg z-20">
                          {statusOptions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm hover:bg-accent",
                                s === order.status && "font-semibold"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                        <Row label="Total" value={`₦${order.total}`} bold />
                      </div>
                    </>
                  )}
                </Card>
              </div>

              {/* ---------------- Sidebar ---------------- */}
              <div className="space-y-6">
                <Card title="Customer">
                  {order.customerInfo ? (
                    <>
                      <p className="font-medium">{order.customerInfo.name}</p>

                      {order.customerInfo.email && (
                        <Info icon={<Mail />} text={order.customerInfo.email} />
                      )}
                      {order.customerInfo.phone && (
                        <Info icon={<Phone />} text={order.customerInfo.phone} />
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
                  {order.shippingAddress ? (
                    <Info
                      icon={<MapPin />}
                      text={`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`}
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
                        {order.paymentStatus ?? 'Pending'}
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
  <div className="p-6 text-center text-sm text-muted-foreground">{text}</div>
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
    <img src={item.image} alt={item.name} className="w-16 h-16 bg-muted rounded-lg object-cover" />
    <div className="flex-1">
      <p className="font-medium">{item.name}</p>
      <p className="text-sm text-muted-foreground">
        {item.color} {item.size && `· ${item.size}`}
      </p>
      <p className="text-sm">Qty: {item.quantity}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">₦{(item.price * item.quantity).toFixed(2)}</p>
      <p className="text-xs text-muted-foreground">₦{item.price} each</p>
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
