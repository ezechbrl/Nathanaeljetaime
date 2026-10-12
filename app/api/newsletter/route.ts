import { z } from "zod";
import { body, clientIp, noContent, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";
import { db } from "@/lib/server/supabase";

export const POST = route(async (req) => {
  await rateLimit(`newsletter:${clientIp(req)}`, 5, 3600);
  const { email } = await body(req, z.object({ email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.") }));
  await db().from("newsletter").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  return noContent();
});
