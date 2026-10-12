export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Guide" | "Conversion" | "Shopify" | "Marque";
  date: string;
  readingMinutes: number;
  sections: { heading?: string; paragraphs: string[]; list?: string[] }[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "creer-boutique-shopify-etapes",
    title: "Créer une boutique Shopify : les 7 étapes qui comptent vraiment",
    excerpt: "Avant le thème et les couleurs, il y a le marché, la promesse et l'offre. Voici l'ordre qui évite de refaire sa boutique trois fois.",
    category: "Guide",
    date: "2026-09-22",
    readingMinutes: 7,
    sections: [
      { paragraphs: ["La plupart des boutiques Shopify sont construites à l'envers : on choisit un thème, on remplit les blocs, puis on se demande à qui on vend. Résultat : des pages jolies qui ne convertissent pas. L'ordre ci-dessous part du client et finit par le design."] },
      { heading: "1. Définir un client précis", paragraphs: ["« Tout le monde » n'est pas un marché. Décris une personne : son âge, ce qu'elle achète déjà, ce qui l'agace avec les produits actuels. Chaque texte de ta boutique s'adresse à elle."] },
      { heading: "2. Écrire une promesse en une phrase", paragraphs: ["Ta promesse dit ce que le client obtient, pas ce que le produit est. « Des lèvres nourries toute la journée avec 6 ingrédients » est une promesse ; « baume à lèvres bio » est une catégorie."] },
      { heading: "3. Lister les objections avant d'écrire", paragraphs: ["Note les 5 raisons pour lesquelles quelqu'un hésiterait : prix, efficacité, délais, retour, confiance. Ta fiche produit et ta FAQ doivent répondre à chacune."], list: ["Est-ce que ça marche pour moi ?", "Pourquoi ce prix ?", "Quand vais-je le recevoir ?", "Et si ça ne me plaît pas ?", "Qui êtes-vous ?"] },
      { heading: "4. Construire l'offre", paragraphs: ["Livraison offerte à partir d'un seuil, lot, garantie : l'offre est souvent ce qui fait basculer la décision, plus que le produit lui-même."] },
      { heading: "5. Écrire la fiche produit", paragraphs: ["Titre court, prix visible sans défiler, 3 bénéfices, une photo qui montre l'usage, la réponse aux objections, puis les détails techniques."] },
      { heading: "6. Seulement maintenant : le design", paragraphs: ["Couleurs et typographies découlent du positionnement. Un produit premium supporte du blanc et peu d'éléments ; un produit impulsif a besoin d'énergie et d'urgence."] },
      { heading: "7. Mesurer et corriger chaque semaine", paragraphs: ["Taux de conversion, ajout au panier, abandon de paiement : regarde ces trois chiffres chaque semaine et corrige un seul élément à la fois."] },
    ],
  },
  {
    slug: "fiche-produit-qui-convertit",
    title: "Anatomie d'une fiche produit qui convertit",
    excerpt: "Ce qui doit être visible sans défiler, ce qui rassure, ce qui fait monter le panier : la fiche produit, bloc par bloc.",
    category: "Conversion",
    date: "2026-09-08",
    readingMinutes: 6,
    sections: [
      { paragraphs: ["Sur mobile, ton client décide en quelques secondes s'il continue à défiler. Tout ce qui compte doit donc tenir dans le premier écran."] },
      { heading: "Le premier écran", paragraphs: ["Une photo qui montre le produit en situation, le titre, le prix, un bénéfice principal et le bouton d'achat. Si le bouton n'est pas visible sans défiler, c'est la première chose à corriger."] },
      { heading: "La réassurance juste sous le bouton", paragraphs: ["Délais de livraison, retours, paiement sécurisé : trois lignes courtes, pas un bloc de texte."] },
      { heading: "Les bénéfices avant les caractéristiques", paragraphs: ["« Tient 8 heures » avant « cire d'abeille 12 % ». Les caractéristiques prouvent les bénéfices, elles viennent après."] },
      { heading: "Les objections traitées dans la page", paragraphs: ["Une FAQ produit de 4 à 6 questions, écrites avec les mots de tes clients, évite qu'ils partent chercher la réponse ailleurs."] },
      { heading: "L'offre qui fait monter le panier", paragraphs: ["Un lot ou un produit complémentaire proposé juste sous le prix augmente le panier moyen sans ajouter d'étape."], list: ["Lot de 3 avec remise", "Produit complémentaire en un clic", "Seuil de livraison offerte affiché"] },
    ],
  },
  {
    slug: "boutique-de-marque-vs-generaliste",
    title: "Boutique de marque ou boutique généraliste : laquelle lancer ?",
    excerpt: "Une boutique mono-produit avec une vraie marque coûte moins cher en publicité sur la durée. Pourquoi, et comment s'y prendre.",
    category: "Marque",
    date: "2026-08-25",
    readingMinutes: 5,
    sections: [
      { paragraphs: ["Une boutique généraliste vend beaucoup de produits sans identité forte. Une boutique de marque vend peu de produits à une audience précise, avec un ton et une promesse reconnaissables."] },
      { heading: "Pourquoi la marque gagne sur la durée", paragraphs: ["Les clients reviennent, recommandent et acceptent un prix plus élevé. La publicité devient plus efficace parce que le message est clair."] },
      { heading: "Comment démarrer", paragraphs: ["Un produit héros, une promesse, une identité cohérente sur toutes les pages. Les produits complémentaires viennent ensuite, quand le premier se vend."] },
    ],
  },
  {
    slug: "ameliorer-taux-de-conversion-shopify",
    title: "10 corrections rapides pour améliorer ton taux de conversion Shopify",
    excerpt: "Des changements qui prennent moins d'une heure chacun et qui ont un effet mesurable sur les ventes.",
    category: "Shopify",
    date: "2026-08-11",
    readingMinutes: 6,
    sections: [
      { paragraphs: ["Avant de refaire ta boutique, commence par ces corrections. Fais-en une par semaine et mesure l'effet sur ton taux de conversion."] },
      { heading: "Les corrections", paragraphs: ["Classées de la plus simple à la plus longue :"], list: [
        "Rendre le bouton d'achat visible sans défiler sur mobile",
        "Afficher le seuil de livraison offerte dans la barre d'annonce",
        "Raccourcir les titres produits à une ligne",
        "Ajouter les délais de livraison sous le bouton",
        "Compresser les images (moins de 200 Ko chacune)",
        "Remplacer les caractéristiques par des bénéfices en haut de fiche",
        "Ajouter une FAQ produit de 5 questions",
        "Proposer un lot sous le prix",
        "Activer le paiement express (Shop Pay, Apple Pay)",
        "Supprimer les applications inutilisées qui ralentissent la boutique",
      ] },
    ],
  },
];
