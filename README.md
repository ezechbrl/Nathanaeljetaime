# Shopora — créateur de boutiques Shopify par IA

Décris ton produit : l'IA pose la stratégie (marché, promesse, offres, objections), construit la boutique
(marque, pages, fiches produits, FAQ, visuels), la publie sur Shopify, puis l'optimise chaque jour.

## Lancer en local

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

Par défaut, `NEXT_PUBLIC_API_MODE=mock` : toute l'application fonctionne avec des données de démonstration
stockées dans le navigateur (compte, boutiques, chat, publication, abonnement). Passe en `live` quand le back-end est configuré.

## Documentation

- [`docs/CLES-ET-COMPTES.md`](docs/CLES-ET-COMPTES.md) — les comptes à créer et où trouver chaque clé (Supabase, Claude, Shopify, Stripe).
- [`docs/BACKEND.md`](docs/BACKEND.md) — les routes d'API, la base de données et le fonctionnement du back-end.

## Structure

| Dossier | Contenu |
|---|---|
| `app/(site)` | Site public : accueil, produit, exemples, tarifs, démo, blog, outils, affiliation, légal… |
| `app/(auth)` | Connexion, inscription, mot de passe oublié |
| `app/app` | Espace client : accueil, boutiques, éditeur IA, studio, pilotage, abonnement, paramètres |
| `app/api` | Routes du back-end |
| `components/ui` | Design system (boutons, apparitions au défilement, lumière, retours d'état) |
| `components/site`, `components/app` | Composants du site et de l'application |
| `lib/api` | Contrat d'API (`types.ts`), client (`client.ts`), back-end simulé (`mock.ts`) |
| `lib/content` | Textes du site : FAQ, tarifs, exemples, blog, nouveautés, pages légales |
| `lib/site.ts` | Nom de la marque et coordonnées |

## Design

Fond bleu-vert profond, typographie DM Sans fine et serrée avec des accents en Instrument Serif italique,
surfaces en verre fin, une seule couleur d'accent. Les sections apparaissent au défilement (`components/ui/Reveal.tsx`),
certaines animations suivent la position de défilement (`components/ui/useScrollProgress.ts`). Toutes les animations
respectent le réglage « réduire les animations » du système.
