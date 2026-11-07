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
    slug: "creer-boutique-shopify-avec-ia",
    title: "Créer une boutique Shopify avec l'IA : ce que ça fait vraiment (et ce que ça ne fait pas)",
    excerpt: "Textes, photos, design : ce qu'une IA peut créer pour ta boutique Shopify en quelques minutes, et les étapes qui restent à faire toi-même.",
    category: "Guide",
    date: "2026-11-07",
    readingMinutes: 6,
    sections: [
      { paragraphs: ["Les outils d'IA promettent une boutique Shopify « en un clic ». La réalité est plus nuancée : l'IA fait très bien une grande partie du travail le plus long, mais certaines décisions restent les tiennes. Voici, sans exagérer, ce qu'elle fait et ce qu'elle ne fait pas."] },
      { heading: "Ce que l'IA fait très bien", paragraphs: ["Le plus long dans une boutique, ce n'est pas la technique : c'est d'écrire et de mettre en forme. C'est exactement là que l'IA fait gagner des heures."], list: [
        "Écrire la fiche produit : titre court, description, points forts, réponses aux objections",
        "Rédiger le titre et la description que Google affiche dans ses résultats (SEO)",
        "Créer un design cohérent : couleurs, typographies, sections de la page d'accueil",
        "Préparer les photos du produit à partir de celles du fournisseur",
        "Écrire les pages importantes : FAQ, livraison, retours, contact",
      ] },
      { heading: "Ce qui reste à faire toi-même", paragraphs: ["Aucune IA ne peut (ni ne devrait) faire ces étapes à ta place, parce qu'elles engagent ton nom, ton argent ou tes clients :"], list: [
        "Choisir un produit qui se vend et un fournisseur fiable",
        "Activer les paiements et régler la livraison dans Shopify",
        "Vérifier les prix, les délais et les promesses affichés",
        "Faire connaître ta boutique : réseaux sociaux, contenu, publicité",
      ] },
      { heading: "Les pièges à éviter", paragraphs: ["Une boutique générée sans relecture peut contenir des promesses fausses ou des délais irréalistes. Relis toujours tout avant de publier. Méfie-toi aussi des outils qui proposent de faux avis clients ou de faux compteurs « plus que 2 en stock » : c'est interdit par la loi en France et ça détruit la confiance des clients."] },
      { heading: "Comment ça se passe avec Vigenia", paragraphs: ["Avec Vigenia, tu colles le lien d'un produit (AliExpress, Amazon ou autre). L'IA lit la page, puis crée la boutique complète : design, textes, photos, fiche produit et pages importantes. Tu vois un aperçu, tu modifies ce que tu veux en écrivant simplement ta demande (« mets un fond noir », « ton plus premium »), puis tu l'installes sur ta boutique Shopify.", "Vigenia s'occupe de la partie longue. Toi, tu gardes les décisions importantes : le produit, les prix et la façon de vendre."] },
    ],
  },
  {
    slug: "creer-boutique-shopify-sans-coder",
    title: "Créer une boutique Shopify sans savoir coder : le guide pour débutant",
    excerpt: "Pas besoin de coder pour lancer une boutique Shopify. Voici les étapes dans l'ordre, du compte Shopify à la première vente.",
    category: "Shopify",
    date: "2026-11-06",
    readingMinutes: 7,
    sections: [
      { paragraphs: ["Bonne nouvelle : Shopify a été conçu pour les gens qui ne savent pas coder. Tout se fait avec des menus, des boutons et des champs à remplir. Ce qui bloque les débutants, ce n'est pas la technique, c'est de savoir par où commencer. Voici l'ordre à suivre."] },
      { heading: "1. Choisir un seul produit pour commencer", paragraphs: ["Une boutique avec un seul produit est plus simple à créer, plus facile à faire connaître et plus crédible. Choisis un produit qui règle un vrai problème, que tu peux expliquer en une phrase, et dont le prix laisse une marge après le coût du produit, de la livraison et de la publicité."] },
      { heading: "2. Créer ton compte Shopify", paragraphs: ["Va sur shopify.com et crée un compte avec ton e-mail. Shopify propose en général une période d'essai : profite-en pour tout construire avant de payer un abonnement. Choisis ensuite le nom de ta boutique : court, facile à écrire, et disponible en nom de domaine."] },
      { heading: "3. Ajouter ton produit", paragraphs: ["Dans Produits > Ajouter un produit, remplis le titre, la description, le prix, les photos et les variantes (taille, couleur). Écris la description pour ton client : commence par ce que le produit lui apporte, puis donne les détails techniques."] },
      { heading: "4. Choisir et régler un thème", paragraphs: ["Le thème, c'est le design de ta boutique. Dans Boutique en ligne > Thèmes, tu peux en choisir un gratuit et le modifier avec l'éditeur, sans écrire de code : couleurs, polices, images, sections de la page d'accueil."] },
      { heading: "5. Créer les pages obligatoires", paragraphs: ["Pour vendre en France, il te faut au minimum ces pages. Shopify peut générer des modèles dans Paramètres > Politiques, mais relis-les et adapte-les à ta situation :"], list: ["Mentions légales", "Conditions générales de vente", "Politique de retour et de remboursement", "Politique de confidentialité", "Contact"] },
      { heading: "6. Activer les paiements et la livraison", paragraphs: ["Dans Paramètres > Paiements, active Shopify Payments ou un autre moyen de paiement. Dans Paramètres > Expédition et livraison, indique tes tarifs et tes délais. Affiche ensuite ces délais clairement sur la fiche produit : c'est une des premières questions des clients."] },
      { heading: "7. Tester une commande", paragraphs: ["Avant d'ouvrir, passe une commande test pour vérifier que tout fonctionne, du panier jusqu'au mail de confirmation. Puis retire le mot de passe de ta boutique dans Boutique en ligne > Préférences."] },
      { heading: "Aller plus vite", paragraphs: ["Les étapes 3 à 5 sont les plus longues : écrire les textes, faire le design et les pages peut prendre plusieurs jours. Un outil comme Vigenia les prépare à partir du lien de ton produit, en quelques minutes. Tu n'as plus qu'à relire, ajuster et passer aux étapes 6 et 7."] },
    ],
  },
  {
    slug: "combien-coute-boutique-shopify",
    title: "Combien coûte une boutique Shopify ? Le vrai budget pour démarrer",
    excerpt: "Abonnement, nom de domaine, applications, produit, publicité : tous les coûts d'une boutique Shopify, et ceux que tu peux éviter au début.",
    category: "Guide",
    date: "2026-11-05",
    readingMinutes: 6,
    sections: [
      { paragraphs: ["« Combien faut-il pour lancer une boutique Shopify ? » La réponse dépend surtout d'un poste que beaucoup oublient : la publicité. Voici tous les coûts, du plus fixe au plus variable. Les prix exacts changent régulièrement : vérifie-les toujours sur les sites officiels avant de te lancer."] },
      { heading: "1. L'abonnement Shopify", paragraphs: ["C'est le seul coût vraiment obligatoire. Shopify propose plusieurs formules ; la plus simple suffit largement pour démarrer. Shopify propose aussi régulièrement une période d'essai ou des premiers mois à prix réduit. Consulte la page des tarifs sur shopify.com pour le prix actuel dans ton pays."] },
      { heading: "2. Les frais sur chaque vente", paragraphs: ["En plus de l'abonnement, chaque paiement par carte entraîne des frais de transaction (un petit pourcentage du montant). Intègre-les dans ton calcul de marge dès le départ."] },
      { heading: "3. Le nom de domaine", paragraphs: ["Une adresse comme tamarque.com coûte en général une dizaine à une vingtaine d'euros par an. Ce n'est pas obligatoire le premier jour, mais ça rend ta boutique beaucoup plus crédible."] },
      { heading: "4. Le thème et les applications", paragraphs: ["Les thèmes gratuits de Shopify suffisent pour commencer. Pour les applications, installe seulement celles dont tu as vraiment besoin : beaucoup sont payantes chaque mois, et trop d'applications ralentissent ta boutique."] },
      { heading: "5. Le produit et les échantillons", paragraphs: ["Commande toujours ton produit avant de le vendre, pour vérifier la qualité et les délais de livraison. Compte le prix de quelques échantillons dans ton budget de départ."] },
      { heading: "6. La publicité : le vrai poste", paragraphs: ["C'est souvent la plus grosse dépense. Tu peux commencer gratuitement avec du contenu sur TikTok ou Instagram, puis tester la publicité avec un petit budget quand ta fiche produit est prête. Ne mets jamais en pub une boutique que tu n'as pas testée."] },
      { heading: "Le budget minimum réaliste", paragraphs: ["En démarrant avec du contenu gratuit plutôt que de la publicité, ton budget se résume à :"], list: ["L'abonnement Shopify", "Un nom de domaine", "Quelques échantillons du produit", "Éventuellement un outil pour créer la boutique plus vite"] },
      { heading: "Où Vigenia intervient", paragraphs: ["Faire créer une boutique par un freelance coûte souvent plusieurs centaines d'euros. Vigenia crée le design, les textes, les photos et les pages à partir du lien de ton produit, pour un abonnement mensuel sans engagement. Tu gardes ton budget pour ce qui fait vraiment vendre : le produit et la visibilité."] },
    ],
  },
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
