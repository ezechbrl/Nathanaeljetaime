// Enregistre de vraies vidéos de l'application (mode démo) pour la landing.
// Usage : lancer l'app (npm run build && npm start, mode démo), puis : node scripts/record-demo-videos.mjs public/videos
// Nécessite playwright-core et Chromium (PLAYWRIGHT executablePath ci-dessous).
import { chromium } from "playwright-core";
import { mkdirSync, renameSync, readdirSync, rmSync } from "node:fs";

const OUT = process.argv[2];
const BASE = "http://localhost:3300";
const W = 1280, H = 800;
const only = process.argv[3];

const CURSOR = `
(() => {
  const mk = () => {
    if (document.getElementById("__cur")) return;
    const c = document.createElement("div");
    c.id = "__cur";
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l14 9-6.2 1.3L9.3 19z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: "fixed", left: "0", top: "0", zIndex: 2147483647, pointerEvents: "none", transform: "translate(640px,400px)", transition: "transform .05s linear", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" });
    const r = document.createElement("div");
    r.id = "__ripple";
    Object.assign(r.style, { position: "fixed", width: "36px", height: "36px", marginLeft: "-18px", marginTop: "-18px", borderRadius: "999px", background: "rgba(0,128,96,.35)", zIndex: 2147483646, pointerEvents: "none", opacity: "0", transform: "scale(.3)", transition: "opacity .35s, transform .35s" });
    document.documentElement.append(c, r);
    const last = JSON.parse(sessionStorage.getItem("__curpos") || "[640,400]");
    c.style.transform = "translate(" + last[0] + "px," + last[1] + "px)";
    addEventListener("mousemove", (e) => { c.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)"; sessionStorage.setItem("__curpos", JSON.stringify([e.clientX, e.clientY])); }, true);
    addEventListener("mousedown", (e) => { r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; r.style.transition = "none"; r.style.opacity = "1"; r.style.transform = "scale(.3)"; requestAnimationFrame(() => { r.style.transition = "opacity .45s, transform .45s"; r.style.opacity = "0"; r.style.transform = "scale(1.6)"; }); }, true);
    const st = document.createElement("style");
    st.textContent = "nextjs-portal{display:none!important}";
    document.head.append(st);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", mk); else mk();
})();`;

async function clip(name, fn) {
  if (only && only !== name) return;
  const dir = `${OUT}/raw-${name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: W, height: H } } });
  await ctx.addInitScript(CURSOR);
  const p = await ctx.newPage();
  let mouse = [640, 400];
  const moveTo = async (loc, { click = true, steps = 28 } = {}) => {
    const el = typeof loc === "string" ? p.locator(loc).first() : loc;
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      await p.mouse.move(mouse[0] + (x - mouse[0]) * e, mouse[1] + (y - mouse[1]) * e);
      await p.waitForTimeout(14);
    }
    mouse = [x, y];
    if (click) { await p.waitForTimeout(160); await p.mouse.down(); await p.mouse.up(); }
  };
  const type = (text, delay = 38) => p.keyboard.type(text, { delay });
  const wait = (ms) => p.waitForTimeout(ms);
  try {
    await fn({ p, moveTo, type, wait });
  } finally {
    await wait(600);
    await ctx.close();
    await browser.close();
    const f = readdirSync(dir).find((x) => x.endsWith(".webm"));
    if (f) renameSync(`${dir}/${f}`, `${OUT}/${name}.webm`);
    rmSync(dir, { recursive: true, force: true });
    console.log("✓", name);
  }
}

// 1. Connexion avec Shopify.
await clip("connect", async ({ p, moveTo, type, wait }) => {
  await p.goto(`${BASE}/inscription`, { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await wait(900);
  await moveTo("#shop");
  await type("maison-lune", 70);
  await wait(500);
  await moveTo(p.getByRole("button", { name: /Créer ma boutique avec Shopify/ }));
  await p.waitForURL(/\/app/);
  await wait(2500);
  await moveTo("#brief", { click: false });
  await wait(1200);
});

// 2. Génération d'une boutique à partir d'un brief.
await clip("generate", async ({ p, moveTo, type, wait }) => {
  await p.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  await wait(1000);
  await moveTo("#brief");
  await type("Bougies parfumées artisanales en cire de soja, ambiance cosy et naturelle, cible 30-45 ans", 32);
  await wait(500);
  await moveTo(p.getByRole("button", { name: "Générer" }));
  await p.getByText("On construit ta boutique").waitFor();
  await p.mouse.move(1180, 760);
  await p.getByText("Modifier avec l'IA").waitFor({ timeout: 40000 });
  await wait(1500);
  await moveTo(p.getByRole("button", { name: "Fiche produit" }));
  await wait(1800);
  await p.mouse.wheel(0, 380);
  await wait(1800);
});

// 3. Modification par chat.
await clip("edit", async ({ p, moveTo, type, wait }) => {
  await p.goto(`${BASE}/app/boutiques/lumea/editeur`, { waitUntil: "networkidle" });
  await wait(1200);
  await moveTo("#msg");
  await type("Rends le ton plus premium", 45);
  await p.keyboard.press("Enter");
  await p.getByText("J'ai réécrit l'accroche").waitFor();
  await wait(1800);
  await moveTo(p.getByRole("button", { name: "Ajoute un lot de 3 à −20 %" }));
  await p.getByText("J'ai ajouté le lot de 3").waitFor();
  await wait(2200);
  await moveTo(p.getByRole("button", { name: "Change la couleur principale" }));
  await p.getByText("J'ai changé la couleur principale").waitFor();
  await wait(1500);
  await moveTo(p.getByRole("button", { name: "Mobile" }));
  await wait(2200);
});

// 4. Pilotage quotidien.
await clip("pilot", async ({ p, moveTo, wait }) => {
  await p.goto(`${BASE}/app/boutiques/lumea/pilotage`, { waitUntil: "networkidle" });
  await wait(1400);
  const chart = p.locator("svg[role=img]").first();
  await chart.scrollIntoViewIfNeeded();
  const b = await chart.boundingBox();
  for (let i = 0; i <= 40; i++) { await p.mouse.move(b.x + 60 + (b.width - 80) * (i / 40), b.y + b.height / 2); await wait(45); }
  await wait(600);
  await moveTo(p.getByRole("button", { name: /Chiffre d'affaires/ }));
  await wait(1600);
  await p.mouse.wheel(0, 520);
  await wait(900);
  await moveTo(p.getByRole("button", { name: "Appliquer" }).first());
  await p.getByText("Recommandation appliquée").waitFor();
  await wait(1800);
});
