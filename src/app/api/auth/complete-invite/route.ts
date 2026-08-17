import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No active invitation session." }, { status: 401 });

  const { access_type: accessType, workspace_id: workspaceId, display_name: displayName } = user.user_metadata ?? {};
  if (accessType !== "contributor" || !workspaceId) {
    return NextResponse.json({ error: "This account does not contain a contributor invitation." }, { status: 403 });
  }

  const admin = createAdminClient();
  const [profileResult, membershipResult] = await Promise.all([
    admin.from("profiles").upsert({ id: user.id, display_name: displayName || "Contributor" }),
    admin.from("workspace_members").upsert({ workspace_id: workspaceId, user_id: user.id, role: "contributor" }),
  ]);

  if (profileResult.error || membershipResult.error) {
    return NextResponse.json({ error: "Could not finish the invitation." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
