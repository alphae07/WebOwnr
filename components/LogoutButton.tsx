// components/LogoutButton.tsx
"use client";

import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push("/auth"); // Redirect after logout
    } catch (error) {
      console.error("Error logging out:", error);
      router.push("/auth"); // fallback redirect
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
