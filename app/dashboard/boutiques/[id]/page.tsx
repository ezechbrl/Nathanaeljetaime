import { notFound } from "next/navigation";
import { StoreEditor } from "@/components/dashboard/StoreEditor";
import { MOCK_STORES } from "@/lib/mock";

export function generateStaticParams() {
  return MOCK_STORES.map((s) => ({ id: s.id }));
}

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = MOCK_STORES.find((s) => s.id === id);
  if (!store) notFound();
  return <StoreEditor store={store} />;
}
