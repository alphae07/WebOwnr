"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Instagram,
  Twitter,
  Bell,
  CheckCircle,
  ExternalLink,
  Unlink,
  Eye,
  MousePointer,
  Link2,
  ShoppingCart,
  TrendingUp,
  Share2,
  Calendar,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import SocialMediaModal from "@/components/social/SocialMediaModal";
import SchedulePostModal from "@/components/social/SchedulePostModal";
import CreateAdModal from "@/components/social/CreateAdModal";
import { getSocialPlatforms, getProducts, getSocialStats } from "@/lib/firebase";
import { toast } from "sonner";

interface SocialPlatform {
  id: string;
  name: string;
  connected: boolean;
  accessToken: string | null;
  username: string | null;
  followers: string | null;
  metrics: {
    reach: number;
    engagement: number;
  };
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  shared: string[];
}

const SocialMedia = () => {
  const [user, setUser] = useState<User | null>(null);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalReach: 0,
    engagement: 0,
    linkClicks: 0,
    socialOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user?.uid]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [platformsData, productsData, statsData] = await Promise.all([
        getSocialPlatforms(user.uid),
        getProducts(user.uid),
        getSocialStats(user.uid),
      ]);

      setPlatforms(platformsData);
      setProducts(productsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setActiveModal("connect");
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to disconnect this platform?")) return;
    
    try {
      // Implementation in API endpoint
      const res = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, platformId }),
      });

      if (!res.ok) throw new Error("Failed to disconnect");
      toast.success("Platform disconnected successfully");
      await loadData();
    } catch (error) {
      toast.error("Failed to disconnect platform");
    }
  };

  const handleShareProduct = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    setActiveModal("share");
  };

  const handleSchedulePost = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    setActiveModal("schedule");
  };

  const handleCreateAd = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    setActiveModal("ad");
  };

  const socialStats = [
    { label: "Total Reach", value: stats.totalReach.toLocaleString(), icon: Eye, color: "text-blue-500" },
    { label: "Engagement", value: stats.engagement.toLocaleString(), icon: MousePointer, color: "text-purple-500" },
    { label: "Link Clicks", value: stats.linkClicks.toLocaleString(), icon: Link2, color: "text-teal-500" },
    { label: "Social Orders", value: stats.socialOrders.toLocaleString(), icon: ShoppingCart, color: "text-red-500" },
  ];

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {socialStats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connected Platforms */}
          <div className="bg-card rounded-2xl border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">Connected Platforms</h2>
              <p className="text-sm text-muted-foreground">Manage your social media accounts</p>
            </div>
            <div className="divide-y divide-border">
              {platforms.map((platform) => (
                <div key={platform.id} className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                    platform.id === "facebook" && "bg-[#1877F2]",
                    platform.id === "instagram" && "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
                    platform.id === "twitter" && "bg-foreground",
                  )}>
                    {platform.id === "facebook" && <Facebook className="w-6 h-6" />}
                    {platform.id === "instagram" && <Instagram className="w-6 h-6" />}
                    {platform.id === "twitter" && <Twitter className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{platform.name}</p>
                      {platform.connected && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {platform.connected ? (
                      <p className="text-sm text-muted-foreground">
                        {platform.username}
                        {platform.followers && ` · ${platform.followers} followers`}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                  {platform.connected ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDisconnectPlatform(platform.id)}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectPlatform(platform.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Share Products */}
          <div className="bg-card rounded-2xl border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">Share Products</h2>
              <p className="text-sm text-muted-foreground">Select products to share across your channels</p>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                    className="rounded"
                  />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-primary font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border space-y-2">
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={handleShareProduct}
                  disabled={selectedProducts.length === 0}
                >
                  <Share2 className="w-4 h-4" />
                  Share Now
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleSchedulePost}
                  disabled={selectedProducts.length === 0}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleCreateAd}
                  disabled={selectedProducts.length === 0}
                >
                  <Zap className="w-4 h-4" />
                  Create Ad
                </Button>
              </div>
              <Link href="/dashboard/products" className="w-full">
                <Button variant="ghost" className="w-full">View All Products</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Social Commerce Info */}
        <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-teal-500/10 rounded-2xl border border-primary/20 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Enable Social Commerce</h3>
              <p className="text-muted-foreground text-sm">
                Share products with "Buy Now" links directly to your social media. Customers can checkout via WhatsApp or your storefront. Track every sale back to your social posts.
              </p>
            </div>
            <Button className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeModal === "connect" && selectedPlatform && (
        <SocialMediaModal
          platformId={selectedPlatform}
          onClose={() => {
            setActiveModal(null);
            loadData();
          }}
        />
      )}
      {activeModal === "share" && (
        <SocialMediaModal
          mode="share"
          productIds={selectedProducts}
          onClose={() => {
            setActiveModal(null);
            setSelectedProducts([]);
          }}
        />
      )}
      {activeModal === "schedule" && (
        <SchedulePostModal
          productIds={selectedProducts}
          platforms={platforms.filter(p => p.connected)}
          onClose={() => {
            setActiveModal(null);
            setSelectedProducts([]);
            loadData();
          }}
        />
      )}
      {activeModal === "ad" && (
        <CreateAdModal
          productIds={selectedProducts}
          platforms={platforms.filter(p => p.connected)}
          onClose={() => {
            setActiveModal(null);
            setSelectedProducts([]);
            loadData();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default SocialMedia;
