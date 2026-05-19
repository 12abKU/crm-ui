import { createRoot } from 'react-dom/client'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import './index.css'
import App from './App.jsx'
import SkeletonTheme from './components/skeletons/SkeletonTheme.jsx'
import { Provider } from 'react-redux'

// ── Impersonation — must run before store initializes ──────────────────────
// PlatformDashboard writes to sessionStorage then opens a new tab.
// We flush it into localStorage here so authSlice.readSession() picks it up.
const impersonatePayload = sessionStorage.getItem('crm_impersonate')
if (impersonatePayload) {
    sessionStorage.removeItem('crm_impersonate')
    try {
        const data = JSON.parse(impersonatePayload)
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value)
        })
    } catch { /* malformed payload — ignore, login page will catch it */ }
}

// ── Store import deferred until after localStorage is hydrated ─────────────
const { store } = await import('./store')   // ← dynamic import keeps order
// NOTE: if your bundler doesn't support top-level await, use the pattern below

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <SkeletonTheme>
            <App />
        </SkeletonTheme>
    </Provider>
)