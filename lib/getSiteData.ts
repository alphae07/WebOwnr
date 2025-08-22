import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getSiteData(subdomain: string) {
  const docRef = doc(db, "sites", subdomain);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return snapshot.data();
}
