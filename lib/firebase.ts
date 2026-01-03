// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// /lib/firestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types
export interface SocialPlatformData {
  id: string;
  name: string;
  connected: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  profileId: string | null;
  followers: string | null;
  metrics: {
    reach: number;
    engagement: number;
  };
  connectedAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  inventory: number;
  status: "active" | "inactive";
  createdAt: Timestamp;
}

export interface SocialPost {
  id: string;
  userId: string;
  productIds: string[];
  platforms: string[];
  caption: string;
  scheduledFor?: Timestamp;
  status: "draft" | "scheduled" | "published" | "failed";
  metrics: {
    views: number;
    clicks: number;
    conversions: number;
  };
  createdAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface SocialAd {
  id: string;
  userId: string;
  productIds: string[];
  platform: string;
  budget: number;
  dailyBudget: number;
  startDate: Timestamp;
  endDate: Timestamp;
  targetAudience: {
    ageMin: number;
    ageMax: number;
    interests: string[];
    locations: string[];
  };
  status: "draft" | "active" | "paused" | "completed";
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    roas: number;
  };
  createdAt: Timestamp;
}

export interface SocialStats {
  totalReach: number;
  engagement: number;
  linkClicks: number;
  socialOrders: number;
  revenue: number;
}

// Get all connected social platforms for a user
export async function getSocialPlatforms(userId: string): Promise<SocialPlatformData[]> {
  try {
    const userPlatformsRef = collection(db, "users", userId, "socialPlatforms");
    const snapshot = await getDocs(userPlatformsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SocialPlatformData));
  } catch (error) {
    console.error("Error fetching social platforms:", error);
    throw error;
  }
}

// Get a specific social platform
export async function getSocialPlatform(userId: string, platformId: string): Promise<SocialPlatformData | null> {
  try {
    const docRef = doc(db, "users", userId, "socialPlatforms", platformId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as SocialPlatformData) : null;
  } catch (error) {
    console.error("Error fetching social platform:", error);
    throw error;
  }
}

// Save or update a social platform connection
export async function saveSocialPlatform(
  userId: string,
  platformId: string,
  data: Partial<SocialPlatformData>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "socialPlatforms", platformId);
    await setDoc(docRef, {
      ...data,
      connectedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving social platform:", error);
    throw error;
  }
}

// Delete a social platform connection
export async function deleteSocialPlatform(userId: string, platformId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "socialPlatforms", platformId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting social platform:", error);
    throw error;
  }
}

// Get user's products
export async function getProducts(userId: string): Promise<ProductData[]> {
  try {
    const productsRef = collection(db, "users", userId, "products");
    const q = query(productsRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProductData));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Get a specific product
export async function getProduct(userId: string, productId: string): Promise<ProductData | null> {
  try {
    const docRef = doc(db, "users", userId, "products", productId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as ProductData) : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Create or update a social post
export async function createSocialPost(
  userId: string,
  data: Omit<SocialPost, "id" | "userId" | "createdAt">
): Promise<string> {
  try {
    const postsRef = collection(db, "users", userId, "socialPosts");
    const docRef = doc(postsRef);
    await setDoc(docRef, {
      ...data,
      userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating social post:", error);
    throw error;
  }
}

// Get user's social posts
export async function getSocialPosts(userId: string, limit: number = 20): Promise<SocialPost[]> {
  try {
    const postsRef = collection(db, "users", userId, "socialPosts");
    const q = query(postsRef);
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as SocialPost))
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching social posts:", error);
    throw error;
  }
}

// Update a social post
export async function updateSocialPost(
  userId: string,
  postId: string,
  data: Partial<SocialPost>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "socialPosts", postId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating social post:", error);
    throw error;
  }
}

// Create a social ad
export async function createSocialAd(
  userId: string,
  data: Omit<SocialAd, "id" | "userId" | "createdAt">
): Promise<string> {
  try {
    const adsRef = collection(db, "users", userId, "socialAds");
    const docRef = doc(adsRef);
    await setDoc(docRef, {
      ...data,
      userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating social ad:", error);
    throw error;
  }
}

// Get user's social ads
export async function getSocialAds(userId: string): Promise<SocialAd[]> {
  try {
    const adsRef = collection(db, "users", userId, "socialAds");
    const snapshot = await getDocs(adsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialAd));
  } catch (error) {
    console.error("Error fetching social ads:", error);
    throw error;
  }
}

// Get aggregated social statistics
export async function getSocialStats(userId: string): Promise<SocialStats> {
  try {
    const postsRef = collection(db, "users", userId, "socialPosts");
    const snapshot = await getDocs(postsRef);

    const stats = {
      totalReach: 0,
      engagement: 0,
      linkClicks: 0,
      socialOrders: 0,
      revenue: 0,
    };

    snapshot.docs.forEach(doc => {
      const post = doc.data() as SocialPost;
      stats.totalReach += post.metrics?.views || 0;
      stats.engagement += post.metrics?.clicks || 0;
      stats.linkClicks += post.metrics?.clicks || 0;
      stats.socialOrders += post.metrics?.conversions || 0;
    });

    // Get revenue from orders
    const ordersRef = collection(db, "users", userId, "orders");
    const ordersSnapshot = await getDocs(query(ordersRef, where("source", "==", "social")));
    ordersSnapshot.docs.forEach(doc => {
      stats.revenue += doc.data().total || 0;
    });

    return stats;
  } catch (error) {
    console.error("Error fetching social stats:", error);
    return {
      totalReach: 0,
      engagement: 0,
      linkClicks: 0,
      socialOrders: 0,
      revenue: 0,
    };
  }
}

// Update social platform metrics
export async function updatePlatformMetrics(
  userId: string,
  platformId: string,
  metrics: { reach: number; engagement: number }
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "socialPlatforms", platformId);
    await updateDoc(docRef, { metrics });
  } catch (error) {
    console.error("Error updating platform metrics:", error);
    throw error;
  }
}

// Batch update posts metrics (for scheduled posts)
export async function updatePostMetrics(
  userId: string,
  postId: string,
  metrics: Partial<SocialPost["metrics"]>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "socialPosts", postId);
    await updateDoc(docRef, { metrics });
  } catch (error) {
    console.error("Error updating post metrics:", error);
    throw error;
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
