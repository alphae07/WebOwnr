"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  Tag,
  Truck,
  ArrowLeft,
  Search,
  Heart,
  User,
  Menu,
  X,
  Package,
  Facebook,
  Instagram,
  Twitter,
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
};

interface Product {
  id: string;
  name: string;
  price: number;
  shipping: number;
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

const Cart = () => {
  const router = useRouter();
  const params = useParams();
  const siteParam = typeof params?.site === "string" ? params.site : Array.isArray(params?.site) ? params?.site[0] : undefined;
  const [templateData, setTemplateData] = useState<TemplateData>({ subdomain: siteParam });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
   const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartHydrated, setCartHydrated] = useState(false);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);
  const themeColor = templateData.themeColor || "#00BCD4";
  const fontFamily = templateData.fontFamily || "system-ui";
  const isDark = templateData.darkMode || false;  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [couponCode, setCouponCode] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
 const [loadingProducts, setLoadingProducts] = useState(true);
  const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [footerModalContent, setFooterModalContent] = useState<"about" | "contact" | "returns" | "shipping" | null>(null);

  // Load buyer profile from localStorage
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_buyer_profile") : null;
      if (stored) {
        setBuyerProfile(JSON.parse(stored));
      }
    } catch {}
  }, []);

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
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_cart") : null;
      if (stored) {
        const items = JSON.parse(stored) as { quantity: number }[];
        const count = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        setCartCount(count);
      }
    } catch {}
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
	 setLoadingProducts(true);
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
  const productsRef = collection(db, "products");
        const pq = query(productsRef, where("siteId", "==", currentSiteId), orderBy("createdAt", "desc"));
        const snap = await getDocs(pq);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        setProducts(list);
        setFilteredProducts(list);
      } catch {
        setProducts([]);
        setFilteredProducts([]);
} finally {
        setLoadingProducts(false);
      }
 };

    fetchData();
  }, [templateData.siteId, [siteParam], templateData.subdomain, templateData.businessName]);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

   

 
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = templateData.shipping || 0;
  const total = subtotal + shipping;

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
       {/* Top Bar */}
      <div className="bg-stone-800 text-white text-sm py-2" style={{backgroundColor: templateData.themeColor}}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>Welcome to our store.</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#socials" className="hover:text-white transition-colors">Social handles</a>
            <a href="#" onClick={() => openFooterModal("contact")} className="hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <button 
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="text-2xl font-serif font-bold text-stone-800 tracking-wide">
              {templateData.businessName || "CLASSIQUE"}
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              
              <button onClick={() => setSelectedCategory("All")} className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Latest</button>
              <button onClick={() => setSelectedCategory("Collections")} className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Collections</button>
              <button onClick={() => setSelectedCategory("All")} className="text-stone-600 hover:text-stone-900 font-medium transition-colors w-full text-left">Sale</button>
              <button onClick={() => openFooterModal("about")} className="text-stone-600 hover:text-stone-900 font-medium transition-colors w-full text-left">About</button>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <Search className="h-5 w-5 text-stone-600" />
              </button>
              <button 
                onClick={() => setProfileModalOpen(true)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <User className="h-5 w-5 text-stone-600" />
              </button>
              <Link href="/c/cart" className="p-2 hover:bg-stone-100 rounded-full transition-colors relative">
                <ShoppingCart className="h-5 w-5 text-stone-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-200 py-4">
            <div className="container mx-auto px-4 space-y-4">
              <a href="#" className="block py-2 text-stone-600 hover:text-stone-900 font-medium">Shop</a>
              <button onClick={() => setSelectedCategory("All")} className="block py-2 text-stone-600 hover:text-stone-900 font-medium w-full text-left">Latest</button>
              <button onClick={() => setSelectedCategory("Collections")} className="block py-2 text-stone-600 hover:text-stone-900 font-medium w-full text-left">Collections</button>
              <button onClick={() => setSelectedCategory("All")} className="block py-2 text-stone-600 hover:text-stone-900 font-medium w-full text-left">Sale</button>
              <button onClick={() => openFooterModal("about")} className="block py-2 text-stone-600 hover:text-stone-900 font-medium w-full text-left">About</button>
            </div>
          </div>
        )}
      </header>



      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href={'/'} className="text-muted-foreground hover:text-foreground">Home</Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8" style={{color: themeColor}}/>
          <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
          <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any items yet.</p>
            <Button className="w-full text-white font-semibold"
                  style={{ backgroundColor: themeColor }} onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-2xl border border-border"
                >
                  <Link
                    href={'/c/product/${item.id}'}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={'/c/product/${item.id}'}
                      className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-lg font-bold text-foreground mt-2">
                      ${item.price}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href={'/'}
                style={{color: themeColor}}
                className="inline-flex items-center gap-2 text-sm hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

                {/* Coupon */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Discount Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{outline: 'none'}}
                        className="pl-9"
                      />
                    </div>
                    <Button className="text-white font-semibold"
                  style={{ backgroundColor: themeColor }}>Apply</Button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold" style={{ color: shipping === 0 ? themeColor : undefined }}>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                      <Truck className="w-4 h-4" />
                      Add coupon code for discount/free shipping
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

                <Button
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: themeColor }}
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/c/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      {wishlistOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setWishlistOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl animate-slide-in-right flex flex-col">
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
      {/* Footer */}
      <footer className="bg-black text-white py-16" style={{backgroundColor: "black"}}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-serif text-xl mb-6" style={{color: templateData.themeColor}}>{templateData.businessName || "CLASSIQUE"}</h3>
              <p className="text-sm leading-relaxed mb-6">
                {templateData.tagline || "Curating timeless pieces for the discerning individual."}
              </p>
              <div className="space-y-2 text-sm">
                {templateData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{templateData.phone || ""}</span>
                  </div>
                )}
                {templateData.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{templateData.contactEmail || ""}</span>
                  </div>
                )}
                {templateData.contactAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{templateData.contactAddress || ""}</span>
                  </div>
                )}
              </div>
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
              <h4 id="socials" className="text-white font-medium mb-4" style={{color: templateData.themeColor}}>Socials</h4>
              <div className="py-2 flex items-center gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => {
                  const key = Icon.displayName?.toLowerCase() as keyof typeof templateData;
                  return (
                    <Link key={i} href={(templateData as any)[key] || "#"}>
                      <button className="p-2 rounded-lg hover:bg-background/10 transition-colors">
                        <Icon className="w-5 h-5" />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-12 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} {templateData.businessName || "Classique"}. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

export default Cart;
