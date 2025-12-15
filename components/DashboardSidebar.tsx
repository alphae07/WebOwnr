"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  Image,
  Sparkles,
  Smartphone,
  LogOut,
  X,
  DollarSign,
  Users,
  Share2,
} from "lucide-react";

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}



export const DashboardSidebar = ({ open, onClose }: DashboardSidebarProps) => {
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
  console.warn("No site found for user:", user.uid);
  setSiteData(null);
  setOrderCount(0);
  return;
}

const siteInfo = {
  id: userSite.id,
  ...userSite.data(),
};

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




const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingBag, label: "Products", href: "/dashboard/products" },
   {
      icon: Package,
      label: "Orders",
      href: "/dashboard/orders",
      badge: orderCount > 0 ? orderCount : undefined,
    },
  { icon: DollarSign, label: "Revenue", href: "/dashboard/revenue" },
  { icon: Users, label: "Customers", href: "/dashboard/customers" },
  { icon: Share2, label: "Social Media", href: "/dashboard/social" },
  { icon: Image, label: "Media", href: "/dashboard/media" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Sparkles, label: "AI Tools", href: "/dashboard/ai-tools" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];


  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">W</span>
            </div>
            <span className="font-bold text-foreground">WebOwnr</span>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
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

        {/* Promo Card */}
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

            <Button size="sm" className="w-full">
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
  );
};
