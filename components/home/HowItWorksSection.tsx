"use client";
import { Palette, ShoppingBag, Rocket, PartyPopper } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Palette,
      step: "01",
      title: "Choose Your Template",
      description: "Browse our collection of beautiful, mobile-responsive templates. Pick the one that fits your brand.",
      gradient: "from-purple to-indigo",
      bgLight: "bg-purple-light",
    },
    {
      icon: ShoppingBag,
      step: "02",
      title: "Add Your Products",
      description: "Upload products, set prices, and let AI help write compelling descriptions that convert.",
      gradient: "from-coral to-gold",
      bgLight: "bg-coral-light",
    },
    {
      icon: Rocket,
      step: "03",
      title: "Launch & Sell",
      description: "Publish your store instantly. Start accepting orders and get notified via WhatsApp.",
      gradient: "from-primary to-teal",
      bgLight: "bg-cyan-light",
    },
    {
      icon: PartyPopper,
      step: "04",
      title: "Own Your Website",
      description: "Complete your installment plan and own your website forever. No more monthly fees.",
      gradient: "from-teal to-teal-dark",
      bgLight: "bg-teal-light",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-teal/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-indigo/10 to-purple/10 border border-indigo/20 rounded-full text-sm font-medium text-indigo mb-4">
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
          {/* Connection line with gradient */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-1 rounded-full bg-gradient-to-r from-purple via-coral via-primary to-teal opacity-30" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step card */}
                <div className="text-center">
                  {/* Icon */}
                  <div className="relative inline-flex mb-6">
                    <div className={`w-20 h-20 rounded-2xl ${step.bgLight} flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`w-10 h-10 bg-gradient-to-br ${step.gradient} bg-clip-text`} style={{ color: `hsl(var(--${step.gradient.split(' ')[0].replace('from-', '')}))` }} />
                    </div>
                    {/* Step number */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} text-primary-foreground text-sm font-bold flex items-center justify-center z-20 shadow-lg`}>
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
                    <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${step.gradient}`} />
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
