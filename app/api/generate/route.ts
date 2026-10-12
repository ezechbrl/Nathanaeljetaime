import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { fetchProductPageText } from "@/lib/fetch-product-page";
import { GenerationError, generateStorePlan } from "@/lib/generate-store";
import { GenerateRequestSchema } from "@/lib/store-schema";

export const maxDuration = 300;

export async function POST(req: Request) {
  const parsed = GenerateRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }
  const { brief, productUrl, language } = parsed.data;

  let productPageText: string | undefined;
  if (productUrl) {
    try {
      productPageText = await fetchProductPageText(productUrl);
    } catch (e) {
      return NextResponse.json(
        { error: `Impossible de lire le lien produit : ${(e as Error).message}` },
        { status: 400 },
      );
    }
  }

  try {
    const plan = await generateStorePlan({ brief, language, productPageText });
    return NextResponse.json({ plan });
  } catch (e) {
    if (e instanceof GenerationError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Trop de demandes, réessaie dans un instant." }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      console.error("Anthropic API error", e.status, e.message);
      return NextResponse.json({ error: "Le service IA est indisponible." }, { status: 502 });
    }
    throw e;
  }
}
