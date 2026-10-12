import { StoreProvider } from "@/components/app/StoreContext";

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreProvider id={id}>{children}</StoreProvider>;
}
