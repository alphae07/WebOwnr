"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Eye,
  Users,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("7d");

  const stats = [
    { label: "Revenue", value: "$12,450", change: "+12.5%", trend: "up", icon: DollarSign, color: "bg-teal-light text-teal" },
    { label: "Orders", value: "156", change: "+8.2%", trend: "up", icon: ShoppingCart, color: "bg-coral-light text-coral" },
    { label: "Visitors", value: "2,340", change: "-2.4%", trend: "down", icon: Eye, color: "bg-purple-light text-purple" },
    { label: "Conversion", value: "3.2%", change: "+0.8%", trend: "up", icon: ArrowUpRight, color: "bg-gold-light text-gold-dark" },
  ];

  const revenueData = [
    { name: "Mon", revenue: 1200, orders: 24 },
    { name: "Tue", revenue: 1800, orders: 32 },
    { name: "Wed", revenue: 1400, orders: 28 },
    { name: "Thu", revenue: 2200, orders: 45 },
    { name: "Fri", revenue: 2800, orders: 52 },
    { name: "Sat", revenue: 2400, orders: 48 },
    { name: "Sun", revenue: 1900, orders: 38 },
  ];

  const topProducts = [
    { name: "Summer Dress", sales: 89, revenue: "$7,921" },
    { name: "Wireless Earbuds", sales: 67, revenue: "$9,983" },
    { name: "Face Serum", sales: 54, revenue: "$3,510" },
    { name: "Minimalist Watch", sales: 42, revenue: "$8,358" },
    { name: "Candle Set", sales: 38, revenue: "$1,710" },
  ];

  const trafficSources = [
    { name: "Direct", value: 35, color: "#00BCD4" },
    { name: "Social", value: 28, color: "#FF6B6B" },
    { name: "Search", value: 22, color: "#9B59B6" },
    { name: "Referral", value: 15, color: "#F4A261" },
  ];

  return (
    <DashboardLayout>
	<main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-medium", stat.trend === "up" ? "text-success" : "text-destructive")}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">Revenue Overview</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00BCD4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#00BCD4" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">Traffic Sources</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {trafficSources.map((source) => (
                  <div key={source.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-sm text-muted-foreground">{source.name}</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{source.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products & Orders Chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">Top Products</h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <span className="font-semibold text-foreground">{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders Chart */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">Orders This Week</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
         </DashboardLayout>
  );
};

export default Analytics;