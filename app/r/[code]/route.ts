import { NextResponse, type NextRequest } from "next/server";
import { AFFILIATE } from "@/lib/content/affiliate";

// Lien d'affiliation : mémorise le code dans un cookie puis renvoie vers l'accueil.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/", req.url));
  if (/^[a-z0-9-]{2,40}$/i.test(code)) {
    res.cookies.set("ref", code.toLowerCase(), { maxAge: AFFILIATE.cookieDays * 86_400, path: "/", sameSite: "lax", httpOnly: false });
  }
  return res;
}
