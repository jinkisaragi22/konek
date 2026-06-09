"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#F0EEFF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="text-2xl font-semibold tracking-tight text-[#1A1035]">
            konek<span className="text-[#5B4EE8]">.</span>
          </span>
        </div>

        <div className="bg-white border border-[#DDD8FF] rounded-2xl p-8 shadow-sm shadow-[#5B4EE8]/10">
          <h1 className="text-xl font-semibold text-[#1A1035] mb-1">Welcome back</h1>
          <p className="text-sm text-[#7B6F9E] mb-8">Sign in to your account</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#5B4EE8] hover:bg-[#4A3ED6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2.5 transition-colors shadow-md shadow-[#5B4EE8]/30"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-[#9B90C2] mt-6">
          No account?{" "}
          <Link href="/auth/register" className="text-[#5B4EE8] font-medium hover:text-[#4A3ED6] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}