"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "./AppContext";

// Sur le téléphone du fondateur, une app d'écran d'accueil qui s'ouvre (ou revient après la connexion
// Shopify) sur l'accueil /app est renvoyée sur « Ventes ». Une seule fois par ouverture : le lien
// « Vigenia » de la page Ventes permet ensuite d'aller dans l'app normalement.
export function StandaloneHome() {
  const { user } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!user.isOwner || pathname !== "/app") return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (!standalone) return;
    try {
      if (sessionStorage.getItem("vg-stay")) return;
      sessionStorage.setItem("vg-stay", "1");
    } catch {}
    router.replace("/ventes");
  }, [user.isOwner, pathname, router]);
  return null;
}
