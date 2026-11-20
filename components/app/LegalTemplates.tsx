"use client";

import { Check, Copy, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

// Modèles de pages légales pour une boutique en ligne française, à compléter par le marchand
// (les [crochets]) puis à coller dans Shopify. Ce sont des bases de départ, pas un conseil juridique.
const TEMPLATES = (shop: string) => [
  {
    id: "mentions",
    title: "Mentions légales",
    text: `Mentions légales

Éditeur du site ${shop}
[Nom et prénom, ou nom de l'entreprise]
Statut : [micro-entreprise / société…]
Adresse : [adresse complète]
SIRET : [numéro SIRET]
TVA intracommunautaire : [numéro, ou « TVA non applicable, art. 293 B du CGI »]
E-mail : [adresse e-mail de contact]
Téléphone : [numéro]

Directeur de la publication : [nom et prénom]

Hébergement : Shopify International Limited, Victoria Buildings, 2e étage, 1-2 Haddington Road, Dublin 4, D04 XN32, Irlande.`,
  },
  {
    id: "cgv",
    title: "Conditions générales de vente",
    text: `Conditions générales de vente

1. Objet
Les présentes conditions régissent les ventes réalisées sur la boutique ${shop}, éditée par [nom ou entreprise], [adresse], SIRET [numéro].

2. Prix
Les prix sont indiqués en euros, toutes taxes comprises. Les frais de livraison sont indiqués avant la validation de la commande.

3. Commande et paiement
La commande est validée après paiement. Une confirmation est envoyée par e-mail.

4. Livraison
Les produits sont livrés à l'adresse indiquée lors de la commande, dans un délai de [X à Y] jours ouvrés après l'expédition. En cas de retard, le client peut nous contacter à [e-mail].

5. Droit de rétractation
Le client dispose de 14 jours à compter de la réception du produit pour se rétracter, sans avoir à se justifier. Il nous informe de sa décision à [e-mail], puis renvoie le produit dans les 14 jours suivants. Les frais de retour sont à la charge de [du client / la boutique]. Le remboursement intervient dans les 14 jours suivant la décision de rétractation, après réception du produit.

6. Garanties
Les produits bénéficient de la garantie légale de conformité (2 ans à compter de la livraison, articles L217-3 et suivants du Code de la consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil).

7. Service client et réclamations
Pour toute question ou réclamation : [e-mail].

8. Médiation
En cas de litige non résolu, le client peut recourir gratuitement au médiateur de la consommation : [nom et coordonnées du médiateur].

9. Données personnelles
Les données sont utilisées pour traiter les commandes. Voir notre politique de confidentialité.

10. Droit applicable
Les présentes conditions sont soumises au droit français.`,
  },
  {
    id: "retours",
    title: "Politique de retour et de remboursement",
    text: `Politique de retour et de remboursement

Vous disposez de 14 jours à compter de la réception de votre commande pour changer d'avis, sans avoir à vous justifier.

Comment faire un retour :
1. Écrivez-nous à [e-mail] avec votre numéro de commande.
2. Renvoyez le produit dans les 14 jours suivants, à l'adresse que nous vous indiquerons.
3. Nous vous remboursons dans les 14 jours suivant votre demande, après réception du produit, avec le même moyen de paiement.

Frais de retour : [à la charge du client / offerts].

Produit défectueux ou non conforme : vous bénéficiez de la garantie légale de conformité de 2 ans. Contactez-nous à [e-mail], nous le remplaçons ou le remboursons.`,
  },
];

export function LegalTemplates({ shopName, policiesUrl }: { shopName: string; policiesUrl: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(id: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(id); window.setTimeout(() => setCopied(null), 2000); } catch { /* presse-papiers indisponible */ }
  }
  return (
    <section className="mt-4 rounded-card border border-white/10 bg-white/[0.03] p-5">
      <p className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-accent" /> Tes pages légales, prêtes à copier</p>
      <p className="mt-1 text-sm text-fg-muted">Obligatoires pour vendre en France. Copie un modèle, colle-le dans Shopify, puis remplace tout ce qui est entre [crochets] par tes informations.</p>
      <ul className="mt-4 space-y-2">
        {TEMPLATES(shopName).map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 rounded-ctl border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm">
            <span className="text-white">{t.title}</span>
            <button type="button" onClick={() => copy(t.id, t.text)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25">
              {copied === t.id ? <><Check className="h-3.5 w-3.5" /> Copié</> : <><Copy className="h-3.5 w-3.5" /> Copier</>}
            </button>
          </li>
        ))}
      </ul>
      <a href={policiesUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-white">Ouvrir les pages légales dans Shopify <ExternalLink className="h-3.5 w-3.5 opacity-60" /></a>
      <p className="mt-2 text-xs text-fg-faint">Ce sont des modèles de départ, pas un conseil juridique : vérifie-les selon ta situation.</p>
    </section>
  );
}
