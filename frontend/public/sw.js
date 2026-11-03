// Service worker for the installed app: serves the app shell offline and falls
// back to the last forecast fetched for a place when the network is down.
// Bump VERSION to drop every old cache on the next visit.
const VERSION = 'v2'
const SHELL = `shell-${VERSION}`
const DATA = `data-${VERSION}`
// The app's root URL; the app may live under a subpath such as /weather/.
const ROOT = self.registration.scope

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll([ROOT])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL && k !== DATA).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) void cache.put(fallbackUrl ?? request, response.clone())
    return response
  } catch (error) {
    const cached = await cache.match(fallbackUrl ?? request)
    if (cached) return cached
    throw error
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) void cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    // Every route is the same SPA document.
    event.respondWith(networkFirst(request, SHELL, ROOT))
  } else if (url.origin === self.location.origin) {
    // Vite fingerprints built assets, so a cached copy is never stale.
    event.respondWith(cacheFirst(request, SHELL))
  } else if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(networkFirst(request, DATA))
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, SHELL))
  }
})
