import "server-only";
import type { StorePlan } from "@/lib/store-schema";
import type { Asset, ChatMessage, Job, Recommendation, ShopConnection, Store, StoreTheme, User } from "@/lib/api/types";
import type { StoreRow, UserRow } from "./auth";

// Conversion des lignes de la base vers les types du contrat d'API (lib/api/types.ts).

export const toUser = (u: UserRow & { email_verified?: boolean }): User => ({
  id: u.id,
  email: u.email,
  firstName: u.first_name,
  avatarUrl: u.avatar_url,
  emailVerified: u.email_verified ?? true,
  plan: u.plan,
  createdAt: u.created_at,
});

const DEFAULT_THEME: StoreTheme = { colors: { primary: "#1d1d22", accent: "#0f8f86", background: "#faf8f5" }, headingFont: "Instrument Serif", bodyFont: "DM Sans" };

export const toStore = (s: StoreRow): Store => ({
  id: s.id,
  name: s.name,
  niche: s.niche,
  language: s.language,
  mode: s.mode,
  status: s.status,
  shopConnectionId: s.shop_connection_id,
  theme: { ...DEFAULT_THEME, ...(s.theme as Partial<StoreTheme>) },
  plan: (s.plan as StorePlan | null) ?? null,
  previewUrl: s.preview_url,
  liveUrl: s.live_url,
  createdAt: s.created_at,
  updatedAt: s.updated_at,
});

export const toJob = (j: Record<string, any>): Job => ({
  id: j.id,
  storeId: j.store_id,
  kind: j.kind,
  status: j.status,
  progress: j.progress,
  steps: j.steps ?? [],
  error: j.error,
  createdAt: j.created_at,
  finishedAt: j.finished_at,
});

export const toConnection = (c: Record<string, any>): ShopConnection => ({
  id: c.id,
  shopDomain: c.shop_domain,
  shopName: c.shop_name,
  status: c.status,
  connectedAt: c.created_at,
});

export const toMessage = (m: Record<string, any>): ChatMessage => ({
  id: m.id,
  storeId: m.store_id,
  role: m.role,
  content: m.content,
  changes: m.changes ?? [],
  createdAt: m.created_at,
});

export const toAsset = (a: Record<string, any>): Asset => ({
  id: a.id,
  storeId: a.store_id,
  kind: a.kind,
  url: a.url,
  width: a.width,
  height: a.height,
  prompt: a.prompt,
  createdAt: a.created_at,
});

export const toRecommendation = (r: Record<string, any>): Recommendation => ({
  id: r.id,
  storeId: r.store_id,
  title: r.title,
  rationale: r.rationale,
  area: r.area,
  expectedImpact: r.expected_impact,
  status: r.status,
  createdAt: r.created_at,
});
