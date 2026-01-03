// /components/social/ABTestSetup.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

interface Variant {
  id: string;
  caption: string;
  hashtags: string;
}

export default function ABTestSetup() {
  const [variants, setVariants] = useState<Variant[]>([
    { id: "a", caption: "", hashtags: "" },
    { id: "b", caption: "", hashtags: "" },
  ]);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: String.fromCharCode(65 + variants.length),
        caption: "",
        hashtags: "",
      },
    ]);
  };

  const updateVariant = (id: string, field: string, value: string) => {
    setVariants(
      variants.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (id: string) => {
    if (variants.length > 2) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Create A/B Test Variants</h3>
      
      {variants.map(variant => (
        <div key={variant.id} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Variant {variant.id}</h4>
            {variants.length > 2 && (
              <button
                onClick={() => removeVariant(variant.id)}
                className="text-destructive hover:bg-destructive/10 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Caption</label>
            <Textarea
              value={variant.caption}
              onChange={e => updateVariant(variant.id, "caption", e.target.value)}
              placeholder="Enter caption for this variant..."
              className="min-h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hashtags</label>
            <Input
              value={variant.hashtags}
              onChange={e => updateVariant(variant.id, "hashtags", e.target.value)}
              placeholder="#hashtag1 #hashtag2..."
            />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addVariant} className="gap-2 w-full">
        <Plus className="w-4 h-4" />
        Add Variant
      </Button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 Tip: Test different captions and hashtags to see which resonates
          best with your audience. A/B tests typically run for 24-48 hours.
        </p>
      </div>
    </div>
  );
}