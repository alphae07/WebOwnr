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
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
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
   Download,
   Upload,
  Zap,
  Plus,
  ExternalLink,
  Link2,
  MessageSquare,
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
      <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
       <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader
          title="Dashboard"
          subtitle="Welcome back!"
          onMenuClick={() => setSidebarOpen(true)}
          actions={<div className="flex items-center gap-2"><a
                href="https://your-store.webownr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                View Store
                <ExternalLink className="w-4 h-4" />
              </a><Button onClick={() => router.push('/dashboard/addproducts')}>
	<Plus className="w-4 h-4" />
                Add Product</Button>
		</div>}
        />

	<div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-centerr">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
	</div>
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
       <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader
          title={pathname === "/dashboard"
                    ? "Dashboard"
                    : pathname === "/dashboard/products"
                    ? "Products"
                    : pathname === "/dashboard/orders"
                    ? "Orders"
                    : pathname === "/dashboard/media"
                    ? "Media Manager"
                    : pathname === "/dashboard/analytics"
                    ? "Analytics"
                    : pathname === "/dashboard/ai-tools"
                    ? "AI Tools"
                    : pathname === "/dashboard/settings"
                    ? "Settings"
			: pathname === "/dashboard/revenue"
                    ? "Revenue"
			: pathname === "/dashboard/social"
                    ? "Social Media"
			: pathname === "/dashboard/customer"
                    ? "Customers"
			: pathname === "/dashboard/customerdetails"
                    ? "Customer Details"
			: pathname === "/dashboard/addproduct"
                    ? "Add Product"
                    : "Dashboard"}
          subtitle={pathname === "/dashboard"
                    ? "Welcome back!"
                    : pathname === "/dashboard/products"
                    ? "Manage your product catalog"
                    : pathname === "/dashboard/orders"
                    ? "Manage and track customer orders"
                    : pathname === "/dashboard/media"
                    ? "Upload and organize your files"
                    : pathname === "/dashboard/analytics"
                    ? "Track your store performance"
                    : pathname === "/dashboard/ai-tools"
                    ? "Supercharge your content with AI"
                    : pathname === "/dashboard/settings"
                    ? "Manage your store settings"
			: pathname === "/dashboard/revenue"
                    ? "Track your earnings & withdrawals"
			: pathname === "/dashboard/social"
                    ? "Connect & share products"
			: pathname === "/dashboard/customer"
                    ? "Manage your customer base"
			: pathname === "/dashboard/customerdetails"
                    ? "View customer information"
			: pathname === "/dashboard/addproduct"
                    ? "Create a new product for your store"
                    : "Dashboard"}
          onMenuClick={() => setSidebarOpen(true)}
          actions={pathname === "/dashboard"
                    ? <div className="flex items-center gap-2"><a
                href="https://your-store.webownr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                View Store
                <ExternalLink className="w-4 h-4" />
              </a><Button onClick={() => router.push('/dashboard/addproducts')}><Plus className="w-4 h-4" />
                Add Product</Button>
		</div>
                    : pathname === "/dashboard/products"
                    ? <Button onClick={() => router.push('/dashboard/addproducts')}><Plus className="w-4 h-4" />
                Add Product</Button>
                    : pathname === "/dashboard/orders"
                    ? <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
                    : pathname === "/dashboard/media"
                    ? <Button size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
                    : pathname === "/dashboard/analytics"
                    ? <a
                href="https://your-store.webownr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                View Store
                <ExternalLink className="w-4 h-4" />
              </a>
                    : pathname === "/dashboard/ai-tools"
                    ? <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">47 credits</span>
              </div>
                    : pathname === "/dashboard/settings"
                    ? <a
                href="https://your-store.webownr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                View Store
                <ExternalLink className="w-4 h-4" />
              </a>

			: pathname === "/dashboard/revenue"
                    ? <Button size="sm" className="gap-2">
                <Wallet className="w-4 h-4" />
                Withdraw
              </Button>
			: pathname === "/dashboard/social"
                    ? <Button size="sm" className="gap-2">
                <Link2 className="w-4 h-4" />
                Connect Account
              </Button>

			: pathname === "/dashboard/customer"
                    ? <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
			: pathname === "/dashboard/customerdetails"
                    ? <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
			: pathname === "/dashboard/addproduct"
                    ? 
              <Button>Save Product</Button>
            
                    : "Dashboard"}

        />

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