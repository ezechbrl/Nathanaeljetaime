import type { Metadata } from "next";
import { PreviewView } from "./PreviewView";

export const metadata: Metadata = { title: "Ta boutique", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PreviewView id={(await params).id} />;
}
