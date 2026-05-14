import axios from 'axios'
import { store } from '../store'
import { signOut } from '../store/authSlice'

const api = axios.create({
    baseURL: 'http://localhost:8086',
})

export const extractApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
    if (err?.userMessage) return err.userMessage

    const data = err?.response?.data
    if (data) {
        const fields = data.fields && typeof data.fields === 'object'
            ? Object.entries(data.fields)
                .filter(([, message]) => Boolean(message))
                .map(([field, message]) => `${field}: ${message}`)
            : []

        if (typeof data.message === 'string' && data.message.trim()) {
            return fields.length ? `${data.message} (${fields.join(', ')})` : data.message
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
    (res) => res,
    (err) => {
        const status = err.response?.status
        const message = extractApiErrorMessage(err)
        err.userMessage = message

        const requestUrl = err.config?.url || ''
        const isAuthEndpoint = requestUrl.includes('/api/auth/')

        if (status === 401 && !isAuthEndpoint) {
            store.dispatch(signOut())
            window.location.href = '/login'
        }

        if (!isAuthEndpoint && !err.config?.suppressErrorToast && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('crm-api-error', {
                detail: { message, status }
            }))
        }

        return Promise.reject(err)
    }
)

export default api
