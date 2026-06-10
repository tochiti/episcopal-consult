/* ---------------------------------------------------------------------------
   DNDN 2026 service worker.
   - Pre-caches the app shell on install (offline launch).
   - Cache-first for hashed/static assets.
   - Network-first with cache fallback for navigations (so users always
     get the latest HTML when online, but the last shell when offline).
   - Bypasses the Firebase / Firestore / Google APIs entirely (those
     are real-time data; offline = no data, by design).
   - The cache version is bumped on each deploy — the activate handler
     purges old versions automatically.
   --------------------------------------------------------------------------- */

const CACHE_VERSION = 'dndn-2026-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

/* Minimal app shell — the URL prefixes the SPA actually uses. We
   pre-cache the root and the manifest, the rest of the JS / CSS / fonts
   are discovered and cached on first fetch (stale-while-revalidate). */
const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

const isAsset = (url) =>
  /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|gif|ico)(?:\?.*)?$/i.test(url.pathname);

const isNavigation = (request) => request.mode === 'navigate';

const isDataOrigin = (url) =>
  url.hostname.endsWith('.googleapis.com') ||
  url.hostname.endsWith('.firebaseio.com') ||
  url.hostname.endsWith('.google.com') ||
  url.hostname.includes('firestore') ||
  url.hostname.includes('firebaseapp');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !isDataOrigin(url)) return;

  /* Always go to the network for Firebase / Google APIs. */
  if (isDataOrigin(url)) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  if (isNavigation(request)) {
    /* Network-first for HTML so updates roll out immediately. */
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match('/').then((root) => root || new Response('Offline', { status: 503 }))
          )
        )
    );
    return;
  }

  if (isAsset(url)) {
    /* Cache-first for static assets. */
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const copy = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
              }
              return response;
            })
            .catch(() => cached || new Response('', { status: 504 }))
      )
    );
  }
});
