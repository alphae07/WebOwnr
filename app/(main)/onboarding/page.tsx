"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { auth, db, storage } from "@/firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Store,
  Shirt,
  Coffee,
  Laptop,
  Palette,
  Flower2,
  CreditCard,
  Wallet,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  Gift,
} from "lucide-react";

// Paystack Payment Modal Component
const PaystackModal = ({ plan, frequency, onSuccess, onClose }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getPricingInfo = () => {
    const pricing: any = {
      subscription: {
        monthly: { amount: 1990 * 100, label: "₦19,900/month" },
        quarterly: { amount: 5500 * 100, label: "₦55,000/3 months" },
        biannual: { amount: 10500 * 100, label: "₦105,000/6 months" },
        annual: { amount: 19900 * 100, label: "₦199,000/year" },
      },
      installment: {
        monthly: { amount: 19900 * 100, label: "₦199,000 × 12 months" },
        quarterly: { amount: 59700 * 100, label: "₦597,000 × 4 quarters" },
        biannual: { amount: 119400 * 100, label: "₦1,194,000 × 2 payments" },
        annual: { amount: 199000 * 100, label: "₦1,990,000 (one-time)" },
      },
    };

    return pricing[plan.id]?.[frequency] || pricing[plan.id].monthly;
  };

  const handlePayment = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setIsLoading(true);
    const priceInfo = getPricingInfo();

    const handler = (window as any).PaystackPop.setup({
      key: "pk_test_xxxxxxxxxxxxx", // Replace with your Paystack public key
      email: email,
      amount: priceInfo.amount,
      currency: "NGN",
      ref: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      metadata: {
        plan: plan.id,
        plan_name: plan.name,
        frequency: frequency,
      },
      callback: function (response: any) {
        setIsLoading(false);
        onSuccess(response);
      },
      onClose: function () {
        setIsLoading(false);
      },
    });

    handler.openIframe();
  };

  const priceInfo = getPricingInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6 animate-scale-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Complete Payment</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-accent/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <plan.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{plan.name}</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{priceInfo.label}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            Billing: {frequency}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="payment-email">Email Address</Label>
            <Input
              id="payment-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={isLoading || !email}
            className="w-full h-12"
            variant="hero"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>Pay {priceInfo.label}</>
            )}
          </Button>
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="w-full h-12"
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
};


const Onboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    template: "",
    businessName: "",
    tagline: "",
    description: "",
    subdomain: "",
    logo: null as File | null,
    branding: "",
    plan: "",
    paymentFrequency: "monthly",
    paymentReference: "",
  });

  const totalSteps = 5;

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("onboarding-draft");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({
          template: parsed.template || "",
          businessName: parsed.businessName || "",
          tagline: parsed.tagline || "",
          description: parsed.description || "",
          subdomain: parsed.subdomain || "",
          logo: null,
          branding: parsed.branding || "",
          plan: parsed.plan || "",
          paymentFrequency: parsed.paymentFrequency || "monthly",
          paymentReference: parsed.paymentReference || "",
        });
      } catch (e) {
        console.error("Failed to restore draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.businessName || formData.template || formData.plan) {
      const { logo, ...dataToSave } = formData;
      localStorage.setItem("onboarding-draft", JSON.stringify(dataToSave));
    }
  }, [formData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed() && !isLoading) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, formData, isLoading]);

  const generateSubdomain = (businessName: string) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
  };

  // Check subdomain availability with debounce
  useEffect(() => {
    if (!formData.subdomain || formData.subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSubdomain(true);
      try {
        const docRef = doc(db, "sites", formData.subdomain);
        const docSnap = await getDoc(docRef);
        setSubdomainAvailable(!docSnap.exists());
      } catch (error) {
        console.error("Error checking subdomain:", error);
        setSubdomainAvailable(null);
      } finally {
        setIsCheckingSubdomain(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      const docRef = doc(db, "sites", subdomain);
      const docSnap = await getDoc(docRef);
      return !docSnap.exists();
    } catch (error) {
      console.error("Error checking subdomain:", error);
      return false;
    }
  };

  const saveOnboardingData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    let logo = "";

    if (formData.logo) {
      const storageRef = ref(storage, `logos/${user.uid}-${Date.now()}.png`);
      await uploadBytes(storageRef, formData.logo);
      logo = await getDownloadURL(storageRef);
    }

    const subdomain = formData.subdomain || generateSubdomain(formData.businessName);

    const isAvailable = await checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
      throw new Error("This subdomain is already taken. Please choose another one.");
    }

    await setDoc(doc(db, "sites", subdomain), {
      uid: user.uid,
      businessName: formData.businessName,
      tagline: formData.tagline,
      description: formData.description,
      template: formData.template,
      branding: formData.branding,
      plan: formData.plan,
      paymentFrequency: formData.paymentFrequency,
      paymentReference: formData.paymentReference,
      logo,
      subdomain: `${subdomain}`,
      createdAt: new Date().toISOString(),
    });

    localStorage.removeItem("onboarding-draft");
  };

  const templates = [
    { id: "fashion", name: "Fashion & Apparel", icon: Shirt, color: "bg-pink-100 text-pink-600" },
    { id: "food", name: "Food & Beverages", icon: Coffee, color: "bg-amber-100 text-amber-600" },
    { id: "electronics", name: "Electronics", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { id: "art", name: "Art & Crafts", icon: Palette, color: "bg-purple-100 text-purple-600" },
    { id: "beauty", name: "Beauty & Wellness", icon: Flower2, color: "bg-green-100 text-green-600" },
    { id: "general", name: "General Store", icon: Store, color: "bg-cyan-100 text-cyan-600" },
  ];

  const brandings = [
    { id: "cyan", name: "Ocean", colors: ["#00BCD4", "#00838F", "#E0F7FA"] },
    { id: "purple", name: "Royal", colors: ["#9C27B0", "#6A1B9A", "#F3E5F5"] },
    { id: "green", name: "Nature", colors: ["#4CAF50", "#2E7D32", "#E8F5E9"] },
    { id: "orange", name: "Sunset", colors: ["#FF9800", "#EF6C00", "#FFF3E0"] },
    { id: "pink", name: "Blossom", colors: ["#E91E63", "#C2185B", "#FCE4EC"] },
    { id: "blue", name: "Trust", colors: ["#2196F3", "#1565C0", "#E3F2FD"] },
  ];

  const plans = [
    {
      id: "trial",
      name: "Free Trial",
      icon: Gift,
      description: "Try for 14 days, no credit card required",
      price: "Free for 14 days",
      benefits: ["All features included", "No credit card required", "Cancel anytime"],
      requiresPayment: false,
      supportsFrequency: true,
    },
    {
      id: "subscription",
      name: "Subscription",
      icon: CreditCard,
      description: "Pay monthly, cancel anytime",
      price: "Starting at ₦19,900/mo",
      benefits: ["Flexible payments", "Cancel anytime", "All features included"],
      requiresPayment: true,
      supportsFrequency: true,
    },
    {
      id: "installment",
      name: "Installment",
      icon: Wallet,
      description: "Pay to own your website",
      price: "Starting at ₦199,000",
      benefits: ["Own your website forever", "No more fees after payment", "1 year free hosting included"],
      requiresPayment: true,
      supportsFrequency: true,
    },
  ];

  const paymentFrequencies = [
    { id: "monthly", name: "Monthly", discount: "" },
    { id: "quarterly", name: "Quarterly", discount: "Save 8%" },
    { id: "biannual", name: "Bi-Annual", discount: "Save 12%" },
    { id: "annual", name: "Annual", discount: "Save 17%" },
  ];

  const handlePlanSelect = (plan: any) => {
    if (plan.requiresPayment) {
      setFormData({ ...formData, plan: plan.id });
      setSelectedPlanForPayment(plan);
    } else {
      setFormData({ ...formData, plan: plan.id, paymentReference: "trial" });
      setPaymentCompleted(true);
    }
  };

  const handlePaymentFrequencySelect = () => {
    if (selectedPlanForPayment) {
      setShowPaymentModal(true);
    } else {
      setShowPaymentModal(false);
    }
  };

  const handlePaymentSuccess = (response: any) => {
    setFormData({
      ...formData,
      plan: selectedPlanForPayment.id,
      paymentReference: response.reference,
    });
    setPaymentCompleted(true);
    setShowPaymentModal(false);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError("");
    } else {
      setIsLoading(true);
      setError("");
      try {
        await saveOnboardingData();
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create your store. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: null });
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview("");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.template !== "";
      case 2:
        return (
          formData.businessName &&
          formData.businessName.trim() !== "" &&
          formData.businessName.length >= 2 &&
          formData.subdomain &&
          formData.subdomain.length >= 3 &&
          subdomainAvailable === true
        );
      case 3:
        return formData.branding !== "";
      case 4:
        return formData.plan !== "" && paymentCompleted;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 pb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose your template</h2>
              <p className="text-muted-foreground">
                Pick a template that best fits your business type
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setFormData({ ...formData, template: template.id })}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg text-center",
                    formData.template === template.id
                      ? "border-primary bg-accent shadow-glow"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                  aria-label={`Select ${template.name} template`}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4",
                      template.color
                    )}
                  >
                    <template.icon className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-foreground">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto pb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your brand details</h2>
              <p className="text-muted-foreground">Tell us about your business</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Brand name *</Label>
                <Input
                  id="businessName"
                  placeholder="My Awesome Store"
                  value={formData.businessName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      businessName: name,
                      subdomain: formData.subdomain || generateSubdomain(name),
                    });
                  }}
                  className="h-12"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">Your store URL *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    placeholder="my-store"
                    value={formData.subdomain}
                    onChange={(e) => {
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "");
                      setFormData({ ...formData, subdomain: value });
                    }}
                    className="h-12"
                    maxLength={50}
                  />
                  <span className="text-muted-foreground whitespace-nowrap text-sm">.webownr.com</span>
                </div>
                {isCheckingSubdomain && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking availability...
                  </p>
                )}
                {!isCheckingSubdomain && subdomainAvailable === true && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Available!
                  </p>
                )}
                {!isCheckingSubdomain && subdomainAvailable === false && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Already taken, try another
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (optional)</Label>
                <Input
                  id="tagline"
                  placeholder="Your brand's catchy tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="h-12"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  A short, memorable phrase about your brand
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brand description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers what makes your brand special..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description?.length || 0}/500
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Logo (optional)</Label>
                {!logoPreview ? (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("logoUpload")?.click()}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">Drag or click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB</p>
                    <input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-border rounded-xl p-4 relative">
                    <button
                      onClick={removeLogo}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      aria-label="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain mx-auto"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {formData.logo?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 pb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Pick your colors</h2>
              <p className="text-muted-foreground">
                Choose a color theme that matches your brand
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {brandings.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({ ...formData, branding: theme.id })}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg",
                    formData.branding === theme.id
                      ? "border-primary shadow-glow"
                      : "border-border hover:border-primary/50"
                  )}
                  aria-label={`Select ${theme.name} color theme`}
                >
                  <div className="flex gap-1 mb-3 justify-center">
                    {theme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 pb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose your plan</h2>
              <p className="text-muted-foreground">
                Select how you want to pay for your website
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg relative",
                    formData.plan === plan.id
                      ? "border-primary bg-accent shadow-glow"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                  aria-label={`Select ${plan.name} payment plan`}
                >
                  {plan.id === "subscription" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  {formData.plan === plan.id && paymentCompleted && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <plan.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-4">{plan.price}</p>
                  <ul className="space-y-2">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {/* Payment Frequency Selection */}
            {formData.plan && selectedPlanForPayment?.supportsFrequency && !paymentCompleted && (
              <div className="max-w-2xl mx-auto mt-8 p-6 bg-card rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Select Payment Frequency</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {paymentFrequencies.map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setFormData({ ...formData, paymentFrequency: freq.id })}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all duration-200",
                        formData.paymentFrequency === freq.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium text-foreground text-sm">{freq.name}</p>
                      {freq.discount && (
                        <p className="text-xs text-green-600 font-semibold mt-1">{freq.discount}</p>
                      )}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handlePaymentFrequencySelect}
                  className="w-full h-12"
                  variant="hero"
                >
                  Proceed to Payment
                </Button>
              </div>
            )}

            {showPaymentModal && selectedPlanForPayment && (
              <PaystackModal
                plan={selectedPlanForPayment}
                frequency={formData.paymentFrequency}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPaymentModal(false)}
              />
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-lg mx-auto pb-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
              <p className="text-muted-foreground">
                Review your choices and start building your store
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Template</span>
                <span className="font-medium text-foreground capitalize">
                  {templates.find((t) => t.id === formData.template)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Brand name</span>
                <span className="font-medium text-foreground">{formData.businessName}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Store URL</span>
                <span className="font-medium text-foreground text-sm">
                  {formData.subdomain}.webownr.com
                </span>
              </div>
              {formData.tagline && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Tagline</span>
                  <span className="font-medium text-foreground text-sm">{formData.tagline}</span>
                </div>
              )}
              {formData.description && (
                <div className="py-3 border-b border-border">
                  <span className="text-muted-foreground block mb-2">Description</span>
                  <p className="font-medium text-foreground text-sm">{formData.description}</p>
                </div>
              )}
              {logoPreview && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Logo</span>
                  <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain" />
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Color theme</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground capitalize">
                    {brandings.find((t) => t.id === formData.branding)?.name}
                  </span>
                  <div className="flex gap-0.5">
                    {brandings
                      .find((t) => t.id === formData.branding)
                      ?.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Payment plan</span>
                <span className="font-medium text-foreground capitalize">
                  {plans.find((p) => p.id === formData.plan)?.name}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Progress Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="font-bold text-lg text-foreground">WebOwnr</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-destructive hover:text-destructive/80"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="animate-fade-up">{renderStep()}</div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="hero"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {currentStep === totalSteps ? "Launch My Store" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;