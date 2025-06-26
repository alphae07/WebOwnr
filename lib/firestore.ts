// lib/firestore.ts
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Fetch site data based on subdomain
export async function getSiteData(subdomain: string) {
  const docRef = doc(db, "sites", subdomain);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("Site not found");
  }
}

export async function getUserSite(uid: string) {
  const sitesRef = collection(db, "sites");
  const snapshot = await getDocs(sitesRef);
  const sites = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...(doc.data() as any), // or define a proper interface
}));

  //const sites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //return sites.find((site) => site.ownerId === uid); // assuming you store ownerId
}

// Create site document after registration/onboarding
export async function createSite(subdomain: string, siteData: any) {
  const docRef = doc(db, "sites", subdomain);
  await setDoc(docRef, {
    ...siteData,
    createdAt: serverTimestamp(),
    status: "setup_pending", // or "maintenance"
  });
}

// Update existing site data
export async function updateSite(subdomain: string, newData: any) {
  const docRef = doc(db, "sites", subdomain);
  await updateDoc(docRef, {
    ...newData,
    updatedAt: serverTimestamp(),
  });
}

// Get all sites (admin use)
export async function getAllSites() {
  const querySnapshot = await getDocs(collection(db, "sites"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
