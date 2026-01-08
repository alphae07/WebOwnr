import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X, ArrowRight, Zap, Truck, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Bold = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(2);

  const products = [
    { id: 1, name: "URBAN RUNNER X", price: 189, category: "SNEAKERS", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", color: "bg-red-500" },
    { id: 2, name: "STREET HOODIE", price: 129, category: "TOPS", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop", color: "bg-purple-500" },
    { id: 3, name: "CARGO PANTS PRO", price: 149, category: "BOTTOMS", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop", color: "bg-green-500" },
    { id: 4, name: "TECH BACKPACK", price: 199, category: "ACCESSORIES", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", color: "bg-blue-500" },
    { id: 5, name: "BOLD CAP", price: 49, category: "ACCESSORIES", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop", color: "bg-yellow-500" },
    { id: 6, name: "GRAPHIC TEE", price: 59, category: "TOPS", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop", color: "bg-pink-500" },
  ];

  const collections = [
    { name: "SUMMER DROP", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop" },
    { name: "STREETWEAR", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop" },
    { name: "ATHLETICS", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop" },
  ];

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

            <Link to="/" className="text-2xl font-black tracking-tighter">
              BOLD<span className="text-yellow-400">.</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <a href="#" className="text-sm font-bold hover:text-yellow-400 transition-colors uppercase tracking-wider">Shop</a>
              <a href="#" className="text-sm font-bold hover:text-yellow-400 transition-colors uppercase tracking-wider">Collections</a>
              <a href="#" className="text-sm font-bold hover:text-yellow-400 transition-colors uppercase tracking-wider">New</a>
              <a href="#" className="text-sm font-bold hover:text-yellow-400 transition-colors uppercase tracking-wider">Sale</a>
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <User className="h-5 w-5" />
              </button>
              <Link to="/b/cart" className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
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
              <a href="#" className="block py-3 text-xl font-bold uppercase tracking-wider hover:text-yellow-400">Shop</a>
              <a href="#" className="block py-3 text-xl font-bold uppercase tracking-wider hover:text-yellow-400">Collections</a>
              <a href="#" className="block py-3 text-xl font-bold uppercase tracking-wider hover:text-yellow-400">New</a>
              <a href="#" className="block py-3 text-xl font-bold uppercase tracking-wider hover:text-yellow-400">Sale</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 text-sm font-bold mb-6">
              <Zap className="h-4 w-4" />
              NEW COLLECTION OUT NOW
            </div>
            <h1 className="text-5xl md:text-8xl font-black leading-none mb-6 tracking-tighter">
              BREAK
              <br />
              <span className="text-yellow-400">THE</span>
              <br />
              RULES
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-md">
              Streetwear that speaks louder than words. Express yourself with our latest drops.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-6 text-sm font-bold uppercase tracking-wider group">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-sm font-bold uppercase tracking-wider">
                View Lookbook
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-yellow-400 text-black py-4">
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
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Hot Right Now</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">TRENDING</h2>
            </div>
            <a href="#" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition-colors group">
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/b/product/${product.id}`} className="group relative">
                <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-0 left-0 w-2 h-full ${product.color}`} />
                  <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
                    <Heart className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-lg mt-1">{product.name}</h3>
                    <p className="text-yellow-400 font-bold mt-1">${product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Curated For You</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">COLLECTIONS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <a key={collection.name} href="#" className="group relative aspect-[4/3] overflow-hidden">
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
      <section className="py-20 bg-yellow-400 text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">JOIN THE MOVEMENT</h2>
          <p className="text-lg mb-8 max-w-md mx-auto">
            Get early access to drops, exclusive offers, and 15% off your first order
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Your email"
              className="bg-black text-white border-black placeholder:text-gray-500 flex-1"
            />
            <Button className="bg-black text-yellow-400 hover:bg-zinc-900 px-8 font-bold uppercase tracking-wider">
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
              <h3 className="text-2xl font-black tracking-tighter mb-4">BOLD<span className="text-yellow-400">.</span></h3>
              <p className="text-gray-500 text-sm mb-4">
                Streetwear for the fearless. Break rules. Make statements.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2024 BOLD. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Bold;
