import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, displayName, inviteCode } = await request.json();
  if (!email || !password || !displayName?.trim() || !inviteCode) {
    return NextResponse.json({ error: "Complete every field." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use at least 8 characters for your password." }, { status: 400 });
  }

  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(inviteCode.trim()).digest("hex");
  const { data: invitation } = await admin.from("invitation_codes").select("*")
    .eq("token_hash", tokenHash).eq("kind", "personal").is("used_at", null)
    .gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!invitation) return NextResponse.json({ error: "This invitation code is invalid or expired." }, { status: 403 });
  if (invitation.invited_email && invitation.invited_email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "This invitation was created for a different email." }, { status: 403 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { display_name: displayName.trim() },
  });
  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Could not create the account." }, { status: 400 });
  }

  const userId = created.user.id;
  const { data: workspace, error: workspaceError } = await admin.from("workspaces")
    .insert({ name: `${displayName.trim()}'s Reference Room`, kind: "personal", owner_id: userId })
    .select("id").single();
  if (workspaceError || !workspace) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Could not prepare your private room." }, { status: 500 });
  }
  await Promise.all([
    admin.from("profiles").upsert({ id: userId, display_name: displayName.trim() }),
    admin.from("workspace_members").insert({ workspace_id: workspace.id, user_id: userId, role: "owner" }),
    admin.from("invitation_codes").update({ used_by: userId, used_at: new Date().toISOString() }).eq("id", invitation.id),
  ]);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return NextResponse.json({ error: "Account created. Please sign in." }, { status: 201 });
  return NextResponse.json({ ok: true });
}
