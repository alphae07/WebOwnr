"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import {
  Search,
  Eye,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  status?: "active" | "inactive";
  createdAt?: Date | null;
}

/* ---------------- PAGE ---------------- */

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* -------- FETCH CUSTOMERS -------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const sitesSnap = await getDocs(collection(db, "sites"));
        const userSite = sitesSnap.docs.find((d) => d.data().uid === user.uid);
        if (!userSite) {
          setLoading(false);
          return;
        }
        const siteId = userSite.id;
        const ordersQ = query(
          collection(db, "orders"),
          where("siteId", "==", siteId),
          orderBy("createdAt", "desc")
        );
        const ordersSnap = await getDocs(ordersQ);
        const customerMap = new Map<string, Customer>();
        ordersSnap.docs.forEach((doc) => {
          const data: any = doc.data();
          const email: string =
            data.customemrEail ||
            data.customerInfo?.email ||
            "";
          if (!email) return;
          const name: string =
            data.customerName ||
            `${data.customerInfo?.firstName || ""} ${data.customerInfo?.lastName || ""}`.trim() ||
            email.split("@")[0];
          const phone: string | undefined =
            data.customerInfo?.phone || data.phone;
          const createdAt: Date | null = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.createdAt
            ? new Date(data.createdAt)
            : null;
          const locationParts = [
            data.shippingAddress?.city,
            data.shippingAddress?.state,
            data.shippingAddress?.country,
          ].filter(Boolean);
          const location = locationParts.length ? locationParts.join(", ") : undefined;
          const existing = customerMap.get(email);
          const status: "active" | "inactive" =
            (data.status?.toLowerCase() === "completed" ||
              data.status?.toLowerCase() === "delivered" ||
              data.status?.toLowerCase() === "paid")
              ? "active"
              : "inactive";
          const merged: Customer = {
            id: email,
            name,
            email,
            phone,
            location: existing?.shippingAddress.cityn || location,
            status: status,
            createdAt:
              !existing?.createdAt || (createdAt && existing.createdAt < createdAt)
                ? createdAt
                : existing?.createdAt || null,
          };
          customerMap.set(email, merged);
        });
        setCustomers(Array.from(customerMap.values()));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  /* -------- SEARCH FILTER -------- */

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;

    return customers.filter((c) =>
      [c.name, c.email, c.phone]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  /* -------- STATS -------- */

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status === "active"
  ).length;

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <main className="p-4 space-y-6">
          {/* SEARCH */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 py-2 border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{totalCustomers}</p>
            </div>

            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-teal">
                {activeCustomers}
              </p>
            </div>

            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">
                {totalCustomers - activeCustomers}
              </p>
            </div>

            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">New This Month</p>
              <p className="text-2xl font-bold text-primary">
                {
                  customers.filter((c) => {
                    if (!c.createdAt) return false;
                    const created = c.createdAt || null;
                    const now = new Date();
                    return (
                      !!created &&
                      created.getMonth() === now.getMonth() &&
                      created.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-card rounded-xl border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm">Customer</th>
                  <th className="px-6 py-4 text-left text-sm">Email</th>
                  <th className="px-6 py-4 text-left text-sm">Location</th>
                  <th className="px-6 py-4 text-right text-sm">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      Loading customers…
                    </td>
                  </tr>
                )}

                {!loading && filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No customers found
                    </td>
                  </tr>
                )}

                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">
                      {c.name || "Unnamed"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {c.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {c.location || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="inline-flex p-2 hover:bg-muted rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
