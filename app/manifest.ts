import type { MetadataRoute } from "next";

// Ajout à l'écran d'accueil du téléphone : nom et logo Vigenia (au lieu d'une simple lettre).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vigenia",
    short_name: "Vigenia",
    start_url: "/app",
    display: "standalone",
    background_color: "#04211a",
    theme_color: "#04211a",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
