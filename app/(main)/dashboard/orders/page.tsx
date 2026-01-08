"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { cn, formatNGN } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Package,
} from "lucide-react";

interface Order {
  id: string;
  siteId: string;
  orderId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
  items?: string[];
  amount: number;
  status: string;
  paymentStatus?: string;
  createdAt?: Timestamp | { toDate: () => Date };
  [key: string]: any;
}

interface SiteData {
  id: string;
  uid: string;
  [key: string]: any;
}

const Orders = () => {
  const router = useRouter();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders from Firebase
  const fetchOrders = async (siteId: string) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("siteId", "==", siteId),
        orderBy("createdAt", "desc")
      );
      const ordersSnapshot = await getDocs(q);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Fallback without orderBy if index doesn't exist
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("siteId", "==", siteId));
        const ordersSnapshot = await getDocs(q);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersData);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    }
  };

  // Auth and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "sites"));
        const userSite = querySnapshot.docs.find(
          (doc) => doc.data().uid === user.uid
        );

        if (!userSite) {
          router.push("/onboarding");
          return;
        }

        const siteInfo: SiteData = {
          id: userSite.id,
          ...userSite.data(),
        } as SiteData;
        setSiteData(siteInfo);

        await fetchOrders(userSite.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Calculate tab counts
  const getTabCounts = () => {
    const all = orders.length;
    const pending = orders.filter(
      (o) => o.status === "Pending" || o.status === "pending"
    ).length;
    const processing = orders.filter(
      (o) => o.status === "Processing" || o.status === "processing"
    ).length;
    const shipped = orders.filter(
      (o) => o.status === "Shipped" || o.status === "shipped"
    ).length;
    const delivered = orders.filter(
      (o) => o.status === "Delivered" || o.status === "delivered" || o.status === "Completed" || o.status === "completed"
    ).length;

    return { all, pending, processing, shipped, delivered };
  };

  const tabCounts = getTabCounts();

  const tabs = [
    { id: "all", label: "All Orders", count: tabCounts.all },
    { id: "pending", label: "Pending", count: tabCounts.pending },
    { id: "processing", label: "Processing", count: tabCounts.processing },
    { id: "shipped", label: "Shipped", count: tabCounts.shipped },
    { id: "delivered", label: "Delivered", count: tabCounts.delivered },
  ];

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    // Normalize status safely
    const status = (order.status || "").toString().toLowerCase();

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      status === activeTab.toLowerCase() ||
      (activeTab === "delivered" && status === "completed");

    // Filter by search (only if there's a query)
    const matchesSearch =
      !searchQuery.trim() ||
      (order.orderId || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerEmail || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.productName || "").toString().toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date =
      timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get customer initials
  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOrderAmount = (order: any): number => {
    const amt = order?.amount ?? order?.pricing?.total ?? 0;
    return typeof amt === "number" ? amt : parseFloat(amt) || 0;
  };



  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          
          {/* Tabs */}
          <div className="overflow-y-auto">
            <div className="flex lg:flex-nowrap gap-2 max-w-sm md:max-w-md lg:max-w-full pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-70">
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <Button variant="outline" className="gap-2 shrink-0">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Orders Table */}
        
          <div className="bg-card  max-w-full  rounded-2xl border border-border overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery || activeTab !== "all"
                    ? "No orders found"
                    : "No orders yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || activeTab !== "all"
                    ? "Try adjusting your search or filters"
                    : "Orders will appear here once customers make purchases"}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-auto">
                <table className="min-w-[380px] w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left px-2 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Order
                      </th>
                      <th className="text-left px-2 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Customer
                      </th>
                      <th className="hidden md:table-cell text-left px-4 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Product
                      </th>
                      <th className="hidden md:table-cell text-left px-4 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Total
                      </th>
                      <th className="hidden md:table-cell text-left px-4 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-left px-2 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-right px-2 lg:px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-2 lg:px-6 py-4">
                          <span className="font-medium text-foreground text-sm whitespace-nowrap">
                            #{order.orderId || order.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-2 lg:px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[50px]">
                            
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {order.customerInfo.firstName || "Unknown"}&nbsp;{order.customerInfo.lastName || ""}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {order.customerInfo.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 lg:px-6 py-4">
                          <p className="text-sm text-foreground truncate max-w-[200px]">
                            {order.items?.[0]?.name || order.productName || "Product"}
                          </p>
                          {(order.items?.length ?? 0) > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.items.length - 1} more
                            </p>
                          )}
                        </td>
                        <td className="hidden md:table-cell px-4 lg:px-6 py-4 font-medium text-foreground whitespace-nowrap">
                          {formatNGN(getOrderAmount(order))}
                        </td>
                        <td className="hidden md:table-cell px-4 lg:px-6 py-4 text-muted-foreground text-sm whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-2 lg:px-6 py-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap inline-block",
                              order.status === "Delivered" ||
                                order.status === "delivered" ||
                                order.status === "Completed" ||
                                order.status === "completed"
                                ? "bg-success/10 text-success"
                                : order.status === "Shipped" ||
                                  order.status === "shipped"
                                ? "bg-primary/10 text-primary"
                                : order.status === "Processing" ||
                                  order.status === "processing"
                                ? "bg-purple/10 text-purple"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-2 lg:px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                              title="View order"
                              onClick={()=> router.push(`/dashboard/orders/${order.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-teal transition-colors"
                              title="Message customer"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
            )}
          </div>

         
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
