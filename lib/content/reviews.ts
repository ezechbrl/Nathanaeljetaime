// Avis de vrais utilisateurs de Vigenia, affichés sur l'accueil. Uniquement des avis réels (jamais inventés),
// avec l'accord de la personne. La section reste masquée tant que la liste est vide.
export type Review = {
  name: string;   // prénom + initiale, ex. « Léa M. »
  role: string;   // ex. « Boutique de bijoux, Lyon »
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  store?: string; // adresse de la boutique, facultatif
};

export const REVIEWS: Review[] = [];
