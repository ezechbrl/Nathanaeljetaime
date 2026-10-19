# Les clés à récupérer (et où les trouver)

C'est moi qui code le back-end. Toi, tu crées les comptes et tu copies les clés dans Vercel.
Obligatoires pour lancer : **Supabase, Claude, Shopify, les clés générées**. Le paiement des abonnements passe par **Stripe** (section 4).
Resend et les images peuvent attendre.

### Ordre pour passer en production
1. Remplir les variables ci-dessous dans Vercel.
2. **Créer les tables** dans Supabase (section 1, étape 6) — sans ça, rien ne marche en mode `live`.
3. Configurer l'app Shopify (section 3).
4. Mettre `NEXT_PUBLIC_API_MODE=live` dans Vercel et redéployer.

**Où les coller :** Vercel → ton projet → **Settings** → **Environment Variables** → ajoute chaque nom/valeur
(coche Production, Preview et Development), puis **Deployments** → « Redeploy ».

> Ne colle jamais ces clés dans le chat, dans un message ou dans le code. Seulement dans Vercel.
> Celles qui commencent par `NEXT_PUBLIC_` sont visibles côté navigateur (c'est normal) ; toutes les autres sont secrètes.

---

## 1. Supabase (base de données + connexion des utilisateurs) — obligatoire

1. Va sur **https://supabase.com** → « Start your project » → connecte-toi avec GitHub.
2. **New project** : nom `vitrio`, mot de passe de base de données (garde-le), région **Europe (Paris ou Frankfurt)**.
3. Attends 2 minutes que le projet soit prêt.
4. Clique sur le bouton **Connect** en haut de la page du projet (ou **Project Settings → API Keys / Data API**) :

| Variable Vercel | Où la trouver dans Supabase |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → **Data API** → « Project URL » (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → **API Keys** → clé **anon / publishable** |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → **API Keys** → clé **service_role / secret** (clique « Reveal ») |
| `DATABASE_URL` | Facultatif (pas utilisé par le code pour l'instant) |

5. **Authentication → URL Configuration** :
   - Site URL : `https://ton-domaine.vercel.app` (ton adresse Vercel)
   - Redirect URLs : ajoute `https://ton-domaine.vercel.app/**` et `http://localhost:3000/**`
6. **Créer les tables (obligatoire)** : **SQL Editor → New query**, colle tout le contenu du fichier
   `supabase/migrations/0001_init.sql` du projet, puis **Run**. Tu dois voir « Success ».
   Recommence avec `0002_ai_budget.sql`, `0003_ai_session_limit.sql`, `0004_waitlist.sql`, `0005_shopify_billing.sql` puis `0006_free_store_once.sql`. (Ou tout d'un coup : `supabase/installation-complete.sql`.)
   À faire une seule fois, dans cet ordre.
7. **Authentication → Sign In / Providers → Email** : laisse-le **activé** (connexion par lien e-mail, et la connexion
   via Shopify s'en sert en interne ; les utilisateurs ne voient jamais de mot de passe).
8. **Envoi des e-mails de connexion** : le service d'e-mail intégré de Supabase est limité à quelques e-mails par heure,
   suffisant pour tester. Avant le lancement, **Authentication → Emails → SMTP Settings** : branche Resend
   (hôte `smtp.resend.com`, port 465, utilisateur `resend`, mot de passe = ta clé `RESEND_API_KEY`).
   Dans **Emails → Templates → Magic Link**, tu peux traduire le message en français.

### Connexion avec Google

1. **https://console.cloud.google.com** → crée un projet → « APIs & Services » → **OAuth consent screen** (type External, remplis nom + e-mail).
2. « Credentials » → **Create credentials → OAuth client ID** → type « Web application ».
3. Dans « Authorized redirect URIs », colle l'URL de rappel que Supabase t'affiche dans
   **Authentication → Sign In / Providers → Google** (elle ressemble à `https://xxxx.supabase.co/auth/v1/callback`).
4. Copie le **Client ID** et le **Client secret** Google **dans Supabase** (même écran Google), active le provider. Rien à mettre dans Vercel.

---

## 2. Anthropic / Claude (l'IA qui génère les boutiques) — obligatoire

1. **https://console.anthropic.com** → crée un compte.
2. **Billing** → ajoute une carte et des crédits (commence avec 20 $ ; une génération coûte quelques centimes).
3. **API Keys** → « Create Key » → nomme-la `vitrio-prod`.

| Variable Vercel | Valeur |
|---|---|
| `ANTHROPIC_API_KEY` | la clé (`sk-ant-...`), affichée une seule fois |

---

## 3. Shopify (connecter les boutiques des clients) — obligatoire

Il te faut une **app Shopify publique** à toi :

1. **https://partners.shopify.com** → crée un compte Partenaire (gratuit).
2. Crée une **boutique de développement** pour tester : Partner Dashboard → **Stores → Add store → Development store**.
3. Crée l'app : Partner Dashboard → **Apps → Create app → Create app manually** (selon ton compte, Shopify peut t'envoyer vers le **Dev Dashboard**, https://dev.shopify.com : c'est la même chose, « Create app »). Nom : `Vitrio`.
4. Dans la configuration de l'app :
   - **App URL** : `https://ton-domaine.vercel.app`
   - **Allowed redirection URL(s)** : `https://ton-domaine.vercel.app/api/shopify/callback`
   - **Distribution** : ⚠️ ce choix est **définitif**. Le plus simple : **deux apps**.
     - « Vitrio dev » en **Custom distribution** pour tester sur tes boutiques de développement ;
     - « Vitrio » en **Public distribution** pour la vraie version (validation Shopify, App Store).
     Mets les clés de « Vitrio dev » dans Vercel pendant les tests, puis celles de « Vitrio » au lancement.
5. Dans **Overview / Settings** (ou « Client credentials ») :

| Variable Vercel | Où la trouver |
|---|---|
| `SHOPIFY_API_KEY` | **Client ID** |
| `SHOPIFY_API_SECRET` | **Client secret** |

6. **Webhooks obligatoires** (dans la configuration de l'app, rubrique « Webhooks » / « Compliance webhooks ») :
   mets l'URL `https://ton-domaine.vercel.app/api/webhooks/shopify` pour **app/uninstalled**,
   **customers/data_request**, **customers/redact** et **shop/redact**. Format : JSON.
7. **Accès aux données protégées** (« API access » → « Protected customer data access ») : demande le **niveau 1**
   (accès aux commandes, sans aucun champ personnel : ni nom, ni e-mail, ni adresse). Raison à indiquer :
   « Calcul du chiffre d'affaires et du nombre de commandes par jour pour recommander des améliorations de la boutique. »
   Nécessaire pour la partie Pilotage ; le reste fonctionne sans.

Les autorisations (scopes) sont demandées par le code au moment de la connexion, tu n'as rien à cocher.
Connexion des utilisateurs : ils tapent l'adresse de leur boutique, valident sur Shopify, et leur compte Vitrio est créé
automatiquement avec l'e-mail de la boutique.

---

## 4. Paiement par Stripe (abonnements Starter et Pro)

Le client paie par carte (ou Apple Pay / Google Pay) sur une page Stripe. Frais : environ 1,5 % + 0,25 € par paiement
(cartes européennes) + 0,7 % pour la gestion des abonnements. Stripe verse l'argent sur le compte bancaire du titulaire.
**Le titulaire doit être majeur** : c'est le parent qui ouvre le compte Stripe, avec sa pièce d'identité et son IBAN.
Tant que les variables sont vides, les boutons de paiement affichent « Le paiement en ligne arrive très bientôt ».

1. **dashboard.stripe.com** → créer le compte (au nom du parent) et l'activer.
2. **Catalogue de produits → Ajouter un produit** (prix normaux, payés après les 48 h de l'offre) :
   - « Vitrio Starter » : prix récurrent **78 €/mois**, puis un 2e prix **398 €/an** ;
   - « Vitrio Pro » : prix récurrent **158 €/mois**, puis un 2e prix **798 €/an**.
   Copie l'identifiant de chaque prix (`price_…`).
3. **Développeurs → Clés API** : copie la **clé secrète** (`sk_live_…`).
4. **Développeurs → Webhooks → Ajouter une destination** :
   URL `https://nathanaeljetaime.vercel.app/api/webhooks/stripe`, événements
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.paid`. Copie le **secret de signature** (`whsec_…`).
5. **Paramètres → Facturation → Portail client** : active-le, autorise « Annuler », « Changer de carte »
   et « Changer d'offre » (ajoute les 4 prix).
6. **Catalogue de produits → Coupons → Créer** : « Offre de lancement », **50 %**, durée **Pour toujours**.
   C'est l'offre du compte à rebours (48 h après l'inscription) : 78 → 39 €, 158 → 79 €, 398 → 199 €, 798 → 399 €.
   Le paiement reste fermé tant que ce coupon n'est pas configuré (le prix affiché est toujours le prix payé).

| Variable Vercel | Valeur |
|---|---|
| `STRIPE_LAUNCH_COUPON` | identifiant du coupon −50 % (étape 6) |
| `STRIPE_SECRET_KEY` | la clé secrète (étape 3) |
| `STRIPE_WEBHOOK_SECRET` | le secret de signature (étape 4) |
| `STRIPE_PRICE_STARTER_MONTH` | prix 78 €/mois |
| `STRIPE_PRICE_STARTER_YEAR` | prix 398 €/an |
| `STRIPE_PRICE_PRO_MONTH` | prix 158 €/mois |
| `STRIPE_PRICE_PRO_YEAR` | prix 798 €/an |

Pour tester sans payer : fais tout en **mode test** (clés `sk_test_…`, carte `4242 4242 4242 4242`), ou dans
Supabase → Table Editor → `users`, mets ta ligne à `plan = pro` (Starter) ou `plan = agency` (Pro).

## 4 bis. Couleurs de la marque dans le thème Shopify

Vitrio applique les couleurs et polices de la marque grâce à une « intégration d'app » (dossier `extensions/vitrio-brand`) :
le marchand l'active d'un clic dans son éditeur de thème, sans qu'aucun fichier du thème soit modifié.
Elle fonctionne avec Dawn et les thèmes qui en dérivent.

À faire une fois (et après chaque modification du dossier `extensions`), sur ton ordinateur :
1. Installe Node.js (https://nodejs.org), puis récupère le projet (`git clone …`).
2. Dans `shopify.app.toml`, remplace `client_id` par ton Client ID (= `SHOPIFY_API_KEY`) et `application_url` par ton adresse.
3. Dans le dossier du projet : `npx @shopify/cli@latest app deploy` (connecte-toi avec ton compte Partenaire).

| Variable Vercel | Valeur |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | la même valeur que `SHOPIFY_API_KEY` (sert au bouton « Activer dans Shopify ») |

---

## 5. Clés que tu génères toi-même — obligatoire

| Variable Vercel | Comment |
|---|---|
| `ENCRYPTION_KEY` | Sert à chiffrer les accès Shopify. Va sur https://generate-secret.vercel.app/32 et copie le résultat (ou `openssl rand -base64 32` dans un terminal). **Ne la change plus jamais** après le lancement. |
| `NEXT_PUBLIC_APP_URL` | Ton adresse : `https://ton-domaine.vercel.app` (sans `/` à la fin) |
| `NEXT_PUBLIC_API_MODE` | `live` quand le back-end est branché (`mock` = démo avec fausses données) |
| `NEXT_PUBLIC_SHOPIFY_REFERRAL_URL` | Facultatif : ton lien d'affilié Shopify (programme Affiliés de Shopify ou rubrique « Affiliés / Referrals » de ton espace Partenaire, selon ce qui t'est proposé). Il remplace le lien « Ouvre une boutique sur Shopify » : tu touches une commission quand un client ouvre sa boutique grâce à toi. Vide = lien Shopify normal. |
| `NEXT_PUBLIC_LAUNCH_MODE` | `waitlist` (par défaut) : les boutons mènent à la liste d'attente. Le jour du lancement : `open`, puis « Redeploy ». Les inscrits sont dans Supabase → Table Editor → `waitlist`. |
| `CRON_SECRET` | Protège la tâche quotidienne d'optimisation. Génère-le comme `ENCRYPTION_KEY`. Vercel l'envoie automatiquement à `/api/cron/daily` (déclarée dans `vercel.json`). |

---

## 6. Lecture des liens AliExpress (ScraperAPI) — facultatif

AliExpress, Amazon et Temu bloquent la lecture de leurs pages par les serveurs (captcha). Sans cette clé, Vitrio
lit les sites qui l'acceptent ; pour les autres, le client ajoute 1 à 3 captures d'écran de la page produit
(l'IA les lit) ou décrit le produit. Avec cette clé, les liens AliExpress se lisent directement.

1. Crée un compte sur https://www.scraperapi.com (offre gratuite : 1 000 crédits par mois).
2. Dans le tableau de bord, copie ta **API Key**.
3. Dans Vercel → ton projet → Settings → Environment Variables, ajoute `SCRAPER_API_KEY` avec cette clé, puis redéploie.

Ne m'envoie jamais la clé : elle va uniquement dans Vercel.

## 7. Notification « Nouvelle vente » sur ton téléphone — facultatif

À chaque nouvel abonné Pro (et à chaque départ), Vitrio t'envoie une notification.

**Option A — Pushover (son « caisse enregistreuse », iPhone et Android, 5 $ une fois après 30 jours d'essai)**
1. Installe l'app **Pushover** sur ton téléphone et crée un compte.
2. Sur **https://pushover.net** : copie ta **User Key** (en haut de la page).
3. **Create an Application/API Token** → nom « Vitrio » → copie l'**API Token**.
4. Dans Vercel : `PUSHOVER_USER_KEY` = la User Key, `PUSHOVER_APP_TOKEN` = l'API Token.

**Option B — ntfy (gratuit)**
1. Installe l'app **ntfy** et abonne-toi à un sujet secret (ex. `vitrio-ventes-8f3k2q`).
2. Dans Vercel : `NTFY_TOPIC` = ce sujet. Le son se choisit dans les réglages du sujet de l'app (Android).

**Tester** : ajoute `OWNER_EMAIL` = l'e-mail de ton compte Vitrio dans Vercel, redéploie, connecte-toi à Vitrio
puis ouvre `https://nathanaeljetaime.vercel.app/api/owner/test-notification`.

## Pour plus tard

### Resend (e-mails : formulaire de contact, notifications)
1. **https://resend.com** → compte → **API Keys → Create API Key**.
2. **Domains → Add domain** et ajoute les enregistrements DNS chez ton registrar (quand tu auras un nom de domaine).

| `RESEND_API_KEY` | `re_...` |
|---|---|
| `CONTACT_EMAIL` | l'adresse qui reçoit les messages du formulaire de contact |

### Génération d'images (photos des boutiques) — fortement conseillé
**https://fal.ai** → compte → **Billing** (ajoute 10 $) → **Dashboard → Keys → Add key**.

Chaque boutique reçoit 8 visuels : une photo produit, puis 7 scènes construites à partir de cette photo
pour garder le même produit partout (héros, gros plan, en situation, 3 moments, histoire).
Coût : environ 0,30 $ par boutique (FLUX dev + FLUX Kontext). Sans clé, la boutique est publiée sans photos.
Modèles modifiables avec `FAL_MODEL` (défaut `fal-ai/flux/dev`) et `FAL_EDIT_MODEL` (défaut `fal-ai/flux-pro/kontext`).

| `FAL_KEY` | la clé |
|---|---|

---

## Récapitulatif à cocher

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Tables créées dans Supabase (`0001` à `0006`)
- [ ] Webhooks Shopify configurés
- [ ] `CRON_SECRET`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] Stripe : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_LAUNCH_COUPON` et les 4 `STRIPE_PRICE_…`
- [ ] Extension de thème déployée + `NEXT_PUBLIC_SHOPIFY_API_KEY`
- [ ] `NEXT_PUBLIC_LAUNCH_MODE` (`waitlist` puis `open`)
- [ ] `ENCRYPTION_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_API_MODE`
- [ ] (plus tard) `RESEND_API_KEY`, `CONTACT_EMAIL`, `FAL_KEY`
