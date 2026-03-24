// 每次更新版本號，強制清除舊快取
const CACHE_NAME = 'huayi-schedule-v3';

self.addEventListener('install', event => {
  self.skipWaiting(); // 立刻取代舊 SW
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['./index.html', './manifest.json']))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k))) // 刪除所有舊快取
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Firebase/CDN 永遠走網路
  if (url.includes('firebase') || url.includes('cloudflare') || url.includes('gstatic') || url.includes('googleapis')) return;

  event.respondWith(
    // 永遠優先從網路取最新版本
    fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
