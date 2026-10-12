import { NextResponse, type NextRequest } from "next/server";
import { AFFILIATE } from "@/lib/content/affiliate";

// Lien d'affiliation : mémorise le code dans un cookie, compte le clic, puis renvoie vers l'accueil.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/", req.url));
  if (!/^[a-z0-9-]{2,40}$/i.test(code)) return res;
  const ref = code.toLowerCase();
  res.cookies.set("ref", ref, { maxAge: AFFILIATE.cookieDays * 86_400, path: "/", sameSite: "lax", httpOnly: false });
  if (process.env.NEXT_PUBLIC_API_MODE === "live") {
    try {
      const { db } = await import("@/lib/server/supabase");
      await db().from("affiliate_events").insert({ code: ref, kind: "click" });
    } catch (e) {
      console.error("Clic affilié non enregistré", e);
    }
  }
  return res;
}
