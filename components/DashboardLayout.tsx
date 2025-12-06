"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { usePathname } from "next/navigation";
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
  ExternalLink,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Set user data
        setUserData({
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email,
          initials: user.displayName
            ? user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : user.email
            ? user.email[0].toUpperCase()
            : "U",
        });

        // Fetch site data
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

        // Fetch order count for badge
        try {
          const ordersSnapshot = await getDocs(collection(db, "orders"));
          const userOrders = ordersSnapshot.docs.filter(
            (doc) => doc.data().siteId === userSite.id
          );
          setOrderCount(userOrders.length);
        } catch (error) {
          console.error("Error fetching orders count:", error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">No site data found.</p>
          <Button onClick={() => router.push("/onboarding")}>
            Go to Onboarding
          </Button>
        </div>
      </div>
    );
  }

  const siteLink = `https://${siteData.subdomain}`;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingBag, label: "Products", href: "/dashboard/products" },
    {
      icon: Package,
      label: "Orders",
      href: "/dashboard/orders",
      badge: orderCount > 0 ? orderCount : undefined,
    },
    { icon: Image, label: "Media", href: "/dashboard/media" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Sparkles, label: "AI Tools", href: "/dashboard/ai-tools" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                    isActive
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
              );
            })}
          </nav>

          {/* PWA Card */}
          <div className="p-4">
            <div className="p-4 bg-accent rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Mobile App
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Convert to PWA
                  </p>
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
                <span className="text-primary-foreground font-medium">
                  {userData?.initials || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {userData?.displayName || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userData?.email || "user@example.com"}
                </p>
              </div>
              <button
                onClick={async () => {
                  await signOut(auth);
                  router.push("/login");
                }}
                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
              >
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
          <div className="flex items-center justify-between px-4 lg:px-6 py-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {pathname === "/dashboard"
                    ? "Dashboard"
                    : pathname === "/dashboard/products"
                    ? "Products"
                    : pathname === "/dashboard/orders"
                    ? "Orders"
                    : pathname === "/dashboard/media"
                    ? "Media"
                    : pathname === "/dashboard/analytics"
                    ? "Analytics"
                    : pathname === "/dashboard/ai-tools"
                    ? "AI Tools"
                    : pathname === "/dashboard/settings"
                    ? "Settings"
                    : "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {userData?.displayName || "User"}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                {orderCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
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

        {/* Page Content */}
        <main className="flex-1">{children}</main>
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

export default DashboardLayout;