import { StoreProvider } from "@/components/app/StoreContext";

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StoreProvider id={id}>
      {/* Fond noir et vert, comme l'accueil */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_85%_0%,rgb(0_150_110/0.35),transparent_70%),radial-gradient(ellipse_60%_50%_at_0%_100%,rgb(104_230_176/0.10),transparent_70%),linear-gradient(180deg,#06120f,#0a2420_55%,#050d0b)]" />
      {children}
    </StoreProvider>
  );
}
