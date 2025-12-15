"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  X,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";

// TypeScript interfaces
interface Product {
  id: string;
  siteId: string;
  name: string;
  category: string;
  price: string | number;
  stock: number;
  status: string;
  image?: string;
  description?: string;
  createdAt?: Timestamp | { toDate: () => Date };
  updatedAt?: Timestamp | { toDate: () => Date };
  [key: string]: any;
}

interface SiteData {
  id: string;
  uid: string;
  [key: string]: any;
}

const Products = () => {
  const router = useRouter();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0,
  });

  // Bulk actions
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: 0,
    status: "Active",
    image: "",
    description: "",
  });

  // Fetch products from Firebase
  const fetchProducts = async (siteId: string) => {
    try {
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("siteId", "==", siteId),
        orderBy("createdAt", "desc")
      );
      const productsSnapshot = await getDocs(q);
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
      calculateStats(productsData);
      extractCategories(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback without orderBy if index doesn't exist
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("siteId", "==", siteId));
        const productsSnapshot = await getDocs(q);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
        calculateStats(productsData);
        extractCategories(productsData);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    }
  };

  // Extract unique categories
  const extractCategories = (productsData: Product[]) => {
    const uniqueCategories = Array.from(
      new Set(productsData.map((p) => p.category).filter(Boolean))
    );
    setCategories(uniqueCategories);
  };

  // Calculate statistics
  const calculateStats = (productsData: Product[]) => {
    const total = productsData.length;
    const active = productsData.filter((p) => p.status === "Active").length;
    const outOfStock = productsData.filter(
      (p) => p.status === "Out of Stock"
    ).length;
    const lowStock = productsData.filter(
      (p) => p.status === "Low Stock"
    ).length;

    setStats({ total, active, outOfStock, lowStock });
  };

  // View product
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price:
        typeof product.price === "number"
          ? product.price.toString()
          : product.price,
      stock: product.stock,
      status: product.status,
      image: product.image || "",
      description: product.description || "",
    });
    setShowEditModal(true);
  };

  // Save edited product
  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    try {
      const productRef = doc(db, "products", selectedProduct.id);
      await updateDoc(productRef, {
        name: editForm.name,
        category: editForm.category,
        price: parseFloat(editForm.price) || 0,
        stock: editForm.stock,
        status: editForm.status,
        image: editForm.image,
        description: editForm.description,
        updatedAt: serverTimestamp(),
      });

      setShowEditModal(false);
      setSelectedProduct(null);
      if (siteData) {
        fetchProducts(siteData.id);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  // Delete single product
  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        if (siteData) {
          fetchProducts(siteData.id);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (
      selectedProducts.size === 0 ||
      !window.confirm(
        `Are you sure you want to delete ${selectedProducts.size} product(s)?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedProducts).map((productId) =>
        deleteDoc(doc(db, "products", productId))
      );
      await Promise.all(deletePromises);
      setSelectedProducts(new Set());
      if (siteData) {
        fetchProducts(siteData.id);
      }
    } catch (error) {
      console.error("Error deleting products:", error);
      alert("Failed to delete some products. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  // Select all products
  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Auth and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "sites"));
        const userSite = querySnapshot.docs.find(
          (doc) => doc.data().uid === user.uid
        );

        if (!userSite) {
          router.push("/onboarding");
          return;
        }

        const siteInfo: SiteData = {
          id: userSite.id,
          ...userSite.data(),
        } as SiteData;
        setSiteData(siteInfo);

        await fetchProducts(userSite.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Button
              variant="outline"
              className="gap-2 min-w-[150px] justify-between"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {selectedCategory === "all"
                  ? "All Categories"
                  : selectedCategory}
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-card border border-border rounded-xl shadow-lg z-50 py-2">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setShowCategoryDropdown(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 hover:bg-muted transition-colors",
                    selectedCategory === "all" && "bg-muted font-medium"
                  )}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 hover:bg-muted transition-colors",
                      selectedCategory === category && "bg-muted font-medium"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.size > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">
                {selectedProducts.size} product(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProducts(new Set())}
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-teal">{stats.active}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-bold text-coral">{stats.outOfStock}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="text-2xl font-bold text-gold-dark">
              {stats.lowStock}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery || selectedCategory !== "all"
                  ? "No products found"
                  : "No products yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedProducts.size === filteredProducts.length &&
                          filteredProducts.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border"
                      />
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Stock
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4 rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.image ||
                              "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&h=100&fit=crop"
                            }
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&h=100&fit=crop";
                            }}
                          />
                          <span className="font-medium text-foreground">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {typeof product.price === "number"
                          ? `$${product.price.toFixed(2)}`
                          : product.price}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-full font-medium",
                            product.status === "Active"
                              ? "bg-success/10 text-success"
                              : product.status === "Out of Stock"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(product)}
                            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            title="View product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Product Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <img
                src={
                  selectedProduct.image ||
                  "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400"
                }
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium text-foreground">
                    {selectedProduct.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Category
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedProduct.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="font-medium text-foreground">
                    {typeof selectedProduct.price === "number"
                      ? `$${selectedProduct.price.toFixed(2)}`
                      : selectedProduct.price}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stock</p>
                  <p className="font-medium text-foreground">
                    {selectedProduct.stock}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span
                    className={cn(
                      "inline-block px-2.5 py-1 text-xs rounded-full font-medium",
                      selectedProduct.status === "Active"
                        ? "bg-success/10 text-success"
                        : selectedProduct.status === "Out of Stock"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    )}
                  >
                    {selectedProduct.status}
                  </span>
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-foreground">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Edit Product
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editForm.image}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Products;