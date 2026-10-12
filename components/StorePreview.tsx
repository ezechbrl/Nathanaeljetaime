import type { StorePlan } from "@/lib/store-schema";

const HEX = /^#[0-9a-f]{3,8}$/i;
const safeColor = (c: string, fallback: string) => (HEX.test(c) ? c : fallback);

// Supprime tout ce qui n'est pas un balisage de mise en forme simple avant affichage.
function sanitize(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(?!\/?(p|h3|ul|ol|li|strong|em|br)\b)[^>]*>/gi, "")
    .replace(/<(\w+)\s[^>]*>/g, "<$1>");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-black/10 p-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-black/40">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StorePreview({ plan }: { plan: StorePlan }) {
  const primary = safeColor(plan.brand.colors.primary, "#111111");
  const accent = safeColor(plan.brand.colors.accent, "#6d4aff");
  const background = safeColor(plan.brand.colors.background, "#ffffff");

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-black/10" style={{ background }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ color: primary }}>
          <span className="text-lg font-bold">{plan.brand.name}</span>
          <span className="text-xs opacity-60">{plan.brand.tagline}</span>
        </div>
        <div className="px-6 py-16 text-center" style={{ color: primary }}>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">{plan.homepage.heroTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-70">{plan.homepage.heroSubtitle}</p>
          <span className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
            {plan.homepage.ctaLabel}
          </span>
        </div>
        <div className="grid gap-4 px-6 pb-10 sm:grid-cols-3" style={{ color: primary }}>
          {plan.homepage.benefits.map((b) => (
            <div key={b.title} className="rounded-2xl bg-black/[0.04] p-4">
              <p className="font-semibold">{b.title}</p>
              <p className="mt-1 text-sm opacity-70">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Section title="Stratégie">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold">Marché</dt><dd className="text-black/70">{plan.strategy.market}</dd></div>
          <div><dt className="font-semibold">Promesse</dt><dd className="text-black/70">{plan.strategy.promise}</dd></div>
          <div>
            <dt className="font-semibold">Offres</dt>
            <dd><ul className="list-disc pl-5 text-black/70">{plan.strategy.offers.map((o) => <li key={o}>{o}</li>)}</ul></dd>
          </div>
          <div>
            <dt className="font-semibold">Objections</dt>
            <dd className="space-y-2 text-black/70">
              {plan.strategy.objections.map((o) => (
                <p key={o.objection}><strong>{o.objection}</strong> — {o.answer}</p>
              ))}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-black/50">Ton : {plan.brand.tone} · Preuve sociale à collecter : {plan.homepage.socialProofIdea}</p>
      </Section>

      <Section title="Fiche produit">
        <h3 className="text-2xl font-bold">{plan.product.title}</h3>
        <p className="text-black/60">{plan.product.subtitle}</p>
        <p className="mt-3 text-xl font-semibold">
          {plan.product.price} €{" "}
          {plan.product.compareAtPrice && <s className="text-base font-normal text-black/40">{plan.product.compareAtPrice} €</s>}
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm">{plan.product.bulletPoints.map((b) => <li key={b}>{b}</li>)}</ul>
        <div
          className="prose-sm mt-4 space-y-2 text-sm text-black/80 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: sanitize(plan.product.descriptionHtml) }}
        />
        <div className="mt-4 rounded-2xl bg-black/[0.03] p-4 text-xs">
          <p className="font-medium text-blue-700">{plan.product.seoTitle}</p>
          <p className="text-black/60">{plan.product.seoDescription}</p>
        </div>
      </Section>

      <Section title="FAQ">
        <div className="space-y-3 text-sm">
          {plan.faq.map((f) => (
            <div key={f.question}><p className="font-semibold">{f.question}</p><p className="text-black/70">{f.answer}</p></div>
          ))}
        </div>
      </Section>
    </div>
  );
}
