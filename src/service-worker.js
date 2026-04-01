const CACHE_NAME = 'twitch-viewer-v2';

// Da wir jetzt alles in einer Datei haben, müssen wir nur noch wenig cachen!
const CACHE_URLS = [
  './',
  'index.html'
];

// 1. Install-Event: Cacht die Dateien beim ersten Laden
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installiert');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching App Shell');
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 2. Activate-Event: Räumt alte Caches auf, falls wir den CACHE_NAME ändern
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Aktiviert');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Lösche alten Cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch-Event: Fängt Netzwerkanfragen ab und liefert sie aus dem Cache
self.addEventListener('fetch', event => {
  // Ignoriere externe Anfragen (wie die Twitch-Embed-Skripte), cache nur unsere eigenen Dateien
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Wenn im Cache gefunden, gib es aus dem Cache zurück
      if (response) {
        return response;
      }
      // Ansonsten hole es normal aus dem Netzwerk
      return fetch(event.request);
    })
  );
});