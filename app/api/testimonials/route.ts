import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { body, json, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";
import { db, must } from "@/lib/server/supabase";

const Input = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10, "Écris au moins une phrase.").max(600),
  name: z.string().trim().min(2).max(60),
  role: z.string().trim().max(80).optional(),
});

// Avis d'un utilisateur sur Vigenia. Un seul par compte (modifiable) ; publié sur le site après relecture.
export const POST = route(async (req) => {
  const user = await requireUser();
  await rateLimit(`testimonial:${user.id}`, 5, 3600);
  const input = await body(req, Input);
  must(await db().from("testimonials").upsert({ user_id: user.id, ...input, role: input.role || null, approved: false }, { onConflict: "user_id" }));
  return json({ ok: true }, 201);
});
