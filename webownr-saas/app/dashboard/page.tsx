'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const querySnapshot = await getDocs(collection(db, 'sites'));
          const userSite = querySnapshot.docs.find(
            (doc) => doc.data().uid === user.uid
          );
          if (userSite) {
            setSiteData(userSite.data());
          }
        } catch (error) {
          console.error('Failed to load site:', error);
        } finally {
          setLoading(false);
        }
      } else {
        window.location.href = '/'; // redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading dashboard...</div>;
  }

  if (!siteData) {
    return <div className="p-10 text-center text-red-600">No site data found.</div>;
  }

  const siteLink = `https://${siteData.subdomain}.webownr.com`;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {siteData.businessName} 👋
      </h1>
      <p className="text-gray-600 mb-6">{siteData.tagline}</p>

      <div className="bg-gray-100 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Site Details</h2>
        <p>
          <strong>Subdomain:</strong>{' '}
          <a href={siteLink} target="_blank" className="text-blue-600 underline">
            {siteLink}
          </a>
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span className="inline-block px-2 py-1 bg-yellow-300 text-sm rounded">
            {siteData.status}
          </span>
        </p>
        <p>
          <strong>Niche:</strong> {siteData.niche}
        </p>
        <p>
          <strong>Primary Color:</strong>{' '}
          <span
            className="inline-block w-4 h-4 rounded-full border"
            style={{ backgroundColor: siteData.color }}
          />
        </p>
        <p className="mt-2">
          <strong>About:</strong> {siteData.about}
        </p>
      </div>

      {siteData.status === 'pending' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          🚧 Your website is in <strong>maintenance mode</strong>. Our team is setting up your content now. It’ll be live in less than 24 hours.
        </div>
      )}

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">Need help? Chat with us from the floating icon below.</p>
      </div>
    </div>
  );
}
