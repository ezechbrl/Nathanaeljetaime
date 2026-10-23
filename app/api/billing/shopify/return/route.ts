import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { env } from "@/lib/server/env";
import { syncFromShopify } from "@/lib/server/billing";

// Retour de la page de paiement Shopify : on relit l'abonnement puis on revient dans l'app
// (la boutique d'aperçu ou le projet en attente se débloque tout seul).
export async function GET() {
  const app = env.appUrl();
  try {
    const user = await requireUser();
    await syncFromShopify(user.id);
    const after = await requireUser();
    return NextResponse.redirect(after.plan === "free" ? `${app}/app/abonnement?paiement=annule` : `${app}/app?checkout=success`);
  } catch (e) {
    console.error("Retour paiement Shopify", e);
    return NextResponse.redirect(`${app}/app/abonnement`);
  }
}
