import { z } from "zod";
import { isTool, runTool } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { body, clientIp, json, notFound, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";

export const maxDuration = 60;

export const POST = route<{ params: Promise<{ tool: string }> }>(async (req, { params }) => {
  const { tool } = await params;
  if (!isTool(tool)) throw notFound();
  // Visiteurs du site : 5 essais par jour. Abonnés (outils dans l'app) : 60 par jour.
  const user = await requireUser().catch(() => null);
  if (user && user.plan !== "free") await rateLimit(`tools-user:${user.id}`, 60, 86_400);
  else await rateLimit(`tools:${clientIp(req)}`, 5, 86_400);
  const input = await body(req, z.record(z.string(), z.string().max(1000)));
  return json({ result: await runTool(tool, input) });
});
