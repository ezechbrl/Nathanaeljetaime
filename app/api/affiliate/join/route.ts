import { z } from "zod";
import { affiliateFor } from "@/lib/server/affiliate";
import { requireUser } from "@/lib/server/auth";
import { randomToken } from "@/lib/server/crypto";
import { body, json, route } from "@/lib/server/http";
import { db } from "@/lib/server/supabase";
import { AFFILIATE } from "@/lib/content/affiliate";

export const POST = route(async (req) => {
  const user = await requireUser();
  const { payoutEmail } = await body(req, z.object({ payoutEmail: z.string().trim().email() }));
  const existing = await affiliateFor(user.id);
  if (existing) return json({ affiliate: existing });
  const base = (user.first_name || "ami").toLowerCase().normalize("NFD").replace(/[^a-z]/g, "").slice(0, 12) || "ami";
  for (let i = 0; i < 5; i++) {
    const code = i === 0 ? base : `${base}-${randomToken(2)}`;
    const { error } = await db().from("affiliates").insert({ user_id: user.id, code, commission_rate: AFFILIATE.rate, payout_email: payoutEmail });
    if (!error) break;
  }
  return json({ affiliate: await affiliateFor(user.id) }, 201);
});
