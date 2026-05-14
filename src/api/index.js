import axios from 'axios'
import { store } from '../store'
import { signOut } from '../store/authSlice'

const api = axios.create({
    baseURL: 'http://localhost:8086',
})

api.interceptors.request.use((config) => {
    const token = store.getState().auth.token || localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 403 || err.response?.status === 401) {
            store.dispatch(signOut())
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
