"use client";

import { ArrowUp, ImagePlus, Link2, PenLine, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { compressImage, saveLandingPhotos } from "@/lib/compress-image";

// Mêmes couleurs que les 2 cartes Shopify de la connexion : « Décrire » = vert de « Connecter mon compte
// Shopify », « Coller un lien » = vert clair de « Créer mon compte Shopify ».
export const MODES = [
  {
    id: "start", label: "Décrire", icon: PenLine,
    placeholder: "Je vends des chaussons bébé en laine mérinos, pour les jeunes parents qui veulent du fait main…",
    on: "border-[#6ee7b7]/60 bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_0_18px_rgb(46_230_166/0.55),inset_0_1px_0_rgb(255_255_255/0.45)]",
    off: "border-[#34f0b0]/30 text-[#86efc9] hover:bg-[#34f0b0]/10",
  },
  {
    id: "link", label: "Coller un lien", icon: Link2,
    placeholder: "Colle le lien de ton produit chez ton fournisseur (AliExpress, CJ…) ou ta propre page",
    on: "border-[#bbf7d0]/60 bg-[linear-gradient(180deg,#6ee7a0,#22c55e)] text-[#052e16] shadow-[0_0_18px_rgb(74_222_128/0.5),inset_0_1px_0_rgb(255_255_255/0.45)]",
    off: "border-[#4ade80]/30 text-[#a7f3c0] hover:bg-[#4ade80]/10",
  },
] as const;

const EXAMPLES = [
  "Café de spécialité en abonnement",
  "Harnais pour chien, coloris pastel",
  "Sac à dos cabine pour l'Espagne",
];
const MAX_PHOTOS = 3;

export function PromptBox({ target = "/inscription", className, align = "center", inputId = "prompt" }: { target?: string; className?: string; align?: "center" | "left"; inputId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("start");
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const current = MODES.find((m) => m.id === mode)!;

  // Placeholder qui s'écrit lettre par lettre.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaceholder(current.placeholder);
      return;
    }
    let i = 0;
    setPlaceholder("");
    const id = setInterval(() => {
      i++;
      setPlaceholder(current.placeholder.slice(0, i));
      if (i >= current.placeholder.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [current.placeholder]);

  // Photos du produit : réduites dans le navigateur, gardées jusqu'à la création de la boutique.
  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError("");
    try {
      const images = [...files].filter((f) => f.type.startsWith("image/")).slice(0, MAX_PHOTOS - photos.length);
      if (!images.length) return setPhotoError("Choisis une image (photo du produit).");
      const added = await Promise.all(images.map((f) => compressImage(f, 1280, 0.8)));
      setPhotos((p) => [...p, ...added].slice(0, MAX_PHOTOS));
    } catch {
      setPhotoError("Cette image n'a pas pu être lue. Essaie une autre photo.");
    }
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    // Un lien collé passe en import par lien, quel que soit l'onglet choisi.
    const text = value.trim();
    const isLink = /^https?:\/\/\S+$/.test(text);
    const m = isLink ? "link" : mode;
    // Parcours habituel : page d'inscription avec les 2 boutons Shopify, puis création dans le compte.
    const params = new URLSearchParams({ mode: m });
    if (text) params.set(m === "link" ? "url" : "brief", text);
    saveLandingPhotos(photos);
    router.push(`${target}?${params}`);
  }

  return (
    <div className={cn("w-full max-w-2xl", align === "center" && "mx-auto", className)}>
      <form onSubmit={submit} className="glow-frame group relative rounded-[16px] p-[1.5px]">
        <div className="rounded-[14.5px] bg-[linear-gradient(180deg,#123d35,#0b2823)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
          <label htmlFor={inputId} className="sr-only">Décris ta boutique</label>
          <textarea
            id={inputId}
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={placeholder}
            className="block w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed text-fg placeholder:text-fg-faint focus:outline-none sm:text-base"
          />
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {photos.map((src, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo du produit ${i + 1}`} className="h-14 w-14 rounded-[10px] border border-white/15 object-cover" />
                  <button type="button" aria-label="Retirer la photo" onClick={() => setPhotos((p) => p.filter((_, k) => k !== i))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/80 text-white ring-1 ring-white/30 hover:bg-black">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <input ref={fileInput} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 px-3 text-[13px] font-medium text-fg-muted transition-colors hover:border-white/25 hover:bg-white/5 hover:text-fg disabled:opacity-40"
            >
              <ImagePlus className="h-4 w-4" /> {photos.length ? `Photo ${photos.length}/${MAX_PHOTOS}` : "Photo du produit"}
            </button>
            <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-full border border-[#6ee7b7]/50 bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-4 text-sm font-semibold text-[#03140d] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_0_18px_rgb(46_230_166/0.55)] transition-all hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_0_28px_rgb(46_230_166/0.8)]">
              <Sparkles className="h-4 w-4" /> Générer
            </button>
          </div>
        </div>
      </form>
      {photoError && <p role="alert" className={cn("mt-2 text-sm text-red-300", align === "center" && "text-center")}>{photoError}</p>}

      {/* Les 2 façons de commencer, sous le champ, aux couleurs des cartes Shopify. */}
      <div role="tablist" aria-label="Mode de création" className={cn("mt-5 grid w-full grid-cols-2 gap-1.5 rounded-[18px] border border-white/10 bg-black/25 p-1.5 backdrop-blur sm:flex sm:w-fit sm:max-w-full sm:gap-2 sm:rounded-full", align === "center" && "mx-auto")}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn("flex items-center justify-center gap-2 rounded-[14px] border px-3 py-3 text-[15px] font-semibold leading-tight transition-all sm:shrink-0 sm:rounded-full sm:px-6 sm:text-[16.5px]", mode === m.id ? m.on : m.off)}
          >
            <m.icon className="h-[18px] w-[18px] shrink-0" /> {m.label}
          </button>
        ))}
      </div>

      {mode === "start" && (
        <div className={cn("mt-4 hidden flex-wrap gap-2 sm:flex", align === "center" && "justify-center")}>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setValue(ex)} className="flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1 text-xs text-fg-faint transition-colors hover:border-white/15 hover:text-fg-muted">
              {ex} <ArrowUp className="h-3 w-3 rotate-45" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
