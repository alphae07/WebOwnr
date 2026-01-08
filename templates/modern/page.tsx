"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  X,
  Star,
  Minus,
  Plus,
  MessageCircle,
  ChevronRight,
  Truck,
  Shield,
  RefreshCcw,
  Home,
  Sparkles,
  LogIn,
  Package,
  Headphones,
  Facebook,
  Instagram,
  Twitter,
  Loader2,
} from "lucide-react";
import { cn, formatNGN } from "@/lib/utils";

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

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const Modern = ({ data }: { data: TemplateData }) => {
  const [templateData, setTemplateData] = useState<TemplateData>(data);
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  
  // Footer modal states
  const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [footerModalContent, setFooterModalContent] = useState<"about" | "contact" | "returns" | "shipping" | null>(null);

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
  const [profileHydrated, setProfileHydrated] = useState(false);

  // Load user profile from localStorage
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_profile") : null;
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        setUserProfile(profile);
      }
      setProfileHydrated(true);
    } catch {}
  }, []);

  // Save user profile to localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && profileHydrated) {
        localStorage.setItem("webownr_profile", JSON.stringify(userProfile));
      }
    } catch {}
  }, [userProfile, profileHydrated]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        let currentSiteId = templateData.siteId;
        let currentData = { ...templateData };

        // Fetch site details if missing
        if (!currentData.businessName || !currentSiteId) {
          let siteDoc = null;
          
          if (currentSiteId) {
             const docRef = doc(db, "sites", currentSiteId);
             const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
               siteDoc = { id: docSnap.id, ...docSnap.data() };
             }
          } else if (currentData.subdomain) {
            const sitesRef = collection(db, "sites");
            const sq = query(sitesRef, where("subdomain", "==", currentData.subdomain));
            const ss = await getDocs(sq);
            if (!ss.empty) {
              siteDoc = { id: ss.docs[0].id, ...ss.docs[0].data() };
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
              about: (siteDoc as any).about || (siteDoc as any).description || currentData.description,
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
      } catch (e) {
        console.error("Error loading data", e);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchData();
  }, [templateData.siteId, templateData.subdomain, templateData.businessName]);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
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

  const handleFooterLink = (type: "about" | "contact" | "returns" | "shipping") => {
    setFooterModalContent(type);
    setFooterModalOpen(true);
  };

  const scrollToProducts = () => {
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShopFilter = (filter: string) => {
    switch(filter) {
      case "New Arrivals":
        const sortedByDate = [...products].sort((a, b) => b.id.localeCompare(a.id));
        setFilteredProducts(sortedByDate.slice(0, 8));
        setSelectedCategory("All");
        break;
      case "Best Sellers":
        const sortedByRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setFilteredProducts(sortedByRating.slice(0, 8));
        setSelectedCategory("All");
        break;
      case "Sale":
        const saleProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);
        setFilteredProducts(saleProducts);
        setSelectedCategory("All");
        break;
      case "All Products":
        setFilteredProducts(products);
        setSelectedCategory("All");
        break;
    }
    scrollToProducts();
    setFooterModalOpen(false);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: fontFamily }}>
      {/* Header */}
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

              <Link href="/" className="flex items-center gap-3 flex-shrink-0">
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
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                <button 
                  onClick={() => setProfileOpen(true)}
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

      <main>
        {templateData.coverImage && (
          <section className="relative h-60 md:h-96 overflow-hidden">
            <img src={templateData.coverImage} alt="Store banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            <div className="absolute inset-0 flex items-end p-4 md:p-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {templateData.businessName || "Welcome"}
                </h1>
                {templateData.tagline && (
                  <p className="text-white/90 text-sm md:text-base">{templateData.tagline}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {!templateData.coverImage && (
          <section className="relative py-12 md:py-20 text-white overflow-hidden" style={{ backgroundColor: themeColor }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-white" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-white" />
            </div>
            <div className="relative px-4 md:px-6 max-w-7xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {templateData.businessName || "Your Store"}
              </h1>
              {templateData.about && (
                <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
                  {templateData.about}
                </p>
              )}
              {templateData.tagline && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">{templateData.tagline}</span>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="py-4 md:py-6 border-b border-border bg-muted/30">
          <div className="px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Truck, text: "Free Shipping", subtext: "On orders over ₦50" },
                { icon: RefreshCcw, text: "Easy Returns", subtext: "30-day returns" },
                { icon: Shield, text: "Secure", subtext: "100% secure checkout" },
                { icon: Headphones, text: "Support", subtext: "Friendly customer service" },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center py-2">
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 mb-2" style={{ color: themeColor }} />
                  <span className="text-xs md:text-sm font-semibold text-foreground">{feature.text}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{feature.subtext}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="products-section" className="py-8 md:py-16">
          <div className="px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {selectedCategory === "All" ? "All Products" : selectedCategory}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            {loadingProducts && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            )}

            {!loadingProducts && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 md:py-24">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: themeColor + "20" }}>
                  <Package className="w-10 h-10" style={{ color: themeColor }} />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No Products Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm text-center">
                  {searchQuery ? "No products match your search. Try different keywords." : "Come back soon to see amazing products!"}
                </p>
              </div>
            )}

            {!loadingProducts && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-0" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Package className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}

                      {product.badge && (
                        <span className="absolute top-8 left-3 px-3 py-1 text-xs font-semibold rounded-full text-white z-10"
                          style={{
                            backgroundColor: product.badge === "Sale" ? "#EF4444" : product.badge === "New" ? themeColor : "#F59E0B",
                          }}
                        >
                          {product.badge}
                        </span>
                      )}

                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-8 right-3 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md hover:scale-110 transition-transform z-10"
                      >
                        <Heart
                          className="w-4 h-4"
                          style={{
                            color: wishlist.has(product.id) ? "#EF4444" : "#999",
                            fill: wishlist.has(product.id) ? "#EF4444" : "none",
                          }}
                        />
                      </button>

                      <button
                        onClick={() => {
                          addToCart(product);
                          setCartOpen(true);
                        }}
                        className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-gradient-to-t from-foreground/80 to-transparent text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>

                    <div className="p-4" onClick={()=> router.push(`/m/product/${product.id}`)}>
                      <h3 className="font-semibold text-foreground text-sm md:text-base mb-1 line-clamp-2 group-hover:line-clamp-none">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-current"
                            style={{
                              color: i < Math.floor(product.rating || 0) ? "#FBBF24" : "#D1D5DB",
                            }}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({product.reviews || 0})</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg text-foreground" style={{ color: themeColor }}>
                          {formatNGN(Number(product.price || 0))}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatNGN(Number(product.originalPrice))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-12 md:py-16 text-white" style={{ backgroundColor: themeColor }}>
          <div className="px-4 md:px-6 max-w-7xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Exclusive Offers</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm md:text-base">
              Subscribe to our newsletter and be the first to know about new arrivals and special promotions.
            </p>
            <div className="flex gap-2 max-w-sm mx-auto flex-col sm:flex-row">
              <Input type="email" placeholder="Enter your email" className="h-12 bg-white/10 border-white/20 placeholder:text-white/50 text-white" />
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 whitespace-nowrap">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-8 md:py-12">
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground font-bold" style={{ backgroundColor: themeColor }}>
                  {(templateData.businessName || "Store").charAt(0)}
                </div>
                <span className="font-bold text-xl">{templateData.businessName || "Store"}</span>
              </div>
              <p className="text-background/70 text-sm">
                {templateData.about || "Your destination for quality products at affordable prices."}
              </p>
            </div>

            {[
              { title: "Shop", links: ["New Arrivals", "Best Sellers", "Sale", "All Products"], onClick: (link: string) => handleShopFilter(link) },
              { title: "Help", links: ["Shipping Info", "Returns", "FAQ", "Contact Us"], onClick: (link: string) => {
                if (link === "Shipping Info") handleFooterLink("shipping");
                else if (link === "Returns") handleFooterLink("returns");
                else if (link === "Contact Us") handleFooterLink("contact");
              }},
              { title: "Connect", links: [templateData.phone ? "Call Us" : null, templateData.whatsapp ? "WhatsApp" : null, templateData.contactEmail ? "Email" : null].filter(Boolean), onClick: (link: string) => {
                if (link === "Call Us" && templateData.phone) window.open(`tel:${templateData.phone}`);
                else if (link === "WhatsApp" && templateData.whatsapp) {
                  const phone = templateData.whatsapp.replace(/\D/g, "");
                  window.open(`https://wa.me/${phone}`);
                }
                else if (link === "Email" && templateData.contactEmail) window.open(`mailto:${templateData.contactEmail}`);
              }},
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4 text-sm md:text-base">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button onClick={() => section.onClick && section.onClick(link)} className="text-sm text-background/70 hover:text-primary transition-colors text-left">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="py-4 border-t border-background/10 flex items-center justify-center gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <button key={i} className="p-2 rounded-lg hover:bg-background/10 transition-colors">
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

      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setCartOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground">Shopping Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-foreground font-semibold mb-2">Cart is Empty</p>
                  <p className="text-sm text-muted-foreground">Start adding items to your cart!</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-muted rounded-xl">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-background flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-sm font-bold mb-2" style={{ color: themeColor }}>{formatNGN(item.price)} each</p>
                      <div className="flex items-center gap-1 bg-background rounded-lg w-fit">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-muted rounded transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-muted rounded transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground text-sm">{formatNGN(item.price * item.quantity)}</p>
                      <button onClick={() => updateQuantity(item.id, 0)} className="text-xs text-red-600 hover:text-red-700 mt-1">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 md:p-6 border-t border-border space-y-4 flex-shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">{formatNGN(cartTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold" style={{ color: themeColor }}>{formatNGN(cartTotal)}</span>
                  </div>
                </div>
                <Button className="w-full text-white font-semibold" style={{ backgroundColor: themeColor }} size="lg" onClick={() => router.push('/m/checkout')}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button onClick={handleCheckout} size="lg" className="w-full text-white font-semibold bg-green-500">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order via WhatsApp
                </Button>
                <button onClick={() => setCartOpen(false)} className="w-full py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">
                  Continue Shopping
                </button>
                <p className="text-xs text-center text-muted-foreground">💬 Chat with us on WhatsApp for instant support</p>
              </div>
            )}
          </div>
        </>
      )}

      {wishlistOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setWishlistOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground">Wishlist</h2>
              <button onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {Array.from(wishlist).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-foreground font-semibold mb-2">No liked products</p>
                  <p className="text-sm text-muted-foreground">Tap the heart on products to add them here.</p>
                </div>
              ) : (
                products.filter(p => wishlist.has(p.id)).map(product => (
                  <div key={product.id} className="flex gap-4 p-4 bg-muted rounded-xl">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover bg-background flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-sm font-bold" style={{ color: themeColor }}>{formatNGN(Number(product.price || 0))}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-2">
                      <Button onClick={() => addToCart(product)} size="sm" className="text-white" style={{ backgroundColor: themeColor }}>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <button onClick={() => toggleWishlist(product.id)} className="text-xs text-muted-foreground hover:text-foreground block">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 md:p-6 border-t border-border space-y-3 flex-shrink-0">
              <Button onClick={() => setWishlistOpen(false)} className="w-full text-foreground hover:bg-muted" variant="ghost">Continue Shopping</Button>
            </div>
          </div>
        </>
      )}
      {profileOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setProfileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground">My Profile</h2>
              <button onClick={() => setProfileOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!editingProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: themeColor }}>
                      {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{userProfile.name || "Guest User"}</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.email || "No email added"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground mt-1">{userProfile.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-foreground mt-1">{userProfile.address || "Not provided"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <p className="text-foreground mt-1">{userProfile.city || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">State</label>
                        <p className="text-foreground mt-1">{userProfile.state || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Zip</label>
                        <p className="text-foreground mt-1">{userProfile.zipCode || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setEditingProfile(true)} className="w-full text-white" style={{ backgroundColor: themeColor }}>Edit Profile</Button>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                    <Input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                    <Input type="email" value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Phone *</label>
                    <Input type="tel" value={userProfile.phone} onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})} placeholder="+234 800 000 0000" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Address *</label>
                    <Input type="text" value={userProfile.address} onChange={(e) => setUserProfile({...userProfile, address: e.target.value})} placeholder="123 Main Street" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">City *</label>
                      <Input type="text" value={userProfile.city} onChange={(e) => setUserProfile({...userProfile, city: e.target.value})} placeholder="Lagos" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">State *</label>
                      <Input type="text" value={userProfile.state} onChange={(e) => setUserProfile({...userProfile, state: e.target.value})} placeholder="Lagos" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Zip Code</label>
                    <Input type="text" value={userProfile.zipCode} onChange={(e) => setUserProfile({...userProfile, zipCode: e.target.value})} placeholder="100001" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 text-white" style={{ backgroundColor: themeColor }}>Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {footerModalOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setFooterModalOpen(false)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-card rounded-2xl z-50 shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-bold text-foreground">
                {footerModalContent === "about" && "About Us"}
                {footerModalContent === "contact" && "Contact Us"}
                {footerModalContent === "returns" && "Returns Policy"}
                {footerModalContent === "shipping" && "Shipping Information"}
              </h2>
              <button onClick={() => setFooterModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {footerModalContent === "about" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {templateData.about || "Welcome to our store! We are committed to providing you with the best shopping experience possible."}
                  </p>
                  <div className="pt-4 space-y-3">
                    <h3 className="font-semibold text-foreground">Our Mission</h3>
                    <p className="text-muted-foreground">To deliver quality products at affordable prices while providing exceptional customer service.</p>
                    <h3 className="font-semibold text-foreground mt-4">Why Choose Us?</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Carefully curated product selection</span></li>
                      <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Fast and reliable shipping</span></li>
                      <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Excellent customer support</span></li>
                      <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Secure payment options</span></li>
                    </ul>
                  </div>
                </div>
              )}

              {footerModalContent === "contact" && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">We'd love to hear from you! Reach out to us through any of these channels:</p>
                  <div className="space-y-4">
                    {templateData.phone && (
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor + "20" }}>
                          <Headphones className="w-6 h-6" style={{ color: themeColor }} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <a href={`tel:${templateData.phone}`} className="font-semibold text-foreground hover:underline">{templateData.phone}</a>
                        </div>
                      </div>
                    )}
                    {templateData.whatsapp && (
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#25D366" + "20" }}>
                          <MessageCircle className="w-6 h-6" style={{ color: "#25D366" }} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">WhatsApp</p>
                          <a href={`https://wa.me/${templateData.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">{templateData.whatsapp}</a>
                        </div>
                      </div>
                    )}
                    {templateData.contactEmail && (
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor + "20" }}>
                          <MessageCircle className="w-6 h-6" style={{ color: themeColor }} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a href={`mailto:${templateData.contactEmail}`} className="font-semibold text-foreground hover:underline">{templateData.contactEmail}</a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>
              )}

              {footerModalContent === "returns" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">We want you to be completely satisfied with your purchase. If you're not happy with your order, we offer a hassle-free return policy.</p>
                  <div className="space-y-4 pt-2">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">30-Day Return Window</h3>
                      <p className="text-muted-foreground">You have 30 days from the date of delivery to return any item for a full refund or exchange.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Return Conditions</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Items must be unused and in original condition</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Original packaging must be included</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Proof of purchase required</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Sale items may have different return policies</span></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">How to Return</h3>
                      <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                        <li>Contact us via WhatsApp or email</li>
                        <li>Receive return authorization and instructions</li>
                        <li>Pack item securely in original packaging</li>
                        <li>Ship back to provided address</li>
                        <li>Refund processed within 7-10 business days</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {footerModalContent === "shipping" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">We offer fast and reliable shipping to ensure your order reaches you quickly and safely.</p>
                  <div className="space-y-4 pt-2">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Shipping Options</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-foreground">Standard Shipping</span>
                            <span className="text-green-600 font-semibold">FREE</span>
                          </div>
                          <p className="text-sm text-muted-foreground">5-7 business days</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-foreground">Express Shipping</span>
                            <span className="font-semibold" style={{ color: themeColor }}>₦2,500</span>
                          </div>
                          <p className="text-sm text-muted-foreground">2-3 business days</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-foreground">Same-Day Delivery</span>
                            <span className="font-semibold" style={{ color: themeColor }}>₦5,000</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Order before 12 PM (Lagos only)</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Processing Time</h3>
                      <p className="text-muted-foreground">Orders are typically processed within 1-2 business days. You'll receive a tracking number once your order ships.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Delivery Areas</h3>
                      <p className="text-muted-foreground">We currently ship nationwide across Nigeria. International shipping coming soon!</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                      <p className="text-sm text-green-800 dark:text-green-200"><strong>Free Shipping:</strong> Enjoy free standard shipping on all orders over ₦50,000!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex-shrink-0">
              <Button onClick={() => setFooterModalOpen(false)} className="w-full" variant="outline">Close</Button>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slide-in-from-top-2 { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        .animate-in { animation: slide-in-from-top-2 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default Modern;
                