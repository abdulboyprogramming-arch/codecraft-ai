const CACHE_NAME = 'codecraft-ai-v1'
const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = [
  '/',
  '/_next/static/css/',
  '/_next/static/js/',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS.map((url) => {
        return new Request(url, { cache: 'force-cache' })
      })).catch(() => {
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const { request } = event
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
          return response
        })
        .catch(() => {
          return caches.match(OFFLINE_URL)
        })
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
          return networkResponse
        }).catch(() => {
          return cachedResponse
        })

        return cachedResponse || fetchPromise
      })
    )
    return
  }

  event.respondWith(
    fetch(request).catch(() => {
      return new Response('Offline', { status: 503 })
    })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncPendingReviews())
  }
})

async function syncPendingReviews() {
  const db = await openDB()
  const pending = await db.getAll('pending-reviews')
  for (const item of pending) {
    try {
      await fetch('/api/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      })
      await db.delete('pending-reviews', item.id)
    } catch (error) {
      console.error('Sync failed for pending review:', error)
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CodeCraftAI', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending-reviews')) {
        db.createObjectStore('pending-reviews', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}
