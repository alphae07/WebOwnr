 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateData = {
  subdomain?: string;
  siteId?: string;
  businessName?: string;
  logoUrl?: string;
};

const ProductDetail = ({ data = {} as TemplateData }: { data?: TemplateData }) => {
  const router = useRouter();
  const search = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const id = search.get("id");
        let currentSiteId = data.siteId;
        if (!currentSiteId && data.subdomain) {
          const sitesRef = collection(db, "sites");
          const sq = query(sitesRef, where("subdomain", "==", data.subdomain));
          const ss = await getDocs(sq);
          if (!ss.empty) {
            currentSiteId = ss.docs[0].id;
          }
        }
        if (!currentSiteId) {
          setProduct(null);
          setRelatedProducts([]);
          setLoading(false);
          return;
        }
        // Load product by id if provided, else first product
        let main: any | null = null;
        if (id) {
          const ref = doc(db, "products", id);
          const snap = await getDoc(ref);
          if (snap.exists()) main = { id: snap.id, ...snap.data() };
        }
        if (!main) {
          const productsRef = collection(db, "products");
          const pq = query(productsRef, where("siteId", "==", currentSiteId));
          const ps = await getDocs(pq);
          const list = ps.docs.map(d => ({ id: d.id, ...d.data() }));
          main = list[0] || null;
          setRelatedProducts(list.slice(1, 5));
        } else {
          const productsRef = collection(db, "products");
          const pq = query(productsRef, where("siteId", "==", currentSiteId));
          const ps = await getDocs(pq);
          const list = ps.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== main.id);
          setRelatedProducts(list.slice(0, 4));
        }
        // Normalize product shape
        if (main) {
          setProduct({
            ...main,
            images: main.images || (main.image ? [main.image] : []),
            sizes: main.sizes || ["XS", "S", "M", "L", "XL"],
            colors: main.colors || [{ name: "Default", hex: "#000000" }],
            rating: main.rating || 4.8,
            reviews: main.reviews || 0,
            originalPrice: main.comparePrice || undefined,
          });
        }
      } catch (e) {
        console.error("Error loading product", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, data?.siteId, data?.subdomain]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt={data.businessName || "Logo"} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <span className="text-background font-bold">{(data.businessName || "S").charAt(0)}</span>
                )}
              </div>
              <span className="font-bold text-xl text-foreground">{data.businessName || "Store"}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("#cart")}>
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link href="#" className="text-muted-foreground hover:text-foreground">Clothing</Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">T-Shirts</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
              {!loading && product && (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
              {(!product || product.images?.length === 0) && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              <button
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {product?.originalPrice && product?.price && product.originalPrice > product.price && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-coral text-white text-sm font-medium rounded-lg">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {product?.images?.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors",
                    selectedImage === index ? "border-primary" : "border-transparent"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product?.name || "Product"}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(product?.rating || 0) ? "text-gold fill-gold" : "text-muted-foreground"
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {product?.rating || 0} ({product?.reviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">${Number(product?.price || 0).toFixed(2)}</span>
              {product?.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">${Number(product.originalPrice).toFixed(2)}</span>
              )}
              <span className="px-2 py-1 bg-coral/10 text-coral text-sm font-medium rounded-lg">
                {product?.originalPrice && product?.price ? `Save ${(product.originalPrice - product.price).toFixed(2)}` : "Great value"}
              </span>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {product?.colors?.map((color: any) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      selectedColor === color.name ? "border-primary scale-110" : "border-border"
                    )}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product?.sizes?.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2 rounded-lg border font-medium text-sm transition-colors",
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">24 items in stock</span>
              </div>
            </div>

              {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="hero" 
                size="lg" 
                className="flex-1"
                onClick={() => router.push("#cart")}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Secure Checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex gap-8 border-b border-border mb-6">
            {["description", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-medium capitalize transition-colors relative",
                  activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <p className="text-muted-foreground max-w-2xl">{product?.description || "No description available."}</p>
          )}

          {activeTab === "features" && (
            <ul className="space-y-2 max-w-2xl">
              {(product?.features || []).map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold text-foreground">{product?.rating || 0}</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.floor(product?.rating || 0) ? "text-gold fill-gold" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {product?.reviews || 0} reviews</p>
                </div>
              </div>
              <Button variant="outline">Write a Review</Button>
            </div>
          )}
        </div>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link
                key={item.id as string}
                href={`?id=${item.id}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                  <p className="font-bold text-foreground">${item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* WhatsApp Float Button */}
      <button className="fixed bottom-6 right-6 p-4 bg-teal text-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ProductDetail;
