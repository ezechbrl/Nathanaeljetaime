"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Compte les visiteurs (anonyme, sans cookie) : un identifiant aléatoire par onglet, pour la durée de la visite.
// Le fondateur et l'app Ventes ne sont pas comptés.
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/ventes")) return;
    let sid: string;
    try {
      if (localStorage.getItem("vg-owner")) return;
      sid = sessionStorage.getItem("vg-sid") ?? "";
      if (!sid) {
        sid = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
        sessionStorage.setItem("vg-sid", sid);
      }
    } catch {
      return;
    }
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sid, path: pathname }), keepalive: true }).catch(() => {});
    };
    ping();
    const t = window.setInterval(ping, 30_000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [pathname]);
  return null;
}
