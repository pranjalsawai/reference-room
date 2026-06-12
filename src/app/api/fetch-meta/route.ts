import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReferenceRoom/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    const get = (pattern: RegExp) => pattern.exec(html)?.[1]?.trim() ?? "";

    const title =
      get(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
      get(/<title[^>]*>([^<]+)<\/title>/i);

    const description =
      get(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ||
      get(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);

    const image =
      get(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);

    return NextResponse.json({ title, description, image });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
