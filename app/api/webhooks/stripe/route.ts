import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/server/env";
import { invoicePaid, stripe, syncSubscription } from "@/lib/server/stripe-billing";
import { db } from "@/lib/server/supabase";

// Événements Stripe (adresse à déclarer dans Stripe → Développeurs → Webhooks : https://vigenia.com/api/webhooks/stripe).
export async function POST(req: Request) {
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", env.stripeWebhookSecret());
  } catch {
    return new NextResponse("signature invalide", { status: 400 });
  }
  // Un même événement n'est traité qu'une fois (Stripe peut le renvoyer).
  const { error: dup } = await db().from("webhook_events").insert({ id: `stripe:${event.id}` });
  if (dup) return NextResponse.json({ received: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (s.subscription) await syncSubscription(await stripe().subscriptions.retrieve(String(s.subscription)));
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      case "invoice.paid":
        await invoicePaid(event.data.object);
        break;
    }
  } catch (e) {
    // On libère l'événement pour que Stripe le renvoie plus tard.
    await db().from("webhook_events").delete().eq("id", `stripe:${event.id}`);
    console.error("Webhook Stripe", event.type, e);
    return new NextResponse("erreur", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
