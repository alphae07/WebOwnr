"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  DollarSign,
  Users,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  CheckCircle,
  Link2,
  ExternalLink,
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingCart,
  Unlink,
} from "lucide-react";

const SocialMedia = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const socialPlatforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      connected: true,
      username: "@mystore",
      followers: "12.5K",
      color: "bg-[#1877F2]",
      lightColor: "bg-[#1877F2]/10",
      textColor: "text-[#1877F2]",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      connected: true,
      username: "@mystore.shop",
      followers: "8.2K",
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
      lightColor: "bg-[#E1306C]/10",
      textColor: "text-[#E1306C]",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: Twitter,
      connected: false,
      username: null,
      followers: null,
      color: "bg-foreground",
      lightColor: "bg-foreground/10",
      textColor: "text-foreground",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      connected: false,
      username: null,
      followers: null,
      color: "bg-foreground",
      lightColor: "bg-foreground/10",
      textColor: "text-foreground",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      connected: true,
      username: "+1 (555) 123-4567",
      followers: null,
      color: "bg-[#25D366]",
      lightColor: "bg-[#25D366]/10",
      textColor: "text-[#25D366]",
    },
  ];

  const recentProducts = [
    {
      id: 1,
      name: "Summer Floral Dress",
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&h=100&fit=crop",
      price: "$89.00",
      shared: ["facebook", "instagram"],
    },
    {
      id: 2,
      name: "Wireless Earbuds",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop",
      price: "$149.00",
      shared: ["instagram"],
    },
    {
      id: 3,
      name: "Organic Face Serum",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop",
      price: "$65.00",
      shared: [],
    },
  ];

  const socialStats = [
    { label: "Total Reach", value: "45.2K", icon: Eye, color: "text-primary" },
    { label: "Engagement", value: "3.8K", icon: MousePointer, color: "text-purple" },
    { label: "Link Clicks", value: "1.2K", icon: Link2, color: "text-teal" },
    { label: "Social Orders", value: "156", icon: ShoppingCart, color: "text-coral" },
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
                {socialPlatforms.map((platform) => (
                  <div key={platform.id} className="p-4 flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", platform.color)}>
                      <platform.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{platform.name}</p>
                        {platform.connected && (
                          <CheckCircle className="w-4 h-4 text-teal" />
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
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Unlink className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">
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
                <p className="text-sm text-muted-foreground">Quick share to your social channels</p>
              </div>
              <div className="divide-y divide-border">
                {recentProducts.map((product) => (
                  <div key={product.id} className="p-4 flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-primary font-semibold">{product.price}</p>
                      {product.shared.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">Shared on:</span>
                          {product.shared.includes("facebook") && (
                            <Facebook className="w-3 h-3 text-[#1877F2]" />
                          )}
                          {product.shared.includes("instagram") && (
                            <Instagram className="w-3 h-3 text-[#E1306C]" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <Link href="/dashboard/products">
                  <Button variant="ghost" className="w-full">View All Products</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Social Commerce Info */}
          <div className="bg-gradient-to-br from-primary/10 via-purple-light to-teal-light rounded-2xl border border-primary/20 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Enable Social Commerce</h3>
                <p className="text-muted-foreground">
                  Let customers order directly from your social media posts. Share products with "Buy Now" links 
                  that take customers straight to checkout via WhatsApp or your storefront.
                </p>
              </div>
              <Button className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Learn More
              </Button>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">WhatsApp Order Notifications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connected to +1 (555) 123-4567. Customers can place orders directly via WhatsApp, 
                  and you'll receive instant notifications for new orders.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm">Configure Messages</Button>
                  <Button variant="ghost" size="sm">View Order Templates</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
  );
};

export default SocialMedia;