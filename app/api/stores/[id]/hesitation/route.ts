import { z } from "zod";
import { HESITATIONS, cancelLabel } from "@/lib/content/cancel";
import { requireUser } from "@/lib/server/auth";
import { noContent, route } from "@/lib/server/http";
import { notifyOwner } from "@/lib/server/notify";
import { db } from "@/lib/server/supabase";

const Input = z.object({
  reason: z.enum(HESITATIONS.map((h) => h.id) as [string, ...string[]]),
  details: z.string().trim().max(500).optional(),
});

// « Qu'est-ce qui te fait hésiter ? » : une réponse par aperçu, pour savoir pourquoi les gens ne paient pas.
export const POST = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const parsed = Input.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return noContent();
  const { data: store } = await db().from("stores").select("id, name").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!store) return noContent();
  const { data: already } = await db().from("hesitations").select("id").eq("store_id", id).maybeSingle();
  if (already) return noContent();
  await db().from("hesitations").insert({ user_id: user.id, store_id: id, email: user.email, reason: parsed.data.reason, details: parsed.data.details || null });
  await notifyOwner("🤔 Un visiteur hésite à payer", `${user.email} (${store.name}) : ${cancelLabel(HESITATIONS, parsed.data.reason)}${parsed.data.details ? ` · « ${parsed.data.details.slice(0, 200)} »` : ""}`).catch(() => {});
  return noContent();
});
