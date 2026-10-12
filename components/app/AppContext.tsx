"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import type { Store, Usage, User } from "@/lib/api/types";

type Ctx = {
  user: User;
  usage: Usage;
  stores: Store[];
  refresh: () => Promise<void>;
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return v;
}

export function AppProvider({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<{ user: User; usage: Usage } | null>(null);
  const [stores, setStores] = useState<Store[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [me, list] = await Promise.all([api.getMe(), api.listStores()]);
      setState(me);
      setStores(list.stores);
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        router.replace(`/connexion?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      } else {
        throw e;
      }
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!state) return <>{fallback}</>;
  return <AppCtx.Provider value={{ ...state, stores, setStores, refresh }}>{children}</AppCtx.Provider>;
}
