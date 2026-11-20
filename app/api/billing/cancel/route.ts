import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { cancelSubscriptionNow } from "@/lib/server/billing";
import { noContent, route } from "@/lib/server/http";
import { notifyOwner } from "@/lib/server/notify";
import { db } from "@/lib/server/supabase";
import { CANCEL_REASONS, CANCEL_WISHES, cancelLabel } from "@/lib/content/cancel";

const Input = z.object({
  reason: z.string().max(20).optional(),
  wish: z.string().max(20).optional(),
  details: z.string().trim().max(500).optional(),
});

// Arrête l'abonnement à la fin de la période déjà payée (Stripe ne le renouvelle plus).
// Les réponses au petit questionnaire sont facultatives : elles ne bloquent jamais l'arrêt.
export const POST = route(async (req) => {
  const user = await requireUser();
  const raw = await req.json().catch(() => ({}));
  const parsed = Input.safeParse(raw);
  await cancelSubscriptionNow(user.id);
  const f = parsed.success ? parsed.data : {};
  if (f.reason || f.wish || f.details) {
    try {
      await db().from("cancel_feedback").insert({ user_id: user.id, email: user.email, plan: user.plan, reason: f.reason ?? null, wish: f.wish ?? null, details: f.details || null });
      await notifyOwner("👋 Un client arrête son abonnement", `${user.email} : ${cancelLabel(CANCEL_REASONS, f.reason) || "—"} · aurait aimé : ${cancelLabel(CANCEL_WISHES, f.wish) || "—"}${f.details ? ` · « ${f.details.slice(0, 200)} »` : ""}`);
    } catch (e) {
      console.warn("cancel_feedback", e);
    }
  }
  return noContent();
});
