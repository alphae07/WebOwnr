// lib/getSiteData.ts
import { SiteData } from "@/components/SiteRenderer";

// Mock function - replace with Firestore later
export async function getSiteData(site: string): Promise<SiteData | null> {
  const sites: Record<string, SiteData> = {
    "alpha": {
      businessName: "Alpha Site",
      color: "#00bcd4",
      about: "Welcome to Alpha’s custom site.",
    },
    "beta": {
      businessName: "Beta Site",
      color: "#ff5722",
      about: "This is Beta’s landing page.",
    },
  };

  return sites[site] || null;
}
