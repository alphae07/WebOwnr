import ModernTemplate from "@/templates/modern/page";
import ClassicTemplate from "@/templates/classic/page";
import MinimalTemplate from "@/templates/minimal/page";
import BoldTemplate from "@/templates/bold/page";
import { ComponentType } from "react";

export type TemplateId =
  | "modern"
  | "classic"
  | "minimal"
  | "bold";

export type TemplateEntry = {
  id: TemplateId;
  name: string;
  preview: string;
  description: string;
  component: ComponentType<{ data: any }>;
};

export const templates: Record<TemplateId, TemplateEntry> = {
  modern: {
    id: "modern",
    name: "Modern",
    preview: "/templates/modern-preview.png",
    description: "Sleek, modern layout for startups and tech-driven brands.",
    component: ModernTemplate,
  },

  classic: {
    id: "classic",
    name: "Classic",
    preview: "/templates/classic-preview.png",
    description: "Timeless structure perfect for businesses and services.",
    component: ClassicTemplate,
  },

  minimal: {
    id: "minimal",
    name: "Minimal",
    preview: "/templates/minimal-preview.png",
    description: "Clean, distraction-free design focused on content.",
    component: MinimalTemplate,
  },

  bold: {
    id: "bold",
    name: "Bold",
    preview: "/templates/bold-preview.png",
    description: "High-impact visuals for confident brands and creators.",
    component: BoldTemplate,
  },
};
