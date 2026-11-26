import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import {
  applyServiceWorkerUpdate,
  dismissInstallBanner,
  isInstallBannerDismissed,
  isRunningStandalone,
  registerPwaServiceWorker,
} from '../../utils/pwa'

export default function PwaManager() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [swRegistration, setSwRegistration] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    registerPwaServiceWorker()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleSwUpdate = (e) => setSwRegistration(e.detail || null)

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      if (!isRunningStandalone() && !isInstallBannerDismissed()) {
        setShowInstall(true)
      }
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setShowInstall(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('crm-sw-update', handleSwUpdate)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('crm-sw-update', handleSwUpdate)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    setInstallPrompt(null)
  }

  const handleDismissInstall = () => {
    dismissInstallBanner()
    setShowInstall(false)
  }

  if (isOnline && !swRegistration && !showInstall) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {!isOnline && (
        <div
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md"
          style={{
            background: T.surface,
            borderColor: T.warning,
            color: T.textPrimary,
          }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: T.warning }}>
            wifi_off
          </span>
          <span>Offline mode — reconnect to sync live CRM updates.</span>
        </div>
      )}

      {swRegistration && (
        <div
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl text-xs backdrop-blur-md"
          style={{
            background: T.surface,
            borderColor: T.primary,
            color: T.textPrimary,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>
              system_update
            </span>
            <span className="font-semibold">A new version of Iinventive CRM is ready.</span>
          </div>
          <button
            onClick={() => applyServiceWorkerUpdate(swRegistration)}
            className="px-3 py-1.5 rounded-lg font-bold text-white shrink-0 cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: T.primary }}
          >
            Update
          </button>
        </div>
      )}

      {showInstall && installPrompt && (
        <div
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs backdrop-blur-md"
          style={{
            background: T.surface,
            borderColor: T.border,
            color: T.textPrimary,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icons/icon-96.png"
              alt="Iinventive CRM"
              className="w-9 h-9 rounded-xl shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-[13px] truncate" style={{ color: T.textPrimary }}>
                Install Iinventive CRM
              </p>
              <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                Quick launch &amp; full-screen workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: T.primary }}
            >
              Install
            </button>
            <button
              onClick={handleDismissInstall}
              aria-label="Dismiss install prompt"
              className="p-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-75"
              style={{ color: T.textMuted }}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
