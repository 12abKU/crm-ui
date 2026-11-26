const DISMISS_STORAGE_KEY = 'crm_pwa_install_dismissed_until'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

let swRegistered = false

export function isRunningStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function isInstallBannerDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY)
    if (!raw) return false
    return Date.now() < Number(raw)
  } catch {
    return false
  }
}

export function dismissInstallBanner() {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_TTL_MS))
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Registers /sw.js early at app boot and broadcasts update notifications
 * whenever a newer build enters the waiting state.
 */
export function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  if (swRegistered) return
  swRegistered = true

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

      if (registration.waiting && navigator.serviceWorker.controller) {
        window.dispatchEvent(new CustomEvent('crm-sw-update', { detail: registration }))
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('crm-sw-update', { detail: registration }))
          }
        })
      })

      // Poll for SW updates every 30 minutes for long-lived tabs
      setInterval(() => {
        registration.update().catch(() => undefined)
      }, 30 * 60 * 1000)
    } catch (err) {
      console.warn('Service worker registration skipped:', err?.message || err)
    }
  })
}

export function applyServiceWorkerUpdate(registration) {
  const waiting = registration?.waiting
  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' })
  } else {
    window.location.reload()
  }
}
