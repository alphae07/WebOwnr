// lib/getSiteData.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { SiteData } from "@/lib/data";

// Fetch site by slug (subdomain)
export async function getSiteBySlug(slug: string): Promise<SiteData | null> {
  const ref = doc(db, "sites", slug);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SiteData) : null;

}

// Get a page by path
export function getPageByPath(site: SiteData, path: string) {
  return site.pages[path] ?? null;
}
