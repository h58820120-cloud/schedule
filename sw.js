const CACHE_NAME = 'huayi-v5';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Only handle http/https, skip everything else
  if (!url.startsWith('http')) return;
  // Skip Firebase, CDNs - always fetch fresh
  if (url.includes('firebase') || url.includes('gstatic') || url.includes('googleapis') ||
      url.includes('cloudflare') || url.includes('jsdelivr') || url.includes('emailjs')) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      fetch(e.request).then(response => {
        // Only cache valid responses
        if (response && response.status === 200 && response.type !== 'opaque') {
          cache.put(e.request, response.clone());
        }
        return response;
      }).catch(() => caches.match(e.request))
    )
  );
});
