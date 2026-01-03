// /components/social/BestPostingTimes.tsx
"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BestTimes {
  [day: string]: { hour: number; engagementRate: number };
}

export default function BestPostingTimes() {
  const { user } = useAuth();
  const [bestTimes, setBestTimes] = useState<BestTimes | null>(null);
  const [platform, setPlatform] = useState("facebook");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchBestTimes();
    }
  }, [user?.uid, platform]);

  const fetchBestTimes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/social/best-times?userId=${user?.uid}&platform=${platform}`,
        {
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch best times");
      const data = await response.json();
      setBestTimes(data.bestTimes);
    } catch (error) {
      toast.error("Failed to load best posting times");
    } finally {
      setLoading(false);
    }
  };

  const chartData = bestTimes
    ? Object.entries(bestTimes).map(([day, data]) => ({
        day: day.slice(0, 3),
        hour: data.hour,
        engagement: (data.engagementRate * 100).toFixed(1),
      }))
    : [];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Best Posting Times
        </h2>
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg"
        >
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="hour" fill="#3b82f6" name="Best Hour" />
            <Bar yAxisId="right" dataKey="engagement" fill="#10b981" name="Engagement %" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          Not enough data to generate recommendations
        </p>
      )}
    </div>
  );
}