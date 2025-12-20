// lib/data.ts
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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
  [key: string]: any;
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


export async function getSiteData(site : string): Promise<SiteData | null> {
  if (demoSite[site]) return demoSite[site];

  try {
    const q = query(collection(db, "sites"), where("subdomain", "==", site));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return {
        name: data.name || site,
        subdomain: data.subdomain || site,
        theme: data.themeColor || "light",
        id: docSnap.id,
        pages: {
          home: {
            sections: [
              // Default sections if none exist
              { type: "hero", title: data.name || "Welcome", subtitle: data.description || "" },
              { type: "footer", text: `© ${new Date().getFullYear()} ${data.name || site}` },
            ]
          }
        },
        ...data
      } as SiteData;
    }
  } catch (error) {
    console.error("Error fetching site data:", error);
  }

  return null;
}

export function getPageData(site: SiteData, path: string): PageData {
  return site.pages?.[path] ?? site.pages?.["home"] ?? { sections: [] };
}


export async function fetchSite(subdomain: string) {
  try {
    // Check demo first
    if (demoSite[subdomain]) {
      return {
        subdomain: demoSite[subdomain].subdomain,
        template: "modern",
        publishedContent: {
          businessName: demoSite[subdomain].name,
          tagline: "We offer the best",
          about: "We offer constant effort to provide the best service to our customers.",
        },
      };
    }

    const q = query(collection(db, "sites"), where("subdomain", "==", subdomain));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      // Map fields for SiteRenderer if needed
      publishedContent: data.publishedContent || {
        businessName: data.name,
        tagline: data.description,
        logoUrl: data.logo,
        about: data.description,
      }
    };
  }

    return null;
  } catch (err) {
    console.error("Error fetching site:", err);
    return null;
  }
}
