const CACHE_NAME = 'logimove-v2';
const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install: cache only local assets (CDN resources can't be cached due to CORS)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

// Fetch: serve local assets from cache with network fallback; always fetch CDN resources fresh
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  if (!isLocal) {
    return; // let CDN/API requests go straight to network
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.filter(c => c !== CACHE_NAME).map(c => caches.delete(c)))
    )
  );
  self.clients.claim();
});
