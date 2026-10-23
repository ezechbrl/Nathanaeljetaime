// Service worker de l'app « Vigenia Ventes » : notifications push et pastille rouge sur l'icône.
const STORE = "vigenia-badge";

async function readCount() {
  const res = await (await caches.open(STORE)).match("/count");
  return res ? Number(await res.text()) || 0 : 0;
}
async function writeCount(n) {
  await (await caches.open(STORE)).put("/count", new Response(String(n)));
  if (n > 0) await self.navigator.setAppBadge?.(n);
  else await self.navigator.clearAppBadge?.();
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil((async () => {
    await writeCount((await readCount()) + 1);
    // App ouverte : elle recharge ses chiffres tout de suite (la vente apparaît sans rien toucher).
    for (const c of await self.clients.matchAll({ type: "window", includeUncontrolled: true })) c.postMessage("refresh");
    await self.registration.showNotification(data.title || "Vigenia", {
      body: data.body || "",
      icon: "/brand/icon-192.png",
      badge: "/brand/icon-192.png",
      data: { url: "/ventes" },
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const open = all.find((c) => new URL(c.url).pathname === "/ventes");
    if (open) return open.focus();
    return self.clients.openWindow("/ventes");
  })());
});

// La page « Mes ventes » remet le compteur à zéro quand on l'ouvre.
self.addEventListener("message", (event) => {
  if (event.data === "clear-badge") event.waitUntil(writeCount(0));
});
