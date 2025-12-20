"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Package,
  DollarSign,
  Heart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  MoreVertical,
} from "lucide-react";

/* ---------------- Types ---------------- */
type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  joinedDate?: string;
  ordersCount?: number;
  totalSpent?: string;
  status?: string;
  avatar?: string;
  notes?: string;
};

type Order = {
  id: string;
  date: string;
  items: number;
  total: string;
  status: string;
};

type WishlistItem = {
  id: string;
  name: string;
  price: string;
  image: string;
};

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch Later ---------------- */
  useEffect(() => {
    if (!id) return;

    // TODO: Replace with Firestore / API call
    // Example:
    // fetchCustomer(id)
    // fetchOrders(id)
    // fetchWishlist(id)

    setLoading(false);
  }, [id]);

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">
            Loading customer…
          </div>
        ) : !customer ? (
          <div className="p-10 text-center text-muted-foreground">
            Customer not found
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ---------------- Customer Info ---------------- */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {customer.avatar ?? "?"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {customer.name}
                    </h2>
                    {customer.status && (
                      <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-teal-light text-teal">
                        {customer.status}
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>{customer.address}</span>
                  </div>
                )}
                {customer.joinedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>Customer since {customer.joinedDate}</span>
                  </div>
                )}
              </div>

              {customer.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-medium text-foreground mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {customer.notes}
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button className="flex-1 gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              </div>
            </div>

            {/* ---------------- Stats & Orders ---------------- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={<ShoppingCart className="w-5 h-5 text-primary" />}
                  value={customer.ordersCount ?? 0}
                  label="Total Orders"
                />
                <StatCard
                  icon={<DollarSign className="w-5 h-5 text-teal" />}
                  value={customer.totalSpent ?? "₦0"}
                  label="Total Spent"
                />
                <StatCard
                  icon={<Heart className="w-5 h-5 text-coral" />}
                  value={wishlist.length}
                  label="Wishlist Items"
                />
              </div>

              {/* Orders */}
              <Section title="Order History">
                {orders.length === 0 ? (
                  <Empty text="No orders yet" />
                ) : (
                  orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))
                )}
              </Section>

              {/* Wishlist */}
              <Section title="Wishlist">
                {wishlist.length === 0 ? (
                  <Empty text="Wishlist is empty" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <WishlistCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

/* ---------------- Small Components ---------------- */

const StatCard = ({ icon, value, label }: any) => (
  <div className="bg-card rounded-xl border border-border p-4 text-center">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
      {icon}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="bg-card rounded-2xl border border-border">
    <div className="p-6 border-b border-border">
      <h2 className="font-semibold text-foreground">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div className="text-center text-sm text-muted-foreground py-6">
    {text}
  </div>
);

const OrderRow = ({ order }: { order: Order }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
    <div className="flex items-center gap-3">
      <Package className="w-5 h-5 text-muted-foreground" />
      <div>
        <p className="font-medium">Order {order.id}</p>
        <p className="text-xs text-muted-foreground">
          {order.date} · {order.items} items
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold">{order.total}</p>
      <span className="text-xs">{order.status}</span>
    </div>
  </div>
);

const WishlistCard = ({ item }: { item: WishlistItem }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl border border-border">
    <img
      src={item.image}
      alt={item.name}
      className="w-16 h-16 rounded-lg object-cover"
    />
    <div>
      <p className="font-medium">{item.name}</p>
      <p className="text-sm font-semibold text-primary">{item.price}</p>
    </div>
  </div>
);

export default CustomerDetail;
