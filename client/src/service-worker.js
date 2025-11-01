// Service worker (very light)
const CACHE_NAME = 'lumenre-static-v1';
const ASSETS = ['/', '/index.html'];

// install
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// fetch
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
