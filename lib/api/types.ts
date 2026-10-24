// Contrat d'API entre le frontend et le backend.
// Toute réponse JSON du backend doit respecter ces types (dates en ISO 8601, montants en centimes).
// Voir docs/BACKEND.md pour la liste des routes.

import type { StorePlan } from "@/lib/store-schema";

export type ApiError = { error: { code: string; message: string; field?: string } };

export type PlanId = "free" | "pro" | "agency";

export type User = {
  id: string;
  email: string;
  firstName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  plan: PlanId;
  createdAt: string;
  isOwner?: boolean; // fondateur de Vigenia : accès au tableau de bord des ventes
};

export type Usage = {
  conversations: { used: number; limit: number };
  images: { used: number; limit: number };
  stores: { used: number; limit: number };
  resetsAt: string;
  // Budget d'IA du client : une recharge toutes les quelques heures (session) et une limite par semaine (24 h de pause).
  aiBudget: {
    spentEur: number; limitEur: number; blockedUntil: string | null; resetsAt: string | null;
    session: { spentEur: number; limitEur: number; hours: number; resetsAt: string | null; blockedUntil: string | null };
  };
};

export type ShopConnection = {
  id: string;
  shopDomain: string; // ex. "ma-boutique.myshopify.com"
  shopName: string;
  status: "active" | "uninstalled" | "error";
  connectedAt: string;
};

export type CreationMode = "start" | "link" | "recraft";

export type StoreStatus = "generating" | "locked" | "ready" | "publishing" | "published" | "failed";

// Aperçu gratuit d'une boutique (sans abonnement) : vrai nom, vraies couleurs, vraie accroche, le reste flouté.
export type StoreTeaser = {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  productTitle: string;
  price: string;
  benefits: { title: string; text: string }[];
  image: string | null;
};

export type StoreTheme = {
  colors: { primary: string; accent: string; background: string };
  headingFont: string;
  bodyFont: string;
  heroLayout?: "left" | "right" | "center"; // varie d'une boutique à l'autre
};

export type Store = {
  id: string;
  name: string;
  niche: string;
  language: string;
  mode: CreationMode;
  status: StoreStatus;
  shopConnectionId: string | null;
  theme: StoreTheme;
  plan: StorePlan | null; // null tant que la génération n'est pas terminée
  teaser?: StoreTeaser | null;
  previewUrl: string | null; // aperçu Shopify (thème non publié) quand disponible
  liveUrl: string | null;
  // Thème Vigenia dans Shopify : installé automatiquement, ou à importer à la main (appli sans dérogation thèmes).
  themeStatus?: "installed" | "manual" | null;
  createdAt: string;
  updatedAt: string;
};

export type JobStepKey = "strategy" | "brand" | "pages" | "product" | "images" | "theme" | "publish";

export type Job = {
  id: string;
  storeId: string;
  kind: "generate" | "publish" | "image" | "recraft";
  status: "queued" | "running" | "succeeded" | "failed";
  progress: number; // 0 à 100
  steps: { key: JobStepKey; label: string; status: "pending" | "running" | "done" | "failed" }[];
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
};

export type ChatChange = { path: string; label: string; before: string; after: string };

export type ChatMessage = {
  id: string;
  storeId: string;
  role: "user" | "assistant";
  content: string;
  changes: ChatChange[]; // modifications appliquées à la boutique par ce message
  createdAt: string;
};

export type StoreVersion = { id: string; storeId: string; label: string; createdAt: string };

export type Asset = {
  id: string;
  storeId: string;
  kind: "product" | "lifestyle" | "banner" | "logo" | "upload";
  url: string;
  width: number;
  height: number;
  prompt: string | null;
  slot?: string | null; // emplacement dans la boutique : packshot, detail, inuse, hero, moment1…3, story
  createdAt: string;
};

export type MetricsPoint = { date: string; sessions: number; orders: number; revenue: number; conversionRate: number };

export type StoreMetrics = {
  range: "7d" | "30d" | "90d";
  totals: { sessions: number; orders: number; revenue: number; conversionRate: number; averageOrderValue: number };
  previous: { sessions: number; orders: number; revenue: number; conversionRate: number; averageOrderValue: number };
  series: MetricsPoint[];
};

export type Recommendation = {
  id: string;
  storeId: string;
  title: string;
  rationale: string;
  area: "copy" | "offer" | "product-page" | "trust" | "seo" | "speed";
  expectedImpact: "low" | "medium" | "high";
  status: "proposed" | "applied" | "dismissed";
  createdAt: string;
};

export type Insight = { storeId: string; summary: string; createdAt: string };

export type Subscription = {
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled";
  interval: "month" | "year" | null;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
  amount?: number | null; // montant réellement payé par période, en centimes (offre de lancement comprise)
  currency?: string; // EUR, ou USD si la boutique paie Shopify en dollars
};

export type Invoice = { id: string; number: string; amount: number; currency: string; status: "paid" | "open" | "void"; pdfUrl: string; createdAt: string };

export type Affiliate = {
  code: string;
  link: string;
  commissionRate: number; // ex. 0.3 pour 30 %
  stats: { clicks: number; signups: number; paidCustomers: number; earned: number; pending: number };
  payoutEmail: string | null;
};

export type GenerateStoreInput = {
  mode: CreationMode;
  brief: string;
  productUrl?: string;
  // Captures d'écran de la page produit (images en data URL, 3 maximum), si le lien ne se lit pas.
  screenshots?: string[];
  language: string;
  shopConnectionId?: string;
};

// Tableau de bord du fondateur (montants en centimes d'euro).
export type OwnerPeriod = { visits: number; revenue: number; sales: number; newSubs: number; cancels: number; waitlist: number; accounts: number; stores: number };
export type OwnerStats = {
  mrr: number;
  arr: number;
  subscribers: { total: number; starter: number; pro: number };
  arpu: number; // revenu mensuel moyen par abonné (centimes)
  churn: number; // part des abonnés partis sur 30 jours (0 à 1)
  conversion: number; // abonnés payants / comptes créés (0 à 1)
  hours: { hour: number; revenue: number; signups: number; visits: number }[];
  liveNow: number; // visiteurs sur le site dans les 2 dernières minutes
  totals: { waitlist: number; accounts: number };
  periods: { today: OwnerPeriod; week: OwnerPeriod; month: OwnerPeriod };
  series: { day: string; revenue: number; signups: number; visits: number }[];
  sources: { ref: string; count: number }[];
  affiliates: { code: string; name: string; clicks: number; signups: number; customers: number; commission: number; rate: number }[];
  shopifyAffiliation: { configured: boolean; trials: number; paid: number; pending: number; approved: number; currency: string; recent: { label: string; state: string | null; payout: number; at: string | null }[] };
  funnel: { step: string; count: number }[];
  signups: { email: string; kind: "waitlist" | "account"; ref: string | null; at: string; shop?: { domain: string; plan: string | null } | null; offer?: { endsAt: string; reminderAt: string | null; lastCallAt: string | null; subscribedAt: string | null; amount: number | null } }[];
  errors: { day: number; month: number; recent: { path: string; status: number; message: string | null; at: string }[] };
  recent: { kind: "new" | "payment" | "cancel"; plan: string | null; amount: number; email: string | null; at: string }[];
};
