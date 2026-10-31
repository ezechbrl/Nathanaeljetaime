import { NextResponse, type NextRequest } from "next/server";
import { emailFromToken, WL_COOKIE } from "@/lib/server/waitlist";

// Lien de l'e-mail de lancement : mémorise l'inscrit de la liste d'attente (prix réservé), puis renvoie vers l'inscription.
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t");
  const res = NextResponse.redirect(new URL("/inscription", req.url));
  if (emailFromToken(t)) res.cookies.set(WL_COOKIE, t!, { maxAge: 30 * 86_400, path: "/", sameSite: "lax", httpOnly: true, secure: true });
  return res;
}
