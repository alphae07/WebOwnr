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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { formatNGN } from "@/lib/utils";

/* ---------------- Types ---------------- */
type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  joinedDate?: string;
  ordersCount?: number;
  totalSpent?: number;
  status?: string;
  avatar?: string;
  notes?: string;
};

type Order = {
  id: string;
  date: string;
  items: number;
  total: number;
  status: string;
  customerInfo?: Customer; // customer snapshot stored inside order
};

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const CustomerDetail = () => {
  const { id: email } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteId, setSiteId] = useState<string | null>(null);

  /* ---------------- Fetch from Firestore ---------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !email) {
        setLoading(false);
        return;
      }
      try {
        const emailStr = decodeURIComponent(String(email));
        const sitesSnap = await getDocs(collection(db, "sites"));
        const userSite = sitesSnap.docs.find((d) => d.data().uid === user.uid);
        if (!userSite) {
          setLoading(false);
          return;
        }
        const currentSiteId = userSite.id;
        setSiteId(currentSiteId);

        const customerRef = doc(db, "customers", email as string);
        const customerSnap = await getDoc(customerRef);

        let customerData: Customer | null = null;
        if (customerSnap.exists()) {
          const raw: any = customerSnap.data();
          customerData = {
            id: email,
            name:
              raw.name ||
              `${raw.firstName || ""} ${raw.lastName || ""}`.trim() ||
              emailStr,
            email: raw.email || emailStr,
            phone: raw.phone,
            address:
              raw.address ||
              [raw.city, raw.state, raw.country].filter(Boolean).join(", "),
            joinedDate: raw.joinedDate,
            status: raw.status,
            avatar: raw.avatar,
            notes: raw.notes,
          };
        } else {
          const customersByEmailQ = query(
            collection(db, "customers"),
            where("email", "==", emailStr)
          );
          const customersByEmailSnap = await getDocs(customersByEmailQ);
          const docByEmail = customersByEmailSnap.docs[0];
          if (docByEmail) {
            const raw: any = docByEmail.data();
            customerData = {
              id: emailStr,
              name:
                raw.name ||
                `${raw.firstName || ""} ${raw.lastName || ""}`.trim() ||
                emailStr,
              email: raw.email || emailStr,
              phone: raw.phone,
              address:
                raw.address ||
                [raw.city, raw.state, raw.country].filter(Boolean).join(", "),
              joinedDate: raw.joinedDate,
              status: raw.status,
              avatar: raw.avatar,
              notes: raw.notes,
            };
          }
        }

        const ordersQ1 = query(
          collection(db, "orders"),
          where("siteId", "==", currentSiteId),
          where("customerInfo.email", "==", emailStr)
        );
        const ordersSnap1 = await getDocs(ordersQ1);
        let ordersDocs = ordersSnap1.docs;

        if (ordersDocs.length === 0) {
          const ordersQ2 = query(
            collection(db, "orders"),
            where("siteId", "==", currentSiteId),
            where("customemrEail", "==", emailStr)
          );
          const ordersSnap2 = await getDocs(ordersQ2);
          ordersDocs = ordersSnap2.docs;
        }

        if (ordersDocs.length === 0) {
          const ordersQ3 = query(
            collection(db, "orders"),
            where("siteId", "==", currentSiteId),
            where("customerEmail", "==", emailStr)
          );
          const ordersSnap3 = await getDocs(ordersQ3);
          ordersDocs = ordersSnap3.docs;
        }

        if (ordersDocs.length === 0) {
          const siteOrdersSnap = await getDocs(
            query(collection(db, "orders"), where("siteId", "==", currentSiteId))
          );
          ordersDocs = siteOrdersSnap.docs.filter((d) => {
            const data: any = d.data();
            const e1 = data?.customerInfo?.email;
            const e2 = data?.customemrEail;
            const e3 = data?.customerEmail;
            return [e1, e2, e3].some((e) => String(e || "").toLowerCase() === emailStr.toLowerCase());
          });
        }

        const ordersData: Order[] = [];
        ordersDocs.forEach((d) => {
          const data: any = d.data();
          const createdAt: Date =
            data.createdAt?.toDate?.() ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
          const itemsCount: number = Array.isArray(data.items) ? data.items.length : Number(data.items || 0);
          const totalNum: number = typeof data.total === "number" ? data.total : parseFloat(String(data.total || 0));
          ordersData.push({
            id: d.id,
            date: createdAt.toISOString().split("T")[0],
            items: itemsCount,
            total: isNaN(totalNum) ? 0 : totalNum,
            status: String(data.status || "pending"),
            customerInfo: data.customerInfo as Customer | undefined,
          });
        });
        setOrders(ordersData);

        if (!customerData && ordersData.length > 0 && ordersData[0].customerInfo) {
          const ci: any = ordersData[0].customerInfo;
          const locationParts = [
            ci?.shippingAddress?.city,
            ci?.shippingAddress?.state,
            ci?.shippingAddress?.country,
          ].filter(Boolean);
          customerData = {
            id: emailStr,
            name:
              ci?.name ||
              `${ci?.firstName || ""} ${ci?.lastName || ""}`.trim() ||
              emailStr,
            email: (ci?.email as string) || emailStr,
            phone: ci?.phone,
            address: locationParts.length ? locationParts.join(", ") : undefined,
            joinedDate: ordersData[ordersData.length - 1]?.date,
            status:
              (ci?.status || "").toLowerCase() === "active" ? "active" : undefined,
            avatar: ci?.avatar,
            notes: ci?.notes,
          };
        }

        if (!customerData && ordersData.length > 0) {
          const first = ordersDocs[0]?.data() as any;
          const e1 = first?.customerInfo?.email;
          const e2 = first?.customemrEail;
          const e3 = first?.customerEmail;
          const name =
            first?.customerName ||
            `${first?.customerInfo?.firstName || ""} ${first?.customerInfo?.lastName || ""}`.trim() ||
            emailStr;
          const locationParts = [
            first?.shippingAddress?.city,
            first?.shippingAddress?.state,
            first?.shippingAddress?.country,
          ].filter(Boolean);
          customerData = {
            id: emailStr,
            name,
            email: (e1 || e2 || e3 || emailStr) as string,
            phone: first?.customerInfo?.phone || first?.phone,
            address: locationParts.length ? locationParts.join(", ") : undefined,
            joinedDate: ordersData[ordersData.length - 1]?.date,
            status:
              ["completed", "delivered", "paid"].includes(String(first?.status || "").toLowerCase())
                ? "active"
                : "inactive",
          };
        }

        setCustomer(customerData);

        const wishlistQ = query(
          collection(db, "wishlists"),
          where("siteId", "==", currentSiteId),
          where("customerId", "==", emailStr)
        );
        const wishlistSnap = await getDocs(wishlistQ);
        const wishlistData: WishlistItem[] = [];
        wishlistSnap.forEach((d) => {
          const w: any = d.data();
          const priceNum: number = typeof w.price === "number" ? w.price : parseFloat(String(w.price || 0));
          wishlistData.push({
            id: d.id,
            name: String(w.name || ""),
            price: isNaN(priceNum) ? 0 : priceNum,
            image: String(w.image || ""),
          });
        });
        setWishlist(wishlistData);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [email]);

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading customer…</div>
        ) : !customer ? (
          <div className="p-10 text-center text-muted-foreground">Customer not found</div>
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
                    <h2 className="text-xl font-semibold text-foreground">{customer.name}</h2>
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
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
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
                  value={orders.length}
                  label="Total Orders"
                />
                <StatCard
                  icon={<DollarSign className="w-5 h-5 text-teal" />}
                  value={orders.reduce((sum, o) => sum + (o.total || 0), 0)}
                  label="Total Spent"
                  money
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
                  orders.map((order) => <OrderRow key={order.id} order={order} />)
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

const StatCard = ({ icon, value, label, money = false }: any) => (
  <div className="bg-card rounded-xl border border-border p-4 text-center">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
      {icon}
    </div>
    <p className="text-2xl font-bold text-foreground">
      {money && typeof value === "number" ? formatNGN(Number(value)) : value}
    </p>
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
  <div className="text-center text-sm text-muted-foreground py-6">{text}</div>
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
      <p className="font-semibold">{formatNGN(Number(order.total || 0))}</p>
      <span className="text-xs">{order.status}</span>
    </div>
  </div>
);

const WishlistCard = ({ item }: { item: WishlistItem }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl border border-border">
    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
    <div>
      <p className="font-medium">{item.name}</p>
      <p className="text-sm font-semibold text-primary">{formatNGN(Number(item.price || 0))}</p>
    </div>
  </div>
);

export default CustomerDetail;
