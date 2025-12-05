"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  Image,
  Sparkles,
  Smartphone,
  Bell,
  LogOut,
  Menu,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);

      try {
        const siteRef = doc(db, "sites", user.uid);
        const siteSnap = await getDoc(siteRef);

        if (!siteSnap.exists()) {
          router.push("/onboarding");
          return;
        }

        setSiteData(siteSnap.data());
      } catch (error) {
        console.error("Error fetching site:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading dashboard...</div>;
  }

  if (!siteData) {
    return <div className="p-10 text-center text-red-600">No site data found.</div>;
  }

  const siteLink = `https://${siteData.subdomain}.webownr.com`;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: ShoppingBag, label: "Products", href: "/dashboard/products" },
    { icon: Package, label: "Orders", href: "/dashboard/orders", badge: 3 },
    { icon: Image, label: "Media", href: "/dashboard/media" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Sparkles, label: "AI Tools", href: "/dashboard/ai-tools" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const stats = [
    {
      label: "Total Revenue",
      value: "$12,450",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "bg-teal-light text-teal",
    },
    {
      label: "Orders",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-coral-light text-coral",
    },
    {
      label: "Visitors",
      value: "2,340",
      change: "-2.4%",
      trend: "down",
      icon: Eye,
      color: "bg-purple-light text-purple",
    },
    {
      label: "Customers",
      value: "89",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "bg-gold-light text-gold-dark",
    },
  ];

  const recentOrders = [
    { id: "#1234", customer: "Sarah Chen", product: "Summer Dress", amount: "$89.00", status: "Delivered" },
    { id: "#1233", customer: "Marcus Johnson", product: "Wireless Earbuds", amount: "$149.00", status: "Shipped" },
    { id: "#1232", customer: "Emily Rodriguez", product: "Handmade Candle Set", amount: "$45.00", status: "Processing" },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="font-bold text-foreground">WebOwnr</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                  item.active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute right-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* PWA Card */}
          <div className="p-4">
            <div className="p-4 bg-accent rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Mobile App</p>
                  <p className="text-xs text-muted-foreground">Convert to PWA</p>
                </div>
              </div>
              <Button variant="default" size="sm" className="w-full">
                Enable PWA
              </Button>
            </div>
          </div>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, John!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
              <a
                href={siteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                View Store
                <ExternalLink className="w-4 h-4" />
              </a>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
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
                <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
                <Link
                  href="/dashboard/orders"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{order.id}</span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            order.status === "Delivered"
                              ? "bg-success/10 text-success"
                              : order.status === "Shipped"
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.customer} • {order.product}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">{order.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-accent transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Add Product</p>
                    <p className="text-xs text-muted-foreground">Create a new listing</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-accent transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Generate descriptions</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-accent transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Image className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Media Manager</p>
                    <p className="text-xs text-muted-foreground">Upload images</p>
                  </div>
                </button>
              </div>

              {/* Installment Progress */}
              <div className="mt-6 p-4 bg-accent rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Ownership Progress</p>
                  <span className="text-xs text-primary font-medium">8/12 paid</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary w-2/3 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground">
                  4 payments left to own your website forever!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
