// Classements (« tier lists ») : notre avis selon des critères annoncés sur la page, pas des chiffres de vente.
export type Tier = "S" | "A" | "B" | "C";
export type RankItem = { name: string; tier: Tier; why: string; product?: string; examples?: string[] };
export type Ranking = { slug: string; title: string; h1: string; description: string; intro: string; criteria: string[]; items: RankItem[]; note?: string };

const NOEL_CRITERIA = [
  "Fait un beau cadeau, facile à offrir",
  "Se montre bien en vidéo (lumière, avant / après, effet waouh)",
  "Prix « cadeau » et marge correcte",
  "Livraison possible avant Noël sans trop de risque (léger, peu fragile)",
  "Peu de risques de retours ou de problèmes légaux",
];

export const RANKINGS: Ranking[] = [
  {
    slug: "meilleurs-produits-a-vendre-noel",
    title: "Tier list : les 15 meilleurs produits à vendre pour Noël",
    h1: "Les meilleurs produits à vendre pour Noël (tier list)",
    description: "Notre classement S, A, B, C des 15 meilleurs produits à vendre en ligne pour Noël : déco lumineuse, cadeaux personnalisés, pyjamas de famille, animaux… avec la raison de chaque note.",
    intro: "À Noël, les gens cherchent surtout trois choses : une ambiance de fête à la maison (lumières, déco), des cadeaux qui touchent (personnalisés, souvenirs de famille) et des cadeaux faciles à offrir à petit prix. Voici notre classement des produits qui collent le mieux à ces envies.",
    criteria: NOEL_CRITERIA,
    note: "Pour Noël, le délai compte plus que tout : un produit qui arrive le 27 décembre est un produit raté. Vérifie le délai réel avec ton fournisseur et affiche une date limite de commande.",
    items: [
      { tier: "S", name: "Guirlande lumineuse de Noël", product: "Guirlande lumineuse de Noël", why: "Tout le monde en achète chaque année, c'est léger et l'effet se voit en une seconde de vidéo." },
      { tier: "S", name: "Projecteur de flocons", product: "Projecteur de flocons", why: "Effet waouh garanti sur une façade, parfait pour les vidéos du soir." },
      { tier: "S", name: "Pyjama de Noël famille", product: "Pyjama de Noël famille", why: "La photo de famille assortie est devenue un rituel ; on achète plusieurs pièces d'un coup." },
      { tier: "S", name: "Boules de Noël personnalisées", product: "Boules de Noël personnalisées", why: "Cadeau émotionnel qu'on garde des années ; attention à prévoir le délai de gravure." },
      { tier: "S", name: "Boule à neige personnalisée", product: "Boule à neige personnalisée", why: "Souvenir unique avec une photo de famille, très touchant." },
      { tier: "A", name: "Pull de Noël", product: "Pull de Noël", why: "Les soirées pull moche font vendre, mais les tailles demandent un bon guide." },
      { tier: "A", name: "Lampe photo personnalisée", product: "Lampe photo personnalisée", why: "Personnel et lumineux ; le délai de fabrication doit être bien annoncé." },
      { tier: "A", name: "Projecteur aurore boréale", product: "Projecteur aurore boréale", why: "Très visuel, mais beaucoup de vendeurs le proposent : soigne tes vidéos." },
      { tier: "A", name: "Pull de Noël pour chien", product: "Pull de Noël pour chien", why: "Les photos d'animaux déguisés font le tour des réseaux à Noël." },
      { tier: "A", name: "Plaid de Noël", product: "Plaid de Noël", why: "Cocooning des fêtes, facile à offrir ; un peu volumineux à expédier." },
      { tier: "B", name: "Bougie de Noël", product: "Bougie de Noël", why: "Facile à offrir, mais très concurrentiel et règles d'étiquetage à respecter." },
      { tier: "B", name: "Chaussettes de Noël", product: "Chaussettes de Noël", why: "Petit prix idéal pour les lots, marge plus faible." },
      { tier: "B", name: "Premier Noël de bébé", product: "Premier Noël de bébé", why: "Très recherché par les parents, mais normes et tailles à gérer." },
      { tier: "C", name: "Calendrier de l'Avent beauté", product: "Calendrier de l'Avent beauté", why: "Excellent produit… mais il se vend avant le 1er décembre : trop tard pour cette année, garde-le pour l'an prochain." },
      { tier: "C", name: "Lumières de Noël solaires", product: "Lumières de Noël solaires", why: "En hiver il y a peu de soleil : risque de clients déçus." },
    ],
  },
  {
    slug: "meilleures-boutiques-a-lancer-pour-noel",
    title: "Tier list : les meilleures boutiques à lancer pour Noël",
    h1: "Les meilleures boutiques en ligne à lancer pour Noël (tier list)",
    description: "Quelle boutique lancer pour Noël ? Notre classement des 10 meilleurs concepts de boutique pour les fêtes, avec des exemples de produits et la raison de chaque note.",
    intro: "Une boutique de Noël marche quand elle est centrée sur un thème clair : les visiteurs comprennent tout de suite ce qu'ils vont trouver, et chaque produit renforce les autres. Voici notre classement des concepts de boutique les plus adaptés aux fêtes.",
    criteria: ["Un thème clair qui parle à beaucoup de monde", "Plusieurs produits qui se complètent (lots, paniers plus gros)", "Facile à montrer en vidéo", "Livraison réaliste avant Noël"],
    note: "Une boutique Noël doit être en ligne au plus vite : chaque jour compte. Après les fêtes, tu peux la faire évoluer vers un thème d'hiver ou de cadeaux toute l'année.",
    items: [
      { tier: "S", name: "Déco lumineuse de Noël", why: "Le thème le plus visuel : chaque produit fait une belle vidéo, et on en achète plusieurs.", examples: ["Guirlande lumineuse de Noël", "Projecteur de flocons", "Rideau lumineux", "Sapin LED de table"] },
      { tier: "S", name: "Cadeaux personnalisés", why: "Les cadeaux avec prénom ou photo touchent beaucoup ; il faut juste maîtriser les délais.", examples: ["Boules de Noël personnalisées", "Boule à neige personnalisée", "Lampe photo personnalisée", "Bracelet personnalisé"] },
      { tier: "A", name: "Pyjamas et tenues de Noël en famille", why: "On achète pour toute la famille d'un coup : panier moyen élevé.", examples: ["Pyjama de Noël famille", "Pull de Noël", "Chaussettes de Noël", "Bonnet de Noël lumineux"] },
      { tier: "A", name: "Le Noël des animaux", why: "Les maîtres adorent gâter leur animal et partager les photos.", examples: ["Pull de Noël pour chien", "Costume de renne pour chat", "Chaussette de Noël pour animal", "Lit apaisant"] },
      { tier: "A", name: "Coffrets beauté et bien-être", why: "Cadeaux tout prêts, faciles à offrir à une femme.", examples: ["Coffret de soin", "Coffret manucure de fêtes", "Gua sha", "Bonnet en satin"] },
      { tier: "B", name: "Cocooning d'hiver", why: "Plaids, bougies et lumières douces se vendent au-delà de Noël.", examples: ["Plaid de Noël", "Bougie de Noël", "Projecteur aurore boréale", "Bouillotte"] },
      { tier: "B", name: "Cadeaux pour gamers", why: "Public passionné, mais compatibilités et concurrence à gérer.", examples: ["Lampe d'ambiance gaming", "Support casque", "Néon LED personnalisé", "Tapis de souris XXL"] },
      { tier: "B", name: "Premier Noël de bébé", why: "Très émotionnel, mais normes de sécurité à respecter.", examples: ["Premier Noël de bébé", "Livre de Noël en tissu", "Veilleuse étoilée", "Coffret naissance"] },
      { tier: "C", name: "Déco de table de réveillon", why: "Achat peu impulsif et très concurrentiel.", examples: ["Décoration de table de Noël", "Planche de fête", "Mug de Noël"] },
      { tier: "C", name: "Calendriers de l'Avent", why: "Ils se vendent avant le 1er décembre : trop tard pour cette année.", examples: ["Calendrier de l'Avent beauté", "Calendrier de l'Avent pour chat", "Calendrier de l'Avent gamer"] },
    ],
  },
  {
    slug: "meilleurs-produits-a-vendre-en-ligne",
    title: "Tier list : les meilleurs produits à vendre en ligne quand on débute",
    h1: "Les meilleurs produits à vendre en ligne (tier list débutant)",
    description: "Notre tier list S, A, B, C des meilleurs produits à vendre en ligne pour un débutant : faciles à montrer, légers à livrer, avec une vraie utilité. La raison de chaque note.",
    intro: "Quand on débute, le meilleur produit n'est pas forcément le plus original : c'est celui qui règle un problème clair, se montre bien en vidéo et se livre sans souci. Voici notre classement de produits adaptés à une première boutique.",
    criteria: ["Règle un vrai problème du quotidien", "Se comprend en quelques secondes de vidéo", "Léger et solide à livrer", "Peu de risques (tailles, normes, retours)"],
    items: [
      { tier: "S", name: "Lampe coucher de soleil", product: "Lampe coucher de soleil", why: "Effet visuel immédiat, léger, adoré des jeunes." },
      { tier: "S", name: "Fontaine à eau chat", product: "Fontaine à eau chat", why: "Vrai besoin des maîtres, vidéos d'animaux très partagées." },
      { tier: "S", name: "Brosse vapeur anti-poils", product: "Brosse vapeur anti-poils", why: "Problème universel chez les maîtres, résultat visible." },
      { tier: "S", name: "Chargeur 3 en 1", product: "Chargeur 3 en 1", why: "Utile à presque tout le monde, facile à comprendre." },
      { tier: "A", name: "Pistolet de massage", product: "Pistolet de massage", why: "Très demandé par les sportifs ; normes électriques à vérifier." },
      { tier: "A", name: "Organisateur maquillage", product: "Organisateur maquillage", why: "Avant / après parlant, un peu encombrant à expédier." },
      { tier: "A", name: "Harnais anti-traction", product: "Harnais anti-traction", why: "Vrai problème de promenade, mais tailles à bien gérer." },
      { tier: "A", name: "Mixeur portable", product: "Mixeur portable", why: "Pratique et visuel ; vérifie la puissance réelle." },
      { tier: "A", name: "Support magnétique voiture", product: "Support magnétique voiture", why: "Utile à tous les conducteurs, petit prix." },
      { tier: "A", name: "Colliers en acier", product: "Colliers en acier", why: "Léger, joli en photo, souvent offert." },
      { tier: "A", name: "Ruban LED musical", product: "Ruban LED musical", why: "Très partagé en vidéo ; application à vérifier." },
      { tier: "A", name: "Gourde isotherme", product: "Gourde isotherme", why: "Utilisée tous les jours, mais concurrence forte." },
      { tier: "B", name: "Masque LED visage", product: "Masque LED visage", why: "Très visuel, mais attention aux promesses : aucune promesse sur la peau." },
      { tier: "B", name: "Mini projecteur", product: "Mini projecteur", why: "Fait rêver, mais clients exigeants sur la qualité d'image." },
      { tier: "B", name: "Coussin de voyage", product: "Coussin de voyage", why: "Utile, mais très présent en magasin." },
      { tier: "B", name: "Aspirateur de voiture", product: "Aspirateur de voiture", why: "Utile, mais la puissance déçoit souvent si le produit est bas de gamme." },
      { tier: "B", name: "Tapis d'acupression", product: "Tapis d'acupression", why: "Petit prix, mais à présenter sans promesse santé." },
      { tier: "B", name: "Veilleuse étoilée", product: "Veilleuse étoilée", why: "Joli cadeau, normes enfants à respecter." },
      { tier: "B", name: "Tapis de souris XXL", product: "Tapis de souris XXL", why: "Simple, mais beaucoup de vendeurs." },
      { tier: "B", name: "Lampe frontale", product: "Lampe frontale", why: "Utile, mais peu impulsif." },
      { tier: "C", name: "Robot lave-vitres", product: "Robot lave-vitres", why: "Cher et technique : plus de risques de retours pour un débutant." },
      { tier: "C", name: "Housse de siège imperméable", product: "Housse de siège imperméable", why: "Compatibilités véhicules compliquées." },
      { tier: "C", name: "Tuyau extensible", product: "Tuyau extensible", why: "Fiabilité souvent décevante sur la durée." },
      { tier: "C", name: "Sac cabine extensible", product: "Sac cabine extensible", why: "Dimensions cabine différentes selon les compagnies : source de litiges." },
    ],
  },
];

// Tous les classements : ceux écrits à la main + une tier list par univers.
import { NICHE_RANKINGS } from "./niche-rankings";
export const ALL_RANKINGS: Ranking[] = [...RANKINGS, ...NICHE_RANKINGS];
