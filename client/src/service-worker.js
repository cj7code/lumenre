// service-worker.js
const CACHE_NAME = "lumenre-static-v2";

// Only cache static assets (HTML, JS, CSS, images)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico"
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event – cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ❗ Do NOT cache API requests
  if (url.pathname.startsWith("/api") || url.origin.includes("onrender.com")) {
    return event.respondWith(fetch(event.request));
  }

  // ❗ Do NOT cache POST/PUT/PATCH/DELETE requests
  if (event.request.method !== "GET") {
    return event.respondWith(fetch(event.request));
  }

  // Only cache static files
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return resp;
        })
    )
  );
});
