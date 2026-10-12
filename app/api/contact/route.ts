import { z } from "zod";
import { env } from "@/lib/server/env";
import { sendEmail } from "@/lib/server/email";
import { body, clientIp, noContent, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";
import { db } from "@/lib/server/supabase";
import { site } from "@/lib/site";

const Input = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email("Adresse e-mail invalide."),
  topic: z.string().trim().max(80),
  message: z.string().trim().min(10, "Ton message est un peu court.").max(5000),
  website: z.string().max(0).optional().or(z.literal("")), // champ piège anti-robots
});

export const POST = route(async (req) => {
  const input = await body(req, Input.passthrough());
  if (input.website) return noContent(); // robot : on fait comme si tout allait bien
  await rateLimit(`contact:${clientIp(req)}`, 3, 3600);
  await db().from("contact_messages").insert({ name: input.name, email: input.email, topic: input.topic, message: input.message });
  await sendEmail(env.contactEmail() ?? site.email, `[Contact] ${input.topic} — ${input.name}`, `${input.message}\n\n— ${input.name} <${input.email}>`, input.email);
  return noContent();
});
