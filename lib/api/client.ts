// Fonctions d'appel au back-end. Une fonction = une route de docs/BACKEND.md.
// En mode "mock" (par défaut tant que le back-end n'existe pas), tout passe par lib/api/mock.ts.

import { ApiClientError } from "./errors";
import * as mock from "./mock";
import type {
  Affiliate, ApiError, Asset, ChatMessage, GenerateStoreInput, Insight, Invoice, Job,
  Recommendation, ShopConnection, Store, StoreMetrics, StoreVersion, Subscription, Usage, User,
} from "./types";

export const API_MODE = (process.env.NEXT_PUBLIC_API_MODE ?? "mock") as "mock" | "live";

export { ApiClientError };

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(path, {
    credentials: "include",
    ...rest,
    headers: { ...(json !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as T | ApiError | null;
  if (!res.ok) {
    const err = (body as ApiError | null)?.error;
    const fallback = res.status === 504 ? "Le serveur a mis trop de temps à répondre. Réessaie dans un instant." : `Une erreur est survenue (code ${res.status}).`;
    throw new ApiClientError(res.status, err?.code ?? "unknown", err?.message ?? fallback, err?.field);
  }
  return body as T;
}

const live = API_MODE === "live";

// Auth et compte : connexion uniquement via Shopify ou Google.
export const shopifyLoginUrl = (shop: string, next = "/app") => `/api/shopify/install?shop=${encodeURIComponent(shop)}&next=${encodeURIComponent(next)}`;
export const googleAuthUrl = (next = "/app", ref?: string) =>
  live ? `/api/auth/google?next=${encodeURIComponent(next)}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}` : `/connecter-shopify?next=${encodeURIComponent(next)}&demo=google`;
// En mode démo, « se connecter avec Shopify » crée directement la session.
export const loginWithShopify = (shop: string, next = "/app") =>
  live ? Promise.resolve(void (window.location.href = shopifyLoginUrl(shop, next))) : mock.loginWithShopify(shop).then(() => void (window.location.href = next));
export const loginWithGoogleDemo = () => mock.loginWithGoogle();
// Lien de connexion par e-mail. En démo, la session est créée directement.
export const sendEmailLink = (email: string, next = "/app") =>
  live ? request<void>("/api/auth/email", { method: "POST", json: { email, next } }) : mock.loginWithEmail(email);
export const logout = () => (live ? request<void>("/api/auth/logout", { method: "POST" }) : mock.logout());
export const getMe = () => (live ? request<{ user: User; usage: Usage }>("/api/me") : mock.getMe());
export const updateMe = (input: Partial<Pick<User, "firstName" | "email" | "avatarUrl">>) =>
  live ? request<{ user: User }>("/api/me", { method: "PATCH", json: input }) : mock.updateMe(input);
export const deleteAccount = () =>
  live ? request<void>("/api/me", { method: "DELETE", json: { confirm: "SUPPRIMER" } }) : mock.ok();

// Shopify
export const listConnections = () =>
  live ? request<{ connections: ShopConnection[] }>("/api/shopify/connections") : mock.listConnections();
export const connectShop = (shop: string, next = "/app/parametres#shopify") => (live ? Promise.resolve(void (window.location.href = shopifyLoginUrl(shop, next))) : mock.connectShop(shop));
export const disconnectShop = (id: string) =>
  live ? request<void>(`/api/shopify/connections/${id}`, { method: "DELETE" }) : mock.disconnectShop(id);

// Boutiques
export const listStores = () => (live ? request<{ stores: Store[] }>("/api/stores") : mock.listStores());
export const createStore = (input: GenerateStoreInput) =>
  live ? request<{ store: Store; job: Job }>("/api/stores", { method: "POST", json: input }) : mock.createStore(input);
export const getStore = (id: string) => (live ? request<{ store: Store; activeJob: Job | null; lastError?: string | null }>(`/api/stores/${id}`) : mock.getStore(id));
export const updateStore = (id: string, input: Partial<Pick<Store, "name" | "theme" | "plan">>) =>
  live ? request<{ store: Store }>(`/api/stores/${id}`, { method: "PATCH", json: input }) : mock.updateStore(id, input);
export const deleteStore = (id: string) => (live ? request<void>(`/api/stores/${id}`, { method: "DELETE" }) : mock.deleteStore(id));
export const publishStore = (id: string, publishTheme: boolean) =>
  live ? request<{ job: Job }>(`/api/stores/${id}/publish`, { method: "POST", json: { publishTheme } }) : mock.publishStore(id);
export const listVersions = (id: string) =>
  live ? request<{ versions: StoreVersion[] }>(`/api/stores/${id}/versions`) : mock.listVersions(id);
export const restoreVersion = (id: string, versionId: string) =>
  live ? request<{ store: Store }>(`/api/stores/${id}/versions/${versionId}/restore`, { method: "POST" }) : mock.restoreVersion(id, versionId);
export const getJob = (id: string) => (live ? request<{ job: Job }>(`/api/jobs/${id}`) : mock.getJob(id));

// Chat
export const listMessages = (storeId: string) =>
  live ? request<{ messages: ChatMessage[] }>(`/api/stores/${storeId}/messages`) : mock.listMessages(storeId);
export const sendMessage = (storeId: string, content: string) =>
  live
    ? request<{ userMessage: ChatMessage; assistantMessage: ChatMessage; store: Store }>(`/api/stores/${storeId}/messages`, { method: "POST", json: { content } })
    : mock.sendMessage(storeId, content);

// Images
export const listAssets = (storeId: string) =>
  live ? request<{ assets: Asset[] }>(`/api/stores/${storeId}/assets`) : mock.listAssets(storeId);
export const generateAsset = (storeId: string, input: { prompt: string; kind: Asset["kind"]; aspectRatio: "1:1" | "4:5" | "16:9" }) =>
  live ? request<{ job: Job }>(`/api/stores/${storeId}/assets/generate`, { method: "POST", json: input }) : mock.generateAsset(storeId, input);
export const regenerateImages = (storeId: string) =>
  live ? request<{ job: Job }>(`/api/stores/${storeId}/assets/regenerate`, { method: "POST" }) : mock.regenerateImages(storeId);
export const uploadAsset = (storeId: string, file: File) => {
  if (!live) return mock.uploadAsset(storeId, file);
  const form = new FormData();
  form.append("file", file);
  return request<{ asset: Asset }>(`/api/stores/${storeId}/assets/upload`, { method: "POST", body: form });
};
export const deleteAsset = (id: string) => (live ? request<void>(`/api/assets/${id}`, { method: "DELETE" }) : mock.deleteAsset(id));

// Pilotage
export const getMetrics = (storeId: string, range: StoreMetrics["range"]) =>
  live ? request<StoreMetrics>(`/api/stores/${storeId}/metrics?range=${range}`) : mock.getMetrics(storeId, range);
export const listRecommendations = (storeId: string) =>
  live
    ? request<{ recommendations: Recommendation[]; insight: Insight | null }>(`/api/stores/${storeId}/recommendations`)
    : mock.listRecommendations(storeId);
export const applyRecommendation = (id: string) =>
  live ? request<{ recommendation: Recommendation; store: Store }>(`/api/recommendations/${id}/apply`, { method: "POST" }) : mock.setRecommendation(id, "applied");
export const dismissRecommendation = (id: string) =>
  live ? request<{ recommendation: Recommendation }>(`/api/recommendations/${id}/dismiss`, { method: "POST" }) : mock.setRecommendation(id, "dismissed");

// Facturation
export const getBilling = (sync = false) =>
  live ? request<{ subscription: Subscription; usage: Usage; invoices: Invoice[] }>(`/api/billing${sync ? "?sync=1" : ""}`) : mock.getBilling();
export const startCheckout = (plan: "pro" | "agency", interval: "month" | "year") =>
  live ? request<{ url: string }>("/api/billing/checkout", { method: "POST", json: { plan, interval } }) : mock.checkout(plan);
export const openBillingPortal = () => (live ? request<{ url: string }>("/api/billing/portal", { method: "POST" }) : Promise.resolve({ url: "/app/abonnement" }));

// Affiliation
export const getAffiliate = () => (live ? request<{ affiliate: Affiliate | null }>("/api/affiliate") : mock.getAffiliate());
export const joinAffiliate = (payoutEmail: string) =>
  live ? request<{ affiliate: Affiliate }>("/api/affiliate/join", { method: "POST", json: { payoutEmail } }) : mock.joinAffiliate(payoutEmail);

// Public
export const sendContact = (input: { name: string; email: string; topic: string; message: string; website: string }) =>
  live ? request<void>("/api/contact", { method: "POST", json: input }) : mock.ok(600);
export const joinWaitlist = (email: string, brief?: string) =>
  live ? request<void>("/api/waitlist", { method: "POST", json: { email, brief } }) : mock.ok(500);

export const subscribeNewsletter = (email: string) =>
  live ? request<void>("/api/newsletter", { method: "POST", json: { email } }) : mock.ok(400);
export function runTool<T>(tool: string, input: Record<string, string>): Promise<{ result: T }> {
  return live ? request<{ result: T }>(`/api/tools/${tool}`, { method: "POST", json: input }) : mock.runTool<T>(tool, input);
}
