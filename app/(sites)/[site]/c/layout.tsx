"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Facebook, Instagram, Twitter, User, Search, Menu, X, Star, ChevronRight, Mail, Phone, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

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
  contactAddress?: string;
  category?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  description?: string;
  category?: string;
};

type CategoryTile = {
  name: string;
  image: string;
};

type BuyerProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const Classic = ({ children, data }: { data: TemplateData, children: React.ReactNode; }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [templateData, setTemplateData] = useState<TemplateData>(data);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [footerModalContent, setFooterModalContent] = useState<"about" | "contact" | "returns" | "shipping" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const themeColor = templateData.themeColor || "#111827";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        let currentSiteId = templateData.siteId;
        let currentData = { ...templateData };

        if (!currentData.businessName || !currentSiteId) {
          let siteDoc: any = null;
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
              businessName: siteDoc.name || siteDoc.businessName || currentData.businessName,
              logo: siteDoc.logo || currentData.logo,
              coverImage: siteDoc.coverImage || currentData.coverImage,
              about: siteDoc.about || siteDoc.description || currentData.about,
              tagline: siteDoc.tagline || currentData.tagline,
              themeColor: siteDoc.themeColor || currentData.themeColor,
              fontFamily: siteDoc.fontFamily || currentData.fontFamily,
              darkMode: siteDoc.darkMode ?? currentData.darkMode,
              whatsapp: siteDoc.whatsapp || currentData.whatsapp,
              phone: siteDoc.phone || currentData.phone,
              contactEmail: siteDoc.email || siteDoc.contactEmail || currentData.contactEmail,
              category: siteDoc.category || currentData.category,
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
  }, [templateData.siteId, templateData.subdomain, templateData.businessName]);

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

  const categories: CategoryTile[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      const cat = p.category || "Collections";
      if (!map.has(cat) && p.image) {
        map.set(cat, p.image);
      }
    }

    const tiles = Array.from(map.entries()).map(([name, image]) => ({ name, image }));
    if (!tiles.length) {
      return [
        { name: "New Arrivals", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop" },
        { name: "Best Sellers", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop" },
        { name: "Sale Items", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop" },
        { name: "Collections", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop" },
      ];
    }
    return tiles.slice(0, 4);
  }, [products]);

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
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar */}
      <div className="bg-stone-800 text-white text-sm py-2" style={{backgroundColor: templateData.themeColor}}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>Free shipping on orders over $150</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Track Order</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
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

      {children}
      
      {/* Footer */}
      <footer className="bg-black text-white py-16" style={{backgroundColor: "black"}}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
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
              <h4 className="text-white font-medium mb-4" style={{color: templateData.themeColor}}>Socials</h4>
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

export default Classic;