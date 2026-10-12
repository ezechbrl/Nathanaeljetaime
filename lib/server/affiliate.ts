import "server-only";
import type { Affiliate } from "@/lib/api/types";
import { env } from "./env";
import { db, must } from "./supabase";

export async function affiliateFor(userId: string): Promise<Affiliate | null> {
  const a = must(await db().from("affiliates").select("*").eq("user_id", userId).maybeSingle()) as Record<string, any> | null;
  if (!a) return null;
  const events = must(await db().from("affiliate_events").select("kind, amount_cents, referred_user_id, created_at").eq("code", a.code)) as { kind: string; amount_cents: number; referred_user_id: string | null; created_at: string }[];
  const payments = events.filter((e) => e.kind === "payment");
  const validated = (e: { created_at: string }) => Date.now() - new Date(e.created_at).getTime() > 30 * 86_400_000;
  return {
    code: a.code,
    link: `${env.appUrl()}/r/${a.code}`,
    commissionRate: Number(a.commission_rate),
    payoutEmail: a.payout_email,
    stats: {
      clicks: events.filter((e) => e.kind === "click").length,
      signups: events.filter((e) => e.kind === "signup").length,
      paidCustomers: new Set(payments.map((e) => e.referred_user_id)).size,
      earned: payments.filter(validated).reduce((s, e) => s + Number(e.amount_cents), 0),
      pending: payments.filter((e) => !validated(e)).reduce((s, e) => s + Number(e.amount_cents), 0),
    },
  };
}
