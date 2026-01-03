"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";

interface Stat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RevenueDataPoint {
  name: string;
  revenue: number;
  orders: number;
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  percentage: number;
}

interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  stats: Stat[];
  revenue: number;
  orders: number;
  visitors: number;
  conversion: number;
  revenueData: RevenueDataPoint[];
  topProducts: TopProduct[];
  trafficSources: TrafficSource[];
  totalRevenue: number;
}

const Analytics = () => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    stats: [],
    revenue: 0,
    orders: 0,
    visitors: 0,
    conversion: 0,
    revenueData: [],
    topProducts: [],
    trafficSources: [],
    totalRevenue: 0,
  });

  // Static traffic sources data
  const trafficSourcesDefault: TrafficSource[] = [
    { name: "Direct", value: 35, color: "#00BCD4" },
    { name: "Social", value: 28, color: "#FF6B6B" },
    { name: "Search", value: 22, color: "#9B59B6" },
    { name: "Referral", value: 15, color: "#F4A261" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      await fetchAnalytics(currentUser.uid, dateRange);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchAnalytics = async (userId: string, range: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, dateRange: range }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data: AnalyticsData = await response.json();
      setAnalyticsData({
        ...data,
        trafficSources: trafficSourcesDefault,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      setError("Failed to load analytics data");
      // Set default data
      setAnalyticsData({
        stats: getDefaultStats(),
        revenue: 0,
        orders: 0,
        visitors: 0,
        conversion: 0,
        revenueData: getDefaultRevenueData(),
        topProducts: [],
        trafficSources: trafficSourcesDefault,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchAnalytics(user.uid, dateRange);
    setRefreshing(false);
  };

  const handleDateRangeChange = async (range: string) => {
    setDateRange(range);
    if (!user) return;
    await fetchAnalytics(user.uid, range);
  };

  const handleDownloadReport = () => {
    const report = generateReportCSV();
    downloadCSV(report, `analytics-report-${dateRange}.csv`);
  };

  const generateReportCSV = (): string => {
    let csv = "Analytics Report\n";
    csv += `Date Range: ${dateRange}\n`;
    csv += `Generated: ${new Date().toISOString()}\n\n`;

    csv += "Summary Statistics\n";
    analyticsData.stats.forEach((stat) => {
      csv += `${stat.label},${stat.value},${stat.change}\n`;
    });

    csv += "\nDaily Revenue\n";
    csv += "Date,Revenue,Orders\n";
    analyticsData.revenueData.forEach((data) => {
      csv += `${data.date},${data.revenue},${data.orders}\n`;
    });

    csv += "\nTop Products\n";
    csv += "Name,Sales,Revenue\n";
    analyticsData.topProducts.forEach((product) => {
      csv += `${product.name},${product.sales},$${product.revenue}\n`;
    });

    return csv;
  };

  const downloadCSV = (content: string, filename: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <main className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your store performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-200 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Date Range Selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "24h", value: "1d" },
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "90 Days", value: "90d" },
            { label: "1 Year", value: "1y" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => handleDateRangeChange(range.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                dateRange === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.stats.map((stat, index) => (
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
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
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

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Revenue Overview</h3>
            {analyticsData.revenueData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00BCD4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00BCD4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Traffic Sources</h3>
            {analyticsData.trafficSources.length > 0 ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(value) => [`${value}%`, "Traffic"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {analyticsData.trafficSources.map((source) => (
                    <div key={source.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm text-muted-foreground">{source.name}</span>
                      <span className="text-sm font-medium text-foreground ml-auto">
                        {source.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No traffic data
              </div>
            )}
          </div>
        </div>

        {/* Top Products & Orders Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Top Products</h3>
            {analyticsData.topProducts.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground whitespace-nowrap">
                      ${product.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No product data available</p>
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Orders This Period</h3>
            {analyticsData.revenueData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value) => [value, "Orders"]}
                    />
                    <Bar dataKey="orders" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No order data available
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

// Default data generators
function getDefaultStats(): Stat[] {
  return [
    {
      label: "Revenue",
      value: "$0",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "bg-teal-500/10 text-teal-600",
    },
    {
      label: "Orders",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Visitors",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Eye,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Conversion",
      value: "0%",
      change: "+0%",
      trend: "up",
      icon: ArrowUpRight,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];
}

function getDefaultRevenueData(): RevenueDataPoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    name: day,
    revenue: 0,
    orders: 0,
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  }));
}

export default Analytics;