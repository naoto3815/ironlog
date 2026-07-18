const CACHE = "ironlog-v4";
const ASSETS = ["./", "./index.html", "./app.js", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  // 同期API(script.google.com)など外部オリジンへのリクエストはキャッシュせず素通しする。
  // キャッシュすると起動時のGETに古いデータが返り、最新のlocalStorageを上書きして記録が消える。
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
    if (res.ok) {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, clone));
    }
    return res;
  }).catch(() => caches.match("./index.html"))));
});
