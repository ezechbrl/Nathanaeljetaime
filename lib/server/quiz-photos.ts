import "server-only";
import { generateImage } from "./images";
import { db, must } from "./supabase";
import { NICHES } from "@/lib/niches";
import { productSlug } from "@/lib/content/product-pages";

// Photos du quiz (univers et produits) : générées une seule fois par fal.ai, petites (512 px), gardées dans le
// stockage Supabase. La tâche de chaque heure en crée quelques-unes jusqu'à ce qu'il n'en manque plus.
const SCENES: Record<string, string> = {
  beaute: "a bright bathroom vanity with skincare bottles, a hair brush and makeup, soft morning light",
  maison: "a cozy bedroom corner at dusk with a warm lamp, soft textiles and plants",
  animaux: "a happy cat and a dog resting together on a soft rug in a bright living room",
  sport: "home workout gear on a wooden floor: dumbbells, resistance bands, a water bottle, daylight",
  bebe: "a calm nursery with a crib, soft toys and a night light, pastel colors",
  cuisine: "a modern kitchen counter with fresh vegetables, a small blender and utensils, daylight",
  tech: "a tidy desk with a smartphone, wireless earbuds and a charger, clean modern style",
  auto: "the clean interior of a modern car, dashboard and front seats, daylight",
  mode: "minimalist jewelry and a watch laid on linen fabric, soft natural light",
  jardin: "a small garden terrace at sunset with string lights and outdoor cushions",
  gaming: "a gaming desk setup with RGB lights, a large mouse pad, a headset on a stand, dark room",
  voyage: "an open suitcase with packing cubes, a travel pillow and a passport on a bed",
};

export function quizPhotoJobs() {
  const jobs: { key: string; prompt: string }[] = [];
  for (const n of NICHES) {
    jobs.push({ key: n.id, prompt: `Realistic lifestyle photo, ${SCENES[n.id] ?? n.label}. No text, no logo, no brand, no people's faces.` });
    for (const [name, brief] of n.products) {
      jobs.push({ key: `p:${productSlug(name)}`, prompt: `Realistic e-commerce product photo: ${brief}. The product alone, centered, on a neutral light background, soft natural light, high detail. No text, no logo, no brand name, no packaging text.` });
    }
  }
  return jobs;
}

export async function fillQuizPhotos(max = 24) {
  const have = new Set((must(await db().from("quiz_photos").select("key")) as { key: string }[]).map((r) => r.key));
  const todo = quizPhotoJobs().filter((j) => !have.has(j.key)).slice(0, max);
  let made = 0;
  // 4 à la fois pour rester sous la limite de fal.ai.
  for (let i = 0; i < todo.length; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async (j) => {
      try {
        const img = await generateImage(j.prompt, "1:1", { width: 512, height: 512 });
        const path = `quiz/${j.key.replace(":", "-")}.jpg`;
        must(await db().storage.from("assets").upload(path, img.bytes, { contentType: img.contentType, upsert: true }));
        const { data } = db().storage.from("assets").getPublicUrl(path);
        must(await db().from("quiz_photos").upsert({ key: j.key, url: `${data.publicUrl}?v=1` }));
        made++;
      } catch (e) {
        console.warn("Photo du quiz", j.key, (e as Error).message);
      }
    }));
  }
  return made;
}

export async function quizPhotoMap() {
  const rows = must(await db().from("quiz_photos").select("key, url")) as { key: string; url: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.url]));
}
