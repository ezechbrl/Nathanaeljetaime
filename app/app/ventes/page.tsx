import { redirect } from "next/navigation";

// Le tableau de bord des ventes vit sur /ventes (app « Vigenia Ventes », en plein écran sur le téléphone).
export default function LegacySales() {
  redirect("/ventes");
}
