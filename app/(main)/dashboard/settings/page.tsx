"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
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
  User,
  Store,
  CreditCard,
  Globe,
  Palette,
  Shield,
  Mail,
  Save,
  Camera,
  Check,
} from "lucide-react";

const SettingsPage = () => {
 const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);


  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "store", label: "Store", icon: Store },
    { id: "domain", label: "Domain", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Settings Tabs */}
              <div className="lg:w-56 shrink-0">
                <div className="bg-card rounded-2xl border border-border p-2">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 space-y-6">
                {activeTab === "profile" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-foreground">JD</span>
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Profile Photo</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB</p>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                          <input
                            type="text"
                            defaultValue="John"
                            className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                          <input
                            type="text"
                            defaultValue="Doe"
                            className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="john@example.com"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                        <input
                          type="tel"
                          defaultValue="+1 (555) 123-4567"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "store" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Store Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Store Name</label>
                        <input
                          type="text"
                          defaultValue="My Awesome Store"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Store Description</label>
                        <textarea
                          defaultValue="We sell amazing products that you'll love."
                          rows={3}
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
                        <input
                          type="email"
                          defaultValue="support@mystore.com"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">WhatsApp Number</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Enable WhatsApp order notifications</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "domain" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Domain Settings</h2>
                    <div className="space-y-6">
                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-sm font-medium text-foreground mb-1">Current Domain</p>
                        <p className="text-primary font-mono">my-store.webownr.com</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Custom Domain</label>
                        <input
                          type="text"
                          placeholder="www.yourdomain.com"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Point your domain's A record to our servers to connect it.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">Connect Custom Domain</Button>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Theme Color</label>
                        <div className="flex gap-3">
                          {["#00BCD4", "#FF6B6B", "#9B59B6", "#F4A261", "#2ECC71"].map((color) => (
                            <button
                              key={color}
                              className="w-10 h-10 rounded-xl border-2 border-transparent hover:border-foreground/20 transition-colors"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Dark Mode</label>
                        <div className="flex items-center gap-3">
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Light</button>
                          <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium">Dark</button>
                          <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium">System</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "billing" && (
                  <div className="space-y-6">
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <div>
                          <p className="font-semibold text-foreground">Installment Plan</p>
                          <p className="text-sm text-muted-foreground">$29/month • 8 of 12 payments completed</p>
                        </div>
                        <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">Active</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Ownership Progress</span>
                          <span className="text-sm font-medium text-primary">67%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-2/3 rounded-full" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">4 payments left to own your website forever!</p>
                      </div>
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                        <div className="w-12 h-8 bg-gradient-to-r from-indigo to-purple rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                          <p className="text-xs text-muted-foreground">Expires 12/25</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto">Edit</Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      {[
                        { label: "Order Notifications", description: "Get notified when you receive a new order", enabled: true },
                        { label: "WhatsApp Alerts", description: "Receive order alerts via WhatsApp", enabled: true },
                        { label: "Email Updates", description: "Weekly summary of your store performance", enabled: false },
                        { label: "Low Stock Alerts", description: "Get notified when products are running low", enabled: true },
                        { label: "Marketing Tips", description: "Receive tips to grow your business", enabled: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <button
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              item.enabled ? "bg-primary" : "bg-border"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                item.enabled ? "translate-x-7" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <Button>Update Password</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
    </DashboardLayout>
  );
};

export default SettingsPage;