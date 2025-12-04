"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Shirt, Coffee, Laptop, Palette, Flower2 } from "lucide-react";

const TemplatesSection = () => {
  const templates = [
    {
      name: "Fashion & Apparel",
      icon: Shirt,
      color: "bg-pink-100 text-pink-600",
      stores: "320+ stores",
    },
    {
      name: "Food & Beverages",
      icon: Coffee,
      color: "bg-amber-100 text-amber-600",
      stores: "280+ stores",
    },
    {
      name: "Electronics",
      icon: Laptop,
      color: "bg-blue-100 text-blue-600",
      stores: "190+ stores",
    },
    {
      name: "Art & Crafts",
      icon: Palette,
      color: "bg-purple-100 text-purple-600",
      stores: "240+ stores",
    },
    {
      name: "Beauty & Wellness",
      icon: Flower2,
      color: "bg-green-100 text-green-600",
      stores: "310+ stores",
    },
    {
      name: "General Store",
      icon: Store,
      color: "bg-cyan-100 text-cyan-600",
      stores: "450+ stores",
    },
  ];

  return (
    <section id="templates" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            Templates
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Beautiful Templates for Every Industry
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose from professionally designed templates and customize them to match your brand.
          </p>
        </div>

        {/* Template Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {templates.map((template, index) => (
            <div
              key={index}
              className="group p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center"
            >
              <div
                className={`w-14 h-14 rounded-xl ${template.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                <template.icon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {template.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {template.stores}
              </p>
            </div>
          ))}
        </div>

        {/* Template Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-xl">
          <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground">
                preview.webownr.com/fashion-template
              </div>
            </div>
          </div>
          <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-muted to-background p-8">
            {/* Mock fashion store preview */}
            <div className="h-full max-w-5xl mx-auto flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-28 bg-foreground/10 rounded-lg" />
                <div className="hidden md:flex gap-4">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
                <div className="h-8 w-8 bg-primary/20 rounded-full" />
              </div>
              
              {/* Hero */}
              <div className="flex-1 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="h-8 w-3/4 bg-foreground/10 rounded-lg mb-4" />
                  <div className="h-4 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-2/3 bg-muted rounded mb-6" />
                  <div className="h-10 w-32 bg-primary rounded-lg" />
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/signup">
            <Button variant="hero" size="lg">
              Browse All Templates
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
