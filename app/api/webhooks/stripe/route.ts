import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/server/env";
import { creditAffiliate, stripe, syncSubscription } from "@/lib/server/stripe";
import { db } from "@/lib/server/supabase";

export async function POST(req: Request) {
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", env.stripeWebhookSecret());
  } catch {
    return new NextResponse("signature invalide", { status: 400 });
  }
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
        await creditAffiliate(event.data.object);
        break;
      case "invoice.payment_failed":
        // Stripe relance automatiquement ; le statut passe à past_due via customer.subscription.updated.
        break;
    }
  } catch (e) {
    // On libère l'événement pour que Stripe le renvoie.
    await db().from("webhook_events").delete().eq("id", `stripe:${event.id}`);
    console.error("Webhook Stripe", event.type, e);
    return new NextResponse("erreur", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
