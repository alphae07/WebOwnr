"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Signup = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Save only name + email to onboarding
      localStorage.setItem("onboarding_name", name);
      localStorage.setItem("onboarding_email", email);

      router.push("/onboarding");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("Email already registered. Try login instead.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex overflow-hidden flex-1 flex items-center justify-center p-8 relative bg-gradient-to-br from-primary via-teal to-primary">
	 <div className="relative z-10 text-center max-w-md">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Build Your Dream Store
          </h2>
        </div>
	</div>
	{/* Right Panel */}
      <div className="flex-1 flex items-center justify-center items-center justify-center p-6 relative">
      <div className="max-w-md w-full">
        
        <h1 className="text-3xl font-bold mb-6">Create your account</h1>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
		className="pl-10 h-12"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email address</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
		className="pl-10 h-12"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="terms">
              I agree to Terms & Privacy Policy
            </Label>
          </div>

          <Button type="submit" size="xl" className="w-full group" disabled={!agreeTerms || loading}>
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
        
        <p className="mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline">Sign in</Link>
        </p>
      </div>
</div>
    </div>
  );
};

export default Signup;
