import { NextResponse, type NextRequest } from "next/server";

// Un lien par compte TikTok (vigenia.com/tiktok/2, vigenia.com/tiktok/3…) : visite marquée « tiktok-2 »,
// pour savoir quel compte ramène le plus de monde.
export async function GET(req: NextRequest, { params }: { params: Promise<{ compte: string }> }) {
  const { compte } = await params;
  const id = compte.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20);
  return NextResponse.redirect(new URL(`/?utm_source=${id ? `tiktok-${id}` : "tiktok"}`, req.url));
}
