"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { formatDate } from "@/lib/format";

function Card({ id, title, text, children }: { id?: string; title: string; text?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-6 border-b border-white/[0.06] py-8 lg:grid-cols-[280px_1fr]">
      <div><h2 className="text-[16px] tracking-tight">{title}</h2>{text && <p className="mt-1 text-sm text-fg-muted">{text}</p>}</div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, refresh } = useApp();
  const router = useRouter();
  const toast = useToast();
  const connections = useApi(() => api.listConnections(), []);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState("");

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await api.updateMe({ firstName: String(f.get("firstName")), email: String(f.get("email")) });
      await refresh();
      toast("Profil enregistré");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function disconnect(id: string) {
    await api.disconnectShop(id);
    connections.reload();
    toast("Boutique déconnectée");
  }

  async function deleteAccount() {
    await api.deleteAccount();
    await api.logout().catch(() => {});
    router.push("/");
  }

  return (
    <>
      <PageHeader title="Paramètres" />
      <div className="px-5 sm:px-8">
        <Card title="Profil">
          <form onSubmit={saveProfile} className="space-y-4">
            <label className="block text-sm">Prénom<input name="firstName" defaultValue={user.firstName} required className="field mt-1.5" /></label>
            <label className="block text-sm">E-mail<input name="email" type="email" defaultValue={user.email} required className="field mt-1.5" /></label>
            <Button type="submit" disabled={saving}>{saving ? <Spinner /> : "Enregistrer"}</Button>
          </form>
        </Card>

        {connections.data && connections.data.connections.length > 0 && (
        <Card id="shopify" title="Boutiques Shopify" text="Anciennes connexions. Tu peux les déconnecter.">
          <div className="space-y-2">
            {!connections.data ? <Skeleton className="h-16" /> : connections.data.connections.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-card border border-white/[0.07] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ctl bg-[#f4f6f1]"><ShoppingBag className="h-4 w-4 text-[#5e8e3e]" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{c.shopDomain}</p>
                    <p className="text-xs text-fg-faint">{c.status === "active" ? `Connectée le ${formatDate(c.connectedAt)}` : "Accès révoqué"}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => disconnect(c.id)}>Déconnecter</Button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-fg-muted">Plus besoin de connecter Shopify : sur chaque boutique, clique sur « Mettre en ligne sur Shopify » et suis les 2 étapes.</p>
        </Card>
        )}

        <Card title="Supprimer le compte" text="Supprime ton compte et toutes tes données. Tes boutiques Shopify ne sont pas touchées.">
          <label className="block text-sm text-fg-muted">Tape <span className="font-mono text-fg">SUPPRIMER</span> pour confirmer<input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field mt-1.5" /></label>
          <Button variant="danger" className="mt-4" disabled={confirm !== "SUPPRIMER"} onClick={deleteAccount}><Trash2 className="h-4 w-4" /> Supprimer définitivement</Button>
        </Card>
      </div>
    </>
  );
}
