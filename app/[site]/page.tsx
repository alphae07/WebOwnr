import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface SitePageProps {
  params: { site: string };
}

export default async function SitePage({ params }: SitePageProps) {
  const { site } = params;

  // Fetch site data from Firestore
  const docRef = doc(db, "sites", site);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <h1 className="text-center mt-20 text-2xl">404 – Site not found</h1>;
  }

  const siteData = docSnap.data();

  if (siteData.status === "maintenance") {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-3xl">🚧 This site is under maintenance</h1>
      </div>
    );
  }

  // Render site with chosen template
  return (
    <div>
      <h1 className="text-4xl text-center mt-10">{siteData.name}</h1>
      <p className="text-center mt-2">{siteData.description}</p>
      {/* Later: Render actual template component based on siteData.template */}
    </div>
  );
}
