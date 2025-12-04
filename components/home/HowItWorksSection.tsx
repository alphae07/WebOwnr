"use client";

import { Palette, ShoppingBag, Rocket, PartyPopper } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Palette,
      step: "01",
      title: "Choose Your Template",
      description: "Browse our collection of beautiful, mobile-responsive templates. Pick the one that fits your brand.",
    },
    {
      icon: ShoppingBag,
      step: "02",
      title: "Add Your Products",
      description: "Upload products, set prices, and let AI help write compelling descriptions that convert.",
    },
    {
      icon: Rocket,
      step: "03",
      title: "Launch & Sell",
      description: "Publish your store instantly. Start accepting orders and get notified via WhatsApp.",
    },
    {
      icon: PartyPopper,
      step: "04",
      title: "Own Your Website",
      description: "Complete your installment plan and own your website forever. No more monthly fees.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Launch Your Store in 4 Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground">
            Get your ecommerce website up and running in minutes, not days.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step card */}
                <div className="text-center">
                  {/* Icon */}
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center relative z-10">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center z-20">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 lg:hidden">
                    <div className="w-0.5 h-8 bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
