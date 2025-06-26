// /app/site/[site]/page.tsx

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

interface Props {
  params: { site: string };
}

export default async function SitePage({ params }: Props) {
  const subdomain = params.site;

  const docRef = doc(db, 'sites', subdomain);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return (
      <div className="p-10 text-center text-red-600">
        🚫 Site not found for: <strong>{subdomain}</strong>
      </div>
    );
  }

  const site = docSnap.data();

  if (site.status === 'pending') {
    return (
      <div className="p-10 text-center text-yellow-600">
        🛠️ This website is under maintenance. Please check back soon.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-4xl font-bold mb-2">{site.businessName}</h1>
      <p className="text-lg text-gray-600 mb-4">{site.tagline}</p>
      <div className="max-w-2xl text-gray-800">{site.about}</div>
    </div>
  );
}
