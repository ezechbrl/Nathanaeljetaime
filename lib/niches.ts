import { Baby, ChefHat, Dumbbell, Flower2, PawPrint, ShoppingBag, Smartphone, Sofa } from "lucide-react";

// Niches et produits proposés à ceux qui n'ont pas encore d'idée (quiz). Produits génériques, sans marque.
export const NICHES = [
  { id: "beaute", icon: Flower2, emoji: "💄", label: "Beauté", products: [
    ["Masque LED visage", "Masque LED visage pour un moment soin à la maison"],
    ["Brosse nettoyante visage", "Brosse nettoyante visage en silicone, douce et rechargeable"],
    ["Rouleau de jade", "Rouleau de massage visage en pierre de jade, effet frais"],
    ["Organisateur maquillage", "Organisateur de maquillage rotatif et transparent pour la salle de bain"],
  ] },
  { id: "sport", icon: Dumbbell, emoji: "🏋️", label: "Sport", products: [
    ["Pistolet de massage", "Pistolet de massage musculaire compact pour la récupération après le sport"],
    ["Gourde isotherme", "Gourde isotherme en inox qui garde l'eau froide 24 h, pour le sport"],
    ["Bandes élastiques", "Kit de bandes élastiques de musculation pour s'entraîner à la maison"],
    ["Corde à sauter connectée", "Corde à sauter avec compteur de sauts, pour le cardio à la maison"],
  ] },
  { id: "animaux", icon: PawPrint, emoji: "🐶", label: "Animaux", products: [
    ["Harnais pour chien", "Harnais pour chien anti-traction, réglable et confortable"],
    ["Fontaine à eau chat", "Fontaine à eau pour chat, silencieuse, avec filtre"],
    ["Brosse anti-poils", "Brosse autonettoyante qui retire les poils morts des chiens et chats"],
    ["Lit apaisant", "Lit rond et moelleux qui apaise les chiens et chats anxieux"],
  ] },
  { id: "maison", icon: Sofa, emoji: "🏠", label: "Maison", products: [
    ["Lampe coucher de soleil", "Lampe projecteur coucher de soleil pour une ambiance douce dans la chambre"],
    ["Diffuseur d'huiles", "Diffuseur d'huiles essentielles effet flamme, avec lumière"],
    ["Rangement sous l'évier", "Étagère de rangement extensible pour le dessous de l'évier"],
    ["Bougies sans flamme", "Lot de bougies LED sans flamme avec télécommande"],
  ] },
  { id: "bebe", icon: Baby, emoji: "👶", label: "Bébé & famille", products: [
    ["Veilleuse bébé", "Veilleuse projecteur étoiles avec bruit blanc pour aider bébé à dormir"],
    ["Bavoirs en silicone", "Lot de bavoirs en silicone avec récupérateur, faciles à laver"],
    ["Tapis d'éveil", "Tapis d'éveil pliable et doux pour bébé"],
    ["Gigoteuse", "Gigoteuse légère en coton pour les nuits de bébé"],
  ] },
  { id: "tech", icon: Smartphone, emoji: "📱", label: "Tech & gadgets", products: [
    ["Support téléphone voiture", "Support de téléphone magnétique pour la voiture"],
    ["Mini projecteur", "Mini vidéoprojecteur portable pour regarder des films sur le mur"],
    ["Ruban LED", "Ruban LED connecté pour la chambre, qui change de couleur avec la musique"],
    ["Chargeur 3 en 1", "Station de recharge sans fil 3 en 1 pour téléphone, montre et écouteurs"],
  ] },
  { id: "mode", icon: ShoppingBag, emoji: "👜", label: "Mode & accessoires", products: [
    ["Sac banane", "Sac banane tendance, léger et imperméable"],
    ["Bijoux acier", "Colliers fins en acier inoxydable qui ne noircissent pas"],
    ["Lunettes anti-lumière bleue", "Lunettes anti-lumière bleue pour les écrans, look moderne"],
    ["Pinces à cheveux", "Lot de grosses pinces à cheveux élégantes"],
  ] },
  { id: "cuisine", icon: ChefHat, emoji: "🍳", label: "Cuisine", products: [
    ["Mixeur portable", "Mixeur portable rechargeable pour smoothies, à emporter partout"],
    ["Hachoir électrique", "Mini hachoir électrique sans fil pour l'ail et les légumes"],
    ["Boîtes de conservation", "Lot de boîtes de conservation en verre hermétiques"],
    ["Balance de cuisine", "Balance de cuisine précise et fine, en verre"],
  ] },
] as const;
