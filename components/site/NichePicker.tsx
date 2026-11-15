"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

// Pour ceux qui n'ont pas encore d'idée : une niche, puis un produit, et la boutique se crée.
// Produits génériques (aucune marque), décrits comme le ferait un vendeur débutant.
const NICHES = [
  { id: "beaute", emoji: "💄", label: "Beauté", products: [
    ["Masque LED visage", "Masque LED visage pour un moment soin à la maison"],
    ["Brosse nettoyante visage", "Brosse nettoyante visage en silicone, douce et rechargeable"],
    ["Rouleau de jade", "Rouleau de massage visage en pierre de jade, effet frais"],
    ["Organisateur maquillage", "Organisateur de maquillage rotatif et transparent pour la salle de bain"],
  ] },
  { id: "sport", emoji: "🏋️", label: "Sport", products: [
    ["Pistolet de massage", "Pistolet de massage musculaire compact pour la récupération après le sport"],
    ["Gourde isotherme", "Gourde isotherme en inox qui garde l'eau froide 24 h, pour le sport"],
    ["Bandes élastiques", "Kit de bandes élastiques de musculation pour s'entraîner à la maison"],
    ["Corde à sauter connectée", "Corde à sauter avec compteur de sauts, pour le cardio à la maison"],
  ] },
  { id: "animaux", emoji: "🐶", label: "Animaux", products: [
    ["Harnais pour chien", "Harnais pour chien anti-traction, réglable et confortable"],
    ["Fontaine à eau chat", "Fontaine à eau pour chat, silencieuse, avec filtre"],
    ["Brosse anti-poils", "Brosse autonettoyante qui retire les poils morts des chiens et chats"],
    ["Lit apaisant", "Lit rond et moelleux qui apaise les chiens et chats anxieux"],
  ] },
  { id: "maison", emoji: "🏠", label: "Maison", products: [
    ["Lampe coucher de soleil", "Lampe projecteur coucher de soleil pour une ambiance douce dans la chambre"],
    ["Diffuseur d'huiles", "Diffuseur d'huiles essentielles effet flamme, avec lumière"],
    ["Rangement sous l'évier", "Étagère de rangement extensible pour le dessous de l'évier"],
    ["Bougies sans flamme", "Lot de bougies LED sans flamme avec télécommande"],
  ] },
  { id: "bebe", emoji: "👶", label: "Bébé & famille", products: [
    ["Veilleuse bébé", "Veilleuse projecteur étoiles avec bruit blanc pour aider bébé à dormir"],
    ["Bavoirs en silicone", "Lot de bavoirs en silicone avec récupérateur, faciles à laver"],
    ["Tapis d'éveil", "Tapis d'éveil pliable et doux pour bébé"],
    ["Gigoteuse", "Gigoteuse légère en coton pour les nuits de bébé"],
  ] },
  { id: "tech", emoji: "📱", label: "Tech & gadgets", products: [
    ["Support téléphone voiture", "Support de téléphone magnétique pour la voiture"],
    ["Mini projecteur", "Mini vidéoprojecteur portable pour regarder des films sur le mur"],
    ["Ruban LED", "Ruban LED connecté pour la chambre, qui change de couleur avec la musique"],
    ["Chargeur 3 en 1", "Station de recharge sans fil 3 en 1 pour téléphone, montre et écouteurs"],
  ] },
  { id: "mode", emoji: "👜", label: "Mode & accessoires", products: [
    ["Sac banane", "Sac banane tendance, léger et imperméable"],
    ["Bijoux acier", "Colliers fins en acier inoxydable qui ne noircissent pas"],
    ["Lunettes anti-lumière bleue", "Lunettes anti-lumière bleue pour les écrans, look moderne"],
    ["Pinces à cheveux", "Lot de grosses pinces à cheveux élégantes"],
  ] },
  { id: "cuisine", emoji: "🍳", label: "Cuisine", products: [
    ["Mixeur portable", "Mixeur portable rechargeable pour smoothies, à emporter partout"],
    ["Hachoir électrique", "Mini hachoir électrique sans fil pour l'ail et les légumes"],
    ["Boîtes de conservation", "Lot de boîtes de conservation en verre hermétiques"],
    ["Balance de cuisine", "Balance de cuisine précise et fine, en verre"],
  ] },
] as const;

export function NichePicker({ onPick, onClose }: { onPick: (brief: string) => void; onClose: () => void }) {
  const [niche, setNiche] = useState<(typeof NICHES)[number] | null>(null);
  return (
    <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25 p-4 text-left backdrop-blur [animation:fade-in_.3s_ease-out_both] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold">{niche ? `${niche.emoji} ${niche.label} : choisis un produit` : "Choisis ta niche"}</p>
        <button type="button" onClick={niche ? () => setNiche(null) : onClose} className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg">
          {niche ? <><ArrowLeft className="h-3.5 w-3.5" /> Niches</> : "Fermer"}
        </button>
      </div>
      {!niche ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {NICHES.map((n) => (
            <button key={n.id} type="button" onClick={() => setNiche(n)} className="flex flex-col items-center gap-1.5 rounded-[14px] border border-white/10 bg-white/[0.04] px-2 py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[#34f0b0]/50 hover:bg-[#34f0b0]/10">
              <span className="text-2xl" aria-hidden>{n.emoji}</span>{n.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {niche.products.map(([name, brief]) => (
            <button key={name} type="button" onClick={() => onPick(brief)} className={cn("group flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-[#34f0b0]/50 hover:bg-[#34f0b0]/10")}>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{name}</span><span className="mt-0.5 block text-xs text-fg-muted">{brief}</span></span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#86efc9] transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-xs text-fg-faint">Un clic sur un produit et ta boutique se crée.</p>
    </div>
  );
}
