"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

// /components/social/SchedulePostModal.tsx
interface SchedulePostModalProps {
  productIds: string[];
  platforms: any[];
  onClose: () => void;
}

export default function SchedulePostModal({
  productIds,
  platforms,
  onClose,
}: SchedulePostModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSchedule = async () => {
    if (!user) {
      toast.error("Please log in to schedule posts");
      return;
    }

    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);

      const response = await fetch("/api/social/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          userId: user?.uid,
          scheduleData: {
            productIds,
            platforms: selectedPlatforms,
            caption: caption || "Check out these amazing products!",
            scheduledFor: scheduledFor.toISOString(),
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule");

      toast.success("Post scheduled successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to schedule post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Schedule Post</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Platforms</label>
            <div className="space-y-2">
              {platforms.map(platform => (
                <label key={platform.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={(e) =>
                      setSelectedPlatforms(prev =>
                        e.target.checked
                          ? [...prev, platform.id]
                          : prev.filter(id => id !== platform.id)
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm">{platform.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Caption (Optional)</label>
            <Textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Schedule Date</label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={loading || selectedPlatforms.length === 0 || !scheduledDate}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
