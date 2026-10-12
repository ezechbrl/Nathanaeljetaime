# Les clés à récupérer (et où les trouver)

C'est moi qui code le back-end. Toi, tu crées les comptes et tu copies les clés dans Vercel.
Il y en a **5 obligatoires** et **2 pour plus tard**.

**Où les coller :** Vercel → ton projet → **Settings** → **Environment Variables** → ajoute chaque nom/valeur
(coche Production, Preview et Development), puis **Deployments** → « Redeploy ».

> Ne colle jamais ces clés dans le chat, dans un message ou dans le code. Seulement dans Vercel.
> Celles qui commencent par `NEXT_PUBLIC_` sont visibles côté navigateur (c'est normal) ; toutes les autres sont secrètes.

---

## 1. Supabase (base de données + connexion des utilisateurs) — obligatoire

1. Va sur **https://supabase.com** → « Start your project » → connecte-toi avec GitHub.
2. **New project** : nom `shopora`, mot de passe de base de données (garde-le), région **Europe (Paris ou Frankfurt)**.
3. Attends 2 minutes que le projet soit prêt.
4. Clique sur le bouton **Connect** en haut de la page du projet (ou **Project Settings → API Keys / Data API**) :

| Variable Vercel | Où la trouver dans Supabase |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → **Data API** → « Project URL » (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → **API Keys** → clé **anon / publishable** |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → **API Keys** → clé **service_role / secret** (clique « Reveal ») |
| `DATABASE_URL` | Bouton **Connect** → onglet « Connection string » → **Transaction pooler** → remplace `[YOUR-PASSWORD]` par ton mot de passe de l'étape 2 |

5. **Authentication → URL Configuration** :
   - Site URL : `https://ton-domaine.vercel.app` (ton adresse Vercel)
   - Redirect URLs : ajoute `https://ton-domaine.vercel.app/**` et `http://localhost:3000/**`

### Connexion avec Google (optionnel mais conseillé)

1. **https://console.cloud.google.com** → crée un projet → « APIs & Services » → **OAuth consent screen** (type External, remplis nom + e-mail).
2. « Credentials » → **Create credentials → OAuth client ID** → type « Web application ».
3. Dans « Authorized redirect URIs », colle l'URL de rappel que Supabase t'affiche dans
   **Authentication → Sign In / Providers → Google** (elle ressemble à `https://xxxx.supabase.co/auth/v1/callback`).
4. Copie le **Client ID** et le **Client secret** Google **dans Supabase** (même écran Google), active le provider. Rien à mettre dans Vercel.

---

## 2. Anthropic / Claude (l'IA qui génère les boutiques) — obligatoire

1. **https://console.anthropic.com** → crée un compte.
2. **Billing** → ajoute une carte et des crédits (commence avec 20 $ ; une génération coûte quelques centimes).
3. **API Keys** → « Create Key » → nomme-la `shopora-prod`.

| Variable Vercel | Valeur |
|---|---|
| `ANTHROPIC_API_KEY` | la clé (`sk-ant-...`), affichée une seule fois |

---

## 3. Shopify (connecter les boutiques des clients) — obligatoire

Il te faut une **app Shopify publique** à toi :

1. **https://partners.shopify.com** → crée un compte Partenaire (gratuit).
2. Crée une **boutique de développement** pour tester : Partner Dashboard → **Stores → Add store → Development store**.
3. Crée l'app : Partner Dashboard → **Apps → Create app → Create app manually** (selon ton compte, Shopify peut t'envoyer vers le **Dev Dashboard**, https://dev.shopify.com : c'est la même chose, « Create app »). Nom : `Shopora`.
4. Dans la configuration de l'app :
   - **App URL** : `https://ton-domaine.vercel.app`
   - **Allowed redirection URL(s)** : `https://ton-domaine.vercel.app/api/shopify/callback`
   - **Distribution** : « Custom distribution » au début (puis App Store plus tard).
5. Dans **Overview / Settings** (ou « Client credentials ») :

| Variable Vercel | Où la trouver |
|---|---|
| `SHOPIFY_API_KEY` | **Client ID** |
| `SHOPIFY_API_SECRET` | **Client secret** |

Les autorisations (scopes) et les webhooks sont gérés par le code, tu n'as rien à cocher.

---

## 4. Stripe (abonnements payants) — obligatoire pour encaisser

1. **https://dashboard.stripe.com** → crée un compte. Reste en **mode test** (interrupteur en haut à droite) jusqu'au lancement.
2. **Product catalog → Add product** :
   - « Shopora Pro » : prix récurrent **39 €/mois**, puis ajoute un 2ᵉ prix **390 €/an**
   - « Shopora Agence » : **149 €/mois** et **1 490 €/an**
   - Sur chaque prix, copie l'identifiant `price_...`
3. **Developers → API keys** → « Secret key » (`sk_test_...`).
4. **Developers → Webhooks → Add endpoint** :
   - URL : `https://ton-domaine.vercel.app/api/webhooks/stripe`
   - Événements : `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copie le **Signing secret** (`whsec_...`).
5. **Settings → Billing → Customer portal** → « Activate » (pour que les clients gèrent leur abonnement).

| Variable Vercel | Valeur |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (puis `sk_live_...` au lancement) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_PRO_MONTH` | `price_...` |
| `STRIPE_PRICE_PRO_YEAR` | `price_...` |
| `STRIPE_PRICE_AGENCY_MONTH` | `price_...` |
| `STRIPE_PRICE_AGENCY_YEAR` | `price_...` |

---

## 5. Clés que tu génères toi-même — obligatoire

| Variable Vercel | Comment |
|---|---|
| `ENCRYPTION_KEY` | Sert à chiffrer les accès Shopify. Va sur https://generate-secret.vercel.app/32 et copie le résultat (ou `openssl rand -base64 32` dans un terminal). **Ne la change plus jamais** après le lancement. |
| `NEXT_PUBLIC_APP_URL` | Ton adresse : `https://ton-domaine.vercel.app` (sans `/` à la fin) |
| `NEXT_PUBLIC_API_MODE` | `live` quand le back-end est branché (`mock` = démo avec fausses données) |

---

## Pour plus tard

### Resend (e-mails : formulaire de contact, notifications)
1. **https://resend.com** → compte → **API Keys → Create API Key**.
2. **Domains → Add domain** et ajoute les enregistrements DNS chez ton registrar (quand tu auras un nom de domaine).

| `RESEND_API_KEY` | `re_...` |
|---|---|
| `CONTACT_EMAIL` | l'adresse qui reçoit les messages du formulaire de contact |

### Génération d'images (Studio)
**https://fal.ai** → compte → **Dashboard → Keys → Add key**.

| `FAL_KEY` | la clé |
|---|---|

---

## Récapitulatif à cocher

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_PRO_MONTH` / `STRIPE_PRICE_PRO_YEAR`
- [ ] `STRIPE_PRICE_AGENCY_MONTH` / `STRIPE_PRICE_AGENCY_YEAR`
- [ ] `ENCRYPTION_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_API_MODE`
- [ ] (plus tard) `RESEND_API_KEY`, `CONTACT_EMAIL`, `FAL_KEY`
