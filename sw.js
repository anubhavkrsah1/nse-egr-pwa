// NSE Good Gold EGR — Service Worker v4
// All JS is now inlined in index.html — single file app
// Strategy: network-first for HTML (always fresh), cache for assets

const CACHE = "nse-egr-v4";

// Only static assets (icons, manifest) — React/DB are now inline in HTML
const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Always fresh from network
const ALWAYS_NETWORK = ["/", "/index.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: "SW_UPDATED" }))
      ))
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  // index.html — always network, fallback to cache
  if (ALWAYS_NETWORK.includes(path)) {
    e.respondWith(
      fetch(e.request)
        .then(r => { if(r.ok){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));} return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Fonts — network first
  if (url.hostname.includes("fonts.googleapis") || url.hostname.includes("fonts.gstatic")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets — cache first
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request).then(r => {
        if(r.ok){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}
        return r;
      }).catch(() => caches.match(e.request)))
  );
});
