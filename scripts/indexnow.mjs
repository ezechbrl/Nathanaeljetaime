// Prévient Bing (et les autres moteurs IndexNow) des pages du site : node scripts/indexnow.mjs
// La clé est publique par conception (fichier public/<clé>.txt), ce n'est pas un secret.
const KEY = "c5d74edef1dc78efe1887c345eed856a";
const HOST = "vigenia.com";
const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow : ${urlList.length} pages envoyées, réponse ${res.status}`);
