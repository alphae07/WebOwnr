// lib/data.ts

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
};

// Example demo site template
export const demoSite: SiteData = {
  name: "Demo Site",
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
};
