import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeEqual } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { route } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/quota";
import { exchangeCode, registerUninstallWebhook, sealTokens, SHOP_RE, shopInfo, verifyQueryHmac } from "@/lib/server/shopify";
import { authClient, db, must } from "@/lib/server/supabase";

// Ouvre une session Supabase pour un utilisateur donné, côté serveur (lien magique à usage unique).
async function signInAs(email: string) {
  const { data, error } = await db().auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.hashed_token) throw new Error(`Connexion impossible : ${error?.message}`);
  const supa = await authClient();
  const { error: e2 } = await supa.auth.verifyOtp({ type: "magiclink", token_hash: data.properties.hashed_token });
  if (e2) throw new Error(`Connexion impossible : ${e2.message}`);
}

export const GET = route(async (req) => {
  const params = new URL(req.url).searchParams;
  const jar = await cookies();
  const app = env.appUrl();
  const fail = (reason: string) => NextResponse.redirect(`${app}/connexion?error=${reason}`);
  const shop = params.get("shop") ?? "";
  const state = jar.get("shopify_state")?.value ?? "";
  const next = jar.get("shopify_next")?.value ?? "/app";
  if (!SHOP_RE.test(shop) || !verifyQueryHmac(params)) return fail("signature");
  // Jeton de sécurité absent ou différent (lien trop ancien, autre onglet, autre adresse du site) :
  // la demande vient bien de Shopify (signature vérifiée), on relance simplement la connexion, sans erreur.
  // Une seule relance automatique (cookie « shopify_retry ») pour ne jamais tourner en boucle si les cookies sont bloqués.
  if (!state || !safeEqual(state, params.get("state") ?? "")) {
    if (jar.get("shopify_retry")) return fail("session");
    return NextResponse.redirect(`${app}/api/shopify/install?shop=${encodeURIComponent(shop)}&next=${encodeURIComponent(next)}&retry=1`);
  }

  const tokens = await exchangeCode(shop, params.get("code") ?? "");
  const { access_token, scope } = tokens;
  const info = await shopInfo(shop, access_token);

  // 1. Déjà connecté (ex. via Google) : on relie la boutique à ce compte.
  const supa = await authClient();
  let userId = (await supa.auth.getUser()).data.user?.id ?? null;

  // 2. Sinon : le compte qui possède déjà cette boutique, ou un nouveau compte.
  if (!userId) {
    const owner = must(await db().from("shop_connections").select("user_id, users(email)").eq("shop_domain", shop).order("updated_at", { ascending: false }).limit(1).maybeSingle()) as { user_id: string; users: { email: string } } | null;
    if (owner) {
      await signInAs(owner.users.email);
      userId = owner.user_id;
    } else {
      const firstName = info.shopOwnerName?.split(" ")[0] ?? "";
      const ref = jar.get("ref")?.value;
      const { data, error } = await db().auth.admin.createUser({ email: info.email, email_confirm: true, user_metadata: { first_name: firstName, ref } });
      // L'e-mail de la boutique correspond à un compte existant non relié à cette boutique :
      // on ne l'ouvre pas automatiquement (l'e-mail d'une boutique n'est pas vérifié par nous).
      if (error) return fail("compte-existant");
      userId = data.user.id;
      await db().from("users").upsert({ id: userId, email: info.email, first_name: firstName, referred_by: ref ?? null });
      if (ref) await db().from("affiliate_events").insert({ code: ref, kind: "signup", referred_user_id: userId });
      await signInAs(info.email);
    }
  }

  const user = must(await db().from("users").select("plan").eq("id", userId).maybeSingle()) as { plan: keyof typeof LIMITS } | null;
  const { count } = await db().from("shop_connections").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active").neq("shop_domain", shop);
  if ((count ?? 0) >= LIMITS[user?.plan ?? "free"].shops) return NextResponse.redirect(`${app}/app/abonnement?raison=boutiques`);

  await db().from("shop_connections").upsert(
    { user_id: userId, shop_domain: shop, shop_name: info.name, shopify_plan: info.planName, access_token_encrypted: sealTokens(tokens), scopes: scope, status: "active", updated_at: new Date().toISOString() },
    { onConflict: "user_id,shop_domain" },
  );
  await registerUninstallWebhook(shop, access_token).catch((e) => console.warn("Webhook de désinstallation non enregistré :", (e as Error).message));
  const res = NextResponse.redirect(`${app}${next}`);
  res.cookies.delete("shopify_state");
  res.cookies.delete("shopify_next");
  return res;
});
