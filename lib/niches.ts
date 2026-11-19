import { Baby, Car, CookingPot, Dumbbell, Gem, Headphones, Lamp, PawPrint, Sparkles } from "lucide-react";

// Univers et produits proposés dans le quiz à ceux qui n'ont pas encore d'idée.
// Produits génériques (aucune marque), qui se montrent bien en vidéo et règlent un vrai problème.
export const NICHES = [
  { id: "beaute", icon: Sparkles, label: "Beauté & soins", products: [
    ["Brosse soufflante", "Brosse soufflante coiffante qui sèche et lisse en même temps, pour un brushing maison"],
    ["Masque LED visage", "Masque LED visage pour un moment soin à la maison"],
    ["Rouleau glacé visage", "Rouleau visage glacé qui défroisse et rafraîchit la peau le matin"],
    ["Patchs anti-boutons", "Patchs invisibles anti-boutons à porter la nuit ou en journée"],
  ] },
  { id: "maison", icon: Lamp, label: "Maison & déco", products: [
    ["Lampe coucher de soleil", "Lampe projecteur coucher de soleil pour une ambiance douce dans la chambre"],
    ["Diffuseur effet flamme", "Diffuseur d'huiles essentielles effet flamme, avec lumière d'ambiance"],
    ["Robot lave-vitres", "Robot lave-vitres qui nettoie les fenêtres tout seul"],
    ["Ruban LED musical", "Ruban LED connecté qui change de couleur au rythme de la musique"],
  ] },
  { id: "animaux", icon: PawPrint, label: "Animaux", products: [
    ["Fontaine à eau chat", "Fontaine à eau pour chat, silencieuse, avec filtre"],
    ["Harnais anti-traction", "Harnais pour chien anti-traction, réglable et confortable"],
    ["Brosse vapeur anti-poils", "Brosse à vapeur qui retire les poils morts des chiens et chats sans les stresser"],
    ["Jouet interactif chat", "Jouet interactif automatique qui occupe le chat quand il est seul"],
  ] },
  { id: "sport", icon: Dumbbell, label: "Sport & bien-être", products: [
    ["Pistolet de massage", "Pistolet de massage musculaire compact pour la récupération après le sport"],
    ["Tapis d'acupression", "Tapis d'acupression pour se détendre le dos et mieux dormir"],
    ["Bandes élastiques", "Kit de bandes élastiques de musculation pour s'entraîner à la maison"],
    ["Corde à sauter lestée", "Corde à sauter lestée avec compteur, pour le cardio à la maison"],
  ] },
  { id: "bebe", icon: Baby, label: "Bébé & parents", products: [
    ["Veilleuse étoilée", "Veilleuse projecteur d'étoiles avec bruit blanc pour aider bébé à s'endormir"],
    ["Bavoirs en silicone", "Lot de bavoirs en silicone avec récupérateur, faciles à laver"],
    ["Mouche-bébé électrique", "Mouche-bébé électrique doux et silencieux"],
    ["Sac à langer sac à dos", "Sac à dos à langer avec matelas intégré et nombreuses poches"],
  ] },
  { id: "cuisine", icon: CookingPot, label: "Cuisine", products: [
    ["Mixeur portable", "Mixeur portable rechargeable pour smoothies, à emporter partout"],
    ["Hachoir électrique", "Mini hachoir électrique sans fil pour l'ail, les herbes et les légumes"],
    ["Spray à huile", "Spray à huile en verre pour cuisiner avec moins de matière grasse"],
    ["Balance cuillère", "Cuillère balance numérique pour doser au gramme près"],
  ] },
  { id: "tech", icon: Headphones, label: "Tech & accessoires", products: [
    ["Chargeur 3 en 1", "Station de recharge sans fil 3 en 1 pour téléphone, montre et écouteurs"],
    ["Mini projecteur", "Mini vidéoprojecteur portable pour regarder des films sur le mur"],
    ["Écouteurs à écran", "Écouteurs sans fil avec boîtier de charge à écran tactile"],
    ["Support magnétique voiture", "Support de téléphone magnétique pour la voiture"],
  ] },
  { id: "auto", icon: Car, label: "Auto", products: [
    ["Aspirateur de voiture", "Mini aspirateur de voiture sans fil, puissant et rechargeable"],
    ["Organisateur de coffre", "Organisateur de coffre pliable avec compartiments"],
    ["Désodorisant solaire", "Désodorisant de voiture à énergie solaire, design élégant"],
    ["Coussin lombaire auto", "Coussin lombaire à mémoire de forme pour les longs trajets"],
  ] },
  { id: "mode", icon: Gem, label: "Mode & bijoux", products: [
    ["Colliers en acier", "Colliers fins en acier inoxydable qui ne noircissent pas"],
    ["Montre minimaliste", "Montre minimaliste au cadran épuré, unisexe"],
    ["Sac banane", "Sac banane tendance, léger et imperméable"],
    ["Pinces à cheveux", "Lot de grosses pinces à cheveux élégantes"],
  ] },
] as const;
