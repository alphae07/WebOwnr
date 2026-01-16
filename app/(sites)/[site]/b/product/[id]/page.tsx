"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, Check,
  Truck, Shield, RefreshCcw, Share2, ChevronRight, Package,
  Loader2, X, MessageCircle, ShoppingBag, Menu, Search, User,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { cn, formatNGN } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  tagline?: string;
  category?: string;
  stock?: number;
  sku?: string;
  specifications?: { [key: string]: string };
  features?: string[];
  siteId?: string;
}

interface SiteData {
  id: string;
  name?: string;
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

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params?.id === "string" ? params.id : "";
  const siteParam = typeof params?.site === "string" ? params.site : "";
  
  const [product, setProduct] = useState<Product | null>(null);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
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
const [loadingProducts, setLoadingProducts] = useState(true);

  const [footerModalOpen, setFooterModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All");

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


  const themeColor = siteData?.themeColor || "#00BCD4";
  const fontFamily = siteData?.fontFamily || "system-ui";
  const isDark = siteData?.darkMode || false;

  // Load wishlist & cart from localStorage
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem("webownr_wishlist");
      const storedCart = localStorage.getItem("webownr_cart");
      if (storedWishlist) setWishlist(new Set(JSON.parse(storedWishlist)));
      if (storedCart) setCartItems(JSON.parse(storedCart));
    } catch {}
  }, []);

  // Save wishlist & cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("webownr_wishlist", JSON.stringify(Array.from(wishlist)));
      localStorage.setItem("webownr_cart", JSON.stringify(cartItems));
    } catch {}
  }, [wishlist, cartItems]);

  // Fetch product and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          router.push('/');
          return;
        }

        const productData = { id: productSnap.id, ...productSnap.data() } as Product;
        setProduct(productData);

        if (productData.siteId) {
          const siteRef = doc(db, "sites", productData.siteId);
          const siteSnap = await getDoc(siteRef);
          if (siteSnap.exists()) {
            setSiteData({ id: siteSnap.id, ...siteSnap.data() } as SiteData);
          }

          // Fetch related products
          const relatedQuery = query(
            collection(db, "products"),
            where("siteId", "==", productData.siteId),
            where("category", "==", productData.category),
            limit(5)
          );
          const relatedSnap = await getDocs(relatedQuery);
          const related = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== productId)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId, router, siteParam]);

const [cartHydrated, setCartHydrated] = useState(false);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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


  const addToCart = () => {
    if (!product) return;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || product.images?.[0],
      }];
    });
  };

  const toggleWishlist = () => {
    if (!product) return;
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });
  };




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: themeColor }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;


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
          content: siteData.about || "We are committed to providing the highest quality products and exceptional customer service. Our carefully curated collection features timeless pieces designed to last beyond seasons."
        };
      case "shipping":
        return {
          title: "Shipping Information",
          content: "We offer fast shipping on all orders. Standard shipping takes 5-7 business days. Express shipping is available for an additional fee. All orders are carefully packaged and tracked for your peace of mind."
        };
      case "returns":
        return {
          title: "Returns Policy",
          content: "We want you to be completely satisfied with your purchase. Items can be returned within 30 days of purchase for a full refund. Products must be unworn and in original condition with tags attached. Return shipping is free for defective items."
        };
      case "contact":
        return {
          title: "Contact Us",
          content: `We'd love to hear from you.\n\nPhone: ${siteData.phone || "(555) 123-4567"}\n\nEmail: ${siteData.contactEmail || "support@classique.com"}\n\nAddress: ${siteData.contactAddress || "123 Fashion Street, New York, NY 10001"}`
        };
      default:
        return { title: "", content: "" };
    }
  };

  const modalData = getModalContent();


  return (
    <div className="min-h-screen bg-background" style={{ fontFamily }}>
      {/* Top Bar */}
      <div className="bg-stone-800 text-white text-sm py-2" style={{backgroundColor: siteData?.themeColor}}>
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
              {siteData?.businessName || "CLASSIQUE"}
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

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
              {product.badge && (
                <span className="absolute top-4 left-4 px-4 py-2 text-sm font-semibold rounded-full text-white shadow-lg" 
                  style={{ backgroundColor: product.badge === "Sale" ? "#EF4444" : themeColor }}>
                  {product.badge}{discount > 0 && ` -${discount}%`}
                </span>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={toggleWishlist} className="p-3 bg-white/90 rounded-full shadow-md hover:scale-110 transition">
                  <Heart className="w-5 h-5" style={{ color: wishlist.has(product.id) ? "#EF4444" : "#999", fill: wishlist.has(product.id) ? "#EF4444" : "none" }} />
                </button>
                <button onClick={() => setShowShareModal(true)} className="p-3 bg-white/90 rounded-full shadow-md hover:scale-110 transition">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={cn("aspect-square rounded-lg overflow-hidden border-2 transition", selectedImage === i ? "ring-2 ring-offset-2" : "border-border hover:border-muted-foreground")}
                    style={selectedImage === i ? { borderColor: themeColor, ringColor: themeColor } : {}}>
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              {product.tagline && <p className="text-muted-foreground text-lg mb-3">{product.tagline}</p>}
              <div className="flex items-center flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: i < (product.rating || 0) ? "#FBBF24" : "#D1D5DB" }} />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">{product.rating || 0} ({product.reviews || 0})</span>
                </div>
                {product.category && <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">{product.category}</span>}
              </div>
            </div>

            <div className="py-4 border-y">
              <div className="flex items-baseline flex-wrap gap-3">
                <span className="text-4xl font-bold" style={{ color: themeColor }}>{formatNGN(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">{formatNGN(product.originalPrice)}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">Save {discount}%</span>
                  </>
                )}
              </div>
              {product.stock !== undefined && (
                <p className="text-sm mt-2">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> In Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted" disabled={quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold min-w-[60px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted" disabled={product.stock !== undefined && quantity >= product.stock}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold" style={{ color: themeColor }}>{formatNGN(product.price * quantity)}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" onClick={() => { addToCart(); router.push('/c/checkout'); }} size="lg" className="gap-2 text-white font-semibold" style={{ backgroundColor: themeColor }} disabled={product.stock === 0}>
                <ShoppingBag className="w-5 h-5 mr-2" /> Buy Now
              </Button>
              <Button type="button" onClick={() => { addToCart(); alert("Added to cart!"); }} size="lg" variant="outline" className="gap-2 font-semibold" disabled={product.stock === 0}>
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
              {[
                { icon: Truck, text: "Fast Delivery", sub: "On all orders" },
                { icon: RefreshCcw, text: "Easy Returns", sub: "30-day returns" },
                { icon: Shield, text: "Secure Payment", sub: "100% protected" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <f.icon className="w-6 h-6 flex-shrink-0" style={{ color: themeColor }} />
                  <div>
                    <p className="text-sm font-semibold">{f.text}</p>
                    <p className="text-xs text-muted-foreground">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {siteData?.whatsapp && (
              <a href={`https://wa.me/${siteData.whatsapp.replace(/\D/g, "")}?text=Hi, interested in ${product.name}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 font-medium">
                <MessageCircle className="w-5 h-5" /> Contact Seller on WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  className={cn("pb-4 text-sm font-medium capitalize transition relative", activeTab === tab ? "text-foreground" : "text-muted-foreground")}>
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: themeColor }} />}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "description" && (
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{product.description || "No description."}</p>
              {product.features && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-3 border-b">
                      <span className="font-medium capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No specifications.</p>}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet.</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <button onClick={() => router.push('/')} className="text-sm font-medium hover:opacity-70 flex items-center gap-1" style={{ color: themeColor }}>
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <button key={p.id} onClick={() => router.push('/c/product/${p.id}')} className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition text-left">
                  <div className="relative aspect-square bg-muted">
                    {p.image || p.images?.[0] ? (
                      <img src={p.image || p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{p.name}</h3>
                    <p className="font-bold" style={{ color: themeColor }}>{formatNGN(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowShareModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-2xl shadow-2xl p-6 z-50 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Product</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); setShowShareModal(false); }} className="w-full p-3  bg-muted hover:bg-muted/70 rounded-lg text-center font-medium">
                Copy Link
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(product.name + " - " + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                className="block w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-center font-medium">
                Share on WhatsApp
              </a>
            </div>
          </div>
        </>
      )}

{/* Footer */}
      <footer className="bg-black text-white py-16" style={{backgroundColor: "black"}}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-serif text-xl mb-6" style={{color: siteData?.themeColor}}>{siteData.businessName || "CLASSIQUE"}</h3>
              <p className="text-sm leading-relaxed mb-6">
                {siteData.tagline || "Curating timeless pieces for the discerning individual."}
              </p>
              <div className="space-y-2 text-sm">
                {siteData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{siteData.phone || ""}</span>
                  </div>
                )}
                {siteData.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{siteData.contactEmail || ""}</span>
                  </div>
                )}
                {siteData.contactAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{siteData.contactAddress || ""}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4" style={{color: siteData.themeColor}}>Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setSelectedCategory("All")} className="hover:text-white transition-colors">New Arrivals</button></li>
                <li><button onClick={() => setSelectedCategory("Best Sellers")} className="hover:text-white transition-colors">Best Sellers</button></li>
                <li><button onClick={() => setSelectedCategory("Collections")} className="hover:text-white transition-colors">Collections</button></li>
                <li><button onClick={() => setSelectedCategory("All")} className="hover:text-white transition-colors">Sale</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4" style={{color: siteData.themeColor}}>Support</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => openFooterModal("contact")} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => openFooterModal("about")} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => openFooterModal("shipping")} className="hover:text-white transition-colors">Shipping</button></li>
                <li><button onClick={() => openFooterModal("returns")} className="hover:text-white transition-colors">Returns</button></li>
              </ul>
            </div>
            <div>
              <h4 id="socials" className="text-white font-medium mb-4" style={{color: siteData.themeColor}}>Socials</h4>
              <div className="py-2 flex items-center gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => {
                  const key = Icon.displayName?.toLowerCase() as keyof typeof siteData;
                  return (
                    <Link key={i} href={(siteData as any)[key] || "#"}>
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
            <p>© {new Date().getFullYear()} {siteData.businessName || "Classique"}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Footer Modal */}
      {footerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={closeFooterModal}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-serif mb-4" style={{color: siteData.themeColor}}>{modalData.title}</h2>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line mb-6">{modalData.content}</p>
            <Button 
              onClick={closeFooterModal}
              className="w-full text-white"
              style={{backgroundColor: siteData.themeColor}}
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
            <h2 className="text-2xl font-serif mb-6" style={{color: siteData.themeColor}}>Buyer Profile</h2>
            
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
                  style={{backgroundColor: siteData.themeColor}}
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
                    style={{backgroundColor: siteData.themeColor}}
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
              <h2 className="text-2xl font-serif" style={{color: siteData.themeColor}}>Search Products</h2>
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
}