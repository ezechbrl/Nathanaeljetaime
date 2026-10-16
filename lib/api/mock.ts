// Back-end simulé, utilisé quand NEXT_PUBLIC_API_MODE=mock.
// L'état est gardé en mémoire et dans le localStorage du navigateur : c'est une démo, pas une base de données.

import { samplePlan, seedAssets, seedMetrics, seedRecommendations, seedStores } from "./fixtures";
import type {
  Affiliate, Asset, ChatChange, ChatMessage, GenerateStoreInput, Invoice, Job, JobStepKey,
  Recommendation, ShopConnection, Store, StoreMetrics, StoreVersion, Subscription, Usage, User,
} from "./types";
import { ApiClientError } from "./errors";

type State = {
  user: User | null;
  stores: Store[];
  jobs: (Job & { startedAt: number; durationMs: number })[];
  messages: ChatMessage[];
  versions: (StoreVersion & { snapshot: Pick<Store, "theme" | "plan"> })[];
  assets: Asset[];
  recommendations: Recommendation[];
  connections: ShopConnection[];
  subscription: Subscription;
  affiliate: Affiliate | null;
  ai: { spent: number; windowStart: number; blockedUntil: number | null; sessionStart?: number | null; sessionSpent?: number }; // budget IA simulé (euros)
};

const KEY = "vitrio-mock-v2";
const iso = () => new Date().toISOString();
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const demoUser: User = {
  id: "user_demo",
  email: "demo@vitrio.ai",
  firstName: "Alex",
  avatarUrl: null,
  emailVerified: true,
  plan: "free",
  createdAt: new Date(Date.now() - 40 * 86_400_000).toISOString(),
};

function initialState(): State {
  return {
    user: demoUser,
    stores: clone(seedStores),
    jobs: [],
    messages: [],
    versions: seedStores.map((s) => ({ id: uid("ver"), storeId: s.id, label: "Version initiale", createdAt: s.createdAt, snapshot: { theme: s.theme, plan: s.plan } })),
    assets: seedStores.flatMap((s) => seedAssets(s.id)),
    recommendations: seedStores.flatMap((s) => seedRecommendations(s.id)),
    connections: [{ id: "conn_1", shopDomain: "oree-paris.myshopify.com", shopName: "Orée Paris", status: "active", connectedAt: seedStores[0].createdAt }],
    subscription: { plan: "free", status: "active", interval: null, renewsAt: null, cancelAtPeriodEnd: false },
    affiliate: null,
    ai: { spent: 0.3, windowStart: Date.now() - 2 * 86_400_000, blockedUntil: null },
  };
}

let state: State | null = null;

function load(): State {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    state = raw ? { ...initialState(), ...(JSON.parse(raw) as Partial<State>) } : initialState();
  } catch {
    state = initialState();
  }
  return state;
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible (navigation privée) : l'état reste en mémoire
  }
}

function notFound(): never {
  throw new ApiClientError(404, "not_found", "Introuvable.");
}

function requireUser(): User {
  const s = load();
  if (!s.user) throw new ApiClientError(401, "unauthenticated", "Connecte-toi pour continuer.");
  return s.user;
}

export const ok = async (ms = 300) => { await wait(ms); };

export function resetDemo() {
  state = initialState();
  save();
}

// Auth (démo) : Shopify crée le compte et relie la boutique ; Google crée le compte sans boutique.
export async function loginWithShopify(shop: string) {
  await wait(700);
  const s = load();
  const domain = shop.includes(".") ? shop : `${shop}.myshopify.com`;
  s.user = s.user ?? { ...demoUser, firstName: "Alex" };
  if (!s.connections.some((c) => c.shopDomain === domain && c.status === "active")) {
    s.connections.push({ id: uid("conn"), shopDomain: domain, shopName: domain.split(".")[0], status: "active", connectedAt: iso() });
  }
  save();
}
export async function loginWithGoogle() {
  await wait(500);
  const s = load();
  s.user = s.user ?? { ...demoUser, firstName: "Alex" };
  save();
}
export async function loginWithEmail(email: string) {
  await wait(700);
  const s = load();
  s.user = s.user ?? { ...demoUser, email, firstName: email.split("@")[0].replace(/[^a-z]/gi, " ").trim().split(" ")[0] || "toi" };
  save();
}
export async function logout() {
  await wait(200);
  const s = load();
  s.user = null;
  save();
}
// Mêmes règles que le serveur (lib/server/budget.ts) : crédit toutes les 5 h et limite par semaine, selon l'offre.
const AI_LIMITS = { free: { session: 0, week: 0 }, pro: { session: 1, week: 3 }, agency: { session: 3, week: 12 } } as const;
const limits = () => AI_LIMITS[load().subscription.plan];
const SESSION_MS = 5 * 3_600_000;
function aiStatus() {
  const s = load();
  const now = Date.now();
  if (s.ai.blockedUntil && s.ai.blockedUntil > now) return s.ai;
  if (s.ai.blockedUntil || s.ai.windowStart < now - 7 * 86_400_000) s.ai = { spent: 0, windowStart: now, blockedUntil: null, sessionStart: null, sessionSpent: 0 };
  if (s.ai.sessionStart && s.ai.sessionStart + SESSION_MS <= now) { s.ai.sessionStart = null; s.ai.sessionSpent = 0; }
  return s.ai;
}
const waitText = (until: number) => {
  const min = Math.max(1, Math.ceil((until - Date.now()) / 60_000));
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, "0")}` : ""}`;
};
function assertAi() {
  if (load().subscription.plan === "free") throw new ApiClientError(402, "subscription_required", "Active Vitrio Pro pour utiliser l'IA : 31 € par mois, sans engagement.");
  const a = aiStatus();
  const l = limits();
  const upsell = load().subscription.plan === "agency" ? "" : " Passe à l'offre supérieure pour plus d'IA.";
  const e = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: n % 1 ? 2 : 0 });
  if (a.blockedUntil) throw new ApiClientError(429, "ai_budget_blocked", `Tu as atteint ta limite d'IA de la semaine (${e(l.week)} €). Elle se débloque dans ${waitText(a.blockedUntil)}.${upsell}`);
  if (a.sessionStart && (a.sessionSpent ?? 0) >= l.session) {
    throw new ApiClientError(429, "ai_session_blocked", `Tu as utilisé ton crédit d'IA (${e(l.session)} €) pour ces 5 heures. Il se recharge dans ${waitText(a.sessionStart + SESSION_MS)}.${upsell}`);
  }
}
function chargeAi(eur: number) {
  const a = aiStatus();
  a.spent = +(a.spent + eur).toFixed(2);
  a.sessionStart = a.sessionStart ?? Date.now();
  a.sessionSpent = +((a.sessionSpent ?? 0) + eur).toFixed(2);
  if (a.spent >= limits().week) Object.assign(a, { blockedUntil: Date.now() + 86_400_000, spent: 0, sessionStart: null, sessionSpent: 0 });
  save();
}

export function usage(): Usage {
  const s = load();
  const quota = { free: [20, 10, 1], pro: [200, 200, 999], agency: [800, 1000, 999] }[s.subscription.plan];
  return {
    conversations: { used: s.messages.filter((m) => m.role === "user").length + 4, limit: quota[0] },
    images: { used: s.assets.filter((a) => a.prompt).length, limit: quota[1] },
    stores: { used: s.stores.length, limit: quota[2] },
    resetsAt: new Date(Date.now() + 12 * 86_400_000).toISOString(),
    aiBudget: (() => {
      const a = aiStatus();
      return {
        spentEur: a.blockedUntil ? limits().week : a.spent,
        limitEur: limits().week,
        blockedUntil: a.blockedUntil ? new Date(a.blockedUntil).toISOString() : null,
        resetsAt: new Date(a.blockedUntil ?? a.windowStart + 7 * 86_400_000).toISOString(),
        session: {
          spentEur: a.sessionStart ? a.sessionSpent ?? 0 : 0,
          limitEur: limits().session,
          hours: 5,
          resetsAt: a.sessionStart ? new Date(a.sessionStart + SESSION_MS).toISOString() : null,
          blockedUntil: a.sessionStart && (a.sessionSpent ?? 0) >= limits().session ? new Date(a.sessionStart + SESSION_MS).toISOString() : null,
        },
      };
    })(),
  };
}
export async function getMe() {
  await wait(150);
  return { user: requireUser(), usage: usage() };
}
export async function updateMe(input: Partial<User>) {
  await wait();
  const s = load();
  s.user = { ...requireUser(), ...input };
  save();
  return { user: s.user };
}

// Shopify
export async function listConnections() {
  await wait(200);
  return { connections: load().connections };
}
export async function connectShop(shop: string) {
  await wait(900);
  const s = load();
  const domain = shop.includes(".") ? shop : `${shop}.myshopify.com`;
  s.connections.push({ id: uid("conn"), shopDomain: domain, shopName: domain.split(".")[0], status: "active", connectedAt: iso() });
  save();
}
export async function disconnectShop(id: string) {
  await wait();
  const s = load();
  s.connections = s.connections.filter((c) => c.id !== id);
  save();
}

// Jobs : la progression est calculée à partir du temps écoulé.
const GENERATE_STEPS: { key: JobStepKey; label: string }[] = [
  { key: "strategy", label: "Analyse du marché et de la promesse" },
  { key: "brand", label: "Identité de marque" },
  { key: "pages", label: "Page d'accueil, FAQ et pages" },
  { key: "product", label: "Fiche produit et SEO" },
  { key: "images", label: "Visuels" },
  { key: "theme", label: "Réglages du thème" },
];

function newJob(storeId: string, kind: Job["kind"], steps: { key: JobStepKey; label: string }[], durationMs: number) {
  const job = {
    id: uid("job"), storeId, kind, status: "queued" as const, progress: 0,
    steps: steps.map((st) => ({ ...st, status: "pending" as const })),
    error: null, createdAt: iso(), finishedAt: null, startedAt: Date.now(), durationMs,
  };
  load().jobs.push(job);
  save();
  return job;
}

function tick(job: State["jobs"][number]): Job {
  const s = load();
  if (job.status === "succeeded" || job.status === "failed") return job;
  const p = Math.min(1, (Date.now() - job.startedAt) / job.durationMs);
  job.progress = Math.round(p * 100);
  job.status = p >= 1 ? "succeeded" : "running";
  const doneCount = Math.floor(p * job.steps.length);
  job.steps = job.steps.map((st, i) => ({ ...st, status: i < doneCount ? "done" : i === doneCount && p < 1 ? "running" : st.status === "done" ? "done" : p >= 1 ? "done" : "pending" }));
  if (job.status === "succeeded") {
    job.finishedAt = iso();
    const store = s.stores.find((x) => x.id === job.storeId);
    if (store && job.kind === "generate") {
      store.status = "ready";
      store.plan = { ...samplePlan(store.name, store.niche), brand: { ...samplePlan(store.name, store.niche).brand, colors: store.theme.colors } };
      store.updatedAt = iso();
      s.versions.push({ id: uid("ver"), storeId: store.id, label: "Version initiale", createdAt: iso(), snapshot: { theme: store.theme, plan: store.plan } });
      s.assets.push(...seedAssets(store.id));
      s.recommendations.push(...seedRecommendations(store.id));
    }
    if (store && job.kind === "publish") {
      store.status = "published";
      store.liveUrl = store.liveUrl ?? `https://${store.id}.example`;
      store.updatedAt = iso();
    }
    if (job.kind === "image") {
      s.assets.unshift({ ...seedAssets(job.storeId)[2], id: uid("asset"), prompt: "Image générée", createdAt: iso() });
    }
  }
  save();
  return job;
}

export async function getJob(id: string) {
  await wait(120);
  const job = load().jobs.find((j) => j.id === id) ?? notFound();
  return { job: clone(tick(job)) as Job };
}

// Boutiques
export async function listStores() {
  await wait(250);
  requireUser();
  const s = load();
  s.jobs.forEach(tick);
  return { stores: clone(s.stores).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) };
}

const ACCENTS = ["#c8506a", "#4b62c9", "#5f9e47", "#b9813f", "#8a4fb0", "#d9822b", "#0f8f86"];

const NAMES = ["Nova", "Maison Lune", "Atelier Brume", "Nordé", "Sable & Sel", "Kōra", "Ombre Douce", "Halo"];
function guessName(_brief: string, url?: string) {
  if (url) {
    const host = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
    return host.charAt(0).toUpperCase() + host.slice(1, 14);
  }
  return NAMES[load().stores.length % NAMES.length];
}

export async function createStore(input: GenerateStoreInput) {
  await wait(500);
  requireUser();
  const s = load();
  assertAi();
  chargeAi(0.4);
  const accent = ACCENTS[s.stores.length % ACCENTS.length];
  const store: Store = {
    id: uid("store"),
    name: guessName(input.brief, input.productUrl),
    niche: input.brief.slice(0, 60),
    language: input.language,
    mode: input.mode,
    status: "generating",
    shopConnectionId: input.shopConnectionId ?? s.connections[0]?.id ?? null,
    theme: { colors: { primary: "#1d1d22", accent, background: "#faf8f5" }, headingFont: "Instrument Serif", bodyFont: "DM Sans" },
    plan: null,
    previewUrl: null,
    liveUrl: null,
    createdAt: iso(),
    updatedAt: iso(),
  };
  s.stores.unshift(store);
  const job = newJob(store.id, "generate", GENERATE_STEPS, 14_000);
  save();
  return { store: clone(store), job: clone(job) as Job };
}

export async function getStore(id: string) {
  await wait(150);
  const s = load();
  s.jobs.filter((j) => j.storeId === id).forEach(tick);
  const store = s.stores.find((x) => x.id === id) ?? notFound();
  const active = [...s.jobs].reverse().find((j) => j.storeId === id && (j.kind === "generate" || j.kind === "publish") && (j.status === "queued" || j.status === "running"));
  return { store: clone(store), activeJob: active ? (clone(active) as Job) : null };
}

export async function updateStore(id: string, input: Partial<Pick<Store, "name" | "theme" | "plan">>) {
  await wait();
  const s = load();
  const store = s.stores.find((x) => x.id === id) ?? notFound();
  Object.assign(store, input, { updatedAt: iso() });
  s.versions.push({ id: uid("ver"), storeId: id, label: "Modification manuelle", createdAt: iso(), snapshot: { theme: store.theme, plan: store.plan } });
  save();
  return { store: clone(store) };
}

export async function deleteStore(id: string) {
  await wait();
  const s = load();
  s.stores = s.stores.filter((x) => x.id !== id);
  save();
}

export async function publishStore(id: string) {
  await wait(300);
  const s = load();
  const store = s.stores.find((x) => x.id === id) ?? notFound();
  if (!store.shopConnectionId && !s.connections.length) {
    throw new ApiClientError(409, "no_shop", "Connecte d'abord une boutique Shopify dans les paramètres.");
  }
  store.status = "publishing";
  const job = newJob(id, "publish", [
    { key: "product", label: "Produit, prix et images" },
    { key: "publish", label: "Mise en vente" },
    { key: "theme", label: "Installation du thème Vitrio" },
  ], 9_000);
  save();
  return { job: clone(job) as Job };
}

export async function listVersions(id: string) {
  await wait(150);
  return { versions: load().versions.filter((v) => v.storeId === id).map(({ snapshot: _snapshot, ...v }) => v).reverse() };
}

export async function restoreVersion(id: string, versionId: string) {
  await wait();
  const s = load();
  const store = s.stores.find((x) => x.id === id) ?? notFound();
  const v = s.versions.find((x) => x.id === versionId) ?? notFound();
  Object.assign(store, clone(v.snapshot), { updatedAt: iso() });
  save();
  return { store: clone(store) };
}

// Chat : règles simples qui imitent ce que fera l'IA.
export async function listMessages(storeId: string) {
  await wait(150);
  const s = load();
  const msgs = s.messages.filter((m) => m.storeId === storeId);
  if (!msgs.length) {
    const store = s.stores.find((x) => x.id === storeId);
    return {
      messages: [{
        id: "welcome", storeId, role: "assistant" as const, changes: [], createdAt: store?.createdAt ?? iso(),
        content: `Ta boutique ${store?.name ?? ""} est prête. Demande-moi n'importe quelle modification : un texte, une couleur, une offre, une section.`,
      }],
    };
  }
  return { messages: msgs };
}

export async function sendMessage(storeId: string, content: string) {
  await wait(1100);
  const s = load();
  const store = s.stores.find((x) => x.id === storeId) ?? notFound();
  if (!store.plan) throw new ApiClientError(409, "conflict", "La boutique est encore en cours de génération.");
  assertAi();
  chargeAi(0.07);
  const plan = store.plan;
  const t = content.toLowerCase();
  const changes: ChatChange[] = [];
  let reply = "C'est noté. Je n'ai rien modifié pour l'instant : peux-tu préciser la section concernée (accueil, fiche produit, FAQ) ?";

  if (/couleur|color/.test(t)) {
    const before = store.theme.colors.accent;
    const after = ACCENTS[(ACCENTS.indexOf(before) + 1) % ACCENTS.length];
    store.theme = { ...store.theme, colors: { ...store.theme.colors, accent: after } };
    plan.brand.colors.accent = after;
    changes.push({ path: "theme.colors.accent", label: "Couleur principale", before, after });
    reply = "J'ai changé la couleur principale. Elle s'applique aux boutons, aux liens et aux badges.";
  } else if (/bundle|lot|offre/.test(t)) {
    const before = plan.strategy.offers.join(" · ");
    if (!plan.strategy.offers.some((o) => /lot de 3/i.test(o))) plan.strategy.offers.push("Lot de 3 à −20 %");
    changes.push({ path: "strategy.offers", label: "Offres", before, after: plan.strategy.offers.join(" · ") });
    reply = "J'ai ajouté le lot de 3 à −20 % sous le prix de la fiche produit. C'est l'offre qui fait le plus monter le panier moyen sur ce type de produit.";
  } else if (/premium|luxe|haut de gamme/.test(t)) {
    const before = plan.homepage.heroTitle;
    plan.homepage.heroTitle = "L'essentiel, rien de plus.";
    plan.homepage.heroSubtitle = "Une formule courte, une fabrication soignée, un rituel qui dure.";
    changes.push({ path: "homepage.heroTitle", label: "Titre d'accueil", before, after: plan.homepage.heroTitle });
    reply = "J'ai réécrit l'accroche avec un ton plus sobre et plus premium. Les phrases sont plus courtes et il n'y a plus de superlatifs.";
  } else if (/titre|court/.test(t)) {
    const before = plan.product.title;
    plan.product.title = plan.product.title.split("—")[0].trim();
    changes.push({ path: "product.title", label: "Titre produit", before, after: plan.product.title });
    reply = "Titre produit raccourci : il tient maintenant sur une ligne sur mobile.";
  } else if (/faq|question/.test(t)) {
    const q = { question: "Combien de temps dure un stick ?", answer: "Environ 3 mois en usage quotidien." };
    plan.faq.push(q);
    changes.push({ path: "faq", label: "FAQ", before: `${plan.faq.length - 1} questions`, after: `${plan.faq.length} questions` });
    reply = "J'ai ajouté une question sur la durée d'utilisation, l'une des plus fréquentes avant achat.";
  }

  store.updatedAt = iso();
  const userMessage: ChatMessage = { id: uid("msg"), storeId, role: "user", content, changes: [], createdAt: iso() };
  const assistantMessage: ChatMessage = { id: uid("msg"), storeId, role: "assistant", content: reply, changes, createdAt: iso() };
  if (!s.messages.some((m) => m.storeId === storeId)) {
    s.messages.push({ id: uid("msg"), storeId, role: "assistant", changes: [], createdAt: store.createdAt, content: `Ta boutique ${store.name} est prête. Demande-moi n'importe quelle modification : un texte, une couleur, une offre, une section.` });
  }
  s.messages.push(userMessage, assistantMessage);
  if (changes.length) s.versions.push({ id: uid("ver"), storeId, label: changes.map((c) => c.label).join(", "), createdAt: iso(), snapshot: clone({ theme: store.theme, plan }) });
  save();
  return { userMessage, assistantMessage, store: clone(store) };
}

// Images
export async function listAssets(storeId: string) {
  await wait(200);
  const s = load();
  s.jobs.filter((j) => j.storeId === storeId && j.kind === "image").forEach(tick);
  return { assets: clone(s.assets.filter((a) => a.storeId === storeId)) };
}
export async function generateAsset(storeId: string, _input: { prompt: string }) {
  await wait(300);
  const job = newJob(storeId, "image", [{ key: "images", label: "Génération de l'image" }], 5_000);
  return { job: clone(job) as Job };
}
export async function regenerateImages(storeId: string) {
  await wait(300);
  const job = newJob(storeId, "image", [{ key: "images", label: "Nouvelles photos de la boutique" }], 6_000);
  return { job: clone(job) as Job };
}
export async function uploadAsset(storeId: string, file: File) {
  const url = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const asset: Asset = { id: uid("asset"), storeId, kind: "upload", url, width: 0, height: 0, prompt: null, createdAt: iso() };
  load().assets.unshift(asset);
  save();
  return { asset };
}
export async function deleteAsset(id: string) {
  await wait(200);
  const s = load();
  s.assets = s.assets.filter((a) => a.id !== id);
  save();
}

// Pilotage
export async function getMetrics(storeId: string, range: StoreMetrics["range"]) {
  await wait(250);
  const store = load().stores.find((x) => x.id === storeId);
  return seedMetrics(store?.status === "published" ? storeId : "none", range);
}
export async function listRecommendations(storeId: string) {
  await wait(250);
  const s = load();
  const store = s.stores.find((x) => x.id === storeId);
  return {
    recommendations: clone(s.recommendations.filter((r) => r.storeId === storeId)),
    insight: store?.status === "published"
      ? { storeId, createdAt: iso(), summary: "Ta fiche produit convertit bien sur ordinateur (4,1 %) mais deux fois moins sur mobile, qui représente 68 % des visites. La priorité de la semaine : rendre le bouton d'achat visible sans défiler." }
      : null,
  };
}
export async function setRecommendation(id: string, status: Recommendation["status"]) {
  await wait(400);
  const s = load();
  const r = s.recommendations.find((x) => x.id === id) ?? notFound();
  if (status === "applied") {
    assertAi();
    chargeAi(0.07);
  }
  r.status = status;
  save();
  const store = s.stores.find((x) => x.id === r.storeId) ?? notFound();
  return { recommendation: clone(r), store: clone(store) };
}

// Facturation
export async function getBilling() {
  await wait(250);
  const s = load();
  const invoices: Invoice[] = s.subscription.plan === "free" ? [] : [
    { id: "inv_1", number: "SHP-0001", amount: s.subscription.plan === "pro" ? 3100 : 14900, currency: "EUR", status: "paid", pdfUrl: "#", createdAt: iso() },
  ];
  return { subscription: clone(s.subscription), usage: usage(), invoices };
}
export async function checkout(plan: "pro" | "agency") {
  await wait(700);
  const s = load();
  s.subscription = { plan, status: "active", interval: "month", renewsAt: new Date(Date.now() + 30 * 86_400_000).toISOString(), cancelAtPeriodEnd: false };
  if (s.user) s.user.plan = plan;
  save();
  return { url: "/app?checkout=success" };
}

// Affiliation
export async function getAffiliate() {
  await wait(200);
  return { affiliate: clone(load().affiliate) };
}
export async function joinAffiliate(payoutEmail: string) {
  await wait(500);
  const s = load();
  const code = (s.user?.firstName ?? "ami").toLowerCase().replace(/[^a-z]/g, "") + "30";
  s.affiliate = {
    code,
    link: `${typeof window !== "undefined" ? window.location.origin : ""}/r/${code}`,
    commissionRate: 0.3,
    stats: { clicks: 0, signups: 0, paidCustomers: 0, earned: 0, pending: 0 },
    payoutEmail,
  };
  save();
  return { affiliate: clone(s.affiliate) };
}

// Outils gratuits
export async function runTool<T>(tool: string, input: Record<string, string>): Promise<{ result: T }> {
  await wait(900);
  const name = input.productName || input.brandName || input.niche || "ton produit";
  const results: Record<string, unknown> = {
    "product-description": {
      html: `<p><strong>${name}</strong> : ${input.details || "un produit pensé pour le quotidien"}.</p><ul><li>Conçu pour durer</li><li>Livré en 48 h</li><li>Satisfait ou remboursé 30 jours</li></ul>`,
    },
    "store-name": { names: ["Maison Lune", "Atelier Brume", "Nordé", "Sable & Sel", "Kōra", "Ombre Douce"] },
    slogan: { slogans: [`${name}, tout simplement.`, `Le quotidien, en mieux.`, `Fait pour durer.`, `Moins, mais mieux.`] },
    faq: {
      items: [
        { question: `Comment utiliser ${name} ?`, answer: "Une application par jour suffit." },
        { question: "Quels sont les délais de livraison ?", answer: "48 à 72 h en France métropolitaine." },
        { question: "Puis-je le retourner ?", answer: "Oui, pendant 30 jours." },
      ],
    },
  };
  if (!(tool in results)) throw new ApiClientError(404, "not_found", "Outil inconnu.");
  return { result: results[tool] as T };
}
