// /app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);

    signOut(auth)
      .then(() => {
        // ✅ Successfully logged out
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        // Even if it fails, push back to login
        router.push("/login");
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Logging you out...</p>
    </div>
  );
}
