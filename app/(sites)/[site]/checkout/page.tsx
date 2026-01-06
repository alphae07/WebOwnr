"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, doc, getDoc, getDocs, orderBy, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import {
  ChevronRight,
  Lock,
  CreditCard,
  Truck,
  MessageCircle,
  ShoppingCart,
  Check,
  ChevronLeft,
  Search,
  Heart,
  User,
  Menu,
  X,
  Package,
  Facebook,
  Instagram,
  Twitter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateData = {
  about?: string;
  tagline?: string;
  businessName?: string;
  logo?: string;
  coverImage?: string;
  subdomain?: string;
  siteId?: string;
  themeColor?: string;
  fontFamily?: string;
  darkMode?: boolean;
  whatsapp?: string;
  phone?: string;
  contactEmail?: string;
  category?: string;
  userId?: string;
  subscriptionPlan?: string;
};

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  category?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const Checkout = () => {
  const router = useRouter();
  const params = useParams();
  const siteParam = typeof params?.site === "string" ? params.site : Array.isArray(params?.site) ? params?.site[0] : undefined;
  const [templateData, setTemplateData] = useState<TemplateData>({ subdomain: siteParam });
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    country: "Nigeria",
  });

  const themeColor = templateData.themeColor || "#00BCD4";
  const fontFamily = templateData.fontFamily || "system-ui";
  const isDark = templateData.darkMode || false;
  const categories = useMemo(() => {
    const cats = ["All"];
    const uniqueCats = new Set(products.map(p => p.category).filter(Boolean));
    return [...cats, ...Array.from(uniqueCats)];
  }, [products]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_wishlist") : null;
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setWishlist(new Set(ids));
      }
      setWishlistHydrated(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && wishlistHydrated) {
        localStorage.setItem("webownr_wishlist", JSON.stringify(Array.from(wishlist)));
      }
    } catch {}
  }, [wishlist, wishlistHydrated]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentSiteId = templateData.siteId;
        let currentData = { ...templateData };
        let siteDoc: any = null;
        if (siteParam) {
          const byId = await getDoc(doc(db, "sites", siteParam));
          if (byId.exists()) {
            siteDoc = { id: byId.id, ...byId.data() };
          } else {
            const sitesRef = collection(db, "sites");
            const sq = query(sitesRef, where("subdomain", "==", siteParam));
            const ss = await getDocs(sq);
            if (!ss.empty) {
              siteDoc = { id: ss.docs[0].id, ...ss.docs[0].data() };
            }
          }
        }
        if (siteDoc) {
          currentSiteId = siteDoc.id;
          currentData = {
            ...currentData,
            siteId: siteDoc.id,
            userId: (siteDoc as any).userId,
            subscriptionPlan: (siteDoc as any).subscriptionPlan || 'free',
            businessName: (siteDoc as any).name || (siteDoc as any).businessName || currentData.businessName,
            logo: (siteDoc as any).logo || currentData.logo,
            coverImage: (siteDoc as any).coverImage || currentData.coverImage,
            about: (siteDoc as any).description || (siteDoc as any).about || currentData.about,
            tagline: (siteDoc as any).tagline || currentData.tagline,
            themeColor: (siteDoc as any).themeColor || currentData.themeColor,
            fontFamily: (siteDoc as any).fontFamily || currentData.fontFamily,
            darkMode: (siteDoc as any).darkMode ?? currentData.darkMode,
            whatsapp: (siteDoc as any).whatsapp || currentData.whatsapp,
            phone: (siteDoc as any).phone || currentData.phone,
            contactEmail: (siteDoc as any).email || (siteDoc as any).contactEmail || currentData.contactEmail,
            category: (siteDoc as any).category || currentData.category,
          };
          setTemplateData(currentData);
        }
        if (currentSiteId) {
          const productsRef = collection(db, "products");
          const pq = query(productsRef, where("siteId", "==", currentSiteId), orderBy("createdAt", "desc"));
          const snap = await getDocs(pq);
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          setProducts(list);
        }
      } catch {}
    };
    fetchData();
  }, [siteParam]);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_cart") : null;
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        setCartItems(items);
      }
      setCartHydrated(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && cartHydrated) {
        localStorage.setItem("webownr_cart", JSON.stringify(cartItems));
      }
    } catch {}
  }, [cartItems, cartHydrated]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const vatFee = templateData.subscriptionPlan === 'free' ? subtotal * 0.05 : 0;
  const total = subtotal + shipping + vatFee;

  const sendWhatsAppNotification = async (orderData: any) => {
    if (!whatsappEnabled) return;

    try {
      // Send to buyer
      if (formData.phone) {
        const buyerMessage = `🎉 *Order Confirmation*%0A%0AHi ${formData.firstName},%0A%0AYour order #${orderData.orderId} has been received!%0A%0A*Order Details:*%0A${cartItems.map(item => `• ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('%0A')}%0A%0A*Total:* $${total.toFixed(2)}%0A%0AYou'll receive updates as your order is processed.%0A%0AThank you for shopping with ${templateData.businessName}!`;
        
        window.open(`https://wa.me/${formData.phone.replace(/\D/g, '')}?text=${buyerMessage}`, '_blank');
      }

      // Send to seller
      if (templateData.whatsapp) {
        const sellerMessage = `🛍️ *New Order Received!*%0A%0A*Order ID:* ${orderData.orderId}%0A*Customer:* ${formData.firstName} ${formData.lastName}%0A*Phone:* ${formData.phone}%0A*Email:* ${formData.email}%0A%0A*Shipping Address:*%0A${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}%0A${formData.city}, ${formData.state} ${formData.zipCode}%0A${formData.country}%0A%0A*Order Items:*%0A${cartItems.map(item => `• ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('%0A')}%0A%0A*Subtotal:* $${subtotal.toFixed(2)}%0A${vatFee > 0 ? `*VAT Fee (5%):* $${vatFee.toFixed(2)}%0A` : ''}*Total:* $${total.toFixed(2)}%0A%0APlease process this order promptly.`;
        
        setTimeout(() => {
          window.open(`https://wa.me/${templateData.whatsapp?.replace(/\D/g, '')}?text=${sellerMessage}`, '_blank');
        }, 1000);
      }
    } catch (error) {
      console.error('WhatsApp notification error:', error);
    }
  };

  const createOrder = async () => {
    try {
      const orderData = {
        siteId: templateData.siteId,
        sellerId: templateData.userId,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        pricing: {
          subtotal,
          shipping,
          vatFee,
          total,
        },
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'paystack',
        whatsappNotificationEnabled: whatsappEnabled,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      return { orderId: orderRef.id, ...orderData };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  };

  const initializePaystack = async (orderData: any) => {
    try {
      // Load Paystack script
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_2d97871e3b2082766dfadeea229d64d8d2a8389e';

      // @ts-ignore
      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: formData.email,
        amount: Math.round(total * 100), // Paystack expects amount in kobo/cents
        currency: 'NGN', // Change based on your needs
        ref: `${orderData.orderId}_${Date.now()}`,
        metadata: {
          orderId: orderData.orderId,
          siteId: templateData.siteId,
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${formData.firstName} ${formData.lastName}`
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: formData.phone
            }
          ]
        },
        callback: async (response: any) => {
          setIsProcessing(true);
          try {
            // Update order with payment info
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                orderId: orderData.orderId,
              }),
            });

            // Send WhatsApp notifications
            await sendWhatsAppNotification(orderData);

            // Clear cart
            setCartItems([]);
            localStorage.removeItem("webownr_cart");

            // Redirect to success page
            router.push(`/success?order=${orderData.orderId}`);
          } catch (error) {
            setError('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        onClose: () => {
          setIsProcessing(false);
          setError('Payment was cancelled');
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw new Error('Failed to initialize payment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Step 2 is payment - process order
    setIsProcessing(true);

    try {
      // Create order in Firebase
      const orderData = await createOrder();

      // Initialize Paystack payment
      await initializePaystack(orderData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily }}>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-3 md:mb-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href={`/${siteParam}`} className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: themeColor }}
                >
                  {templateData.logo ? (
                    <img src={templateData.logo} alt={templateData.businessName} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    (templateData.businessName || "Store").charAt(0)
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-lg text-foreground">{templateData.businessName || "Store"}</div>
                  {templateData.tagline && (
                    <div className="text-xs text-muted-foreground">{templateData.tagline}</div>
                  )}
                </div>
              </Link>

              <div className="hidden md:flex flex-1 max-w-xs">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as any]: `${themeColor}80` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearchMobile(!showSearchMobile)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setWishlistOpen(true)}
                  className="hidden sm:flex p-2 hover:bg-muted rounded-lg transition-colors relative"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.size > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full text-white flex items-center justify-center"
                      style={{ backgroundColor: themeColor }}
                    >
                      {wishlist.size}
                    </span>
                  )}
                </button>
                <button className="hidden sm:flex p-2 hover:bg-muted rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full text-white flex items-center justify-center font-semibold"
                      style={{ backgroundColor: themeColor }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {showSearchMobile && (
              <div className="md:hidden mt-3 animate-in slide-in-from-top-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as any]: `${themeColor}80` }}
                    autoFocus
                  />
                </div>
              </div>
            )}

            <nav className="hidden lg:flex gap-1 mt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat || "All")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    selectedCategory === cat
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={selectedCategory === cat ? { backgroundColor: themeColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-muted/30 animate-in slide-in-from-top-2">
            <div className="px-4 py-3 space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat || "All");
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    selectedCategory === cat
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={selectedCategory === cat ? { backgroundColor: themeColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Information", "Payment"].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step > index + 1
                    ? "text-white"
                    : step === index + 1
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
                style={step > index + 1 ? { backgroundColor: themeColor } : {}}
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
              {index < 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5",
                    step > index + 1 ? "bg-opacity-100" : "bg-border"
                  )}
                  style={step > index + 1 ? { backgroundColor: themeColor } : {}}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
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
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-colors",
                      whatsappEnabled
                        ? "border-green-500 bg-green-50"
                        : "border-border hover:border-muted-foreground"
                    )}
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          whatsappEnabled ? "bg-green-500" : "bg-muted"
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
                          whatsappEnabled ? "border-green-500 bg-green-500" : "border-border"
                        )}
                      >
                        {whatsappEnabled && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                </div>

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
                        placeholder="Lagos"
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
                        placeholder="Lagos"
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
                        placeholder="100001"
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
                        <option>Nigeria</option>
                        <option>Ghana</option>
                        <option>South Africa</option>
                        <option>Kenya</option>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3">
                    <Truck className="w-5 h-5" style={{ color: themeColor }} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Free Standard Shipping</p>
                      <p className="text-xs text-muted-foreground">Estimated delivery: 5-7 business days</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Payment</h2>

                <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5" style={{ color: themeColor }} />
                  <p className="text-sm text-muted-foreground">
                    Secure payment powered by Paystack
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 mb-1">Payment via Paystack</p>
                        <p className="text-sm text-blue-700">
                          You'll be redirected to Paystack to complete your payment securely. We accept cards, bank transfers, and mobile money.
                        </p>
                      </div>
                    </div>
                  </div>

                  {vatFee > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> A 5% VAT fee (${vatFee.toFixed(2)}) is applied.
                      </p>
                    </div>
                  )}
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
                  disabled={isProcessing}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="w-full text-white flex-1 font-semibold"
                style={{ backgroundColor: themeColor }}
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : step === 2 ? (
                  `Pay ${total.toFixed(2)}`
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="lg:order-last">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg shrink-0 flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
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
                  <span className="font-semibold" style={{ color: themeColor }}>
                    Free
                  </span>
                </div>
                {vatFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT Fee (5%)</span>
                    <span className="text-foreground">${vatFee.toFixed(2)}</span>
                  </div>
                )}
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

      {wishlistOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={() => setWishlistOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground">Wishlist</h2>
              <button
                onClick={() => setWishlistOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {Array.from(wishlist).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-foreground font-semibold mb-2">No liked products</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the heart on products to add them here.
                  </p>
                </div>
              ) : (
                products
                  .filter(p => wishlist.has(p.id))
                  .map(product => (
                    <div key={product.id} className="flex gap-4 p-4 bg-muted rounded-xl">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 rounded-lg object-cover bg-background flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold" style={{ color: themeColor }}>
                          ${Number(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-2">
                        <Button
                          onClick={() =>
                            setCartItems(prev => {
                              const existing = prev.find(i => i.id === product.id);
                              if (existing) {
                                return prev.map(i =>
                                  i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                                );
                              }
                              return [
                                ...prev,
                                {
                                  id: product.id,
                                  name: product.name,
                                  price: Number(product.price || 0),
                                  quantity: 1,
                                  image: product.image,
                                },
                              ];
                            })
                          }
                          size="sm"
                          className="text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                        <button
                          onClick={() =>
                            setWishlist(prev => {
                              const next = new Set(prev);
                              next.delete(product.id);
                              return next;
                            })
                          }
                          className="text-xs text-muted-foreground hover:text-foreground block"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="p-4 md:p-6 border-t border-border space-y-3 flex-shrink-0">
              <Button
                onClick={() => setWishlistOpen(false)}
                className="w-full text-foreground hover:bg-muted"
                variant="ghost"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </>
      )}

      <footer className="bg-foreground text-background py-8 md:py-12">
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground font-bold"
                  style={{ backgroundColor: themeColor }}
                >
                  {(templateData.businessName || "Store").charAt(0)}
                </div>
                <span className="font-bold text-xl">{templateData.businessName || "Store"}</span>
              </div>
              <p className="text-background/70 text-sm">
                {templateData.about || "Your destination for quality products at affordable prices."}
              </p>
            </div>
            {[
              {
                title: "Shop",
                links: ["New Arrivals", "Best Sellers", "Sale", "All Products"],
              },
              { title: "Help", links: ["Shipping Info", "Returns", "FAQ", "Contact Us"] },
              {
                title: "Connect",
                links: [templateData.phone ? "Call Us" : null, templateData.whatsapp ? "WhatsApp" : null, templateData.contactEmail ? "Email" : null].filter(Boolean) as string[],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4 text-sm md:text-base">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button className="text-sm text-background/70 hover:text-background transition-colors">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="py-4 border-t border-background/10 flex items-center justify-center gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <button
                key={i}
                className="p-2 rounded-lg hover:bg-background/10 transition-colors"
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} {templateData.businessName || "Store"}. Powered by WebOwnr.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;