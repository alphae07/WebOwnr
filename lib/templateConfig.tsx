import ModernStartup from "@/templates/modernStartup";
import SimpleBusiness from "@/templates/simpleBusiness";
import ElegantBrand from "@/templates/elegantBrand";
import { ReactNode } from "react";

type TemplateEntry = {
  name: string;
  id: "modernStartup" | "simpleBusiness" | "elegantBrand";
  preview: string;
  description: string;
  // Each template is a React component that accepts `{ data }`
  component:  React.ComponentType<{ data: any }>;
};

export const templates: Record<TemplateEntry["id"], TemplateEntry> = {
  modernStartup: {
    id: "modernStartup",
    name: "Modern Startup",
    preview: "/templates/modernStartup-preview.png",
    description: "Bold, modern look for startups and creators.",
    component: ModernStartup,
  },
  simpleBusiness: {
    id: "simpleBusiness",
    name: "Simple Business",
    preview: "/templates/simpleBusiness-preview.png",
    description: "Clean and professional—great for services and SMBs.",
    component: SimpleBusiness,
  },
  elegantBrand: {
    id: "elegantBrand",
    name: "Elegant Brand",
    preview: "/templates/elegantBrand-preview.png",
    description: "Premium feel—great for brands and product sites.",
    component: ElegantBrand,
  },
};
