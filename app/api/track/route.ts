import { z } from "zod";
import { noContent, route } from "@/lib/server/http";
import { authClient, db } from "@/lib/server/supabase";

// Mesure d'audience anonyme : chaque onglet ouvert envoie son identifiant de session (aléatoire,
// gardé le temps de la visite seulement) toutes les 30 s. Sert aux chiffres « en ce moment », « visites » et audience.
const Ping = z.object({ sid: z.string().regex(/^[a-z0-9]{16,40}$/), vid: z.string().regex(/^[a-z0-9]{16,40}$/).optional(), path: z.string().max(200), src: z.string().max(300).optional() });
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|inspection|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget|python|axios|node-fetch/i;

// Origine lisible : « tiktok », « google », « instagram », un code d'affilié, ou « direct ».
function sourceOf(src: string) {
  if (!src) return "direct";
  let host = src;
  try { host = new URL(src).hostname; } catch { return src.toLowerCase().slice(0, 40); }
  host = host.replace(/^www\.|^m\.|^l\.|^lm\./, "");
  const known: [RegExp, string][] = [[/tiktok/, "tiktok"], [/instagram/, "instagram"], [/facebook|fb\./, "facebook"], [/youtube|youtu\.be/, "youtube"], [/google/, "google"], [/bing/, "bing"], [/snapchat/, "snapchat"], [/(^|\.)t\.co$|twitter|x\.com/, "x"], [/linkedin/, "linkedin"], [/shopify/, "shopify"], [/vigenia/, "direct"]];
  return known.find(([r]) => r.test(host))?.[1] ?? host.slice(0, 40);
}

// Visiteur connecté : sa visite (et celles d'avant l'inscription, même navigateur) est reliée à son compte.
// On ne lit la session de connexion que si son cookie est là, et une seule fois par visite.
async function linkUser(req: Request, sid: string, vid?: string) {
  if (!/auth-token/.test(req.headers.get("cookie") ?? "")) return;
  try {
    const { data } = await (await authClient()).auth.getUser();
    const id = data.user?.id;
    if (!id) return;
    await db().from("site_sessions").update({ user_id: id }).eq("id", sid);
    if (vid) await db().from("site_sessions").update({ user_id: id }).eq("visitor", vid).is("user_id", null);
  } catch {
    // mesure d'audience : jamais bloquante
  }
}

export const POST = route(async (req) => {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return noContent();
  const { sid, vid, path, src } = Ping.parse(await req.json().catch(() => ({})));
  const page = path.split("?")[0];
  const now = new Date().toISOString();
  const { data: row } = await db().from("site_sessions").select("path, pages, user_id").eq("id", sid).maybeSingle();
  if (row) {
    await db().from("site_sessions").update({ last_seen: now, ...(row.path !== page && { path: page, pages: (row.pages ?? 1) + 1 }) }).eq("id", sid);
    if (!row.user_id) await linkUser(req, sid, vid);
    return noContent();
  }
  const source = sourceOf(src ?? "");
  await db().from("site_sessions").upsert({
    id: sid, path: page, entry: page, last_seen: now, source,
    device: /iPad|Tablet/i.test(ua) ? "tablette" : /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "ordinateur",
    country: req.headers.get("x-vercel-ip-country") ?? null,
    // Pas des vrais visiteurs : passages depuis l'admin Shopify (évaluateurs, aperçus) et navigateurs automatisés.
    excluded: source === "shopify" || /shopify/i.test(ua),
    visitor: vid ?? null,
  }, { onConflict: "id", ignoreDuplicates: true }); // deux premiers pings simultanés : une seule ligne
  await linkUser(req, sid, vid);
  return noContent();
});
