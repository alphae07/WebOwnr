// app/api/analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface OrderData {
  id: string;
  userId: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: string;
  createdAt: any;
  updatedAt: any;
}

interface AnalyticsRequest {
  userId: string;
  dateRange: string;
}

interface AnalyticsResponse {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: string;
    color: string;
  }>;
  revenue: number;
  orders: number;
  visitors: number;
  conversion: number;
  revenueData: Array<{
    name: string;
    revenue: number;
    orders: number;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalRevenue: number;
}

function getDaysInRange(range: string): number {
  const rangeMap: Record<string, number> = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };
  return rangeMap[range] || 7;
}

function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

async function fetchOrdersInRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<OrderData[]> {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as OrderData[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

async function calculateStats(
  orders: OrderData[],
  previousOrders: OrderData[]
): Promise<Array<{
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}>> {
  // Current period stats
  const currentRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const currentOrderCount = orders.length;
  const currentVisitors = Math.round(orders.length * 2.5); // Estimate: ~2.5 visitors per order

  // Previous period stats
  const previousRevenue = previousOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );
  const previousOrderCount = previousOrders.length;
  const previousVisitors = Math.round(previousOrders.length * 2.5);

  // Calculate changes
  const revenueChange =
    previousRevenue > 0
      ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : "0";
  const ordersChange =
    previousOrderCount > 0
      ? (((currentOrderCount - previousOrderCount) / previousOrderCount) * 100).toFixed(1)
      : "0";
  const visitorsChange =
    previousVisitors > 0
      ? (((currentVisitors - previousVisitors) / previousVisitors) * 100).toFixed(1)
      : "0";

  // Conversion rate
  const conversionRate = currentVisitors > 0 ? ((currentOrderCount / currentVisitors) * 100).toFixed(1) : "0";
  const previousConversionRate = previousVisitors > 0 ? ((previousOrderCount / previousVisitors) * 100).toFixed(1) : "0";
  const conversionChange =
    parseFloat(previousConversionRate) > 0
      ? (parseFloat(conversionRate) - parseFloat(previousConversionRate)).toFixed(1)
      : "0";

  return [
    {
      label: "Revenue",
      value: `$${currentRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      change: `${parseFloat(revenueChange) > 0 ? "+" : ""}${revenueChange}%`,
      trend: parseFloat(revenueChange) >= 0 ? "up" : "down",
    },
    {
      label: "Orders",
      value: currentOrderCount.toString(),
      change: `${parseFloat(ordersChange) > 0 ? "+" : ""}${ordersChange}%`,
      trend: parseFloat(ordersChange) >= 0 ? "up" : "down",
    },
    {
      label: "Visitors",
      value: currentVisitors.toString(),
      change: `${parseFloat(visitorsChange) > 0 ? "+" : ""}${visitorsChange}%`,
      trend: parseFloat(visitorsChange) >= 0 ? "up" : "down",
    },
    {
      label: "Conversion",
      value: `${conversionRate}%`,
      change: `${parseFloat(conversionChange) > 0 ? "+" : ""}${conversionChange}%`,
      trend: parseFloat(conversionChange) >= 0 ? "up" : "down",
    },
  ];
}

async function generateRevenueData(
  orders: OrderData[],
  days: number
): Promise<Array<{ name: string; revenue: number; orders: number; date: string }>> {
  const revenueMap = new Map<string, { revenue: number; orders: number }>();

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateKey = formatDateKey(date);
    revenueMap.set(dateKey, { revenue: 0, orders: 0 });
  }

  // Aggregate orders by date
  orders.forEach((order) => {
    const orderDate = order.createdAt?.toDate?.() || new Date();
    const dateKey = formatDateKey(orderDate);
    const existing = revenueMap.get(dateKey) || { revenue: 0, orders: 0 };
    revenueMap.set(dateKey, {
      revenue: existing.revenue + (order.total || 0),
      orders: existing.orders + 1,
    });
  });

  // Convert to array and sort
  const result = Array.from(revenueMap.entries())
    .map(([dateKey, data]) => {
      const date = new Date(dateKey);
      return {
        name: formatDateDisplay(date),
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
        date: dateKey,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
}

async function getTopProducts(
  orders: OrderData[]
): Promise<Array<{ id: string; name: string; sales: number; revenue: number; percentage: number }>> {
  const productMap = new Map<string, { name: string; sales: number; revenue: number }>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const existing = productMap.get(item.id) || {
        name: item.name,
        sales: 0,
        revenue: 0,
      };
      productMap.set(item.id, {
        name: item.name,
        sales: existing.sales + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([id, data]) => ({
      id,
      ...data,
      percentage: 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calculate percentages
  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);
  topProducts.forEach((product) => {
    product.percentage = (product.revenue / maxRevenue) * 100;
  });

  return topProducts;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsRequest;
    const { userId, dateRange } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const days = getDaysInRange(dateRange);
    const { start, end } = getDateRange(days);
    const { start: prevStart, end: prevEnd } = getDateRange(days * 2);

    // Fetch orders for current and previous periods
    const [currentOrders, previousOrders] = await Promise.all([
      fetchOrdersInRange(userId, start, end),
      fetchOrdersInRange(userId, prevStart, prevEnd),
    ]);

    // Calculate statistics
    const stats = await calculateStats(currentOrders, previousOrders);

    // Generate revenue data
    const revenueData = await generateRevenueData(currentOrders, Math.min(days, 7));

    // Get top products
    const topProducts = await getTopProducts(currentOrders);

    // Calculate totals
    const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = currentOrders.length;
    const totalVisitors = Math.round(totalOrders * 2.5);
    const conversionRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : "0";

    const response: AnalyticsResponse = {
      stats: stats.map((stat) => ({
        ...stat,
        icon: stat.label.toLowerCase(),
        color: getColorForStat(stat.label),
      })),
      revenue: totalRevenue,
      orders: totalOrders,
      visitors: totalVisitors,
      conversion: parseFloat(conversionRate),
      revenueData,
      topProducts,
      trafficSources: [
        { name: "Direct", value: 35, color: "#00BCD4" },
        { name: "Social", value: 28, color: "#FF6B6B" },
        { name: "Search", value: 22, color: "#9B59B6" },
        { name: "Referral", value: 15, color: "#F4A261" },
      ],
      totalRevenue,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function getColorForStat(label: string): string {
  const colors: Record<string, string> = {
    revenue: "bg-teal-500/10 text-teal-600",
    orders: "bg-orange-500/10 text-orange-600",
    visitors: "bg-purple-500/10 text-purple-600",
    conversion: "bg-amber-500/10 text-amber-600",
  };
  return colors[label.toLowerCase()] || "bg-blue-500/10 text-blue-600";
}