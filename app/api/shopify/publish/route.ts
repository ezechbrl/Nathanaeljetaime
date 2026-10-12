import { NextResponse } from "next/server";
import { publishStorePlan } from "@/lib/shopify";
import { StorePlanSchema } from "@/lib/store-schema";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { plan?: unknown } | null;
  const parsed = StorePlanSchema.safeParse(body?.plan);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan de boutique invalide" }, { status: 400 });
  }
  try {
    const result = await publishStorePlan(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
