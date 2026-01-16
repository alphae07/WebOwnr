"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, doc, getDoc, getDocs, orderBy, query, where, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
  X, Minus, Plus,
  Package,
  Facebook,
  Instagram,
  Twitter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, formatNGN } from "@/lib/utils";

type TemplateData = {
  about?: string;
  tagline?: string;
  businessName?: string;
  logo?: string;
  coverImage?: string;
  contactAddress?: string;
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

type BuyerProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
};
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
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
 
  const [loadingProducts, setLoadingProducts] = useState(true);
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

   const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [footerModalContent, setFooterModalContent] = useState<"about" | "contact" | "returns" | "shipping" | null>(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
  };


  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCheckout = () => {
    if (!cartItems.length) return;
    const message = `Hi, I'd like to order:\n\n${cartItems
      .map(item => `${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")}\n\nTotal: ₦${cartTotal.toFixed(2)}`;
    const phone = templateData.whatsapp?.replace(/\D/g, "") || "";
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  // Save buyer profile to localStorage
  const saveBuyerProfile = (profile: BuyerProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("webownr_buyer_profile", JSON.stringify(profile));
      setBuyerProfile(profile);
      setEditingProfile(false);
    }
  };
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

  
  const updateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

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
        if (!currentSiteId) {
          setProducts([]);
          setFilteredProducts([]);
          setLoadingProducts(false);
          return;
        }

        const productsRef = collection(db, "products");
        const pq = query(
          productsRef,
          where("siteId", "==", currentSiteId),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(pq);
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Product));
        setProducts(list);
        setFilteredProducts(list);
      }
       catch (e) {
        console.error("Error loading data", e);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoadingProducts(false);
      }
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
        const buyerMessage = `🎉 *Order Confirmation*%0A%0AHi ${formData.firstName},%0A%0AYour order #${orderData.orderId} has been received!%0A%0A*Order Details:*%0A${cartItems.map(item => `• ${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toFixed(2)}`).join('%0A')}%0A%0A*Total:* ₦${total.toFixed(2)}%0A%0AYou'll receive updates as your order is processed.%0A%0AThank you for shopping with ${templateData.businessName}!`;
        
        window.open(`https://wa.me/${formData.phone.replace(/\D/g, '')}?text=${buyerMessage}`, '_blank');
      }

      // Send to seller
      if (templateData.whatsapp) {
        const sellerMessage = `🛍️ *New Order Received!*%0A%0A*Order ID:* ${orderData.orderId}%0A*Customer:* ${formData.firstName} ${formData.lastName}%0A*Phone:* ${formData.phone}%0A*Email:* ${formData.email}%0A%0A*Shipping Address:*%0A${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}%0A${formData.city}, ${formData.state} ${formData.zipCode}%0A${formData.country}%0A%0A*Order Items:*%0A${cartItems.map(item => `• ${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toFixed(2)}`).join('%0A')}%0A%0A*Subtotal:* ₦${subtotal.toFixed(2)}%0A${vatFee > 0 ? `*VAT Fee:* ₦${vatFee.toFixed(2)}%0A` : ''}*Total:* ₦${total.toFixed(2)}%0A%0APlease process this order promptly.`;
        
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
        sellerId: templateData.userId ?? null,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        productName: cartItems.length > 0 ? (cartItems.length === 1 ? cartItems[0].name : `${cartItems[0].name} +${cartItems.length - 1} more`) : undefined,
        amount: total,
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
      try {
        await updateDoc(orderRef, { orderId: orderRef.id });
      } catch {}
      return { orderId: orderRef.id, ...orderData };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  };

  const initializePaystack = async (orderData: any) => {
    try {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_2d97871e3b2082766dfadeea229d64d8d2a8389e';

      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop || typeof PaystackPop.setup !== 'function') {
        throw new Error('Paystack SDK failed to load');
      }
      if (!formData.email) {
        throw new Error('Email is required for payment');
      }
      if (total <= 0) {
        throw new Error('Cart total must be greater than zero');
      }

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
        callback: function (response: any) {
          setIsProcessing(true);
          (async () => {
            try {
              await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reference: response.reference,
                  orderId: orderData.orderId,
                }),
              });
              try {
                const orderDoc = doc(db, "orders", orderData.orderId);
                await updateDoc(orderDoc, {
                  status: "paid",
                  paymentStatus: "paid",
                  amount: orderData.pricing.total,
                  updatedAt: serverTimestamp(),
                });
              } catch {}
              await sendWhatsAppNotification(orderData);
              setCartItems([]);
              localStorage.removeItem("webownr_cart");
              router.push(`/m/success?order=${orderData.orderId}`);
            } catch (error) {
              setError('Payment verification failed. Please contact support.');
              setIsProcessing(false);
            }
          })();
        },
        onClose: function () {
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

     const openFooterModal = (content: "about" | "contact" | "returns" | "shipping") => {
    setFooterModalContent(content);
    setFooterModalOpen(true);
  };

  const closeFooterModal = () => {
    setFooterModalOpen(false);
    setTimeout(() => setFooterModalContent(null), 300);
  };

  const getModalContent = () => {
    switch (footerModalContent) {
      case "about":
        return {
          title: "About Us",
          content: templateData.about || "We are committed to providing the highest quality products and exceptional customer service. Our carefully curated collection features timeless pieces designed to last beyond seasons."
        };
      case "shipping":
        return {
          title: "Shipping Information",
          content: "We offer free shipping on all orders over $150. Standard shipping takes 5-7 business days. Express shipping is available for an additional fee. All orders are carefully packaged and tracked for your peace of mind."
        };
      case "returns":
        return {
          title: "Returns Policy",
          content: "We want you to be completely satisfied with your purchase. Items can be returned within 30 days of purchase for a full refund. Products must be unworn and in original condition with tags attached. Return shipping is free for defective items."
        };
      case "contact":
        return {
          title: "Contact Us",
          content: `We'd love to hear from you.\n\nPhone: ${templateData.phone || "(555) 123-4567"}\n\nEmail: ${templateData.contactEmail || "support@classique.com"}\n\nAddress: ${templateData.contactAddress || "123 Fashion Street, New York, NY 10001"}`
        };
      default:
        return { title: "", content: "" };
    }
  };

  const modalData = getModalContent();
  
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily }}>
       {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="max-w-7xl mx-auto">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-4 mb-3 md:mb-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo/Brand */}
              <Link href="/" className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: templateData.themeColor }}
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

              {/* Desktop Search */}
              <div className="hidden md:flex flex-1 max-w-xs">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={() => setSearchModalOpen(true)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchModalOpen(true)}
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
                                <button onClick={() => setProfileModalOpen(true)}
                  className="hidden sm:flex p-2 hover:bg-muted rounded-lg transition-colors"
                >
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

            {/* Mobile Search Bar */}
            {showSearchMobile && (
              <div className="md:hidden mt-3 animate-in slide-in-from-top-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
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

        {/* Mobile Menu */}
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
                        <strong>Note:</strong> A 5% VAT fee ({formatNGN(vatFee)}) is applied.
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
                  `Pay ${formatNGN(total)}`
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
                        {formatNGN(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold" style={{ color: themeColor }}>
                    Free
                  </span>
                </div>
                {vatFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT Fee</span>
                    <span className="text-foreground">{formatNGN(vatFee)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatNGN(total)}
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
                          {formatNGN(Number(product.price || 0))}
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

     {/* Footer */}
      <footer className="bg-foreground text-background py-8 md:py-12">
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Brand */}
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

            <div>
              <h4 className="text-white font-medium mb-4" style={{color: templateData.themeColor}}>Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setSelectedCategory("All")} className="hover:text-white transition-colors">New Arrivals</button></li>
                <li><button onClick={() => setSelectedCategory("Best Sellers")} className="hover:text-white transition-colors">Best Sellers</button></li>
                <li><button onClick={() => setSelectedCategory("Collections")} className="hover:text-white transition-colors">Collections</button></li>
                <li><button onClick={() => setSelectedCategory("All")} className="hover:text-white transition-colors">Sale</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4" style={{color: templateData.themeColor}}>Support</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => openFooterModal("contact")} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => openFooterModal("about")} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => openFooterModal("shipping")} className="hover:text-white transition-colors">Shipping</button></li>
                <li><button onClick={() => openFooterModal("returns")} className="hover:text-white transition-colors">Returns</button></li>
              </ul>
            </div>
            <div>
              <h4 id="socials" className="text-white font-medium mb-4" style={{color: templateData.themeColor}}>Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href={`tel:${(templateData as any).phone}`} className="hover:text-white transition-colors">Call Us</a></li>
                <li><Link href={`https://wa.me/${(templateData as any).whatsapp}`} className="hover:text-white transition-colors">WhatsApp</Link></li>
                <li><a href={`mailto:${(templateData as any).email}`} className="hover:text-white transition-colors">Email</a></li>
             </ul>
            </div>  
          </div>

          {/* Social Links */}
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

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} {templateData.businessName || "Store"}. Powered by WebOwnr.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Shopping Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-foreground font-semibold mb-2">Cart is Empty</p>
                  <p className="text-sm text-muted-foreground">
                    Start adding items to your cart!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-muted rounded-xl"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover bg-background flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p
                        className="text-sm font-bold mb-2"
                        style={{ color: themeColor }}
                      >
                        {formatNGN(item.price)} each
                      </p>
                      <div className="flex items-center gap-1 bg-background rounded-lg w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground text-sm">
                        {formatNGN(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>


            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 md:p-6 border-t border-border space-y-4 flex-shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatNGN(cartTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: themeColor }}
                    >
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: themeColor }}
                  size="lg"
                  onClick={() => router.push('/m/checkout')}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button
                  onClick={handleCheckout}
                  size="lg"
                  className="w-full text-white font-semibold bg-green-500"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order via WhatsApp
                </Button>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  💬 Chat with us on WhatsApp for instant support
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Wishlist Sidebar */}
      {wishlistOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setWishlistOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Wishlist
              </h2>
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
                          onClick={() => addToCart(product)}
                          size="sm"
                          className="text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                        <button
                          onClick={() => toggleWishlist(product.id)}
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


      {/* Footer Modal */}
      {footerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={closeFooterModal}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-serif mb-4" style={{color: templateData.themeColor}}>{modalData.title}</h2>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line mb-6">{modalData.content}</p>
            <Button 
              onClick={closeFooterModal}
              className="w-full text-white"
              style={{backgroundColor: templateData.themeColor}}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => setProfileModalOpen(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-serif mb-6" style={{color: templateData.themeColor}}>Buyer Profile</h2>
            
            {!editingProfile ? (
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-stone-500">Full Name</p>
                  <p className="font-medium text-stone-800">{buyerProfile.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Email</p>
                  <p className="font-medium text-stone-800">{buyerProfile.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Phone</p>
                  <p className="font-medium text-stone-800">{buyerProfile.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Address</p>
                  <p className="font-medium text-stone-800">{buyerProfile.address || "Not provided"}</p>
                </div>
                <Button 
                  onClick={() => setEditingProfile(true)}
                  className="w-full text-white mt-6"
                  style={{backgroundColor: templateData.themeColor}}
                >
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <input 
                  type="text"
                  placeholder="Full Name"
                  value={buyerProfile.name}
                  onChange={(e) => setBuyerProfile({...buyerProfile, name: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
                <input 
                  type="email"
                  placeholder="Email"
                  value={buyerProfile.email}
                  onChange={(e) => setBuyerProfile({...buyerProfile, email: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
                <input 
                  type="tel"
                  placeholder="Phone"
                  value={buyerProfile.phone}
                  onChange={(e) => setBuyerProfile({...buyerProfile, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
                <textarea 
                  placeholder="Address"
                  value={buyerProfile.address}
                  onChange={(e) => setBuyerProfile({...buyerProfile, address: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => saveBuyerProfile(buyerProfile)}
                    className="flex-1 text-white"
                    style={{backgroundColor: templateData.themeColor}}
                  >
                    Save
                  </Button>
                  <Button 
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 border border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => setSearchModalOpen(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif" style={{color: templateData.themeColor}}>Search Products</h2>
              <button onClick={() => setSearchModalOpen(false)} className="p-1 hover:bg-stone-100 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg mb-6"
              autoFocus
            />

            <div className="max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-stone-500 py-8">No products found</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                      <h3 className="font-medium text-sm text-stone-800 truncate">{product.name}</h3>
                      <p className="text-stone-600 text-sm font-medium">${product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
