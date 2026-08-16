import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { password, displayName } = await request.json();
  if (!password || !displayName?.trim()) {
    return NextResponse.json({ error: "Enter your name and the shared password." }, { status: 400 });
  }

  const sharedEmail = process.env.SHARED_CONTRIBUTOR_EMAIL;
  if (!sharedEmail) {
    return NextResponse.json({ error: "Shared access has not been configured yet." }, { status: 503 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: sharedEmail, password });
  if (error) return NextResponse.json({ error: "That shared password is not correct." }, { status: 401 });

  const cookieStore = await cookies();
  cookieStore.set("reference-room-contributor-name", displayName.trim(), {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
