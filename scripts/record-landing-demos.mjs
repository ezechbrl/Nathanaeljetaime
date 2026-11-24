// Enregistre les 2 vidéos de démo de l'accueil (« Décrire » et « Coller un lien ») avec le design actuel.
// Usage : lancer l'app en mode démo (NEXT_PUBLIC_API_MODE=mock, par défaut), puis :
//   node scripts/record-landing-demos.mjs http://localhost:3123 <dossier-sortie>
// Produit <nom>.webm brut ; la conversion mp4/webm/jpg se fait avec ffmpeg ensuite.
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3123";
const OUT = process.argv[3] ?? "videos-raw";
const W = 1280, H = 720;

// Curseur visible, onde au clic, et pastille d'étape en bas (gardée d'une page à l'autre).
const OVERLAY = `
(() => {
  const mk = () => {
    if (document.getElementById("__cur")) return;
    const c = document.createElement("div"); c.id = "__cur";
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l14 9-6.2 1.3L9.3 19z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: "fixed", left: 0, top: 0, zIndex: 2147483647, pointerEvents: "none", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.4))" });
    const r = document.createElement("div"); r.id = "__rip";
    Object.assign(r.style, { position: "fixed", width: "38px", height: "38px", marginLeft: "-19px", marginTop: "-19px", borderRadius: "999px", background: "rgba(61,255,154,.45)", zIndex: 2147483646, pointerEvents: "none", opacity: 0 });
    const cap = document.createElement("div"); cap.id = "__cap";
    Object.assign(cap.style, { position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: 2147483645, pointerEvents: "none", display: "none", alignItems: "center", gap: "10px", padding: "10px 20px 10px 10px", borderRadius: "999px", background: "rgba(12,14,13,.92)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", font: "600 17px system-ui, sans-serif", boxShadow: "0 12px 40px rgba(0,0,0,.5)" });
    document.documentElement.append(c, r, cap);
    const pos = JSON.parse(sessionStorage.getItem("__pos") || "[640,360]");
    c.style.transform = "translate(" + pos[0] + "px," + pos[1] + "px)";
    addEventListener("mousemove", (e) => { c.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)"; sessionStorage.setItem("__pos", JSON.stringify([e.clientX, e.clientY])); }, true);
    addEventListener("mousedown", (e) => { r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; r.animate([{ opacity: 1, transform: "scale(.3)" }, { opacity: 0, transform: "scale(1.7)" }], { duration: 450 }); }, true);
    window.__setCap = (n, t) => { sessionStorage.setItem("__capv", JSON.stringify([n, t])); cap.innerHTML = '<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:linear-gradient(180deg,#34f0b0,#0fae7c);color:#03140d;font-weight:800">' + n + '</span>' + t; cap.style.display = "flex"; cap.animate([{ opacity: 0, transform: "translate(-50%,10px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 300 }); };
    const saved = sessionStorage.getItem("__capv"); if (saved) { const [n, t] = JSON.parse(saved); window.__setCap(n, t); }
    const st = document.createElement("style"); st.textContent = "nextjs-portal{display:none!important}"; document.head.append(st);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", mk); else mk();
})();`;

async function clip(name, fn) {
  const dir = `${OUT}/raw-${name}`;
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir, size: { width: W, height: H } } });
  await ctx.addInitScript(OVERLAY);
  const p = await ctx.newPage();
  let mouse = [640, 360];
  const moveTo = async (loc, { click = true, steps = 26 } = {}) => {
    const el = typeof loc === "string" ? p.locator(loc).first() : loc.first();
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    for (let i = 1; i <= steps; i++) { const t = i / steps, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; await p.mouse.move(mouse[0] + (x - mouse[0]) * e, mouse[1] + (y - mouse[1]) * e); await p.waitForTimeout(14); }
    mouse = [x, y];
    if (click) { await p.waitForTimeout(150); await p.mouse.down(); await p.mouse.up(); }
  };
  const cap = (n, t) => p.evaluate(([n, t]) => window.__setCap(n, t), [n, t]);
  const wait = (ms) => p.waitForTimeout(ms);
  try { await fn({ p, moveTo, cap, wait }); }
  finally {
    await wait(500); await ctx.close(); await browser.close();
    const f = readdirSync(dir).find((x) => x.endsWith(".webm"));
    if (f) renameSync(`${dir}/${f}`, `${OUT}/${name}.webm`);
    rmSync(dir, { recursive: true, force: true });
    console.log("✓", name);
  }
}

async function demo(name, { mode, text }) {
  await clip(name, async ({ p, moveTo, cap, wait }) => {
    await p.goto(`${BASE}/app?skipquiz=1`, { waitUntil: "networkidle" });
    await p.evaluate(() => sessionStorage.removeItem("__capv"));
    await wait(900);
    await moveTo(p.getByText(mode === "link" ? "Ton fournisseur, ex. AliExpress" : "Ton idée en une phrase"));
    await wait(400);
    await cap(1, mode === "link" ? "Colle le lien de ton produit" : "Décris ta boutique en une phrase");
    await moveTo(mode === "link" ? "#url" : "#brief");
    await p.keyboard.type(text, { delay: 30 });
    // Lien : on attend que le produit soit lu (la zone s'agrandit) avant de cliquer sur « Générer ».
    if (mode === "link") await p.getByText("Produit importé").first().waitFor({ timeout: 30000 });
    await wait(700);
    await moveTo(p.getByRole("button", { name: "Générer" }));
    await p.waitForURL(/\/app\/boutiques\//);
    await cap(2, "L'IA crée ta boutique");
    await p.mouse.move(1150, 620); 
    await p.locator("h1", { hasText: "t'attend" }).first().waitFor({ state: "visible", timeout: 60000 });
    await cap(3, "Ta boutique est prête");
    await wait(1400);
    for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 120); await wait(160); }
    await wait(1500);
  });
}

mkdirSync(OUT, { recursive: true });
await demo("demo-start", { mode: "start", text: "Bougies parfumées en cire de soja, ambiance cosy, pour les 25-40 ans" });
await demo("demo-link", { mode: "link", text: "https://fr.aliexpress.com/item/1005012660420402.html" });
