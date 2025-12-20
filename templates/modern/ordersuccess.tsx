import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Package,
  Truck,
  MessageCircle,
  Mail,
  ArrowRight,
} from "lucide-react";

const OrderSuccess = () => {
  const orderNumber = "WO-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <Link href="/template/modern" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold">S</span>
              </div>
              <span className="font-bold text-xl text-foreground">StyleHub</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-teal/10 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-teal" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Thank you for your order!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-muted-foreground mb-8">
            Order number: <span className="font-semibold text-foreground">{orderNumber}</span>
          </p>

          {/* Notification Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Email Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email with your order details.
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-teal" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">WhatsApp Updates</h3>
              <p className="text-sm text-muted-foreground">
                You'll receive shipping updates on WhatsApp.
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h2 className="font-semibold text-foreground mb-6 text-left">What's Next?</h2>
            <div className="space-y-4">
              {[
                { icon: CheckCircle2, title: "Order Confirmed", desc: "Your order has been received", status: "complete" },
                { icon: Package, title: "Processing", desc: "We're preparing your items", status: "current" },
                { icon: Truck, title: "Shipped", desc: "On its way to you", status: "pending" },
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4 text-left">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      step.status === "complete"
                        ? "bg-teal text-white"
                        : step.status === "current"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-border last:border-0">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link href="/template/modern">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Track Order
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:support@stylehub.com" className="text-primary hover:underline">
              support@stylehub.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OrderSuccess;
