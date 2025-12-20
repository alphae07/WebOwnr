 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateData = {
  about?: string;
  tagline?: string;
  businessName?: string;
  logoUrl?: string;
  subdomain?: string;
  siteId?: string;
};

const Storefront = ({ data }: { data: TemplateData }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; quantity: number; image?: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        let currentSiteId = data.siteId;
        // If siteId is missing, resolve by subdomain
        if (!currentSiteId && data.subdomain) {
          const sitesRef = collection(db, "sites");
          const sq = query(sitesRef, where("subdomain", "==", data.subdomain));
          const ss = await getDocs(sq);
          if (!ss.empty) {
            currentSiteId = ss.docs[0].id;
          }
        }
        if (!currentSiteId) {
          setProducts([]);
          setLoadingProducts(false);
          return;
        }
        const productsRef = collection(db, "products");
        const pq = query(productsRef, where("siteId", "==", currentSiteId), orderBy("createdAt", "desc"));
        const snap = await getDocs(pq);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(list);
      } catch (e) {
        console.error("Error loading products", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [data.siteId, data.subdomain]);

  const categories = ["All", "Clothing", "Shoes", "Accessories", "Sale"];

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt={data.businessName || "Logo"} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <span className="text-background font-bold">{(data.businessName || "S").charAt(0)}</span>
                )}
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block">{data.businessName || "Store"}</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    cat === "All" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg hidden sm:flex">
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg hidden sm:flex">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg hidden sm:flex">
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-muted rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="px-4 py-2 text-left text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Banner */}
        <section className="relative bg-foreground text-background py-16 md:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl">
              {data.tagline && (
                <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
                  {data.tagline}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {data.businessName || "Your Store"}
              </h1>
              <p className="text-lg text-background/70 mb-8">
                {data.about || "Discover great products from our store."}
              </p>
              <div className="flex gap-4">
                <Link href="#">
                  <Button variant="hero" size="lg" className="bg-primary hover:bg-primary/90">
                    Shop Now
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-background/30 text-black hover:bg-background/10 hover:text-black">
                  View Lookbook
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="py-4 border-b border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Truck, text: "Free Shipping" },
                { icon: RefreshCcw, text: "Easy Returns" },
                { icon: Shield, text: "Secure Checkout" },
                { icon: MessageCircle, text: "WhatsApp Support" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 justify-center py-2">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
              <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loadingProducts && (
                <div className="col-span-full text-center text-muted-foreground">Loading products…</div>
              )}
              {!loadingProducts && products.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">No products yet</div>
              )}
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-xl bg-muted-foreground/10" />
                      </div>
                    )}
                    {product.badge && (
                      <span
                        className={cn(
                          "absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-lg",
                          product.badge === "Sale"
                            ? "bg-destructive text-destructive-foreground"
                            : product.badge === "New"
                            ? "bg-primary text-primary-foreground"
                            : "bg-warning text-foreground"
                        )}
                      >
                        {product.badge}
                      </span>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-foreground mb-1 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-xs text-muted-foreground">
                        {product.rating || 4.8} ({product.reviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">${Number(product.price || 0).toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-accent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Join Our Newsletter</h2>
            <p className="text-muted-foreground mb-6">
              Get exclusive offers and be the first to know about new arrivals.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="h-12" />
              <Button variant="default" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                  <span className="text-foreground font-bold">S</span>
                </div>
                <span className="font-bold text-xl">StyleHub</span>
              </div>
              <p className="text-background/70 text-sm">
                Your destination for modern fashion. Quality clothing at affordable prices.
              </p>
            </div>
            {[
              { title: "Shop", links: ["Clothing", "Shoes", "Accessories", "Sale"] },
              { title: "Help", links: ["FAQ", "Shipping", "Returns", "Contact"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button className="text-sm text-background/70 hover:text-primary transition-colors">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-background/10 text-center">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} {data.businessName || "Store"}. Powered by WebOwnr.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-xl animate-slide-in-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-20 h-20 bg-background rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-primary font-semibold">
                        ${item.price}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button className="p-1 hover:bg-background rounded">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button className="p-1 hover:bg-background rounded">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold text-foreground">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <Button variant="hero" size="lg" className="w-full">
                  Checkout
                  <MessageCircle className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Get WhatsApp order confirmation
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Storefront;
