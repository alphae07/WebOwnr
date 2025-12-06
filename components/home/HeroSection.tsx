"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Sparkles } from "lucide-react";

const HeroSection = () => {
  const highlights = [
    "No credit card required",
    "14-day free trial",
    "Cancel anytime",
  ];

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden gradient-coral">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                AI-Powered Website Builder
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Build Your Store.{" "}
              <span className="text-gradient">Pay Monthly.</span>{" "}
              Own It Forever.
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Create a professional ecommerce website for your small business with flexible subscription or installment payments. No coding needed.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/signup">
                <Button variant="hero" size="xl">
                  Start Building Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="hero-outline" size="xl">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Visual */}
          <div className="relative lg:pl-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Main dashboard preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border bg-card animate-float">
                <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground">
                      your-brand.webownr.com
                    </div>
                  </div>
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-muted to-background p-6">
                  {/* Mock store preview */}
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-8 w-32 bg-primary/20 rounded-lg" />
                      <div className="flex gap-2">
                        <div className="h-8 w-20 bg-muted rounded-lg" />
                        <div className="h-8 w-8 bg-primary/20 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card rounded-xl p-3 shadow-sm">
                          <div className="aspect-square bg-muted rounded-lg mb-2" />
                          <div className="h-3 w-full bg-muted rounded mb-1" />
                          <div className="h-3 w-2/3 bg-primary/30 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">New Order!</p>
                    <p className="text-xs text-muted-foreground">WhatsApp notification sent</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-indigo flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Product descriptions ready</p>
                  </div>
                </div>
              </div>

               <div className="absolute -bottom-4 left-1/4 bg-card/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg border border-border animate-fade-in" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-coral">+147%</p>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-teal">2.4k</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Trusted by section */}
        <div className="mt-16 pt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by 2,000+ small businesses worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
            {["TechCraft", "LocalMart", "StyleHub", "GreenGoods", "ArtisanCo"].map((brand, index) => (
              <div key={index} className="text-lg font-semibold text-muted-foreground">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
