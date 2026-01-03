
// /components/social/InfluencerSearch.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function InfluencerSearch() {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [minFollowers, setMinFollowers] = useState("10000");
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchInfluencers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/social/influencer/search?userId=${user?.uid}&category=${category}&minFollowers=${minFollowers}`,
        {
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to search influencers");
      const data = await response.json();
      setInfluencers(data.influencers);
    } catch (error) {
      toast.error("Failed to search influencers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Find Influencers
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Input
            placeholder="e.g., Fashion, Beauty, Technology"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Minimum Followers</label>
          <Input
            type="number"
            value={minFollowers}
            onChange={e => setMinFollowers(e.target.value)}
            min="1000"
            step="1000"
          />
        </div>

        <Button onClick={searchInfluencers} disabled={loading || !category} className="w-full gap-2">
          <Search className="w-4 h-4" />
          Search Influencers
        </Button>
      </div>

      {influencers.length > 0 && (
        <div className="space-y-3">
          {influencers.map(influencer => (
            <div key={influencer.id} className="border border-border rounded-lg p-4 hover:bg-muted transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{influencer.name}</p>
                  <p className="text-sm text-muted-foreground">@{influencer.username}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(influencer.followers / 1000).toFixed(0)}K followers
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {influencer.engagementRate}% engagement
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Collaborate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}