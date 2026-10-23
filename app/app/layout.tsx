import type { Metadata } from "next";
import { AppProvider } from "@/components/app/AppContext";
import { OfferBanner } from "@/components/app/OfferBanner";
import { Sidebar } from "@/components/app/Sidebar";
import { StandaloneHome } from "@/components/app/StandaloneHome";
import { LogoMark } from "@/components/ui/Logo";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <LogoMark className="h-10 w-10 animate-pulse" />
    </div>
  );
}

// App « Ventes » du fondateur ouverte depuis l'écran d'accueil sur /app : on part sur /ventes avant même
// d'afficher quoi que ce soit (sinon on voit l'accueil Vigenia une fraction de seconde).
const SALES_REDIRECT = `try{var s=matchMedia("(display-mode: standalone)").matches||navigator.standalone;if(s&&location.pathname==="/app"&&localStorage.getItem("vg-owner")&&!sessionStorage.getItem("vg-stay")){sessionStorage.setItem("vg-stay","1");location.replace("/ventes")}}catch(e){}`;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <script dangerouslySetInnerHTML={{ __html: SALES_REDIRECT }} />
      <AppProvider fallback={<Loading />}>
        <StandaloneHome />
        <div className="min-h-dvh lg:flex">
          <Sidebar />
          <main id="main" className="min-w-0 flex-1"><OfferBanner />{children}</main>
        </div>
      </AppProvider>
    </ToastProvider>
  );
}
