// Carte « nouvelle vente » (image PNG) pour la kill list d'Ezechiel. Aucune donnée personnelle du client.
// node scripts/sale-card.mjs --out vente.png --n 2 --date "27 nov. 2026 · 23 h 01" --offer "Ma boutique" --amount 39 --mrr 39 --total 78 --source Bing
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require(`${execSync("npm root -g").toString().trim()}/playwright`);

const a = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith("--") ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const eur = (n) => `${Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1080px;height:1080px;font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;background:#0d1110;color:#fff;display:grid;place-items:center;overflow:hidden}
.bg{position:absolute;inset:0;background:radial-gradient(600px 400px at 80% 10%,rgba(61,255,154,.22),transparent),radial-gradient(500px 400px at 10% 90%,rgba(20,184,134,.25),transparent)}
.card{position:relative;width:900px;padding:64px;border-radius:48px;background:linear-gradient(160deg,#16201c,#0f1513);border:2px solid rgba(61,255,154,.45);box-shadow:0 0 120px -30px rgba(61,255,154,.6)}
.top{display:flex;align-items:center;justify-content:space-between}.logo{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:700}
.v{width:60px;height:60px;border-radius:16px;background:#000;display:grid;place-items:center;color:#14b886;font-size:38px;font-weight:900;border:1px solid rgba(255,255,255,.15)}
.n{font-size:26px;color:#3dff9a;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.big{margin-top:56px;font-size:44px;font-weight:700}.amount{font-size:150px;font-weight:900;letter-spacing:-6px;line-height:1;margin-top:12px;background:linear-gradient(180deg,#fff,#3dff9a);-webkit-background-clip:text;color:transparent}
.offer{margin-top:18px;font-size:34px;color:rgba(255,255,255,.75)}
.grid{margin-top:56px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}.box{padding:26px;border-radius:24px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.lab{font-size:22px;color:rgba(255,255,255,.6)}.val{margin-top:8px;font-size:40px;font-weight:800}
.foot{margin-top:40px;font-size:24px;color:rgba(255,255,255,.55)}
</style></head><body><div class="bg"></div><div class="card">
<div class="top"><div class="logo"><div class="v">V</div>Vigenia</div><div class="n">Vente n°${esc(a.n)} 🎉</div></div>
<div class="big">Nouvelle vente !</div>
<div class="amount">+${esc(eur(a.amount))}</div>
<div class="offer">${esc(a.offer)}${a.source ? ` · client venu de ${esc(a.source)}` : ""}</div>
<div class="grid">
<div class="box"><div class="lab">MRR</div><div class="val">${esc(eur(a.mrr))}</div></div>
<div class="box"><div class="lab">Total encaissé</div><div class="val">${esc(eur(a.total))}</div></div>
<div class="box"><div class="lab">Ventes</div><div class="val">${esc(a.n)}</div></div>
</div>
<div class="foot">${esc(a.date)}</div>
</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
await p.setContent(html);
await p.screenshot({ path: a.out ?? "vente.png" });
await b.close();
console.log("ok", a.out);
