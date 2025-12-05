"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground" />
      
      {/* Decorative gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/30 to-teal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-purple/20 to-coral/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-teal/20 backdrop-blur rounded-full mb-8 border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground">Start Your 14-Day Free Trial</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-primary-foreground">
            Ready to Build Your{" "}
            <span className="bg-gradient-to-r from-primary via-teal to-primary bg-clip-text text-transparent">
              Online Store?
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            Join 2,000+ small businesses already selling online with WebOwnr. No credit card required to start.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button variant="hero" size="xl" className="group shadow-glow">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-primary-foreground/60">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal" />
              Free 14-day trial
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple" />
              Full support included
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
