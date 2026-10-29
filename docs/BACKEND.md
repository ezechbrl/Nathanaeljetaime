# Back-end : référence

**Statut : toutes les routes ci-dessous sont implémentées** dans `app/api/**` (logique dans `lib/server/**`).
Pour l'activer : remplis les clés (`docs/CLES-ET-COMPTES.md`), exécute `supabase/migrations/0001_init.sql`,
puis passe `NEXT_PUBLIC_API_MODE=live`. En `mock`, le frontend utilise des données simulées.

Choix techniques : Supabase (Postgres + Auth + Storage) ; tâches longues exécutées après la réponse avec
`after()` de Next.js (`maxDuration` 300 s), progression enregistrée dans la table `jobs` et suivie par le frontend ;
tâche quotidienne via Vercel Cron (`vercel.json` → `/api/cron/daily`) ; limitation de débit en base (`hit_rate_limit`).
Thème Shopify : la v1 crée produit, prix, images, pages et mise en vente, mais ne modifie pas le thème (l'écriture
de fichiers de thème par une app publique demande une autorisation spéciale de Shopify).

- **Contrat exact des données** : `lib/api/types.ts` (source de vérité, à respecter au champ près).
- **Appels côté frontend** : `lib/api/client.ts` (chaque fonction = une route).
- **Données simulées** : `lib/api/mock.ts` (montre le comportement attendu de chaque route).

---

## 0. Stack recommandée

| Besoin | Recommandation | Pourquoi |
|---|---|---|
| Serveur | Routes API Next.js (`app/api/**/route.ts`) dans ce même dépôt | Un seul déploiement Vercel, pas de CORS |
| Base de données + auth | **Supabase** (Postgres + Auth + Storage) | Auth e-mail/Google incluse, RLS, stockage d'images |
| ORM | Drizzle ou Prisma | Migrations versionnées |
| Tâches longues | **Inngest** ou **Trigger.dev** | Une génération dure 1 à 3 min, plus que la limite d'une fonction Vercel |
| IA texte | API Claude (`@anthropic-ai/sdk`, déjà en place dans `lib/generate-store.ts`) | Sorties structurées validées par Zod |
| IA images | Un fournisseur d'images (ex. fal.ai, Replicate, OpenAI Images) | Visuels produit et bannières |
| Paiement | **Shopify Billing API** (appSubscriptionCreate, voir `lib/server/shopify-billing.ts`) | Obligatoire pour une app de l'App Store Shopify |
| E-mails | Resend (+ React Email) | Vérification, mot de passe oublié, notifications |
| Limitation de débit | Upstash Redis (`@upstash/ratelimit`) | Protéger les routes IA et publiques |
| Suivi d'erreurs | Sentry | |
| Analytics produit | PostHog | Entonnoir inscription → boutique générée → publiée |

---

## 1. Variables d'environnement

```
# App
NEXT_PUBLIC_APP_URL=https://ton-domaine.com
NEXT_PUBLIC_API_MODE=live            # mock | live
SESSION_SECRET=                      # si auth maison
ENCRYPTION_KEY=                      # 32 octets base64, pour chiffrer les tokens Shopify

# Base de données / auth
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# IA
ANTHROPIC_API_KEY=
IMAGE_API_KEY=

# Shopify (app publique, créée dans le Partner Dashboard)
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_SCOPES=read_products,write_products,read_content,write_content,read_online_store_pages,write_online_store_pages,read_files,write_files,read_online_store_navigation,write_online_store_navigation,read_orders,read_reports,read_analytics
SHOPIFY_API_VERSION=2025-10

# Notifications téléphone (app ntfy) : ventes, désabonnements, inscrits, avis
NTFY_TOPIC=

# Tâches, e-mails, sécurité
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
```

---

## 2. Base de données

Tables minimales (Postgres). Toutes les tables ont `id uuid pk`, `created_at`, `updated_at`.
Active la RLS Supabase : un utilisateur ne voit que ses lignes (`user_id = auth.uid()`).

| Table | Colonnes principales |
|---|---|
| `users` | email (unique), first_name, avatar_url, email_verified, plan (`free`/`pro`/`agency`), stripe_customer_id, referred_by_affiliate_id |
| `shop_connections` | user_id, shop_domain (unique par user), shop_name, access_token_encrypted, scopes, status (`active`/`uninstalled`/`error`), installed_at, uninstalled_at |
| `stores` | user_id, shop_connection_id (nullable), name, niche, language, mode (`start`/`link`/`recraft`), status, theme (jsonb), plan (jsonb = `StorePlan`), source_url, shopify_theme_id, shopify_product_ids (jsonb), preview_url, live_url |
| `store_versions` | store_id, label, snapshot (jsonb : theme + plan) → pour annuler une modification |
| `jobs` | store_id, user_id, kind, status, progress, steps (jsonb), error, input (jsonb), finished_at |
| `chat_messages` | store_id, role, content, changes (jsonb), tokens_in, tokens_out |
| `assets` | store_id, kind, storage_path, url, width, height, prompt, shopify_file_id |
| `recommendations` | store_id, title, rationale, area, expected_impact, status, patch (jsonb : ce qu'il faut modifier si appliqué), applied_at |
| `insights` | store_id, summary (texte de « l'avis de l'IA » du jour) |
| `metrics_daily` | store_id, date, sessions, orders, revenue_cents, conversion_rate (unique store_id+date) |
| `usage` | user_id, period_start, conversations_used, images_used, stores_used |
| `subscriptions` | user_id, stripe_subscription_id, plan, status, interval, current_period_end, cancel_at_period_end |
| `affiliates` | user_id, code (unique), commission_rate, payout_email |
| `affiliate_events` | affiliate_id, kind (`click`/`signup`/`payment`), amount_cents, referred_user_id |
| `contact_messages` | name, email, topic, message, ip_hash |
| `webhook_events` | source (`shopify`/`stripe`), external_id (unique), payload, processed_at → idempotence |

---

## 3. Authentification (implémentée)

Pas de mot de passe : **Shopify**, **Google** ou **lien magique par e-mail**, et la boutique Shopify est obligatoire (Google et e-mail redirigent vers `/connecter-shopify`).

| Route | Rôle |
|---|---|
| `GET /api/shopify/install?shop=…&next=…` | Démarre l'OAuth Shopify. Sert à se connecter (sans compte) **et** à relier une boutique |
| `GET /api/shopify/callback` | Vérifie HMAC + state, récupère le token, puis : utilisateur déjà connecté → relie la boutique ; sinon propriétaire existant de la boutique → ouvre sa session ; sinon crée le compte avec l'e-mail de la boutique (session via lien magique généré côté serveur). Si l'e-mail appartient déjà à un autre compte non relié, refus (`/connexion?error=compte-existant`) |
| `GET /api/auth/google?next=…` | OAuth Google via Supabase |
| `POST /api/auth/email` | `{email, next}` → envoie un lien magique (Supabase `signInWithOtp`), 204 ; 5/h par IP |
| `GET /api/auth/callback` | Retour Google ou lien e-mail ; sans boutique active → `/connecter-shopify` |
| `POST /api/auth/logout` | Déconnexion |
| `GET /api/me` · `PATCH /api/me` · `DELETE /api/me` | Profil, quotas, suppression complète (RGPD) |

## 4. Connexion Shopify (app publique)

1. Crée une app dans le **Shopify Partner Dashboard** (app publique, « distribution personnalisée » au début, App Store ensuite).
2. URL de redirection : `https://ton-domaine.com/api/shopify/callback`.

| Route | Rôle |
|---|---|
| `GET /api/shopify/install?shop=xxx.myshopify.com` | Valide le domaine (`^[a-z0-9-]+\.myshopify\.com$`), crée un `state` aléatoire en cookie, redirige vers `https://{shop}/admin/oauth/authorize?client_id&scope&redirect_uri&state` |
| `GET /api/shopify/callback` | Vérifie le **HMAC** et le `state`, échange le `code` contre un access token, **chiffre** le token (AES-256-GCM avec `ENCRYPTION_KEY`), enregistre `shop_connections`, enregistre les webhooks, redirige vers `/app/parametres?shopify=connected` |
| `GET /api/shopify/connections` | `{ connections: ShopConnection[] }` |
| `DELETE /api/shopify/connections/:id` | Révoque (`DELETE /admin/api_permissions/current.json`) et marque `uninstalled` |

**Webhooks obligatoires** (vérifier `X-Shopify-Hmac-Sha256` sur le corps brut, répondre `200` vite, idempotence via `webhook_events`) :

- `app/uninstalled` → `POST /api/webhooks/shopify/app-uninstalled` : statut `uninstalled`, supprimer le token.
- `customers/data_request`, `customers/redact`, `shop/redact` (RGPD, obligatoires pour l'App Store) → `POST /api/webhooks/shopify/gdpr`.

**Ce que la publication fait sur Shopify** (Admin GraphQL API) :

| Étape | Mutation |
|---|---|
| Thème | `themeCreate` (à partir d'un thème de base type Dawn en zip hébergé) puis `themeFilesUpsert` pour `config/settings_data.json` (couleurs, polices) et `templates/index.json`, `templates/product.json` (sections) |
| Images | `stagedUploadsCreate` → upload → `fileCreate` |
| Produits | `productSet` (titre, description HTML, SEO, variantes, prix, prix barré, médias, tags) |
| Collection | `collectionCreate` + `collectionAddProducts` |
| Pages | `pageCreate` (À propos, FAQ, Livraison, Contact) |
| Menus | `menuCreate` / `menuUpdate` (menu principal + pied de page) |
| Publication | `publishablePublish` sur la boutique en ligne ; le thème est publié seulement si l'utilisateur clique « Publier » (`themePublish`) |

Le prototype déjà fait (`lib/shopify.ts`) couvre produit + prix + page avec un token fixe : à reprendre avec le token de la connexion.

---

## 5. Boutiques et génération IA

### Routes

| Route | Entrée | Sortie |
|---|---|---|
| `GET /api/stores` | – | `{ stores: Store[] }` (triées par `updatedAt` desc) |
| `POST /api/stores` | `GenerateStoreInput` | `{ store: Store, job: Job }` — crée la boutique en `generating` et lance la tâche. Vérifie le quota `usage.stores` (`402` si dépassé) |
| `GET /api/stores/:id` | – | `{ store: Store, activeJob: Job \| null }` (`activeJob` = génération ou publication en cours) |
| `PATCH /api/stores/:id` | `{ name?, theme?, plan? }` (édition manuelle) | `{ store: Store }` + crée une `store_version` |
| `DELETE /api/stores/:id` | – | `204` (ne supprime rien sur Shopify) |
| `POST /api/stores/:id/publish` | `{ publishTheme: boolean }` | `{ job: Job }` |
| `GET /api/stores/:id/versions` | – | `{ versions: StoreVersion[] }` |
| `POST /api/stores/:id/versions/:versionId/restore` | – | `{ store: Store }` |
| `GET /api/jobs/:id` | – | `{ job: Job }` — le frontend interroge toutes les 2 s tant que `queued`/`running` |

### Pipeline d'une génération (tâche Inngest/Trigger.dev)

Étapes, dans cet ordre, en mettant à jour `jobs.steps` et `jobs.progress` après chacune :

1. `strategy` — marché, persona, promesse, offres, objections (Claude, sortie structurée).
2. `brand` — nom, slogan, ton, couleurs, polices.
3. `pages` — page d'accueil (sections), FAQ, À propos, livraison/retours.
4. `product` — fiche produit complète + SEO + prix conseillé.
5. `images` — visuels produit/bannière (fournisseur d'images), stockés dans Supabase Storage → `assets`.
6. `theme` — calcul des réglages du thème.
7. Fin : `stores.plan` rempli, statut `ready`, `store_versions` « Version initiale ».

Modes :
- `start` : brief seul.
- `link` : récupérer la page produit (`lib/fetch-product-page.ts` déjà fait, avec protection SSRF) et l'injecter comme données.
- `recraft` : lire la boutique Shopify connectée (produits, pages, thème actif) via GraphQL, puis générer une version améliorée.

Le schéma de sortie IA est `StorePlanSchema` dans `lib/store-schema.ts` (déjà utilisé par `lib/generate-store.ts`).
En cas d'échec : statut `failed`, message lisible dans `job.error`, ne pas décompter le quota.

---

## 6. Éditeur par chat (AI Builder)

| Route | Entrée | Sortie |
|---|---|---|
| `GET /api/stores/:id/messages` | `?before=<id>` (pagination, 50 max) | `{ messages: ChatMessage[] }` |
| `POST /api/stores/:id/messages` | `{ content: string }` | `{ userMessage, assistantMessage, store }` |

Fonctionnement : envoyer à Claude le `plan` actuel + l'historique + la demande, avec un outil
`apply_changes` qui renvoie une liste de modifications (`path` dans le plan, nouvelle valeur).
Valider le plan modifié avec `StorePlanSchema`, enregistrer, créer une `store_version`,
renvoyer les `changes` (le frontend les affiche sous le message). Décompte `usage.conversations`.
Optionnel plus tard : streaming SSE de la réponse.

---

## 7. Studio images et bibliothèque

| Route | Entrée | Sortie |
|---|---|---|
| `GET /api/stores/:id/assets` | – | `{ assets: Asset[] }` |
| `POST /api/stores/:id/assets/generate` | `{ prompt, kind, sourceAssetId?, aspectRatio: "1:1" \| "4:5" \| "16:9" }` | `{ job: Job }` → à la fin, l'asset apparaît dans la liste. Décompte `usage.images` |
| `POST /api/stores/:id/assets/upload` | `multipart/form-data` (`file`, image ≤ 10 Mo, png/jpg/webp) | `{ asset: Asset }` |
| `DELETE /api/assets/:id` | – | `204` |

---

## 8. Pilotage et optimisation quotidienne

| Route | Entrée | Sortie |
|---|---|---|
| `GET /api/stores/:id/metrics` | `?range=7d\|30d\|90d` | `StoreMetrics` |
| `GET /api/stores/:id/recommendations` | – | `{ recommendations: Recommendation[], insight: Insight \| null }` |
| `POST /api/recommendations/:id/apply` | – | `{ recommendation, store }` (applique `patch`, crée une version, republie la partie concernée sur Shopify) |
| `POST /api/recommendations/:id/dismiss` | – | `{ recommendation }` |

Tâche planifiée **une fois par jour par boutique publiée** :
1. Lire les stats Shopify de la veille (ShopifyQL : sessions, commandes, CA) → `metrics_daily`.
2. Envoyer à Claude : le plan de la boutique + 30 jours de stats → 1 `insight` + 3 à 5 `recommendations` avec leur `patch`.
3. E-mail récapitulatif hebdomadaire (optionnel).

---

## 9. Abonnement, quotas et facturation

Offres affichées dans le frontend (`lib/content/pricing.ts`) : Découverte (gratuit), Pro, Agence, en mensuel et annuel.

| Route | Entrée | Sortie |
|---|---|---|
| `GET /api/billing` | – | `{ subscription: Subscription, usage: Usage, invoices: Invoice[] }` |
| `GET /api/billing?sync=1` | – | idem, après relecture de l'abonnement chez Shopify |
| `POST /api/billing/checkout` | – | `{ url }` : page d'offres hébergée par Shopify |
| `POST /api/billing/portal` | – | `{ url }` : même page (changer d'offre, revenir à Découverte) |
| `GET /api/billing/shopify/return?shop=…` | « Welcome link » Shopify | relit l'abonnement puis redirige vers `/app/abonnement` |
| `POST /api/waitlist` | `{ email, brief? }` | `204` (liste d'attente, 5/h par IP) |
| `POST /api/webhooks/stripe` (public, signature vérifiée) | événements Stripe | `200` |

Événements Stripe à traiter : `checkout.session.completed`, `customer.subscription.created/updated/deleted`,
`invoice.paid`, `invoice.payment_failed` → mettre à jour `subscriptions` et `users.plan`, et créditer l'affilié.

Quotas par offre (à ajuster) :

| | Découverte | Pro | Agence |
|---|---|---|---|
| Boutiques | 1 | illimitées | illimitées |
| Conversations IA / mois | 20 | 200 | 800 |
| Crédit IA (toutes les 5 h / par semaine) | 0,50 € / 1 € | 1 € / 3 € | 3 € / 12 € |
| Images / mois | 10 | 200 | 1 000 |
| Boutiques Shopify connectées | 1 | 3 | 10 |

Dépassement → `402` avec `error.code = "quota_exceeded"` (le frontend affiche la modale « Passer à Pro »).

---

## 9 bis. Crédit d'IA par client (comme Claude)

Deux limites par offre, réglables dans `AI_LIMITS` (`lib/server/budget.ts`) : Découverte 0,50 € / 5 h et 1 € / semaine, Pro 1 € et 3 €, Agence 3 € et 12 €.
- **Crédit de session** : `SESSION_AI_BUDGET_EUR` (1 €) par tranche de `SESSION_HOURS` (5 h). La tranche démarre à la
  première demande ; une fois le crédit épuisé, l'IA attend la fin de la tranche (`429 ai_session_blocked`), puis se recharge.
- **Limite de la semaine** : `WEEKLY_AI_BUDGET_EUR` (3 €) sur 7 jours glissants ; une fois atteinte, pause de 24 h
  (`429 ai_budget_blocked`), puis remise à zéro.

Le coût réel de chaque appel est calculé à partir de l'usage renvoyé par l'API Claude et débité des deux compteurs
(`ai_budget_add`) ; la vérification se fait avant chaque action (`ai_budget_check`). Concernés : génération, chat,
application de recommandations. La tâche quotidienne ne s'arrête que si la limite de la semaine est atteinte.
Migrations : `0002_ai_budget.sql` puis `0003_ai_session_limit.sql`.

## 10. Affiliation

| Route | Entrée | Sortie |
|---|---|---|
| `GET /api/affiliate` | – | `{ affiliate: Affiliate \| null }` |
| `POST /api/affiliate/join` | `{ payoutEmail }` | `{ affiliate: Affiliate }` |
| `PATCH /api/affiliate` | `{ payoutEmail }` | `{ affiliate: Affiliate }` |
| `GET /r/:code` (public) | – | pose un cookie `ref` 60 jours, compte un clic, redirige vers `/` |

Commission : 30 % récurrents pendant 12 mois sur les paiements des filleuls (à ajuster dans `lib/content/affiliate.ts`).
Paiement des commissions : manuel au début (export mensuel), ou Stripe Connect / Rewardful.

---

## 11. Routes publiques du site

| Route | Entrée | Sortie |
|---|---|---|
| `POST /api/contact` | `{ name, email, topic, message, website }` (`website` = champ piège anti-bot, doit être vide) | `204` → e-mail à l'équipe via Resend. Limite 3 / heure / IP |
| `POST /api/newsletter` | `{ email }` | `204` |
| `POST /api/tools/:tool` | voir ci-dessous | `{ result }` |

Outils gratuits (page `/outils`), sans compte, limités à 5 appels / jour / IP :

| `:tool` | Entrée | Sortie `result` |
|---|---|---|
| `product-description` | `{ productName, details, language }` | `{ html: string }` |
| `store-name` | `{ niche, vibe, language }` | `{ names: string[] }` |
| `slogan` | `{ brandName, niche, language }` | `{ slogans: string[] }` |
| `faq` | `{ productName, details, language }` | `{ items: { question, answer }[] }` |

---

## 12. Format des erreurs

Toujours : `{ "error": { "code": "...", "message": "Message lisible en français", "field": "email" } }`

| HTTP | `code` | Quand |
|---|---|---|
| 400 | `invalid_input` | validation Zod (renseigner `field`) |
| 401 | `unauthenticated` | pas de session |
| 402 | `quota_exceeded` | quota de l'offre atteint |
| 403 | `forbidden` | ressource d'un autre utilisateur |
| 404 | `not_found` | |
| 409 | `conflict` | e-mail déjà utilisé, boutique déjà en génération |
| 422 | `generation_failed` | l'IA a refusé ou renvoyé un résultat incomplet |
| 429 | `rate_limited` | trop de requêtes |
| 502 | `upstream_error` | Shopify, Stripe ou l'IA indisponible |

---

## 13. Sécurité (à ne pas oublier)

- Tokens Shopify chiffrés en base, jamais renvoyés au frontend.
- Vérification HMAC de **tous** les webhooks Shopify et de la signature Stripe, sur le corps brut.
- Toutes les requêtes vérifient que la ressource appartient à l'utilisateur (RLS + contrôle dans la route).
- Limitation de débit sur l'auth, les routes IA et les routes publiques.
- Protection SSRF sur l'import de lien produit (déjà dans `lib/fetch-product-page.ts`).
- Le HTML généré par l'IA est nettoyé avant d'être envoyé à Shopify (balises autorisées seulement).
- Ne jamais logger les tokens, mots de passe ou clés.

## 14. RGPD et légal

- Pages légales à rédiger (le frontend a les pages, le texte est à fournir) : mentions légales, confidentialité, CGV, CGU, conditions d'affiliation.
- Export et suppression des données d'un utilisateur (`DELETE /api/me`).
- Webhooks RGPD Shopify (section 4).
- Bandeau cookies si tu ajoutes PostHog/analytics non exemptés.

## 15. Déploiement

- Vercel : les routes IA longues ne doivent **pas** attendre la fin de la génération ; elles créent un job et répondent tout de suite.
- Domaine personnalisé + `NEXT_PUBLIC_APP_URL`.
- Webhooks Stripe et Shopify pointés vers le domaine de production.
- Sauvegardes quotidiennes de la base (incluses avec Supabase Pro).

---

## Ordre conseillé

1. Base de données + auth (`/api/auth/*`, `/api/me`) → le frontend peut passer `live` pour la connexion.
2. Connexion Shopify (OAuth + webhooks).
3. `POST /api/stores` + jobs + pipeline de génération (modes `start` puis `link`).
4. Publication sur Shopify.
5. Éditeur par chat + versions.
6. Stripe + quotas.
7. Studio images.
8. Optimisation quotidienne.
9. Affiliation, contact, outils gratuits.
10. Mode `recraft`.
