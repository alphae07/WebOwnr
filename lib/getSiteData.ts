// lib/getSiteData.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { SiteData, PageData } from "@/lib/data";

/**
 * Fetch a site by its slug (subdomain)
 * @param slug The subdomain/slug of the site
 * @returns SiteData if found, otherwise null
 */
export async function getSiteBySlug(slug: string): Promise<SiteData | null> {
  const ref = doc(db, "sites", slug);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  // Type assertion ensures snap.data() matches SiteData
  return snap.data() as SiteData;
}

/**
 * Get a page from a site by its path
 * @param site The SiteData object
 * @param path The path of the page (e.g., "home", "about")
 * @returns PageData if found, otherwise null
 */
export function getPageByPath(site: SiteData, path: string): PageData | null {
  return site.pages[path] ?? null;
}
