"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Shirt, Coffee, Laptop, Palette, Flower2 } from "lucide-react";
import templateFashion from "@/public/template-fashion.png";
import templateFood from "@/public/template-food.png";
import templateTech from "@/public/template-tech.png";
import Image from "next/image";

const TemplatesSection = () => {
  const templates = [
    {
      name: "Fashion & Apparel",
      icon: Shirt,
      color: "bg-coral-light text-coral",
      hoverBg: "group-hover:bg-coral group-hover:text-primary-foreground",
      stores: "320+ stores",
    },
    {
      name: "Food & Beverages",
      icon: Coffee,
      color: "bg-gold-light text-gold-dark",
      hoverBg: "group-hover:bg-gold group-hover:text-primary-foreground",
      stores: "280+ stores",
    },
    {
      name: "Electronics",
      icon: Laptop,
      color: "bg-indigo-light text-indigo",
      hoverBg: "group-hover:bg-indigo group-hover:text-primary-foreground",
      stores: "190+ stores",
    },
    {
      name: "Art & Crafts",
      icon: Palette,
      color: "bg-purple-light text-purple",
      hoverBg: "group-hover:bg-purple group-hover:text-primary-foreground",
      stores: "240+ stores",
    },
    {
      name: "Beauty & Wellness",
      icon: Flower2,
      color: "bg-teal-light text-teal",
      hoverBg: "group-hover:bg-teal group-hover:text-primary-foreground",
      stores: "310+ stores",
    },
    {
      name: "General Store",
      icon: Store,
      color: "bg-cyan-light text-cyan",
      hoverBg: "group-hover:bg-cyan group-hover:text-primary-foreground",
      stores: "450+ stores",
    },
  ];

  const templatePreviews = [
    { name: "Fashion Store", image: templateFashion, tag: "Popular" },
    { name: "Food Delivery", image: templateFood, tag: "New" },
    { name: "Tech Shop", image: templateTech, tag: "Trending" },
  ];

  return (
    <section id="templates" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-gold/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple/10 to-indigo/10 border border-purple/20 rounded-full text-sm font-medium text-purple mb-4">
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
                className={`w-14 h-14 rounded-xl ${template.color} ${template.hoverBg} flex items-center justify-center mx-auto mb-4 transition-all duration-300`}
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

        {/* Template Previews Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {templatePreviews.map((template, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Tag */}
              <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${
                template.tag === "Popular" ? "bg-coral text-primary-foreground" :
                template.tag === "New" ? "bg-teal text-primary-foreground" :
                "bg-purple text-primary-foreground"
              }`}>
                {template.tag}
              </div>

              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-primary-foreground mb-2">{template.name}</h3>
                  <Button variant="hero-white" size="sm" className="w-full">
                    Preview Template
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup">
            <Button variant="hero" size="lg" className="group">
              Browse All Templates
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
