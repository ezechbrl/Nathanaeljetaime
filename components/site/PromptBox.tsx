"use client";

import { ImagePlus, Link2, PenLine, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as api from "@/lib/api/client";
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

const MAX_PHOTOS = 3;
// Lien d'exemple : un vrai produit (mini aspirateur de voiture), pour voir le résultat sans chercher.
const EXAMPLE_LINK = "https://fr.aliexpress.com/item/1005012660420402.html";

export function PromptBox({ target = "/inscription", className, align = "center", inputId = "prompt" }: { target?: string; className?: string; align?: "center" | "left"; inputId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("start");
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const current = MODES.find((m) => m.id === mode)!;
  const linkMode = /^https?:\/\/\S+$/.test(value.trim());
  const [link, setLink] = useState<{ state: "idle" | "checking" | "fail" } | { state: "ok"; title: string; image: string | null }>({ state: "idle" });

  // Lien collé : passe en mode « lien » et on lit la page produit pour l'afficher (titre, photo).
  useEffect(() => {
    if (!linkMode) { setLink({ state: "idle" }); return; }
    setMode("link");
    let live = true;
    setLink({ state: "checking" });
    const t = setTimeout(() => {
      api.checkLink(value.trim())
        .then((r) => { if (live) setLink(r.ok ? { state: "ok", title: r.title, image: r.image } : { state: "fail" }); })
        .catch(() => { if (live) setLink({ state: "fail" }); });
    }, 400);
    return () => { live = false; clearTimeout(t); };
  }, [linkMode, value]);

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
      // Aperçu immédiat (fichier local), puis version réduite pour l'envoi : aucune attente à l'écran.
      const previews = images.map((f) => URL.createObjectURL(f));
      setPending(previews);
      try {
        const added = await Promise.all(images.map((f) => compressImage(f, 1280, 0.8)));
        setPhotos((p) => [...p, ...added].slice(0, MAX_PHOTOS));
      } finally {
        setPending([]);
        previews.forEach((u) => URL.revokeObjectURL(u));
      }
    } catch {
      setPhotoError("Cette image n'a pas pu être lue. Essaie une autre photo.");
    }
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (pending.length) return; // photo encore en préparation
    // Un lien collé passe en import par lien, quel que soit l'onglet choisi.
    const text = value.trim();
    const isLink = /^https?:\/\/\S+$/.test(text);
    const m = isLink ? "link" : mode;
    // Toujours le quiz d'abord (onboarding), avec la description ou le lien déjà donnés ; puis le compte et la boutique.
    const params = new URLSearchParams({ mode: m });
    if (text) params.set(m === "link" ? "url" : "brief", text);
    saveLandingPhotos(photos);
    router.push(`/quiz?${params}`);
  }

  return (
    <div className={cn("w-full max-w-2xl", align === "center" && "mx-auto", className)}>
      <form onSubmit={submit} className="glow-frame group relative rounded-[16px] p-[1.5px]">
        <div className="rounded-[14.5px] bg-[linear-gradient(180deg,#123d35,#0b2823)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
          <label htmlFor={inputId} className="sr-only">Décris ta boutique</label>
          {linkMode ? (
            // Lien collé : affiché en une ligne courte, avec le produit reconnu (photo + nom) si la page se lit.
            <div className="flex items-center gap-4 px-4 pb-3 pt-4 text-left">
              {link.state === "ok" && link.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={link.image} alt="" className="h-28 w-28 shrink-0 rounded-[14px] border border-white/20 bg-white object-cover shadow-[0_8px_24px_-10px_rgb(0_0_0/0.6)] sm:h-32 sm:w-32" />
                : <span className="grid h-28 w-28 shrink-0 place-items-center rounded-[14px] bg-[#34f0b0]/10 text-[#86efc9] sm:h-32 sm:w-32">{link.state === "checking" ? <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#86efc9]/30 border-t-[#86efc9]" /> : <Link2 className="h-8 w-8" />}</span>}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[16px] font-semibold leading-snug text-fg sm:text-[17px]">{link.state === "ok" && link.title ? link.title : shortLink(value)}</span>
                <span className="mt-1.5 block truncate text-[13px] text-fg-muted">
                  {link.state === "checking" ? "Lecture du produit…" : link.state === "ok" ? <span className="text-[#86efc9]">Produit trouvé ✓ · {hostOf(value)}</span> : `Lien produit · ${hostOf(value)}`}
                </span>
              </span>
              <button type="button" onClick={() => setValue("")} aria-label="Retirer le lien" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-fg-faint hover:bg-white/5 hover:text-fg"><X className="h-4 w-4" /></button>
            </div>
          ) : (
          <textarea
            id={inputId}
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={placeholder}
            className="block w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed text-fg placeholder:text-fg-faint focus:outline-none sm:text-base"
          />
          )}
          {(photos.length > 0 || pending.length > 0) && (
            // Grandes vignettes, comme une vraie pièce jointe.
            <div className="flex flex-wrap gap-3 px-4 pb-3 pt-1 text-left">
              {[...photos.map((src) => ({ src, loading: false })), ...pending.map((src) => ({ src, loading: true }))].map(({ src, loading }, i) => (
                <div key={src} className="relative h-28 w-28 overflow-hidden rounded-[14px] border border-white/20 bg-black/30 shadow-[0_8px_24px_-10px_rgb(0_0_0/0.6)] [animation:fade-in_.2s_ease-out_both] sm:h-32 sm:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo du produit ${i + 1}`} className="h-full w-full object-cover" />
                  {loading ? (
                    <span className="absolute inset-0 grid place-items-center bg-black/25"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" /></span>
                  ) : (
                    <button type="button" aria-label="Retirer la photo" onClick={() => setPhotos((p) => p.filter((x) => x !== src))} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/75 text-white ring-1 ring-white/30 backdrop-blur hover:bg-black">
                      <X className="h-4 w-4" />
                    </button>
                  )}
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
            <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#a7f3d0]/70 bg-[linear-gradient(180deg,#5ff7c2,#10b981)] px-5 text-[15px] font-bold text-[#03140d] transition-all [animation:cta-glow_2.4s_ease-in-out_infinite] hover:-translate-y-px hover:brightness-110">
              <Sparkles className="h-4 w-4" /> Générer
            </button>
          </div>
        </div>
      </form>
      {/* Pas de produit sous la main : un vrai lien d'exemple, reconnu tout de suite (photo et nom). */}
      {!value.trim() && (
        <button type="button" onClick={() => setValue(EXAMPLE_LINK)} className={cn("mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#86efc9] underline-offset-4 hover:text-white hover:underline", align === "center" && "mx-auto flex")}>
          <Link2 className="h-4 w-4" /> Essayer avec un exemple
        </button>
      )}
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


    </div>
  );
}

const hostOf = (u: string) => { try { return new URL(u.trim()).hostname.replace(/^(www|fr|m)\./, ""); } catch { return "lien"; } };
// Version courte d'un lien pour l'affichage : site + identifiant du produit, sans les paramètres de suivi.
function shortLink(u: string) {
  try {
    const url = new URL(u.trim());
    const id = url.pathname.match(/(\d{6,})/)?.[1];
    const host = url.hostname.replace(/^(www|fr|m)\./, "");
    return id ? `${host} · produit ${id}` : `${host}${url.pathname.length > 1 ? url.pathname.slice(0, 40) : ""}`;
  } catch { return u.slice(0, 60); }
}
