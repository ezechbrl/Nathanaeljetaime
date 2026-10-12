# Shopora — créateur de boutiques Shopify par IA (MVP)

SaaS inspiré de Scale Ova : le marchand décrit son produit (ou colle un lien produit),
l'IA (Claude) pose la stratégie (marché, promesse, offres, objections) puis génère la
boutique (marque, page d'accueil, fiche produit + SEO, FAQ, page « À propos »),
et le tout est envoyé sur Shopify en brouillon.

## Démarrer

```bash
npm install
cp .env.example .env.local   # renseigner les clés
npm run dev                  # http://localhost:3000
```

| Variable | Rôle |
|---|---|
| `ANTHROPIC_API_KEY` | Clé API Claude |
| `SHOPIFY_STORE_DOMAIN` | `ma-boutique.myshopify.com` |
| `SHOPIFY_ADMIN_TOKEN` | Token d'une app personnalisée Shopify (scopes `write_products`, `read_products`, `write_content`, `write_online_store_pages`) |

## Structure

- `app/page.tsx` — landing page (FR)
- `app/generer/` + `components/Generator.tsx` — brief → génération → aperçu → publication
- `app/api/generate` — appelle Claude avec une sortie structurée (`lib/store-schema.ts`)
- `app/api/shopify/publish` — crée produit, prix et page via l'Admin GraphQL API (`lib/shopify.ts`)
- `lib/site.ts` — nom de la marque (à changer)

## Feuille de route vers le vrai SaaS

1. **Comptes** : auth (Supabase / Clerk) + base de données pour sauvegarder les boutiques générées.
2. **App Shopify publique (OAuth)** : chaque client connecte *sa* boutique au lieu d'un token unique en variable d'env.
3. **Abonnement** : Stripe (ou Shopify Billing API si l'app passe par l'App Store), quotas de générations.
4. **Thème** : générer/paramétrer un thème (Online Store 2.0, `themeFilesUpsert`) avec les couleurs et sections générées.
5. **Images** : génération/retouche des visuels produit.
6. **Éditeur** : modifier le contenu par chat ou dans un éditeur visuel avant publication.
7. **Optimisation quotidienne** : tâche planifiée qui lit les stats Shopify et propose des améliorations.
8. **Légal** : mentions légales, CGU/CGV, politique de confidentialité (RGPD).
