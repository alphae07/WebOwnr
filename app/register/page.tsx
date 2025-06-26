'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [color, setColor] = useState('#000000');
  const [tagline, setTagline] = useState('');
    const [niche, setNiche] = useState('');
    const [about, setAbout] = useState('');
  const [plan, setPlan] = useState('starter');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      const siteData = {
        uid: userCred.user.uid,
        email,
        businessName,
        tagline,
        niche,
        subdomain,
        color,
        about,
        plan,
        logo: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      console.log("Creating Firestore document...");

      await setDoc(doc(db, 'sites', subdomain), siteData);

      console.log("Firestore document created");

      router.push('/dashboard');
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
        alert("That email is already registered. Try logging in instead.");
    } else {
        console.error("Registration error:", error);
        alert("Registration failed: " + error.message);
    }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-4">Create Your WebOwnr Site</h2>

      <input
        className="border p-2 mb-2 w-full"
        placeholder="Business Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Business Name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Business Tagline"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        />
        
        <input
        className="border p-2 mb-2 w-full"
        placeholder="Industry or Niche (e.g. Skincare, Tech)"
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
        />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Subdomain (e.g. myshop)"
        value={subdomain}
        onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
      />
      <div className="mb-2">
        <label className="block mb-1 font-semibold">Brand Color:</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1 font-semibold">Logo Upload:</label>
        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
      </div>
      <textarea
        className="border p-2 mb-4 w-full"
        placeholder="About your business (short description)"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={4}
        />
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Choose Plan:</label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro Brand</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <button
        onClick={handleRegister}
        className="bg-black text-white px-6 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Register & Launch'}
      </button>
    </div>
  );
}
