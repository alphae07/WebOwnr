 "use client";
 
 import { useState } from "react";
 import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Lock,
  CreditCard,
  Truck,
  MessageCircle,
  Check,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Checkout = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const orderItems = [
    { name: "Classic Premium Cotton T-Shirt", size: "M", color: "Black", qty: 2, price: 49.99 },
    { name: "Denim Jacket", size: "L", color: "Blue", qty: 1, price: 89.99 },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push("/template/modern/order-success");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/storefront" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold">S</span>
              </div>
              <span className="font-bold text-xl text-foreground">StyleHub</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Information", "Shipping", "Payment"].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step > index + 1
                    ? "bg-primary text-primary-foreground"
                    : step === index + 1
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:inline",
                  step >= index + 1 ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {index < 2 && (
                <div
                  className={cn(
                    "w-8 h-0.5",
                    step > index + 1 ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      First Name
                    </label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Last Name
                    </label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* WhatsApp Notification */}
                <div
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    whatsappEnabled
                      ? "border-teal bg-teal/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        whatsappEnabled ? "bg-teal" : "bg-muted"
                      )}
                    >
                      <MessageCircle
                        className={cn(
                          "w-5 h-5",
                          whatsappEnabled ? "text-white" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">WhatsApp Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get order updates via WhatsApp
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        whatsappEnabled ? "border-teal bg-teal" : "border-border"
                      )}
                    >
                      {whatsappEnabled && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Address
                  </label>
                  <Input
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Apartment, suite, etc. (optional)
                  </label>
                  <Input
                    placeholder="Apt 4B"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      City
                    </label>
                    <Input
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      State
                    </label>
                    <Input
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      ZIP Code
                    </label>
                    <Input
                      placeholder="10001"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Free Standard Shipping</p>
                    <p className="text-xs text-muted-foreground">Estimated delivery: 5-7 business days</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Payment</h2>

                <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Your payment information is encrypted and secure
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Name on Card
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Expiry Date
                    </label>
                    <Input
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      CVV
                    </label>
                    <Input
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(step - 1)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button type="submit" variant="hero" size="lg" className="flex-1">
                {step === 3 ? `Pay $${total.toFixed(2)}` : "Continue"}
                {step < 3 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </form>

          {/* Order Summary */}
          <div className="lg:order-last">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.color} / {item.size} × {item.qty}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-teal">Free</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
