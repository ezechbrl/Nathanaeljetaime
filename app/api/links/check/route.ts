import { z } from "zod";
import { UnreadablePageError } from "@/lib/fetch-product-page";
import { cachedProductPage } from "@/lib/server/link-cache";
import { requireUser } from "@/lib/server/auth";
import { body, clientIp, json, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";

export const maxDuration = 90;

// Vérifie un lien produit dès qu'il est collé : aperçu (titre, photo) si la page se lit,
// sinon on demande tout de suite des captures, avant de lancer une génération qui échouerait.
export const POST = route(async (req) => {
  // Aussi depuis la page d'accueil, sans compte : limité par adresse IP (lecture ≈ 0,5 centime).
  const user = await requireUser().catch(() => null);
  const { url } = await body(req, z.object({ url: z.string().trim().url() }));
  if (user) await rateLimit(`link-check:${user.id}`, 20, 600);
  else {
    await rateLimit(`link-check-ip:${clientIp(req)}`, 6, 3600);
    await rateLimit("link-check-anon", 300, 86_400);
  }
  try {
    const page = await cachedProductPage(url);
    return json({ ok: true, title: page.title, image: page.images[0] ?? null });
  } catch (e) {
    const reason = e instanceof UnreadablePageError ? e.message : "La page n'a pas pu être lue.";
    return json({ ok: false, reason, protectedSite: /aliexpress|amazon|temu|alibaba/i.test(url) });
  }
});
