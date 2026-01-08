"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { cn, formatNGN } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Download,
  Loader2,
} from "lucide-react";

interface Order {
  id: string;
  siteId: string;
  amount: number;
  status: string;
  description?: string;
  productName?: string;
  orderId?: string;
  createdAt?: Timestamp | { toDate: () => Date };
  [key: string]: any;
}

interface SiteData {
  id: string;
  uid: string;
  paymentMethods?: PaymentMethod[];
  [key: string]: any;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  details: string;
  isDefault: boolean;
}

interface Withdrawal {
  id: string;
  siteId: string;
  amount: number;
  method: string;
  status: string;
  createdAt?: Timestamp | { toDate: () => Date };
}

const Revenue = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    available: 0,
    withdrawn: 0,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const sitesRef = collection(db, "sites");
        const sitesSnapshot = await getDocs(sitesRef);
        const userSite = sitesSnapshot.docs.find(
          (doc) => doc.data().uid === user.uid
        );

        if (userSite) {
          const siteInfo: SiteData = {
            id: userSite.id,
            uid: userSite.data().uid,
            paymentMethods: userSite.data().paymentMethods || [],
            ...userSite.data(),
          };
          setSiteData(siteInfo);

          // Set default method if available
          const defaultMethod = siteInfo.paymentMethods?.find(m => m.isDefault);
          if (defaultMethod) {
            setSelectedMethod(defaultMethod.id);
          } else if (siteInfo.paymentMethods && siteInfo.paymentMethods.length > 0) {
            setSelectedMethod(siteInfo.paymentMethods[0].id);
          }

          await Promise.all([
            fetchOrders(userSite.id),
            fetchWithdrawals(userSite.id)
          ]);
        } else {
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchOrders = async (siteId: string) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("siteId", "==", siteId),
        orderBy("createdAt", "desc")
      );
      const ordersSnapshot = await getDocs(q);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(ordersData);
      return ordersData;
    } catch (error) {
      console.error("Error fetching orders:", error);
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("siteId", "==", siteId));
        const ordersSnapshot = await getDocs(q);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersData);
        return ordersData;
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        return [];
      }
    }
  };

  const fetchWithdrawals = async (siteId: string) => {
    try {
      const withdrawalsRef = collection(db, "withdrawals");
      const q = query(withdrawalsRef, where("siteId", "==", siteId));
      const withdrawalsSnapshot = await getDocs(q);
      const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Withdrawal[];

      setWithdrawals(withdrawalsData);
      return withdrawalsData;
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      return [];
    }
  };

  useEffect(() => {
    if (orders.length > 0 || withdrawals.length > 0) {
      calculateStats(orders, withdrawals);
    }
  }, [orders, withdrawals, selectedPeriod]);

  const calculateStats = (ordersData: Order[], withdrawalsData: Withdrawal[]) => {
    // Filter by period
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0);
        break;
    }

    const filterByDate = (item: any) => {
      if (!item.createdAt) return false;
      const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      return date >= startDate;
    };

    const filteredOrders = ordersData.filter(filterByDate);
    const filteredWithdrawals = withdrawalsData.filter(filterByDate);

    const getAmount = (o: any): number => {
      const v = o?.amount ?? o?.pricing?.total ?? 0;
      return typeof v === "number" ? v : parseFloat(v) || 0;
    };

    // Calculate total revenue (completed/delivered orders)
    const totalRevenue = filteredOrders.reduce((sum, order) => {
      const status = order.status?.toLowerCase();
      if (status === "completed" || status === "delivered" || status === "paid") {
        return sum + getAmount(order);
      }
      return sum;
    }, 0);

    // Calculate pending amount
    const pendingAmount = filteredOrders.reduce((sum, order) => {
      const status = order.status?.toLowerCase();
      if (status === "pending" || status === "processing") {
        return sum + getAmount(order);
      }
      return sum;
    }, 0);

    // Calculate withdrawn amount (completed withdrawals)
    const withdrawnAmount = filteredWithdrawals.reduce((sum, withdrawal) => {
      if (withdrawal.status === "completed") {
        return sum + Number(withdrawal.amount || 0);
      }
      return sum;
    }, 0);

    // Available balance = revenue - withdrawn
    const availableBalance = totalRevenue - withdrawnAmount;

    setStats({
      revenue: totalRevenue,
      pending: pendingAmount,
      available: Math.max(0, availableBalance),
      withdrawn: withdrawnAmount,
    });
  };

  const handleWithdraw = async () => {
    if (!siteData || !withdrawAmount || !selectedMethod) {
      alert("Please fill in all fields");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > stats.available) {
      alert("Insufficient balance");
      return;
    }

    setWithdrawing(true);
    try {
      // Create withdrawal request
      await addDoc(collection(db, "withdrawals"), {
        siteId: siteData.id,
        amount: amount,
        method: selectedMethod,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Refresh data
      await fetchWithdrawals(siteData.id);
      setWithdrawAmount("");
      alert("Withdrawal request submitted successfully!");
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ["Date", "Description", "Amount", "Status"];
    const rows = orders.map(order => [
      formatDate(order.createdAt),
      order.productName || order.description || `Order #${order.orderId || order.id.slice(0, 8)}`,
      (() => {
        const v = (order as any)?.amount ?? (order as any)?.pricing?.total ?? 0;
        return (typeof v === "number" ? v : parseFloat(v) || 0).toFixed(2);
      })(),
      order.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          

          {/* Period Filter */}
          <div className="flex flex-wrap gap-2">
            {["week", "month", "year", "all"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedPeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal" />
                </div>
                <span className="flex items-center gap-1 text-sm text-teal">
                  <ArrowUpRight className="w-4 h-4" />
                  {stats.revenue > 0 ? "Active" : "0%"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatNGN(stats.revenue)}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <span className="flex items-center gap-1 text-sm text-teal">
                  <ArrowUpRight className="w-4 h-4" />
                  Ready
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-foreground">{formatNGN(stats.available)}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple" />
                </div>
                <span className="flex items-center gap-1 text-sm text-warning">
                  <ArrowDownRight className="w-4 h-4" />
                  Pending
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{formatNGN(stats.pending)}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gold-dark" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              <p className="text-2xl font-bold text-foreground">{formatNGN(stats.withdrawn)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transactions */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Recent Transactions</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={exportTransactions}
                  disabled={orders.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No transactions found for this period.
                  </div>
                ) : (
                  orders.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-light">
                        <ArrowUpRight className="w-5 h-5 text-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {tx.productName || tx.description || `Order #${tx.orderId || tx.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-teal">
                          +{formatNGN(((tx as any)?.amount ?? (tx as any)?.pricing?.total ?? 0) as number || (parseFloat(((tx as any)?.amount ?? (tx as any)?.pricing?.total) as any) || 0))}
                        </p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full inline-block capitalize",
                          (tx.status?.toLowerCase() === "completed" || 
                           tx.status?.toLowerCase() === "delivered" || 
                           tx.status?.toLowerCase() === "paid")
                            ? "bg-teal-light text-teal"
                            : "bg-gold-light text-gold-dark"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard/orders">View All Transactions</Link>
                </Button>
              </div>
            </div>

            {/* Withdrawal Methods & Quick Withdraw */}
            <div className="space-y-6">
              {/* Quick Withdraw */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Quick Withdraw</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {formatNGN(stats.available)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Withdraw to</label>
                    {siteData?.paymentMethods && siteData.paymentMethods.length > 0 ? (
                      <select 
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                      >
                        {siteData.paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name} ({method.details})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded-xl">
                        No payment methods added. Add one in Settings.
                      </p>
                    )}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleWithdraw}
                    disabled={withdrawing || !withdrawAmount || !selectedMethod || stats.available <= 0}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Withdraw Funds"
                    )}
                  </Button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground">Payment Methods</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/settings?tab=billing">Add New</Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {siteData?.paymentMethods && siteData.paymentMethods.length > 0 ? (
                    siteData.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-colors",
                          method.isDefault ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {method.type === "bank" ? (
                              <CreditCard className="w-5 h-5 text-foreground" />
                            ) : (
                              <Wallet className="w-5 h-5 text-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.details}</p>
                          </div>
                          {method.isDefault && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-muted rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">
                        No payment methods added
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/settings?tab=billing">Add Method</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Revenue;
