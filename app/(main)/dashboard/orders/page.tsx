"use client";
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
  Search,
  Filter,
  Eye,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

const Orders = () => {

  const [activeTab, setActiveTab] = useState("all");


  const tabs = [
    { id: "all", label: "All Orders", count: 156 },
    { id: "pending", label: "Pending", count: 12 },
    { id: "processing", label: "Processing", count: 8 },
    { id: "shipped", label: "Shipped", count: 24 },
    { id: "delivered", label: "Delivered", count: 112 },
  ];

  const orders = [
    {
      id: "#ORD-1234",
      customer: { name: "Sarah Chen", email: "sarah@example.com", avatar: "SC" },
      products: ["Summer Floral Dress", "+2 items"],
      total: "$287.00",
      date: "Dec 5, 2024",
      status: "Delivered",
      payment: "Paid",
    },
    {
      id: "#ORD-1233",
      customer: { name: "Marcus Johnson", email: "marcus@example.com", avatar: "MJ" },
      products: ["Wireless Bluetooth Earbuds"],
      total: "$149.00",
      date: "Dec 5, 2024",
      status: "Shipped",
      payment: "Paid",
    },
    {
      id: "#ORD-1232",
      customer: { name: "Emily Rodriguez", email: "emily@example.com", avatar: "ER" },
      products: ["Handmade Soy Candle Set", "+1 item"],
      total: "$89.00",
      date: "Dec 4, 2024",
      status: "Processing",
      payment: "Paid",
    },
    {
      id: "#ORD-1231",
      customer: { name: "David Kim", email: "david@example.com", avatar: "DK" },
      products: ["Organic Face Serum"],
      total: "$65.00",
      date: "Dec 4, 2024",
      status: "Pending",
      payment: "Pending",
    },
    {
      id: "#ORD-1230",
      customer: { name: "Lisa Thompson", email: "lisa@example.com", avatar: "LT" },
      products: ["Minimalist Watch", "+3 items"],
      total: "$456.00",
      date: "Dec 3, 2024",
      status: "Delivered",
      payment: "Paid",
    },
  ];

const [loading, setLoading] = useState(true);




  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-h-screen">
       
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Orders Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Products</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{order.customer.avatar}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{order.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{order.products[0]}</p>
                        {order.products[1] && (
                          <p className="text-xs text-muted-foreground">{order.products[1]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{order.total}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">{order.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-full font-medium",
                            order.status === "Delivered"
                              ? "bg-success/10 text-success"
                              : order.status === "Shipped"
                              ? "bg-primary/10 text-primary"
                              : order.status === "Processing"
                              ? "bg-purple/10 text-purple"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-teal">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Orders;