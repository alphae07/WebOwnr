// lib/data.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";


export type Section =
  | { type: "hero"; title: string; subtitle: string }
  | { type: "features"; items: string[] }
  | { type: "footer"; text: string }
  | { type: string; [key: string]: any }; // fallback for future sections

export type PageData = {
  sections: Section[];
};

export type SiteData = {
  name: string;
  theme: string;
  pages: {
    [key: string]: PageData;
  };
subdomain: string;
};

// Example demo site template
export const demoSite: Record<string, SiteData> = {
   demosite: {
  name: "Demo Site",
  subdomain: "demosite",
  theme: "light",
  pages: {
    home: {
      sections: [
        { type: "hero", title: "Welcome to WebOwnr", subtitle: "Build your site instantly" },
        { type: "features", items: ["Fast setup", "Custom branding", "Subdomain ready"] },
        { type: "footer", text: "© 2025 WebOwnr" },
      ],
    },
  },
  },
};


export function getSiteData(site : string): SiteData | null {
  return demoSite[site] ?? null;
}

export function getPageData(site: SiteData, path: string): PageData {
  return site.pages[path] ?? site.pages["home"];
}


export async function fetchSite(subdomain: string) {
  try {
    const ref = doc(db, "sites", subdomain);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }

    // ✅ fallback ONLY for allowed demo subdomains
    if (demoSite[subdomain]) {
      return {
        subdomain: demoSite[subdomain].subdomain,
        template: "modernStartup",
        publishedContent: {
          businessName: demoSite[subdomain].name,
          tagline: "Demo fallback tagline",
          about: "Demo about section",
        },
      };
    }

    return null;
  } catch (err) {
    console.error("Error fetching site:", err);
    return null;
  }
}