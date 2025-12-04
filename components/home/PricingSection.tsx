"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const PricingSection = () => {
  const [billingType, setBillingType] = useState<"subscription" | "installment">("subscription");

  const plans = {
    subscription: [
      {
        name: "Starter",
        price: "$19",
        period: "/month",
        description: "Perfect for getting started",
        features: [
          "Up to 50 products",
          "Basic templates",
          "SSL certificate",
          "Email support",
          "Webownr subdomain",
        ],
        popular: false,
      },
      {
        name: "Professional",
        price: "$49",
        period: "/month",
        description: "Best for growing businesses",
        features: [
          "Unlimited products",
          "Premium templates",
          "Custom domain",
          "WhatsApp notifications",
          "AI product descriptions",
          "PWA mobile app",
          "Priority support",
        ],
        popular: true,
      },
      {
        name: "Business",
        price: "$99",
        period: "/month",
        description: "For established stores",
        features: [
          "Everything in Professional",
          "Multiple staff accounts",
          "Advanced analytics",
          "API access",
          "White-label options",
          "Dedicated support",
        ],
        popular: false,
      },
    ],
    installment: [
      {
        name: "Starter",
        price: "$199",
        period: " × 12 months",
        totalPrice: "$2,388",
        description: "Own your basic store",
        features: [
          "Up to 50 products",
          "Basic templates",
          "SSL certificate",
          "Email support",
          "Webownr subdomain",
          "Own after 12 payments",
        ],
        popular: false,
      },
      {
        name: "Professional",
        price: "$399",
        period: " × 12 months",
        totalPrice: "$4,788",
        description: "Own your professional store",
        features: [
          "Unlimited products",
          "Premium templates",
          "Custom domain",
          "WhatsApp notifications",
          "AI product descriptions",
          "PWA mobile app",
          "Own after 12 payments",
        ],
        popular: true,
      },
      {
        name: "Business",
        price: "$699",
        period: " × 12 months",
        totalPrice: "$8,388",
        description: "Own your enterprise store",
        features: [
          "Everything in Professional",
          "Multiple staff accounts",
          "Advanced analytics",
          "API access",
          "White-label options",
          "Lifetime updates",
        ],
        popular: false,
      },
    ],
  };

  const currentPlans = plans[billingType];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Flexible Plans for Every Business
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose subscription for flexibility, or installment to own your website forever.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1.5 bg-muted rounded-xl">
            <button
              onClick={() => setBillingType("subscription")}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                billingType === "subscription"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Subscription
            </button>
            <button
              onClick={() => setBillingType("installment")}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                billingType === "installment"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Installment
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                Own It
              </span>
            </button>
          </div>
        </div>

        {/* Installment info banner */}
        {billingType === "installment" && (
          <div className="max-w-2xl mx-auto mb-12 p-4 bg-accent rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-accent-foreground">
              <strong>Own your website forever!</strong> After completing 12 monthly payments, your website is yours with no more fees. Includes 1 year of free hosting after ownership.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentPlans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-2xl p-8 transition-all duration-300",
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-glow scale-105"
                  : "bg-card border border-border shadow-card hover:shadow-lg"
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-background text-foreground text-sm font-medium rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3
                  className={cn(
                    "text-xl font-semibold mb-2",
                    plan.popular ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm mb-4",
                    plan.popular
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      plan.popular ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      plan.popular
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                {billingType === "installment" && "totalPrice" in plan && (
                  <p
                    className={cn(
                      "text-xs mt-2",
                      plan.popular
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    Total: {plan.totalPrice}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "w-5 h-5 shrink-0 mt-0.5",
                        plan.popular ? "text-primary-foreground" : "text-primary"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        plan.popular
                          ? "text-primary-foreground/90"
                          : "text-foreground"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/signup" className="block">
                <Button
                  variant={plan.popular ? "hero-white" : "hero"}
                  className="w-full"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Need a custom solution?{" "}
            <Link href="/contact" className="text-primary font-medium hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
