// Petit questionnaire de départ (facultatif) : on veut savoir pourquoi un client arrête.
export const CANCEL_REASONS = [
  { id: "price", label: "C'est trop cher pour moi" },
  { id: "shopify", label: "Je n'ai pas réussi à mettre ma boutique en ligne" },
  { id: "quality", label: "La boutique ne me plaît pas assez" },
  { id: "sales", label: "Je n'ai pas eu de ventes" },
  { id: "done", label: "J'ai déjà tout ce qu'il me faut" },
  { id: "other", label: "Autre raison" },
  // Réponses à l'enquête de résiliation de Stripe (quand le client arrête depuis l'espace Stripe).
  { id: "stripe:too_expensive", label: "Trop cher (Stripe)" },
  { id: "stripe:missing_features", label: "Il manque des fonctionnalités (Stripe)" },
  { id: "stripe:switched_service", label: "Est passé à un autre service (Stripe)" },
  { id: "stripe:unused", label: "Ne l'utilise pas assez (Stripe)" },
  { id: "stripe:customer_service", label: "Pas content du service client (Stripe)" },
  { id: "stripe:too_complex", label: "Trop compliqué (Stripe)" },
  { id: "stripe:low_quality", label: "Qualité pas assez bonne (Stripe)" },
  { id: "stripe:other", label: "Autre raison (Stripe)" },
] as const;

export const CANCEL_WISHES = [
  { id: "cheaper", label: "Un prix plus bas" },
  { id: "help", label: "De l'aide pour lancer ma boutique" },
  { id: "better", label: "Des boutiques encore plus belles" },
  { id: "nothing", label: "Rien, c'est juste le bon moment" },
] as const;

export const cancelLabel = (list: readonly { id: string; label: string }[], id?: string | null) => list.find((x) => x.id === id)?.label ?? id ?? "";
