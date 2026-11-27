import { NextResponse } from "next/server";
import { quizPhotoMap } from "@/lib/server/quiz-photos";

// Photos des univers et produits du quiz (publiques), gardées en cache 10 minutes.
export async function GET() {
  const map = await quizPhotoMap().catch(() => ({}));
  return NextResponse.json(map, { headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" } });
}
