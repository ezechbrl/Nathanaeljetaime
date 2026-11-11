import { permanentRedirect } from "next/navigation";

// La refonte d'une boutique existante demandait l'app Shopify (lecture de la boutique) : page retirée.
export default function RecraftPage() {
  permanentRedirect("/boutique-shopify-cle-en-main");
}
