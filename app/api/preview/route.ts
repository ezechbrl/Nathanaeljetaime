import { after } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createHash } from "node:crypto";
import { badRequest, body, clientIp, json, route } from "@/lib/server/http";
import { randomToken } from "@/lib/server/crypto";
import { storeImage } from "@/lib/server/images";
import { runAnonymousPreview } from "@/lib/server/jobs";
import { rateLimit } from "@/lib/server/quota";
import { db, must } from "@/lib/server/supabase";

export const maxDuration = 120; // l'aperçu se prépare après la réponse (after)

// Aperçu de boutique sans compte, depuis la page d'accueil. Coût : moins d'un centime (modèle le moins
// cher + lecture du lien). Limité par visiteur et par jour pour éviter les abus.
const Input = z.object({
  mode: z.enum(["start", "link"]),
  brief: z.string().trim().max(4000).default(""),
  productUrl: z.string().trim().url("Lien invalide.").optional(),
  screenshots: z.array(z.string().regex(/^data:image\/(jpeg|png|webp);base64,/, "Image invalide.").max(3_000_000, "Image trop lourde.")).max(3).optional(),
  language: z.string().trim().min(2).max(40).default("français"),
});

export const POST = route(async (req) => {
  const input = await body(req, Input);
  if (input.mode === "link" && !input.productUrl && !input.screenshots?.length) throw badRequest("Colle le lien de la page produit, ou ajoute une photo du produit.", "productUrl");
  if (input.mode === "start" && input.brief.length < 3 && !input.screenshots?.length) throw badRequest("Décris ton produit en une phrase.", "brief");
  const visitor = createHash("sha256").update(`vigenia-preview:${clientIp(req)}`).digest("hex").slice(0, 32);
  await rateLimit(`preview:h:${visitor}`, 4, 3600);
  await rateLimit(`preview:d:${visitor}`, 10, 86_400);
  await rateLimit("preview:all", 500, 86_400);

  const token = randomToken(24);
  const brief = input.brief || (input.mode === "link" ? "Boutique à partir du lien produit" : "Boutique à partir de la photo du produit");
  const row = must(await db().from("previews").insert({
    claim_token: token, visitor, mode: input.mode, brief, source_url: input.productUrl ?? null, language: input.language,
  }).select("id").single()) as { id: string };
  const screenshots: string[] = [];
  for (const shot of input.screenshots ?? []) {
    const [head, b64] = shot.split(",");
    const type = head.match(/^data:(image\/[a-z]+);/)![1];
    screenshots.push((await storeImage(`previews/${row.id}`, Buffer.from(b64, "base64"), type, "source")).url);
  }
  // Le jeton prouve plus tard que l'aperçu appartient bien à ce visiteur (rattachement à son compte).
  (await cookies()).set(`vg_pv_${row.id}`, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 86_400 });
  after(() => runAnonymousPreview(row.id, { mode: input.mode, sourceUrl: input.productUrl ?? null, brief, language: input.language, screenshots }));
  return json({ id: row.id }, 201);
});
