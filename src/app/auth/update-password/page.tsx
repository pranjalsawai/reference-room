"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Handle the hash-based token from Supabase reset emails
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => { window.location.href = "/"; }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-prata text-[22px] text-[#0D0D0D] leading-tight">The Reference Room</h1>
          <div className="mx-auto mt-2 w-8 h-px bg-[#0D0D0D]" />
          <p className="mt-3 text-[11px] font-google-sans text-[#9B9690] tracking-widest uppercase">Set your password</p>
        </div>

        {done ? (
          <p className="text-center text-[13px] font-google-sans text-[#6B6B6B]">Password set. Entering the room…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="form-input" />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className="form-input" />
            </div>
            {error && <p className="text-[12px] font-google-sans text-[#EF3054]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#0D0D0D] text-white text-[12px] font-google-sans font-medium py-2.5 rounded-[2px] hover:bg-[#222] disabled:opacity-40 transition-colors tracking-wide mt-2">
              {loading ? "Saving…" : "Set Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
