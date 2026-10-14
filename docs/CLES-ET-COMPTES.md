# Les clés à récupérer (et où les trouver)

C'est moi qui code le back-end. Toi, tu crées les comptes et tu copies les clés dans Vercel.
Obligatoires pour lancer : **Supabase, Claude, Shopify, les clés générées**. Le paiement passe par **Shopify** (pas besoin de Stripe).
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
   Recommence avec `0002_ai_budget.sql`, `0003_ai_session_limit.sql`, `0004_waitlist.sql` puis `0005_shopify_billing.sql`.
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

## 4. Paiement par Shopify (abonnements Pro et Agence)

Le client paie depuis Shopify : l'abonnement s'ajoute à sa facture Shopify, et Shopify te reverse l'argent
(0 % de commission sur ton premier million de dollars, 2,9 % de frais de paiement, inscription unique de 19 $).
Tant que ces variables sont vides, les boutons « Passer à Pro » affichent « Le paiement arrive très bientôt ».

1. **Partner Dashboard → Settings → App Store registration** : inscris-toi (19 $, une fois).
2. **Apps → Vitrio → Distribution → Manage listing → Pricing content → Settings** : choisis **Shopify App Pricing**.
3. Crée les offres (le **handle** doit contenir `pro` ou `agence`) :
   - `pro` : 31 €/mois et 310 €/an ;
   - `agence` : 149 €/mois et 1 490 €/an ;
   - (option) une offre gratuite `decouverte`.
   Dans chaque offre, **Welcome link** : `https://ton-domaine.vercel.app/api/billing/shopify/return`
4. **Settings → Partner API clients → Create** : coche **Manage apps** et **View financials**, copie le jeton.

| Variable Vercel | Où la trouver |
|---|---|
| `SHOPIFY_APP_HANDLE` | le « handle » de l'app (dans l'URL de la page d'offres ou le fichier `shopify.app.toml`), ex. `vitrio` |
| `SHOPIFY_APP_ID` | le nombre dans l'URL de l'app : `partners.shopify.com/<ORG_ID>/apps/<APP_ID>/…` |
| `SHOPIFY_PARTNER_ORG_ID` | le premier nombre de cette même URL |
| `SHOPIFY_PARTNER_TOKEN` | le jeton du Partner API client (étape 4) |

Sur une boutique de développement, les offres payantes sont gratuites : tu peux tout tester sans payer.

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
| `NEXT_PUBLIC_LAUNCH_MODE` | `waitlist` (par défaut) : les boutons mènent à la liste d'attente. Le jour du lancement : `open`, puis « Redeploy ». Les inscrits sont dans Supabase → Table Editor → `waitlist`. |
| `CRON_SECRET` | Protège la tâche quotidienne d'optimisation. Génère-le comme `ENCRYPTION_KEY`. Vercel l'envoie automatiquement à `/api/cron/daily` (déclarée dans `vercel.json`). |

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
- [ ] Tables créées dans Supabase (`0001` à `0005`)
- [ ] Webhooks Shopify configurés
- [ ] `CRON_SECRET`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] Offres Shopify + `SHOPIFY_APP_HANDLE`, `SHOPIFY_APP_ID`, `SHOPIFY_PARTNER_ORG_ID`, `SHOPIFY_PARTNER_TOKEN`
- [ ] Extension de thème déployée + `NEXT_PUBLIC_SHOPIFY_API_KEY`
- [ ] `NEXT_PUBLIC_LAUNCH_MODE` (`waitlist` puis `open`)
- [ ] `ENCRYPTION_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_API_MODE`
- [ ] (plus tard) `RESEND_API_KEY`, `CONTACT_EMAIL`, `FAL_KEY`
