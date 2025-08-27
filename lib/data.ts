// lib/data.ts

export type SiteData = {
  name: string;
  theme: string;
  pages: {
    [key: string]: {
      sections: any[]; // Each section could be hero, about, features, contact...
    };
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
