import { z } from "zod";
import { body, json, route } from "@/lib/server/http";
import { requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Ventes : ce que le fondateur paie pour faire tourner Vigenia (abonnements, services à l'usage).
export const GET = route(async () => {
  await requireOwner();
  const costs = must(await db().from("owner_costs").select("id, name, what, amount_cents, currency, period, method, essential, sort, last_cents, last_currency, last_at").order("sort").order("created_at"));
  return json({ costs });
});

const Cost = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  what: z.string().trim().max(300).nullable().optional(),
  amount_cents: z.number().int().min(0).max(10_000_000).nullable(),
  currency: z.enum(["EUR", "USD"]),
  period: z.enum(["month", "year", "usage", "once"]),
  method: z.string().trim().max(120).nullable().optional(),
  essential: z.boolean().optional(),
});

export const POST = route(async (req: Request) => {
  await requireOwner();
  const c = await body(req, Cost);
  const row = { name: c.name, what: c.what ?? null, amount_cents: c.amount_cents, currency: c.currency, period: c.period, method: c.method ?? null, essential: c.essential ?? false };
  const saved = c.id
    ? must(await db().from("owner_costs").update(row).eq("id", c.id).select().single())
    : must(await db().from("owner_costs").insert({ ...row, sort: 100 }).select().single());
  return json({ cost: saved });
});

export const DELETE = route(async (req: Request) => {
  await requireOwner();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ ok: false }, 400);
  must(await db().from("owner_costs").delete().eq("id", id));
  return json({ ok: true });
});
