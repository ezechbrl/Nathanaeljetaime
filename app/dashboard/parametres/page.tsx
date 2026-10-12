import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata = { title: "Paramètres" };

const input = "mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" />
      <div className="grid max-w-4xl gap-6 px-6 py-8 sm:px-10">
        <Card title="Profil">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Prénom<input className={input} defaultValue="" /></label>
            <label className="text-sm font-medium">E-mail<input className={input} type="email" defaultValue="toi@exemple.fr" /></label>
          </div>
          <button className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Enregistrer</button>
        </Card>

        <Card title="Boutique Shopify">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-black/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛍️</span>
              <div>
                <p className="text-sm font-medium">lumea.myshopify.com</p>
                <p className="text-xs text-emerald-700">● Connectée</p>
              </div>
            </div>
            <button className="rounded-full border border-black/10 px-4 py-2 text-sm">Déconnecter</button>
          </div>
          <button className="mt-4 rounded-full bg-[#008060] px-4 py-2 text-sm font-semibold text-white">+ Connecter une autre boutique</button>
        </Card>

        <Card title="Abonnement">
          <p className="text-sm">Plan actuel : <strong>Découverte</strong> (gratuit) · 1 génération restante</p>
          <Link href="/tarifs" className="mt-4 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Voir les offres</Link>
        </Card>

        <Card title="Zone sensible">
          <button className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600">Supprimer mon compte</button>
        </Card>
      </div>
    </>
  );
}
