import ModernStartup from "@/templates/modernStartup";
import SimpleBusiness from "@/templates/simpleBusiness";
import ElegantBrand from "@/templates/elegantBrand";

export type TemplateItem = {
  id: string;
  name: string;
  preview: string;
  description: string;
  component: any;
};

export const templates: TemplateItem[] = [
  {
    id: "modernStartup",
    name: "Modern Startup",
    preview: "/templates/modernStartup-preview.png",
    description: "A bold and modern template for tech startups and digital creators.",
    component: ModernStartup,
  },
  {
    id: "simpleBusiness",
    name: "Simple Business",
    preview: "/templates/simpleBusiness-preview.png",
    description: "Clean and professional for small businesses or service providers.",
    component: SimpleBusiness,
  },
  {
    id: "elegantBrand",
    name: "Elegant Brand",
    preview: "/templates/elegantBrand-preview.png",
    description: "An elegant layout for product-based businesses and e-commerce.",
    component: ElegantBrand,
  },
];

export const templatesMap = templates.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, TemplateItem>);
