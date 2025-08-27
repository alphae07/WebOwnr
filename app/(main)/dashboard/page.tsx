"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);

      try {
        const siteRef = doc(db, "sites", user.uid);
        const siteSnap = await getDoc(siteRef);

        if (!siteSnap.exists()) {
          router.push("/onboarding");
          return;
        }

        setSiteData(siteSnap.data());
      } catch (error) {
        console.error("Error fetching site:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading dashboard...</div>;
  }

  if (!siteData) {
    return (
      <div className="p-10 text-center text-red-600">No site data found.</div>
    );
  }

  const siteLink = `https://${siteData.subdomain}.webownr.com`;

  // Fake progress bar (you can calculate based on setup steps)
  const setupProgress =
    siteData.status === "live"
      ? 100
      : siteData.status === "pending"
      ? 60
      : 30;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1">
        Welcome back, {siteData.businessName} 👋
      </h1>
      <p className="text-gray-600 mb-8">{siteData.tagline}</p>

      {/* Progress */}
      <Card className="mb-8 shadow">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">Setup Progress</h2>
          <Progress value={setupProgress} className="h-3" />
          <p className="text-sm text-gray-500 mt-2">
            {setupProgress}% completed —{" "}
            {siteData.status === "live"
              ? "Your site is live! 🚀"
              : "We’re still setting up your site."}
          </p>
        </CardContent>
      </Card>

      {/* Site Details */}
      <Card className="mb-8 shadow">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Website</h2>
          <p>
            <strong>Subdomain:</strong>{" "}
            <a
              href={siteLink}
              target="_blank"
              className="text-blue-600 underline"
              rel="noopener noreferrer"
            >
              {siteLink}
            </a>
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`inline-block px-2 py-1 text-sm rounded ${
                siteData.status === "live"
                  ? "bg-green-200 text-green-700"
                  : "bg-yellow-200 text-yellow-700"
              }`}
            >
              {siteData.status}
            </span>
          </p>
          <p>
            <strong>Niche:</strong> {siteData.niche}
          </p>
          <p>
            <strong>Primary Color:</strong>{" "}
            <span
              className="inline-block w-4 h-4 rounded-full border"
              style={{ backgroundColor: siteData.color }}
            />
          </p>
          <p className="mt-2">
            <strong>About:</strong> {siteData.about}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Edit Content</h3>
            <p className="text-sm text-gray-500 mb-4">
              Update text, images, and branding.
            </p>
            <Button onClick={() => router.push("/editor")} className="w-full">
              Open Editor
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Manage Subscription</h3>
            <p className="text-sm text-gray-500 mb-4">
              View and update your payment plan.
            </p>
            <Button onClick={() => router.push("/billing")} className="w-full">
              Billing
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Help & Support</h3>
            <p className="text-sm text-gray-500 mb-4">
              Chat with our team or read FAQs.
            </p>
            <Button onClick={() => router.push("/support")} className="w-full">
              Get Help
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Notice */}
      {siteData.status === "pending" && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-8 rounded">
          🚧 Your website is in <strong>maintenance mode</strong>. Our team is
          preparing your content. It’ll be live in less than 24 hours.
        </div>
      )}
    </div>
  );
}
