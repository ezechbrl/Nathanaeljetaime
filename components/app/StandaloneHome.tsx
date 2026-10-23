"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// L'app « Ventes » (écran d'accueil) a sa propre session : après la connexion Shopify, on revient
// parfois sur l'accueil /app. Dans cette app-là, on renvoie tout de suite sur /ventes.
export function StandaloneHome() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (pathname !== "/app" || !window.matchMedia("(display-mode: standalone)").matches) return;
    try {
      if (localStorage.getItem("vg-home") === "/ventes") router.replace("/ventes");
    } catch {}
  }, [pathname, router]);
  return null;
}
