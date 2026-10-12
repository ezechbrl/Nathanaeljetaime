import { ownedStore, requireUser } from "@/lib/server/auth";
import { badRequest, json, route } from "@/lib/server/http";
import { storeImage } from "@/lib/server/images";
import { toAsset } from "@/lib/server/mappers";
import { rateLimit } from "@/lib/server/quota";
import { db, must } from "@/lib/server/supabase";

const TYPES = ["image/png", "image/jpeg", "image/webp"];

export const POST = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  await rateLimit(`upload:${user.id}`, 30, 600);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw badRequest("Aucun fichier reçu.", "file");
  if (!TYPES.includes(file.type)) throw badRequest("Formats acceptés : PNG, JPG, WebP.", "file");
  if (file.size > 10 * 1024 * 1024) throw badRequest("Image trop lourde (10 Mo maximum).", "file");
  const saved = await storeImage(store.id, new Uint8Array(await file.arrayBuffer()), file.type);
  const row = must(await db().from("assets").insert({ store_id: store.id, kind: "upload", storage_path: saved.path, url: saved.url }).select("*").single());
  return json({ asset: toAsset(row) }, 201);
});
