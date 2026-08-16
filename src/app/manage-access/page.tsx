"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ManageAccessPage() {
  const supabase = useMemo(() => createClient(), []);
  const [workspaceId, setWorkspaceId] = useState("");
  const [kind, setKind] = useState<"contributor" | "personal">("contributor");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("workspace_members").select("workspace_id")
      .eq("user_id", user.id).eq("role", "owner").limit(1).maybeSingle();
    if (data) setWorkspaceId(data.workspace_id);
  })(); }, [supabase]);

  const invite = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage(""); setCode("");
    const response = await fetch("/api/admin/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, email, displayName: name, workspaceId }) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(result.error ?? "Could not create the invitation.");
    if (result.code) { setCode(result.code); setMessage("Personal-room invitation created."); }
    else setMessage(`Invitation sent to ${email}.`);
  };

  return <main className="min-h-screen bg-[#F5F2EC] px-6 py-12"><div className="max-w-lg mx-auto">
    <a href="/" className="text-[11px] font-google-sans text-[#6B6B6B] hover:text-black">← Back to the library</a>
    <p className="mt-10 text-[9px] uppercase tracking-[0.14em] text-[#9B9690] font-google-sans">Owner settings</p>
    <h1 className="mt-2 font-prata text-[28px] text-[#0D0D0D]">Manage access</h1>
    <p className="mt-3 text-[13px] leading-relaxed text-[#6B6B6B] font-google-sans">Invite a contributor to your shared library, or create a code that lets someone open a private Reference Room.</p>
    <form onSubmit={invite} className="mt-8 bg-white border border-[#DDD9D0] p-6 space-y-5">
      <div><label className="form-label">Invitation type</label><select className="form-input" value={kind} onChange={(e) => setKind(e.target.value as "contributor" | "personal")}><option value="contributor">Shared-library contributor</option><option value="personal">New private room</option></select></div>
      <div><label className="form-label">Name</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contributor's name" required /></div>
      <div><label className="form-label">Email {kind === "personal" && "(optional)"}</label><input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required={kind === "contributor"} /></div>
      <button disabled={loading || !workspaceId} className="w-full bg-[#0D0D0D] text-white py-2.5 text-[12px] font-google-sans disabled:opacity-40">{loading ? "Preparing…" : kind === "contributor" ? "Send invitation" : "Create invitation code"}</button>
      {message && <p className="text-[12px] font-google-sans text-[#6B6B6B]">{message}</p>}
      {code && <div className="bg-[#F0EDE6] border border-[#DDD9D0] p-4"><p className="text-[9px] uppercase tracking-widest text-[#9B9690]">Invitation code</p><p className="mt-1 font-mono text-[16px] select-all">{code}</p><p className="mt-2 text-[10px] text-[#9B9690]">Send this code with the website link. It expires in 14 days and works once.</p></div>}
    </form>
  </div></main>;
}
