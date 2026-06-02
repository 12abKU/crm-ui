import axios from 'axios'
import { store } from '../store'
import { signOut } from '../store/authSlice'
import { API_BASE_URL } from '../constants/config'

const api = axios.create({
    baseURL: API_BASE_URL,
})

export const extractApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
    if (err?.userMessage) return err.userMessage

    // Handle 429 rate limit explicitly
    if (err?.response?.status === 429) {
        return 'Too many attempts. Please wait a minute and try again.'
    }

    const data = err?.response?.data
    if (data) {
        if (data.fields && typeof data.fields === 'object') {
            const fieldErrors = Object.values(data.fields).filter(Boolean)
            if (fieldErrors.length > 0) {
                return fieldErrors.join(', ')
            }
        }

        if (typeof data.message === 'string' && data.message.trim()) {
            return data.message
        }

        if (typeof data.error === 'string' && data.error.trim()) return data.error
        if (typeof data === 'string' && data.trim()) return data
    }

    if (err?.message === 'Network Error') {
        return 'Backend is not reachable. Please check if the server is running.'
    }

    return err?.message || fallback
}

api.interceptors.request.use((config) => {
    const token = store.getState().auth.token || localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => {
        if (res?.data && res.data.page && Array.isArray(res.data.content)) {
            res.data.totalElements = res.data.page.totalElements;
            res.data.totalPages = res.data.page.totalPages;
            res.data.size = res.data.page.size;
            res.data.number = res.data.page.number;
        }
        return res;
    },
    (err) => {
        const status = err.response?.status
        const message = extractApiErrorMessage(err)
        err.userMessage = message

        const requestUrl = err.config?.url || ''
        const isAuthEndpoint = requestUrl.includes('/api/auth/')

        // 401 — sign out silently
        if (status === 401 && !isAuthEndpoint) {
            store.dispatch(signOut())
            window.location.href = '/login'
            return Promise.reject(err) // ← return early, no toast
        }

        // 403 — company suspended/trial expired → sign out with reason shown on login page
        // If it's a regular RBAC permission error (e.g. "You don't have permission..."), we let it fall through to the toast!
        if (status === 403 && !isAuthEndpoint) {
            const isAccountLocked = message?.toLowerCase().includes('suspended') || message?.toLowerCase().includes('expired')
            if (isAccountLocked) {
                store.dispatch(signOut())
                sessionStorage.setItem('logoutReason', message)
                window.location.href = '/login'
                return Promise.reject(err) // ← return early, no toast
            }
        }

        // All other errors — show global toast (but not for auth endpoints)
        if (!isAuthEndpoint && !err.config?.suppressErrorToast && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('crm-api-error', {
                detail: { message, status }
            }))
        }

        return Promise.reject(err)
    }
)
export default api