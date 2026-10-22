"use client";

import { AlertTriangle, Clock, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Avant / maintenant : coder sa boutique à la main (des semaines) contre Vigenia (quelques minutes).
const CODE = [
  "{% schema %}",
  '  "name": "Section produit",',
  '  "settings": [{ "type": "image_picker",',
  "{% endschema %}",
  "<div class=\"product__media {{ section.id }}\">",
  "  {% for media in product.media %}",
  "    {% render 'media', media: media, loading: 'lazy' %}",
  "  {% endfor %}",
  ".product__title { font-size: clamp(2rem, 4vw, 3rem); }",
  "@media (max-width: 749px) { .grid--2 { display: block } }",
  "{% if product.selected_variant.available %}",
  "  <button type=\"submit\" name=\"add\">{{ 'cart.add' | t }}",
];

function CodingLoop() {
  const [lines, setLines] = useState(0);
  const [day, setDay] = useState(1);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setLines(CODE.length); setDay(21); return; }
    const t = window.setInterval(() => {
      setLines((n) => {
        if (n >= CODE.length) { setDay((d) => (d >= 21 ? 1 : d + 4)); setError(false); return 0; }
        if (n === 7) setError(true);
        if (n === 9) setError(false);
        return n + 1;
      });
    }, 420);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="relative h-full overflow-hidden rounded-[14px] bg-[#0b0d10] font-mono text-[12px] leading-[1.7] text-[#9aa4b2]">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2 text-[11px] text-[#6b7280]">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" /><span className="h-2 w-2 rounded-full bg-[#febc2e]" /><span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-2">sections/main-product.liquid</span>
      </div>
      <div className="p-4">
        {CODE.slice(0, lines).map((l, i) => (
          <p key={i} className="whitespace-pre"><span className="mr-3 inline-block w-4 text-right text-[#4b5563]">{i + 1}</span><span className={l.startsWith("{%") ? "text-[#c084fc]" : l.startsWith(".") || l.startsWith("@") ? "text-[#60a5fa]" : ""}>{l}</span></p>
        ))}
        <span className="ml-7 inline-block h-4 w-2 animate-pulse bg-[#9aa4b2]" />
      </div>
      {error && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 font-sans text-[12px] text-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Liquid error : la section ne s'affiche pas sur mobile
        </div>
      )}
      <div className="absolute right-3 top-10 rounded-full bg-white/10 px-3 py-1 font-sans text-[12px] font-semibold text-white tabular-nums">Jour {day} / 21</div>
    </div>
  );
}

function VigeniaLoop({ name }: { name: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} muted loop playsInline preload="metadata" poster={`/videos/${name}.jpg`} className="h-full w-full rounded-[14px] bg-black object-cover" aria-label="Vigenia crée une boutique à partir d'un lien">
      <source src={`/videos/${name}.mp4`} type="video/mp4" />
      <source src={`/videos/${name}.webm`} type="video/webm" />
    </video>
  );
}

export function BeforeAfter() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[22px] border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <p className="text-[15px] font-semibold text-fg-muted">Avant · coder sa boutique</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-[12px] font-semibold text-red-200"><Clock className="h-3.5 w-3.5" /> 3 semaines</span>
        </div>
        <div className="h-[190px] sm:h-auto sm:aspect-video"><CodingLoop /></div>
      </div>
      <div className="rounded-[22px] bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_45%,rgb(46_230_166/0.5))] p-px shadow-[0_0_60px_-20px_rgb(46_230_166/0.6)]">
        <div className="h-full rounded-[21px] bg-[#05261d]/90 p-3">
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <p className="text-[15px] font-semibold">Maintenant · avec Vigenia</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2ee6a6]/15 px-3 py-1 text-[12px] font-semibold text-[#a7f3d0]"><Sparkles className="h-3.5 w-3.5" /> 10 minutes</span>
          </div>
          <div className="hidden aspect-video sm:block"><VigeniaLoop name="demo-link" /></div>
          {/* Sur téléphone, la vidéo est déjà en haut de la page : ici, juste les 3 étapes. */}
          <ol className="space-y-2 px-2 pb-2 sm:hidden">
            {["Tu colles le lien de ton produit", "L'IA écrit, crée les photos et importe les vrais avis", "Tu valides : c'est en ligne sur Shopify"].map((t, i) => (
              <li key={t} className="flex items-center gap-3 rounded-[12px] border border-white/[0.08] bg-black/20 px-3 py-2.5 text-[14px]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2ee6a6] text-[12px] font-bold text-[#03140d]">{i + 1}</span>{t}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
