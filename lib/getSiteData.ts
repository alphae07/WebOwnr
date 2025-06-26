// lib/getSiteData.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getSiteData(subdomain: string) {
  try {
    const docRef = doc(db, "sites", subdomain);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching site data:", error);
    return null;
  }
}
