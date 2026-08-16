import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { kind, email, displayName, workspaceId } = await request.json();
  const { data: membership } = await supabase.from("workspace_members").select("role")
    .eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
  if (membership?.role !== "owner") return NextResponse.json({ error: "Owner access required." }, { status: 403 });

  const admin = createAdminClient();
  if (kind === "contributor") {
    if (!email) return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
    const redirectTo = `${new URL(request.url).origin}/auth/callback?next=/auth/update-password`;
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { access_type: "contributor", workspace_id: workspaceId, display_name: displayName?.trim() || "Contributor" },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await admin.from("invitation_codes").insert({
      kind: "contributor", workspace_id: workspaceId, invited_email: email,
      display_name: displayName?.trim() || "Contributor", created_by: user.id,
    });
    return NextResponse.json({ ok: true });
  }

  if (kind === "personal") {
    const code = `ROOM-${randomBytes(4).toString("hex").toUpperCase()}`;
    const tokenHash = createHash("sha256").update(code).digest("hex");
    const { error } = await admin.from("invitation_codes").insert({
      token_hash: tokenHash, kind: "personal", invited_email: email || null,
      display_name: displayName?.trim() || "", created_by: user.id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, code });
  }
  return NextResponse.json({ error: "Unknown invitation type." }, { status: 400 });
}
