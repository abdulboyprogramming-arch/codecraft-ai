/**
 * CodeCraft AI - Service Worker Registration
 * 
 * Registers the PWA service worker for offline support.
 */

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
)

export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registered:', registration.scope)

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (confirm('A new version is available. Reload to update?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}

export const unregisterServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.unregister()
    console.log('Service Worker unregistered')
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
  }
}

export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
}
