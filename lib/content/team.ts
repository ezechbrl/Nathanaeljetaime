// Ajoute ici les fondateurs pour les afficher sur la page « Notre histoire ».
// Exemple : { name: "Prénom Nom", role: "Cofondateur, produit", bio: "…", photo: "/team/prenom.jpg", linkedin: "https://…" }
export type Founder = { name: string; role: string; bio: string; photo?: string; linkedin?: string };
export const FOUNDERS: Founder[] = [];
