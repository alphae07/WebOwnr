"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useParams } from "next/navigation";
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
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  Heart,
  MessageSquare,
  MoreVertical,
} from "lucide-react";

const CustomerDetail = () => {
  const id = useParams();

    const customer = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    address: "123 Main Street, Apt 4B, New York, NY 10001",
    joinedDate: "Jan 15, 2024",
    orders: 12,
    totalSpent: "$1,245.00",
    status: "active",
    avatar: "SJ",
    notes: "VIP customer, prefers express shipping",
  };

  const orders = [
    { id: "#1234", date: "Dec 14, 2024", items: 2, total: "$178.00", status: "Delivered" },
    { id: "#1198", date: "Dec 8, 2024", items: 1, total: "$89.00", status: "Delivered" },
    { id: "#1156", date: "Nov 28, 2024", items: 3, total: "$256.00", status: "Delivered" },
    { id: "#1089", date: "Nov 15, 2024", items: 1, total: "$149.00", status: "Delivered" },
    { id: "#1045", date: "Oct 30, 2024", items: 2, total: "$198.00", status: "Delivered" },
  ];

  const wishlist = [
    { id: 1, name: "Designer Handbag", price: "$299.00", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop" },
    { id: 2, name: "Gold Necklace Set", price: "$450.00", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop" },
  ];

  return (
   <DashboardLayout>
            <main className="flex-1 p-4 lg:p-6 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Customer Info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{customer.avatar}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{customer.name}</h2>
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-teal-light text-teal">
                      {customer.status}
                    </span>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>{customer.address}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span>Customer since {customer.joinedDate}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium text-foreground mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1 gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              </div>
            </div>

            {/* Stats & Orders */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{customer.orders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-teal" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{customer.totalSpent}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-coral-light flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-5 h-5 text-coral" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{wishlist.length}</p>
                  <p className="text-sm text-muted-foreground">Wishlist Items</p>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="font-semibold text-foreground">Order History</h2>
                </div>
                <div className="divide-y divide-border">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Order {order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date} · {order.items} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{order.total}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-light text-teal">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wishlist */}
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="font-semibold text-foreground">Wishlist</h2>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm font-semibold text-primary">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
  );
};

export default CustomerDetail;