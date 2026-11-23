import { NextResponse, type NextRequest } from "next/server";

// Lien à mettre dans la bio TikTok (vigenia.com/tiktok) : renvoie vers l'accueil en marquant la visite
// « tiktok », car l'appli TikTok n'indique presque jamais d'où vient le visiteur.
export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/?utm_source=tiktok", req.url));
}
