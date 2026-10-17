import { z } from "zod";
import { UnreadablePageError } from "@/lib/fetch-product-page";
import { cachedProductPage } from "@/lib/server/link-cache";
import { requireUser } from "@/lib/server/auth";
import { body, json, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";

export const maxDuration = 90;

// Vérifie un lien produit dès qu'il est collé : aperçu (titre, photo) si la page se lit,
// sinon on demande tout de suite des captures, avant de lancer une génération qui échouerait.
export const POST = route(async (req) => {
  const user = await requireUser();
  const { url } = await body(req, z.object({ url: z.string().trim().url() }));
  await rateLimit(`link-check:${user.id}`, 20, 600);
  try {
    const page = await cachedProductPage(url);
    return json({ ok: true, title: page.title, image: page.images[0] ?? null });
  } catch (e) {
    const reason = e instanceof UnreadablePageError ? e.message : "La page n'a pas pu être lue.";
    return json({ ok: false, reason, protectedSite: /aliexpress|amazon|temu|alibaba/i.test(url) });
  }
});
