"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  X,
  Package,
  Minus,
  Plus,
  ArrowRight,
  Star,
  Filter,
  Check,
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

const MinimalTemplate = () => {
  const router = useRouter();
  const params = useParams();
  const siteParam = typeof params?.site === "string" ? params.site : Array.isArray(params?.site) ? params?.site[0] : undefined;
  const [templateData, setTemplateData] = useState<TemplateData>({ subdomain: siteParam });
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const themeColor = templateData.themeColor || "#000000";
  const fontFamily = templateData.fontFamily || "'Inter', sans-serif";

  const categories = useMemo(() => {
    const cats = ["All"];
    const uniqueCats = new Set(products.map(p => p.category).filter(Boolean));
    return [...cats, ...Array.from(uniqueCats)];
  }, [products]);

  const [cartHydrated, setCartHydrated] = useState(false);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [products, selectedCategory, searchQuery, priceRange]);

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

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems(prev =>
      prev
        .map(item => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily }}>
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="#" className="flex items-center gap-2">
              {templateData.logo ? (
                <img src={templateData.logo} alt={templateData.businessName} className="h-8 w-8 object-contain" />
              ) : (
                <div className="h-8 w-8 bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(templateData.businessName || "Store").charAt(0)}
                  </span>
                </div>
              )}
              <span className="font-semibold text-lg tracking-tight">
                {templateData.businessName || "Store"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    selectedCategory === cat ? "text-black" : "text-gray-500 hover:text-black"
                  )}
                >
                  {cat}
                  {selectedCategory === cat && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterOpen(true)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors md:hidden"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setWishlistOpen(true)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative"
              >
                <Heart className={cn("w-5 h-5", wishlist.size > 0 && "fill-black")} />
                {wishlist.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlist.size}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block">
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] bg-gray-50 overflow-hidden">
        {templateData.coverImage ? (
          <img
            src={templateData.coverImage}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              {templateData.tagline || "Discover Quality"}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
              {templateData.about || "Curated products for the modern lifestyle"}
            </p>
            <Button
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 font-medium px-8"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section id="products" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">All Products</h2>
              <p className="text-gray-500 text-sm mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="group">
                  <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                      >
                        <Heart className={cn("w-4 h-4", wishlist.has(product.id) && "fill-black")} />
                      </button>
                    </div>

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black text-white text-xs font-medium rounded">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product)}
                      className="absolute bottom-2 left-2 right-2 bg-white py-2 rounded-lg font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                    >
                      Add to Cart
                    </button>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:underline">
                      {product.name}
                    </h3>
                    
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-black" />
                        <span className="text-xs text-gray-600">
                          {product.rating} {product.reviews && `(${product.reviews})`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
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

      {/* Filter Drawer */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === cat ? "bg-black text-white" : "hover:bg-gray-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { label: "Under $50", range: [0, 50] },
                    { label: "$50 - $100", range: [50, 100] },
                    { label: "$100 - $200", range: [100, 200] },
                    { label: "$200+", range: [200, 1000] },
                  ].map(({ label, range }) => (
                    <button
                      key={label}
                      onClick={() => setPriceRange(range as [number, number])}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                        priceRange[0] === range[0] && priceRange[1] === range[1]
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      )}
                    >
                      {label}
                      {priceRange[0] === range[0] && priceRange[1] === range[1] && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedCategory("All");
                  setPriceRange([0, 1000]);
                  setSearchQuery("");
                }}
                variant="outline"
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Shopping Cart ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="font-medium text-gray-900 mb-1">Your cart is empty</p>
                  <p className="text-sm text-gray-500">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h4>
                        <p className="font-semibold text-sm mb-2">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-semibold text-lg">${cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => router.push(`/${siteParam}/checkout`)}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium"
                  size="lg"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Wishlist Drawer */}
      {wishlistOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setWishlistOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Wishlist ({wishlist.size})</h3>
              <button onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {wishlist.size === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="font-medium text-gray-900 mb-1">No saved items</p>
                  <p className="text-sm text-gray-500">Save your favorites here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products
                    .filter(p => wishlist.has(p.id))
                    .map(product => (
                      <div key={product.id} className="flex gap-4 p-3 border border-gray-100 rounded-lg">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                          <p className="font-semibold text-sm mb-2">${product.price.toFixed(2)}</p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                addToCart(product);
                                toggleWishlist(product.id);
                              }}
                              size="sm"
                              className="bg-black hover:bg-gray-800 text-white text-xs"
                            >
                              Add to Cart
                            </Button>
                            <Button
                              onClick={() => toggleWishlist(product.id)}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Minimal Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              {templateData.logo ? (
                <img src={templateData.logo} alt={templateData.businessName} className="h-10 w-10 object-contain mx-auto mb-3" />
              ) : (
                <div className="h-10 w-10 bg-black flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">
                    {(templateData.businessName || "Store").charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2">{templateData.businessName || "Store"}</h3>
              <p className="text-sm text-gray-500 max-w-md">
                {templateData.about || "Quality products for modern living"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                About
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Shop
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                FAQs
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Shipping
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Returns
              </Link>
            </div>

            <div className="w-full border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} {templateData.businessName || "Store"}. All rights reserved. Powered by WebOwnr.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalTemplate;