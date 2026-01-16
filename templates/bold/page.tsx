"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X, ArrowRight, Zap, Truck, Shield, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";

type TemplateData = {
  about?: string;
  tagline?: string;
  businessName?: string;
  logo?: string;
  logoUrl?: string;
  coverImage?: string;
  subdomain?: string;
  siteId?: string;
  themeColor?: string;
  fontFamily?: string;
  darkMode?: boolean;
  whatsapp?: string;
  phone?: string;
  contactEmail?: string;
  contactAddress?: string;
  category?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  description?: string;
  featured?: boolean;
  comparePrice?: number;
};

type BuyerProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const Bold = ({ data }: { data: TemplateData }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [templateData, setTemplateData] = useState<TemplateData>(data);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);

  const themeColor = templateData?.themeColor || "#000000";

  // Load cart count
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_cart") : null;
      if (stored) {
        const items = JSON.parse(stored) as { quantity: number }[];
        const count = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }, []);

  // Load buyer profile
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("webownr_buyer_profile") : null;
      if (stored) {
        setBuyerProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading buyer profile:", error);
    }
  }, []);

  // Save buyer profile
  const saveBuyerProfile = (profile: BuyerProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("webownr_buyer_profile", JSON.stringify(profile));
      setBuyerProfile(profile);
      setEditingProfile(false);
    }
  };

  // Fetch site and products data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);

      try {
        let currentSiteId = templateData.siteId;

        // Resolve site if missing
        if (!currentSiteId && templateData.subdomain) {
          const sitesQuery = query(
            collection(db, "sites"),
            where("subdomain", "==", templateData.subdomain)
          );
          const sitesSnap = await getDocs(sitesQuery);
          
          if (!sitesSnap.empty && mounted) {
            const siteDoc = sitesSnap.docs[0];
            currentSiteId = siteDoc.id;
            
            const siteData = siteDoc.data();
            setTemplateData({
              ...templateData,
              siteId: siteDoc.id,
              businessName: siteData.name || siteData.businessName || templateData.businessName,
              logo: siteData.logo,
              coverImage: siteData.coverImage,
              about: siteData.about || siteData.description,
              tagline: siteData.tagline,
              themeColor: siteData.themeColor,
              fontFamily: siteData.fontFamily,
              darkMode: siteData.darkMode ?? false,
              whatsapp: siteData.whatsapp,
              phone: siteData.phone,
              contactEmail: siteData.email || siteData.contactEmail,
              contactAddress: siteData.address || siteData.contactAddress,
              category: siteData.category,
            });
          }
        }

        // Load products
        if (currentSiteId && mounted) {
          const productsQuery = query(
            collection(db, "products"),
            where("siteId", "==", currentSiteId)
          );
          const productsSnap = await getDocs(productsQuery);
          const allProducts = productsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Product));

          setProducts(allProducts);
          
          // Get featured products or first 6
          const featured = allProducts
            .filter(p => p.featured)
            .slice(0, 6);
          
          setFeaturedProducts(
            featured.length > 0 ? featured : allProducts.slice(0, 6)
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [templateData.siteId, templateData.subdomain]);

  // Filter products for search
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const filtered = products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).slice(0, 3);

  // Collections with actual product images
  const collections = categories.map(cat => {
    const product = products.find(p => p.category === cat);
    return {
      name: cat?.toUpperCase() || "COLLECTION",
      image: product?.image || product?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop"
    };
  });

  // Add default collections if not enough
  while (collections.length < 3) {
    const defaults = [
      { name: "FEATURED", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop" },
      { name: "NEW ARRIVALS", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop" },
      { name: "BESTSELLERS", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop" },
    ];
    collections.push(defaults[collections.length]);
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thanks for subscribing with ${email}!`);
      setEmail("");
    }
  };

  const getProductColor = (index: number) => {
    const colors = [
      "bg-red-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="text-2xl font-black tracking-tighter">
              {templateData?.businessName || "BOLD"}
              <span style={{ color: themeColor }}>.</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-sm font-bold hover:opacity-80 transition-colors uppercase tracking-wider" style={{ color: "white" }}>
                Shop
              </Link>
              <a href="#collections" className="text-sm font-bold hover:opacity-80 transition-colors uppercase tracking-wider">
                Collections
              </a>
              <a href="#products" className="text-sm font-bold hover:opacity-80 transition-colors uppercase tracking-wider">
                Products
              </a>
              <a href="#newsletter" className="text-sm font-bold hover:opacity-80 transition-colors uppercase tracking-wider">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setProfileModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              <Link href="/b/cart" className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black border-t border-white/10 py-6">
            <div className="container mx-auto px-4 space-y-4">
              <Link 
                href="/" 
                className="block py-3 text-xl font-bold uppercase tracking-wider hover:opacity-80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <a 
                href="#collections" 
                className="block py-3 text-xl font-bold uppercase tracking-wider hover:opacity-80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collections
              </a>
              <a 
                href="#products" 
                className="block py-3 text-xl font-bold uppercase tracking-wider hover:opacity-80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </a>
              <a 
                href="#newsletter" 
                className="block py-3 text-xl font-bold uppercase tracking-wider hover:opacity-80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <img 
            src={templateData?.coverImage || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop"}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div 
              className="inline-flex items-center gap-2 text-black px-4 py-2 text-sm font-bold mb-6"
              style={{ backgroundColor: themeColor }}
            >
              <Zap className="h-4 w-4" />
              {templateData?.businessName || "NEW COLLECTION OUT NOW"}
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-none mb-6 tracking-tighter">
              {templateData?.tagline || "BREAK THE RULE"}
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-md">
              {templateData?.about || "Discover our curated collection. Quality products that speak for themselves."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="text-black hover:opacity-90 px-8 py-6 text-sm font-bold uppercase tracking-wider group"
                style={{ backgroundColor: themeColor }}
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-black hover:bg-white hover:text-black px-8 py-6 text-sm font-bold uppercase tracking-wider"
                onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Collections
              </Button>
            </div>
          </div>
        </div>

      </section>

      {/* Features Bar */}
      <section style={{ backgroundColor: themeColor }} className="text-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Truck className="h-5 w-5" />
              FREE SHIPPING
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Shield className="h-5 w-5" />
              SECURE CHECKOUT
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Zap className="h-5 w-5" />
              FAST DELIVERY
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-6 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                {featuredProducts.length > 0 ? "Hot Right Now" : "Our Products"}
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">
                {featuredProducts.length > 0 ? "TRENDING" : "COLLECTION"}
              </h2>
            </div>
            <Link 
              href="/" 
              className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-colors group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div 
                  className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: themeColor, borderTopColor: "transparent" }}
                />
                <p className="text-gray-400">Loading products...</p>
              </div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-2xl font-bold mb-2">No Products Yet</h3>
              <p className="text-gray-400">Products will appear here once added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  href={`/b/product?id=${product.id}`} 
                  className="group relative"
                >
                  <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                    <img 
                      src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute top-0 left-0 w-2 h-full ${getProductColor(index)}`} />
                    <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
                      <Heart className="h-5 w-5" />
                    </button>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div 
                        className="absolute top-4 left-4 px-2 py-1 text-black text-xs font-bold"
                        style={{ backgroundColor: themeColor }}
                      >
                        SALE
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {product.category || "Product"}
                      </span>
                      <h3 className="font-bold text-lg mt-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-bold" style={{ color: themeColor }}>
                          ${product.price}
                        </p>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <p className="text-sm text-gray-500 line-through">
                            ${product.comparePrice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Collections */}
      <section id="collections" className="py-6 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: themeColor }}>
              Curated For You
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">COLLECTIONS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <a 
                key={collection.name} 
                href="#products" 
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <img 
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter">{collection.name}</h3>
                    <span className="inline-flex items-center gap-2 text-sm font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      EXPLORE <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="py-7 text-black" style={{ backgroundColor: themeColor }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">JOIN THE MOVEMENT</h2>
          <p className="text-lg mb-8 max-w-md mx-auto">
            Get early access to drops, exclusive offers, and updates
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black text-white border-black placeholder:text-gray-500 flex-1"
            />
            <Button 
              type="submit"
              className="px-8 font-bold uppercase tracking-wider text-white bg-black hover:bg-zinc-900"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-black tracking-tighter mb-4">
                {templateData?.businessName || "BOLD"}
                <span style={{ color: themeColor }}>.</span>
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {templateData?.about || "Quality products for everyone."}
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/" className="hover:text-white transition-colors">All Products</Link></li>
                <li><a href="#collections" className="hover:text-white transition-colors">Collections</a></li>
                <li><a href="#products" className="hover:text-white transition-colors">Featured</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {templateData?.contactEmail && (
                  <li>
                    <a href={`mailto:${templateData.contactEmail}`} className="hover:text-white transition-colors">
                      Email Us
                    </a>
                  </li>
                )}
                {templateData?.phone && (
                  <li>
                    <a href={`tel:${templateData.phone}`} className="hover:text-white transition-colors">
                      Call Us
                    </a>
                  </li>
                )}
                {templateData?.whatsapp && (
                  <li>
                    <a 
                      href={`https://wa.me/${templateData.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Info</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {templateData?.businessName || "BOLD"}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      {searchModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-start justify-center pt-20" 
          onClick={() => setSearchModalOpen(false)}
        >
          <div 
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden border border-white/10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-black border-white/10 text-white"
                  autoFocus
                />
                <button 
                  onClick={() => setSearchModalOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {searchQuery && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProducts.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      href={`/b/product?id=${product.id}`}
                      onClick={() => {
                        setSearchModalOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <img 
                        src={product.image || product.images?.[0]} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded" 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-gray-400">${product.price}</p>
                      </div>
                    </Link>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No products found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" 
          onClick={() => setProfileModalOpen(false)}
        >
          <div 
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md border border-white/10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Profile</h2>
                <button 
                  onClick={() => setProfileModalOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                    <Input
                      value={buyerProfile.name}
                      onChange={(e) => setBuyerProfile({ ...buyerProfile, name: e.target.value })}
                      placeholder="Enter your name"
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                    <Input
                      type="email"
                      value={buyerProfile.email}
                      onChange={(e) => setBuyerProfile({ ...buyerProfile, email: e.target.value })}
                      placeholder="Enter your email"
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Phone</label>
                    <Input
                      value={buyerProfile.phone}
                      onChange={(e) => setBuyerProfile({ ...buyerProfile, phone: e.target.value })}
                      placeholder="Enter your phone"
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Address</label>
                    <Input
                      value={buyerProfile.address}
                      onChange={(e) => setBuyerProfile({ ...buyerProfile, address: e.target.value })}
                      placeholder="Enter your address"
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => saveBuyerProfile(buyerProfile)} 
                      className="flex-1 text-black font-bold"
                      style={{ backgroundColor: themeColor }}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingProfile(false)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {buyerProfile.name ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="font-medium text-white">{buyerProfile.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-medium text-white">{buyerProfile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="font-medium text-white">{buyerProfile.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p className="font-medium text-white">{buyerProfile.address}</p>
                      </div>
                      <Button 
                        onClick={() => setEditingProfile(true)} 
                        className="w-full text-black font-bold"
                        style={{ backgroundColor: themeColor }}
                      >
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 mb-4">No profile information yet</p>
                      <Button 
                        onClick={() => setEditingProfile(true)}
                        className="text-black font-bold"
                        style={{ backgroundColor: themeColor }}
                      >
                        Create Profile
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      {templateData.whatsapp && (
        <a 
          href={`https://wa.me/${templateData.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      )}
    </div>
  );
};

export default Bold;