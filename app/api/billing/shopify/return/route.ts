import { NextResponse } from "next/server";
import { env } from "@/lib/server/env";

// Ancien lien de retour des offres Shopify : le paiement passe maintenant par Stripe.
export function GET() {
  return NextResponse.redirect(`${env.appUrl()}/app/abonnement`);
}
