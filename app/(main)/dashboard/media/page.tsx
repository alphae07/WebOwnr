"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  Grid,
  List,
  Search,
  Folder,
  MoreVertical,
  Trash2,
  Download,
  Copy,
} from "lucide-react";

const Media = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const folders = [
    { id: "all", name: "All Files", count: 156 },
    { id: "products", name: "Products", count: 89 },
    { id: "banners", name: "Banners", count: 12 },
    { id: "logos", name: "Logos", count: 8 },
    { id: "others", name: "Others", count: 47 },
  ];

  const mediaFiles = [
    { id: 1, name: "summer-dress-1.jpg", type: "image", size: "2.4 MB", url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop" },
    { id: 2, name: "earbuds-product.jpg", type: "image", size: "1.8 MB", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop" },
    { id: 3, name: "candle-set.jpg", type: "image", size: "3.1 MB", url: "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=300&h=300&fit=crop" },
    { id: 4, name: "face-serum.jpg", type: "image", size: "1.5 MB", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop" },
    { id: 5, name: "watch-minimal.jpg", type: "image", size: "2.0 MB", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop" },
    { id: 6, name: "coffee-beans.jpg", type: "image", size: "2.8 MB", url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop" },
    { id: 7, name: "hero-banner.jpg", type: "image", size: "4.2 MB", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop" },
    { id: 8, name: "lifestyle-shot.jpg", type: "image", size: "3.5 MB", url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop" },
  ];

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Folders Sidebar */}
            <div className="lg:w-64 shrink-0">
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-medium text-foreground mb-4">Folders</h3>
                <div className="space-y-1">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        selectedFolder === folder.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="flex-1 text-sm">{folder.name}</span>
                      <span className="text-xs opacity-70">{folder.count}</span>
                    </button>
                  ))}
                </div>

                {/* Storage Info */}
                <div className="mt-6 p-4 bg-muted rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Storage</span>
                    <span className="text-xs text-muted-foreground">2.4 GB / 5 GB</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[48%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Files Grid */}
            <div className="flex-1 space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drop Zone */}
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-card hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground mb-1">Drop files here to upload</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>

              {/* Files */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square relative">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="p-2 bg-background rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-background rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-background rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Size</th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mediaFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={file.url} alt={file.name} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-medium text-foreground">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{file.size}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
    </DashboardLayout>
  );
};

export default Media;