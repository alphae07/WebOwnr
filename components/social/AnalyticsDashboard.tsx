// /components/social/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Users, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Analytics {
  totalPosts: number;
  totalReach: number;
  totalEngagement: number;
  averageEngagementRate: number;
  topPost: any;
  postsByPlatform: Record<string, number>;
  dailyData: Array<{ date: string; views: number; clicks: number }>;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchAnalytics();
    }
  }, [user?.uid, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/social/analytics?userId=${user?.uid}&period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const platformColors: Record<string, string> = {
    facebook: "#1877F2",
    instagram: "#E1306C",
    twitter: "#000000",
    tiktok: "#25F4EE",
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {["7", "30", "90"].map(p => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            onClick={() => setPeriod(p)}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Last {p} Days
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
              <p className="text-2xl font-bold">{analytics.totalPosts}</p>
            </div>
            <Share2 className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Reach</p>
              <p className="text-2xl font-bold">{analytics.totalReach.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Engagement</p>
              <p className="text-2xl font-bold">{analytics.totalEngagement.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold">
                {(analytics.averageEngagementRate * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Daily Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" />
              <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Posts by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.postsByPlatform).map(([name, value]) => ({
                  name,
                  value,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.keys(analytics.postsByPlatform).map(platform => (
                  <Cell key={platform} fill={platformColors[platform] || "#999"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Post */}
      {analytics.topPost && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Your Top Performing Post</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Caption</p>
              <p className="mb-4">{analytics.topPost.caption}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="text-lg font-semibold">{analytics.topPost.metrics?.views || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-lg font-semibold">{analytics.topPost.metrics?.clicks || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-lg font-semibold">
                    {(
                      (analytics.topPost.metrics?.clicks || 0) /
                      (analytics.topPost.metrics?.views || 1) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
