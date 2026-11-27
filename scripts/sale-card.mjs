// Carte « Nouvelle vente » (PNG) pour la kill list d'Ezechiel.
// node scripts/sale-card.mjs --out vente.png --n 2 --date "Vendredi 27 novembre 2026" --time "23 h 01" \
//   --client "adam…@gmail.com" --offer "Ma boutique" --type "Paiement unique" --amount 39 \
//   --mrr 39 --month 78 --goal 100 --total 78 --source Bing
// Le client est toujours masqué (début de l'adresse + domaine) : la carte peut être partagée.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require(`${execSync("npm root -g").toString().trim()}/playwright`);

const a = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith("--") ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const eur = (n) => `${Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;
// Masque une adresse : 4 premières lettres + domaine.
const mask = (e = "") => (e.includes("@") ? `${e.split("@")[0].slice(0, 4)}•••@${e.split("@")[1]}` : e);
const goal = Number(a.goal ?? 100), month = Number(a.month ?? 0);
const pct = Math.max(3, Math.min(100, (month / goal) * 100));

const row = (k, v) => `<div class="row"><span>${k}</span><b>${v}</b></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1080px;height:1350px;font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;background:#0b0f0e;color:#fff;display:grid;place-items:center;overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(700px 480px at 85% 0%,rgba(61,255,154,.20),transparent),radial-gradient(600px 500px at 0% 100%,rgba(20,184,134,.22),transparent)}
.card{position:relative;width:940px;padding:60px;border-radius:44px;background:linear-gradient(165deg,#151c19,#0e1312);border:2px solid rgba(61,255,154,.4);box-shadow:0 0 140px -40px rgba(61,255,154,.55)}
.top{display:flex;align-items:center;justify-content:space-between}.logo{display:flex;align-items:center;gap:16px;font-size:32px;font-weight:700}
.v{width:58px;height:58px;border-radius:16px;background:#000;display:grid;place-items:center;color:#14b886;font-size:36px;font-weight:900;border:1px solid rgba(255,255,255,.15)}
.badge{padding:10px 20px;border-radius:999px;background:rgba(61,255,154,.12);border:1px solid rgba(61,255,154,.5);color:#3dff9a;font-size:22px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
.title{margin-top:46px;font-size:30px;color:rgba(255,255,255,.7);font-weight:600}
.amount{font-size:140px;font-weight:900;letter-spacing:-6px;line-height:1;margin-top:6px;background:linear-gradient(180deg,#fff,#3dff9a);-webkit-background-clip:text;color:transparent}
.offer{margin-top:14px;display:flex;gap:12px;align-items:center;font-size:30px;font-weight:700}.pill{font-size:20px;font-weight:700;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.85)}
.details{margin-top:34px;border-top:1px solid rgba(255,255,255,.1);padding-top:22px}
.row{display:flex;justify-content:space-between;font-size:25px;padding:9px 0;color:rgba(255,255,255,.6)}.row b{color:#fff;font-weight:700}
.goal{margin-top:30px;padding:26px;border-radius:24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
.gl{display:flex;justify-content:space-between;font-size:24px;color:rgba(255,255,255,.7)}.gl b{color:#3dff9a}
.bar{margin-top:14px;height:18px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}.bar i{display:block;height:100%;width:${pct}%;border-radius:999px;background:linear-gradient(90deg,#14b886,#3dff9a)}
.stats{margin-top:22px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}.box{padding:22px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
.lab{font-size:20px;color:rgba(255,255,255,.55)}.val{margin-top:6px;font-size:36px;font-weight:800}
</style></head><body><div class="glow"></div><div class="card">
<div class="top"><div class="logo"><div class="v">V</div>Vigenia</div><div class="badge">Vente n°${esc(a.n)} 🎉</div></div>
<div class="title">Nouvelle vente</div>
<div class="amount">+${esc(eur(a.amount))}</div>
<div class="offer">${esc(a.offer)} <span class="pill">${esc(a.type ?? "")}</span></div>
<div class="details">
${row("Date", esc(a.date))}${row("Heure", esc(a.time))}${a.client ? row("Client", esc(mask(a.client))) : ""}${a.source ? row("Venu de", esc(a.source)) : ""}
</div>
<div class="goal"><div class="gl"><span>Objectif du mois</span><span><b>${esc(eur(month))}</b> / ${esc(eur(goal))}${month >= goal ? " ✓" : ""}</span></div><div class="bar"><i></i></div></div>
<div class="stats">
<div class="box"><div class="lab">MRR</div><div class="val">${esc(eur(a.mrr))}</div></div>
<div class="box"><div class="lab">Total encaissé</div><div class="val">${esc(eur(a.total))}</div></div>
<div class="box"><div class="lab">Ventes</div><div class="val">${esc(a.n)}</div></div>
</div>
</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.setContent(html);
await p.screenshot({ path: a.out ?? "vente.png" });
await b.close();
console.log("ok", a.out);
