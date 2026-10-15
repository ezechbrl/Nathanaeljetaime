"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import { useStore } from "./StoreContext";

export function PublishButton({ size = "md" }: { size?: "sm" | "md" }) {
  const { store, trackJob, setStore, activeJob } = useStore();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needShop, setNeedShop] = useState(false);
  const [reauth, setReauth] = useState<string | null>(null);
  if (!store.plan) return null;

  if (activeJob?.kind === "publish") {
    return (
      <div className="flex h-10 min-w-[190px] items-center gap-3 rounded-ctl border border-accent/30 bg-accent-deep/30 px-3 text-sm" role="status">
        <Spinner className="text-accent" />
        <span className="flex-1">Publication…</span>
        <span className="tabular-nums text-fg-muted">{activeJob.progress} %</span>
      </div>
    );
  }

  async function publish(publishTheme: boolean) {
    setLoading(true);
    try {
      const { job } = await api.publishStore(store.id, publishTheme);
      setStore({ ...store, status: "publishing" });
      trackJob(job);
      setConfirm(false);
    } catch (e) {
      if (e instanceof ApiClientError && e.code === "no_shop") setNeedShop(true);
      else if (e instanceof ApiClientError && e.code === "reauth_required" && e.field) setReauth(e.field);
      else toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button size={size} onClick={() => setConfirm((c) => !c)} disabled={!!activeJob}>
        <Upload className="h-4 w-4" /> {store.status === "published" ? "Republier" : "Publier sur Shopify"}
      </Button>
      {confirm && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-card border border-white/10 bg-bg-2 p-4 text-sm shadow-2xl">
          {reauth ? (
            <>
              <p className="text-fg">Une autorisation à donner</p>
              <p className="mt-1 text-fg-muted">Vitrio installe maintenant un vrai thème à tes couleurs dans Shopify. Shopify te demande de l'autoriser une fois, puis tu reviens ici.</p>
              <a href={api.shopifyLoginUrl(reauth, `/app/boutiques/${store.id}`)} className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-ctl bg-accent px-3 text-sm font-medium text-white">Autoriser dans Shopify</a>
            </>
          ) : needShop ? (
            <>
              <p>Aucune boutique Shopify connectée.</p>
              <Link href="/app/parametres#shopify" className="mt-3 inline-block text-accent underline underline-offset-4">Connecter ma boutique</Link>
            </>
          ) : (
            <>
              <p className="text-fg">Comment publier ?</p>
              <p className="mt-1 text-fg-muted">Ton produit, tes pages et ton thème Vitrio sont installés dans Shopify. Le thème peut rester en aperçu le temps que tu vérifies.</p>
              <div className="mt-4 grid gap-2">
                <Button size="sm" variant="secondary" disabled={loading} onClick={() => publish(false)}>{loading ? <Spinner /> : "Envoyer, thème en aperçu"}</Button>
                <Button size="sm" disabled={loading} onClick={() => publish(true)}>{loading ? <Spinner /> : "Envoyer et mettre le thème en ligne"}</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
