const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || ''
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '')

let initialized = false

export function initTelemetry() {
    if (initialized || !POSTHOG_KEY || typeof window === 'undefined') return
    initialized = true

    if (window.posthog) return
    const script = document.createElement('script')
    script.async = true
    script.src = `${POSTHOG_HOST}/static/array.js`
    script.onload = () => {
        if (window.posthog && typeof window.posthog.init === 'function') {
            window.posthog.init(POSTHOG_KEY, {
                api_host: POSTHOG_HOST,
                autocapture: true,
                capture_pageview: true,
            })
        }
    }
    document.head.appendChild(script)
}

export function identifyUser(userId, traits = {}) {
    if (!POSTHOG_KEY || typeof window === 'undefined') return
    try {
        window.posthog?.identify?.(String(userId), traits)
    } catch {
        // non-blocking
    }
}

export function trackEvent(eventName, properties = {}) {
    if (!POSTHOG_KEY || typeof window === 'undefined') return
    try {
        window.posthog?.capture?.(eventName, properties)
    } catch {
        // non-blocking
    }
}
