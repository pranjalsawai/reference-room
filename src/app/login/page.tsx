"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "shared" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) window.location.href = "/auth/update-password" + window.location.hash;
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "no-access") setError("This account does not have access to a Reference Room yet.");
    if (reason === "service-unavailable") setError("The library is waking up. Please try again in a moment.");
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      if (mode === "login") {
        const { error: loginError } = await createClient().auth.signInWithPassword({ email, password });
        if (loginError) throw new Error("Invalid email or password.");
      } else {
        const response = await fetch(mode === "shared" ? "/api/auth/shared" : "/api/auth/signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mode === "shared" ? { password, displayName } : { email, password, displayName, inviteCode }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Something went wrong.");
      }
      window.location.href = "/";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong."); setLoading(false);
    }
  };

  const labels = {
    login: ["Member sign in", "Enter the Room"],
    shared: ["Shared contributor access", "Enter Shared Room"],
    signup: ["Create your private room", "Create My Room"],
  } as const;

  return <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-4 py-10"><div className="w-full max-w-sm">
    <div className="mb-8 text-center"><h1 className="font-prata text-[22px] text-[#0D0D0D]">The Reference Room</h1><div className="mx-auto mt-2 w-8 h-px bg-[#0D0D0D]" /><p className="mt-3 text-[10px] font-google-sans text-[#9B9690] tracking-widest uppercase">{labels[mode][0]}</p></div>
    <div className="grid grid-cols-3 border border-[#DDD9D0] bg-white mb-6">{(["login", "shared", "signup"] as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setError(""); }} className={`py-2 text-[10px] font-google-sans ${mode === item ? "bg-[#0D0D0D] text-white" : "text-[#6B6B6B] hover:bg-[#F8F6F1]"}`}>{item === "login" ? "Sign in" : item === "shared" ? "Shared access" : "New room"}</button>)}</div>
    <form onSubmit={submit} className="space-y-4">
      {mode !== "login" && <Field label="Your name" type="text" value={displayName} onChange={setDisplayName} placeholder="How your name should appear" />}
      {mode !== "shared" && <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />}
      {mode === "signup" && <Field label="Invitation code" type="text" value={inviteCode} onChange={setInviteCode} placeholder="ROOM-XXXXXXXX" />}
      <Field label={mode === "shared" ? "Shared password" : "Password"} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
      {mode === "shared" && <p className="text-[11px] font-google-sans text-[#9B9690] leading-relaxed">You can browse and add references. Editing and deleting stay with the room owner.</p>}
      {error && <p className="text-[12px] font-google-sans text-[#EF3054]">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-[#0D0D0D] text-white text-[12px] font-google-sans font-medium py-2.5 rounded-[2px] hover:bg-[#222] disabled:opacity-40">{loading ? "Please wait…" : labels[mode][1]}</button>
    </form>
  </div></div>;
}

function Field({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div><label className="form-label">{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required className="form-input" /></div>;
}
