// lib/getSiteData.ts
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { SiteData, PageData, demoSite } from "@/lib/data";

/**
 * Fetch a site by its slug (subdomain)
 * @param slug The subdomain/slug of the site
 * @returns SiteData if found, otherwise null
 */
export async function getSiteBySlug(slug: string): Promise<SiteData | null> {
  // Check demo first
  if (demoSite[slug]) return demoSite[slug];

  try {
    const q = query(collection(db, "sites"), where("subdomain", "==", slug));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return {
        ...data,
        // Ensure required fields exist
        name: data.name || slug,
        subdomain: data.subdomain || slug,
        pages: data.pages || {},
      } as SiteData;
    }
  } catch (error) {
    console.error("Error fetching site by slug:", error);
  }

  return null;
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
