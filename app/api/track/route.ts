import { z } from "zod";
import { noContent, route } from "@/lib/server/http";
import { db } from "@/lib/server/supabase";

// Mesure d'audience anonyme : chaque onglet ouvert envoie son identifiant de session (aléatoire,
// gardé le temps de la visite seulement) toutes les 30 s. Sert aux chiffres « en ce moment » et « visites ».
const Ping = z.object({ sid: z.string().regex(/^[a-z0-9]{16,40}$/), path: z.string().max(200) });
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor/i;

export const POST = route(async (req) => {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return noContent();
  const { sid, path } = Ping.parse(await req.json().catch(() => ({})));
  await db().from("site_sessions").upsert({ id: sid, path: path.split("?")[0], last_seen: new Date().toISOString() }, { onConflict: "id" });
  return noContent();
});
