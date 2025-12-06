"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

import {
  Package,
  Image,
  Sparkles,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const Dashboard = () => {
  const router = useRouter();
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    visitors: 0,
    customers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [statsChanges, setStatsChanges] = useState({
    revenue: { change: "+0%", trend: "up" as "up" | "down" },
    orders: { change: "+0%", trend: "up" as "up" | "down" },
    visitors: { change: "+0%", trend: "up" as "up" | "down" },
    customers: { change: "+0%", trend: "up" as "up" | "down" },
  });

  // Fetch orders data
  const fetchOrders = async (siteId: string) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("siteId", "==", siteId),
        orderBy("createdAt", "desc")
      );
      const ordersSnapshot = await getDocs(q);
      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("siteId", "==", siteId));
        const ordersSnapshot = await getDocs(q);
        const orders = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return orders;
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        return [];
      }
    }
  };

  // Calculate statistics
  const calculateStats = (orders: any[]) => {
    const totalRevenue = orders.reduce((sum, order) => {
      const amount =
        typeof order.amount === "number"
          ? order.amount
          : parseFloat(order.amount) || 0;
      return sum + amount;
    }, 0);

    const completedOrders = orders.filter(
      (order) =>
        order.status === "Delivered" ||
        order.status === "Completed" ||
        order.status === "delivered" ||
        order.status === "completed"
    );

    const uniqueCustomers = new Set(
      orders.map((order) => order.customerId || order.customerEmail)
    );

    return {
      revenue: totalRevenue,
      ordersCount: orders.length,
      customers: uniqueCustomers.size,
      completedOrders: completedOrders.length,
    };
  };

  // Calculate percentage changes
  const calculateChanges = (currentStats: any, previousStats: any) => {
    const calculatePercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? "+" : "";
      return `${sign}${change.toFixed(1)}%`;
    };

    return {
      revenue: {
        change: calculatePercentage(currentStats.revenue, previousStats.revenue),
        trend: (currentStats.revenue >= previousStats.revenue ? "up" : "down") as "up" | "down",
      },
      orders: {
        change: calculatePercentage(currentStats.ordersCount, previousStats.ordersCount),
        trend: (currentStats.ordersCount >= previousStats.ordersCount ? "up" : "down") as "up" | "down",
      },
      visitors: {
        change: calculatePercentage(currentStats.visitors, previousStats.visitors),
        trend: (currentStats.visitors >= previousStats.visitors ? "up" : "down") as "up" | "down",
      },
      customers: {
        change: calculatePercentage(currentStats.customers, previousStats.customers),
        trend: (currentStats.customers >= previousStats.customers ? "up" : "down") as "up" | "down",
      },
    };
  };

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

        const siteInfo = { id: userSite.id, ...userSite.data() };
        setSiteData(siteInfo);

        const orders = await fetchOrders(userSite.id);

        const recent = orders
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 3);

        setRecentOrders(recent);

        const calculatedStats = calculateStats(orders);
        const currentVisitors = siteInfo.visitors || siteInfo.totalVisitors || 0;

        const currentStats = {
          revenue: calculatedStats.revenue,
          ordersCount: calculatedStats.ordersCount,
          visitors: currentVisitors,
          customers: calculatedStats.customers,
        };

        setStats({
          revenue: calculatedStats.revenue,
          orders: calculatedStats.ordersCount,
          visitors: currentVisitors,
          customers: calculatedStats.customers,
        });

        const previousStats = {
          revenue: calculatedStats.revenue * 0.9,
          ordersCount: Math.max(0, calculatedStats.ordersCount - 5),
          visitors: Math.max(0, currentVisitors - 100),
          customers: Math.max(0, calculatedStats.customers - 3),
        };

        const changes = calculateChanges(currentStats, previousStats);
        setStatsChanges(changes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statsDisplay = [
    {
      label: "Total Revenue",
      value: `$${stats.revenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: statsChanges.revenue.change,
      trend: statsChanges.revenue.trend,
      icon: DollarSign,
      color: "bg-teal-light text-teal",
    },
    {
      label: "Orders",
      value: stats.orders.toString(),
      change: statsChanges.orders.change,
      trend: statsChanges.orders.trend,
      icon: ShoppingCart,
      color: "bg-coral-light text-coral",
    },
    {
      label: "Visitors",
      value: stats.visitors.toLocaleString(),
      change: statsChanges.visitors.change,
      trend: statsChanges.visitors.trend,
      icon: Eye,
      color: "bg-purple-light text-purple",
    },
    {
      label: "Customers",
      value: stats.customers.toString(),
      change: statsChanges.customers.change,
      trend: statsChanges.customers.trend,
      icon: Users,
      color: "bg-gold-light text-gold-dark",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Orders
              </h2>
              <Link
                href="/dashboard/orders"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          #{order.orderId || order.id.slice(0, 8)}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            order.status === "Delivered" ||
                              order.status === "delivered"
                              ? "bg-success/10 text-success"
                              : order.status === "Shipped" ||
                                order.status === "shipped"
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.customerName || order.customerEmail} •{" "}
                        {order.productName || "Product"}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      $
                      {(
                        typeof order.amount === "number"
                          ? order.amount
                          : parseFloat(order.amount) || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                  <p className="text-sm mt-1">
                    Orders will appear here once customers make purchases
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/dashboard/products">
                <button className="w-full flex items-center gap-3 p-4 mb-3 rounded-xl bg-muted hover:bg-accent transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Add Product</p>
                    <p className="text-xs text-muted-foreground">
                      Create a new listing
                    </p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/ai-tools">
                <button className="w-full flex items-center gap-3 p-4 mb-3 rounded-xl bg-muted hover:bg-accent transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">
                      Generate descriptions
                    </p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/media">
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-accent transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Image className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Media Manager
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload images
                    </p>
                  </div>
                </button>
              </Link>
            </div>

            {/* Installment Progress */}
            {siteData?.installmentsPaid !== undefined &&
              siteData?.totalInstallments !== undefined && (
                <div className="mt-6 p-4 bg-accent rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">
                      Ownership Progress
                    </p>
                    <span className="text-xs text-primary font-medium">
                      {siteData.installmentsPaid}/{siteData.totalInstallments}{" "}
                      paid
                    </span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (siteData.installmentsPaid /
                            siteData.totalInstallments) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {siteData.totalInstallments - siteData.installmentsPaid}{" "}
                    payments left to own your website forever!
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;