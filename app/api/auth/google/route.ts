import { NextResponse } from "next/server";
import { env } from "@/lib/server/env";
import { route } from "@/lib/server/http";
import { authClient } from "@/lib/server/supabase";

export const GET = route(async (req) => {
  const params = new URL(req.url).searchParams;
  const ref = params.get("ref");
  const nextParam = params.get("next") ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";
  const supa = await authClient();
  const { data, error } = await supa.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${env.appUrl()}/api/auth/callback?next=${encodeURIComponent(next)}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}` },
  });
  if (error || !data.url) return NextResponse.redirect(`${env.appUrl()}/connexion?error=google`);
  return NextResponse.redirect(data.url);
});
