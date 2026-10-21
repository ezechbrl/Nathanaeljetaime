import { AFFILIATE } from "./affiliate";
import { site } from "@/lib/site";

// Modèles de textes légaux. Les éléments entre crochets [ ] sont à compléter avant la mise en ligne,
// et l'ensemble doit être relu par un juriste.
export const COMPANY = {
  name: site.legalEntity,
  form: "[forme juridique, ex. SAS au capital de 1 000 €]",
  address: "[adresse du siège social]",
  rcs: "[RCS Ville B 000 000 000]",
  vat: "[numéro de TVA intracommunautaire]",
  director: "[nom du directeur de la publication]",
  host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  email: site.email,
};

export type LegalDoc = { slug: string; title: string; updated: string; sections: { heading: string; body: string[] }[] };

export const LEGAL: LegalDoc[] = [
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    updated: "2026-10-12",
    sections: [
      { heading: "Éditeur du site", body: [`${COMPANY.name}, ${COMPANY.form}, dont le siège est situé ${COMPANY.address}, immatriculée au ${COMPANY.rcs}, TVA ${COMPANY.vat}.`, `Contact : ${COMPANY.email}.`, `Directeur de la publication : ${COMPANY.director}.`] },
      { heading: "Hébergement", body: [`Le site est hébergé par ${COMPANY.host}. Les données de l'application sont stockées par Supabase Inc. dans l'Union européenne.`] },
      { heading: "Propriété intellectuelle", body: [`Les contenus du site (textes, interface, logo, code) sont la propriété de ${COMPANY.name}. Toute reproduction sans autorisation est interdite.`, "Shopify est une marque de Shopify Inc. Le service n'est ni affilié à Shopify, ni approuvé par Shopify."] },
    ],
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    updated: "2026-10-19",
    sections: [
      { heading: "Responsable du traitement", body: [`${COMPANY.name}, ${COMPANY.address}. Pour toute question : ${COMPANY.email}.`] },
      { heading: "Données collectées", body: ["Compte : prénom, e-mail, mot de passe chiffré.", "Boutique : domaine Shopify, jeton d'accès chiffré, contenus générés, statistiques de vente agrégées.", "Paiement : géré par Stripe ; nous n'avons jamais accès à ton numéro de carte.", "Usage : pages consultées et actions dans l'application, pour améliorer le service."] },
      { heading: "Finalités et bases légales", body: ["Fournir le service (exécution du contrat).", "Facturer l'abonnement (obligation légale).", "Améliorer le produit et prévenir la fraude (intérêt légitime).", "Envoyer la newsletter (consentement, retirable à tout moment)."] },
      { heading: "Sous-traitants", body: ["Vercel (hébergement), Supabase (base de données), Anthropic (génération de texte par IA), Resend (e-mails), Stripe (paiement de l'abonnement), Shopify (publication de ta boutique). Les contenus que tu soumets à l'IA ne sont pas utilisés pour entraîner les modèles."] },
      { heading: "Durée de conservation", body: ["Les données du compte sont conservées tant que le compte est actif, puis supprimées sous 30 jours après sa clôture, sauf obligations comptables (10 ans pour les factures)."] },
      { heading: "Données des clients de ta boutique", body: ["Pour t'afficher tes statistiques, Vigenia lit les commandes de ta boutique et n'en garde que des totaux par jour (nombre de commandes, chiffre d'affaires). Aucune donnée personnelle de tes clients (nom, e-mail, téléphone, adresse) n'est lue ni conservée.", "Pour ces données, Vigenia agit comme sous-traitant pour ton compte : elles ne servent qu'à ces statistiques, ne sont ni vendues ni partagées, sont chiffrées en transit et au repos, et sont supprimées dans les 48 heures après la désinstallation de l'app (demande d'effacement de Shopify)."] },
      { heading: "Tes droits", body: [`Tu peux accéder à tes données, les rectifier, les exporter, les supprimer ou t'opposer à leur traitement en écrivant à ${COMPANY.email}, ou supprimer ton compte depuis les paramètres. Tu peux aussi saisir la CNIL (cnil.fr).`] },
      { heading: "Cookies", body: ["Nous utilisons des cookies strictement nécessaires (session, sécurité) et un cookie d'affiliation de 60 jours. Aucun cookie publicitaire."] },
    ],
  },
  {
    slug: "cgu",
    title: "Conditions générales d'utilisation",
    updated: "2026-10-12",
    sections: [
      { heading: "Objet", body: [`Les présentes conditions encadrent l'utilisation du service ${site.name}, qui génère et optimise des boutiques Shopify à l'aide de l'intelligence artificielle.`] },
      { heading: "Compte", body: ["Tu es responsable de la confidentialité de tes identifiants et des actions réalisées depuis ton compte. Tu dois avoir au moins 18 ans ou agir pour le compte d'une entreprise."] },
      { heading: "Contenus générés", body: ["Les contenus générés t'appartiennent. Tu es responsable de leur vérification avant publication, notamment des allégations sur les produits, des prix et de la conformité aux lois applicables à ton activité.", "L'IA peut commettre des erreurs : relis toujours ce qui est publié."] },
      { heading: "Usages interdits", body: ["Vendre des produits illégaux, contrefaits ou dangereux ; publier des avis ou labels inventés ; contourner les limites du service ; tenter d'accéder aux données d'autres utilisateurs."] },
      { heading: "Connexion Shopify", body: ["En connectant ta boutique, tu nous autorises à y créer et modifier des thèmes, produits, pages, menus et fichiers, et à lire tes statistiques de vente. Tu peux révoquer cet accès à tout moment."] },
      { heading: "Responsabilité", body: [`${COMPANY.name} s'engage à fournir le service avec soin mais ne garantit pas un niveau de ventes. Sa responsabilité est limitée aux sommes payées au cours des 12 derniers mois.`] },
      { heading: "Droit applicable", body: ["Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action."] },
    ],
  },
  {
    slug: "cgv",
    title: "Conditions générales de vente",
    updated: "2026-10-19",
    sections: [
      { heading: "Offres et prix", body: ["Les offres et prix en vigueur sont indiqués sur la page Tarifs, en euros hors taxes pour les professionnels et toutes taxes comprises pour les particuliers. L'abonnement Shopify n'est pas inclus."] },
      { heading: "Paiement", body: ["L'abonnement est payé par carte via Stripe, au début de chaque période (un mois ou un an). Il peut être changé ou arrêté à tout moment depuis la page Abonnement ; l'arrêt prend effet à la fin de la période payée."] },
      { heading: "Renouvellement et résiliation", body: ["L'abonnement se renouvelle automatiquement. Tu peux le résilier à tout moment depuis ton espace ; il reste actif jusqu'à la fin de la période payée."] },
      { heading: "Rétractation et remboursement", body: ["Si tu es un consommateur, tu disposes d'un délai de rétractation de 14 jours. En commençant à utiliser le service pendant ce délai, tu reconnais que l'exécution a commencé. Nous remboursons néanmoins intégralement le premier paiement sur simple demande dans les 14 jours."] },
      { heading: "Factures", body: ["Les factures sont disponibles dans ton espace, rubrique Abonnement."] },
    ],
  },
  {
    slug: "conditions-affiliation",
    title: "Conditions d'affiliation",
    updated: "2026-10-12",
    sections: [
      { heading: "Commission", body: [`L'affilié perçoit ${AFFILIATE.rate * 100} % des paiements hors taxes des clients qu'il a recommandés, pendant ${AFFILIATE.months} mois à compter du premier paiement.`] },
      { heading: "Attribution", body: [`Un client est attribué à l'affilié s'il crée son compte dans les ${AFFILIATE.cookieDays} jours suivant un clic sur son lien. Le dernier lien cliqué l'emporte. L'auto-parrainage est exclu.`] },
      { heading: "Paiement", body: [`Une commission est validée 30 jours après le paiement du client (hors remboursement). Les commissions validées sont versées chaque mois dès ${AFFILIATE.minPayout} €.`] },
      { heading: "Règles de promotion", body: [`Interdits : enchérir sur la marque « ${site.name} » dans les moteurs de recherche, les promesses de gains, le spam et toute présentation trompeuse.`] },
      { heading: "Fin du partenariat", body: ["Chaque partie peut mettre fin au partenariat à tout moment. Les commissions validées restent dues, sauf fraude."] },
    ],
  },
];
