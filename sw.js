// 旧 Service Worker の後始末用。キャッシュを消して自分自身を登録解除する。
// アプリが安定してから、改めて SW 化する。
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
  );
});
