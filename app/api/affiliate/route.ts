import { z } from "zod";
import { affiliateFor } from "@/lib/server/affiliate";
import { requireUser } from "@/lib/server/auth";
import { body, json, notFound, route } from "@/lib/server/http";
import { db } from "@/lib/server/supabase";

export const GET = route(async () => {
  const user = await requireUser();
  return json({ affiliate: await affiliateFor(user.id) });
});

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const { payoutEmail } = await body(req, z.object({ payoutEmail: z.string().trim().email() }));
  const { count } = await db().from("affiliates").update({ payout_email: payoutEmail }, { count: "exact" }).eq("user_id", user.id);
  if (!count) throw notFound();
  return json({ affiliate: await affiliateFor(user.id) });
});
