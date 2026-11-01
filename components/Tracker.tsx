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
    let src = "";
    try {
      if (localStorage.getItem("vg-owner") || navigator.webdriver) return; // fondateur, navigateurs pilotés par un robot
      sid = sessionStorage.getItem("vg-sid") ?? "";
      if (!sid) {
        sid = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
        sessionStorage.setItem("vg-sid", sid);
        // Origine de la visite, mémorisée au premier passage : ?utm_source=, ?ref=, sinon le site d'où l'on vient.
        const q = new URLSearchParams(location.search);
        src = q.get("utm_source") || q.get("ref") || document.referrer || "";
        sessionStorage.setItem("vg-src", src);
      } else src = sessionStorage.getItem("vg-src") ?? "";
    } catch {
      return;
    }
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sid, path: pathname, src: src.slice(0, 300) }), keepalive: true }).catch(() => {});
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
