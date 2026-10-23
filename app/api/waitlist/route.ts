import { z } from "zod";
import { body, clientIp, noContent, route } from "@/lib/server/http";
import { sendEmail } from "@/lib/server/email";
import { notifyOwner } from "@/lib/server/notify";
import { rateLimit } from "@/lib/server/quota";
import { db } from "@/lib/server/supabase";
import { site } from "@/lib/site";

// Inscription à la liste d'attente (avec, si fourni, ce que la personne veut vendre).
export const POST = route(async (req) => {
  await rateLimit(`waitlist:${clientIp(req)}`, 5, 3600);
  const input = await body(req, z.object({
    email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
    brief: z.string().trim().max(500).optional(),
  }));
  const ref = /(?:^|;\s*)ref=([^;]+)/.exec(req.headers.get("cookie") ?? "")?.[1] ?? null;
  const { data } = await db().from("waitlist").upsert({ email: input.email, brief: input.brief || null, ref }, { onConflict: "email", ignoreDuplicates: true }).select("email");
  if (data?.length) {
    const { count } = await db().from("waitlist").select("*", { count: "exact", head: true });
    await notifyOwner("🙌 Nouvel inscrit Vigenia", `Une personne de plus sur la liste d'attente${count ? ` (${count} au total)` : ""}.`);
    await sendEmail(
      input.email,
      `Ta place est réservée sur ${site.name}`,
      `Merci ! Tu fais partie des premiers inscrits sur ${site.name}.\n\nOn t'écrit dès l'ouverture.\n\nÀ très vite,\nL'équipe ${site.name}`,
    );
  }
  return noContent();
});
