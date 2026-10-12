import type { Metadata } from "next";
import { AppProvider } from "@/components/app/AppContext";
import { Sidebar } from "@/components/app/Sidebar";
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider fallback={<Loading />}>
        <div className="min-h-dvh lg:flex">
          <Sidebar />
          <main id="main" className="min-w-0 flex-1">{children}</main>
        </div>
      </AppProvider>
    </ToastProvider>
  );
}
