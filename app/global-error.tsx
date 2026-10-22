"use client";

import { useEffect } from "react";
import { isStaleBuildError, reloadOnce } from "@/lib/recover";

// Dernier filet : remplace toute la page, donc styles écrits ici directement.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    if (isStaleBuildError(error)) reloadOnce();
  }, [error]);
  return (
    <html lang="fr">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#05261d", color: "#ecfdf5", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 20 }}>
        <title>Vigenia</title>
        <div>
          <p style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Petit souci d'affichage</p>
          <p style={{ opacity: 0.7, marginTop: 8, fontSize: 14 }}>Ton travail est bien enregistré. Recharge la page pour continuer.</p>
          <button onClick={() => { retry(); window.location.reload(); }} style={{ marginTop: 20, height: 44, padding: "0 20px", borderRadius: 10, border: 0, background: "#4ade80", color: "#05261d", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Recharger</button>
        </div>
      </body>
    </html>
  );
}
