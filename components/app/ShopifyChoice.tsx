"use client";

import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { normalizeShop, ShopifyBag } from "@/components/auth/AuthForms";
import { AuroraBackground } from "@/components/pricing/PlanCards";
import { Spinner } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import * as api from "@/lib/api/client";
import { site } from "@/lib/site";

// Deux grandes cartes : créer un compte Shopify, ou relier celui qu'on a déjà.
export function ShopifyChoice({ next, brief }: { next: string; brief?: string }) {
  const [open, setOpen] = useState(false);
  const [shop, setShop] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    const domain = normalizeShop(shop);
    if (!domain) return setError("Saisis l'adresse de ta boutique, par exemple ma-boutique.myshopify.com");
    setError("");
    setLoading(true);
    await api.loginWithShopify(domain, next).catch((err) => {
      setError((err as Error).message);
      setLoading(false);
    });
  }

  return (
    <div className="relative isolate overflow-hidden rounded-[26px] border border-white/10 px-4 py-8 sm:px-8 sm:py-10">
      <AuroraBackground className="-z-10" />
      {brief && <p className="mx-auto max-w-xl truncate text-center text-[13px] text-fg-muted">Ton projet est gardé : <span className="italic text-fg">« {brief} »</span></p>}
      <h2 className="mt-2 text-center text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)] font-semibold tracking-[-0.03em]">Relie ta boutique Shopify</h2>
      <p className="mt-1.5 text-center text-sm text-fg-muted">Vigenia publie ta boutique directement dans Shopify.</p>

      <div className="mx-auto mt-7 grid max-w-[760px] gap-4 sm:grid-cols-2">
        <div className="flex flex-col rounded-[22px] border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <div className="grid h-36 place-items-center rounded-[16px] bg-[linear-gradient(135deg,#c4f04a,#95bf47)]">
            <span className="flex items-center gap-2"><ShopifyBag className="h-12 w-12 drop-shadow" /><span className="text-[1.9rem] font-bold italic tracking-[-0.02em] text-white drop-shadow">shopify</span></span>
          </div>
          <p className="mt-5 text-[1.35rem] font-semibold tracking-[-0.02em]">Pas de compte Shopify ?</p>
          <p className="mt-1 flex-1 text-[13.5px] text-fg-muted">Crée ta boutique Shopify : {site.shopifyOffer} en ce moment. Reviens ensuite ici pour la relier. <span className="text-fg-faint">(Lien partenaire Shopify.)</span></p>
          <a href={site.shopifySignupUrl} target="_blank" rel="noreferrer sponsored" className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#c4f04a,#8fbf2f)] text-[15px] font-semibold text-[#0f1f05] shadow-[0_10px_30px_-10px_rgb(196_240_74/0.7)] transition-transform hover:-translate-y-px">
            Créer un compte Shopify <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="flex flex-col rounded-[22px] border border-[#2ee6a6]/30 bg-black/30 p-4 backdrop-blur-xl">
          <div className="grid h-36 place-items-center rounded-[16px] border border-white/5 bg-[linear-gradient(135deg,rgb(16_176_127/0.35),rgb(4_30_22/0.6))]">
            <span className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-black/40"><LogoMark /></span>
              <span className="flex items-center gap-1"><span className="h-px w-6 bg-white/50" /><span className="h-1.5 w-1.5 rounded-full bg-[#2ee6a6]" /><span className="h-px w-6 bg-white/50" /></span>
              <ShopifyBag className="h-12 w-12" />
            </span>
          </div>
          <p className="mt-5 text-[1.35rem] font-semibold tracking-[-0.02em]">J'ai un compte Shopify</p>
          <p className="mt-1 flex-1 text-[13.5px] text-fg-muted">Relie ta boutique à Vigenia en 10 secondes.</p>
          {open ? (
            <form onSubmit={connect} className="mt-4">
              <div className="flex items-center rounded-full border border-white/15 bg-white/[0.04] focus-within:border-[#2ee6a6]">
                <input autoFocus value={shop} onChange={(e) => setShop(e.target.value)} autoComplete="off" spellCheck={false} placeholder="ma-boutique" aria-label="Adresse de ta boutique" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] focus:outline-none" />
                <span className="pr-4 text-sm text-fg-faint">.myshopify.com</span>
              </div>
              {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
              <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[15px] font-semibold text-[#03140d] disabled:opacity-60">
                {loading ? <Spinner /> : <>Connecter <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[15px] font-semibold text-[#03140d] shadow-[0_10px_30px_-10px_rgb(46_230_166/0.7)] transition-transform hover:-translate-y-px">
              Connecter Vigenia à Shopify <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShopifyChoiceDialog({ next, onClose }: { next: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Relier ma boutique Shopify" className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm [animation:fade-in_.2s_ease-out] sm:items-center" onClick={onClose}>
      <div className="relative my-auto w-full max-w-[860px] [animation:rise_.35s_cubic-bezier(.2,.8,.2,1)]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-fg-muted hover:bg-white/10 hover:text-fg"><X className="h-4 w-4" /></button>
        <ShopifyChoice next={next} />
      </div>
    </div>
  );
}
