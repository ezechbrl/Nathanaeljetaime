import { z } from "zod";
import { isTool, runTool } from "@/lib/server/ai";
import { body, clientIp, json, notFound, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";

export const maxDuration = 60;

export const POST = route<{ params: Promise<{ tool: string }> }>(async (req, { params }) => {
  const { tool } = await params;
  if (!isTool(tool)) throw notFound();
  await rateLimit(`tools:${clientIp(req)}`, 5, 86_400);
  const input = await body(req, z.record(z.string(), z.string().max(1000)));
  return json({ result: await runTool(tool, input) });
});
