"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <h1 className="font-prata text-[22px] text-[#0D0D0D] leading-tight">
            The Reference Room
          </h1>
          <div className="mx-auto mt-2 w-8 h-px bg-[#0D0D0D]" />
          <p className="mt-3 text-[11px] font-google-sans text-[#9B9690] tracking-widest uppercase">
            Invite only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input"
            />
          </div>

          {error && (
            <p className="text-[12px] font-google-sans text-[#EF3054]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D0D0D] text-white text-[12px] font-google-sans font-medium py-2.5 rounded-[2px] hover:bg-[#222] disabled:opacity-40 transition-colors tracking-wide mt-2"
          >
            {loading ? "Signing in…" : "Enter the Room"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] font-google-sans text-[#9B9690]">
          Access by invitation only.
        </p>
      </div>
    </div>
  );
}
