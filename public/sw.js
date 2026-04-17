const CACHE_NAME = 'qr-tool-shell-v2';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/app.css',
  '/assets/app.js',
  '/@vite/client',
  '/src/main.js',
  '/src/styles.css',
  '/src/lib/auto-clipboard.js',
  '/src/lib/clipboard-session.js',
  '/src/lib/clipboard.js',
  '/src/lib/copy-action.js',
  '/src/lib/debug-info.js',
  '/src/lib/defaults.js',
  '/src/lib/dom.js',
  '/src/lib/foreground-clipboard.js',
  '/src/lib/qr-code.js',
  '/src/lib/share-target.js',
  '/src/lib/startup-value.js',
  '/src/lib/storage.js',
  '/node_modules/.vite/deps/qrcode.js',
];

async function cacheShellPath(cache, path) {
  try {
    const response = await fetch(path, { cache: 'no-store' });

    if (!response.ok) return;
    await cache.put(path, response.clone());
  } catch {
    // Ignore missing or unavailable candidates so one bad path
    // does not block the whole service worker install.
  }
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(APP_SHELL.map((path) => cacheShellPath(cache, path)));
}

async function deleteOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
}

async function cacheResponse(request, response) {
  if (!response.ok) return response;

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function findCachedResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  return cache.match(request, { ignoreSearch: true });
}

async function handleNavigationRequest(event) {
  try {
    const response = await fetch(event.request);
    return cacheResponse('/', response);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(event.request, { ignoreSearch: true })) || cache.match('/');
  }
}

async function handleAssetRequest(event) {
  const cached = await findCachedResponse(event.request);
  if (cached) return cached;

  try {
    const response = await fetch(event.request);
    return cacheResponse(event.request, response);
  } catch {
    return findCachedResponse(event.request);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(precacheAppShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await deleteOldCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  event.respondWith(handleAssetRequest(event));
});
