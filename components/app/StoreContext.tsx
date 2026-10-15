"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ErrorState, Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { usePoll } from "@/lib/api/hooks";
import type { Job, Store } from "@/lib/api/types";
import { useApp } from "./AppContext";
import { LaunchCelebration } from "./LaunchCelebration";

type Ctx = { store: Store; activeJob: Job | null; setStore: (s: Store) => void; reload: () => Promise<void>; trackJob: (job: Job) => void };
const StoreCtx = createContext<Ctx | null>(null);

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useStore doit être utilisé dans <StoreProvider>");
  return v;
}

export function StoreProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const { setStores } = useApp();
  const toast = useToast();
  const [store, setStoreState] = useState<Store | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const setStore = useCallback((s: Store) => {
    setStoreState(s);
    setStores((all) => all.map((x) => (x.id === s.id ? s : x)));
  }, [setStores]);

  const reload = useCallback(async () => {
    try {
      const res = await api.getStore(id);
      setStore(res.store);
      setActiveJob(res.activeJob);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id, setStore]);

  useEffect(() => {
    setStoreState(null);
    reload();
  }, [reload]);

  // Tant qu'une tâche tourne, on suit sa progression puis on recharge la boutique.
  usePoll(async () => {
    if (!activeJob) return;
    const { job } = await api.getJob(activeJob.id);
    setActiveJob(job.status === "queued" || job.status === "running" ? job : null);
    if (job.status === "succeeded" || job.status === "failed") {
      if (job.kind === "publish") toast(job.status === "succeeded" ? "Boutique publiée sur Shopify" : job.error ?? "La publication a échoué.", job.status === "succeeded" ? "ok" : "error");
      if (job.kind === "generate" && job.status === "succeeded") setCelebrate(true);
      reload();
    }
  }, 1500, !!activeJob);

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={reload} /></div>;
  if (!store) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="mt-8 h-[360px] w-full" />
      </div>
    );
  }
  return (
    <StoreCtx.Provider value={{ store, activeJob, setStore, reload, trackJob: setActiveJob }}>
      {children}
      {celebrate && store.status !== "generating" && <LaunchCelebration store={store} onClose={() => setCelebrate(false)} />}
    </StoreCtx.Provider>
  );
}
