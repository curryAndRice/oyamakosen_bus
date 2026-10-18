var cacheName = 'bus-app';
var filesToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/index.js',
  '/js/main.js',
  '/img/pdf_icon_blue.png',
  '/img/pdf_icon_yellow.png',
  '/img/pdf_icon_red.png',
];

/* サービスワーカー起動して、コンテンツをキャッシュする */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* オフライン時はキャッシュからコンテンツを取得する */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
