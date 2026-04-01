const CACHE_NAME = 'twitch-viewer-v5-separated';

const CACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'service-worker.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Erzwingt sofortiges Update
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Räumt alte Caches auf
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stale-While-Revalidate Strategie
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cache im Hintergrund aktualisieren
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });

      // Liefere Cache wenn vorhanden, ansonsten warte aufs Netzwerk
      return cachedResponse || fetchPromise;
    })
  );
});