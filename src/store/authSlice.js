import { createSlice } from '@reduxjs/toolkit'

const readSession = () => ({
    token: localStorage.getItem('token') || '',
    name: localStorage.getItem('name') || 'User',
    role: localStorage.getItem('role') || 'AGENT',
    userId: localStorage.getItem('userId') || '',
    email: localStorage.getItem('email') || '',
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
})

const persistSession = (session) => {
    Object.entries(session).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            localStorage.removeItem(key)
        } else {
            localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value)
        }
    })
}

const authSlice = createSlice({
    name: 'auth',
    initialState: readSession(),
    reducers: {
        setCredentials: (state, action) => {
            const session = {
                token: action.payload.token || '',
                name: action.payload.name || 'User',
                role: action.payload.role || 'AGENT',
                userId: action.payload.id || action.payload.userId || '',
                email: action.payload.email || '',
                permissions: action.payload.permissions || [],
            }
            persistSession(session)
            Object.assign(state, session)
        },
        setPermissions: (state, action) => {
            state.permissions = action.payload
            localStorage.setItem('permissions', JSON.stringify(action.payload))
        },
        updateProfileSession: (state, action) => {
            const updates = {
                name: action.payload.name ?? state.name,
                email: action.payload.email ?? state.email,
                role: action.payload.role ?? state.role,
                userId: action.payload.id ?? action.payload.userId ?? state.userId,
                token: state.token,
                permissions: state.permissions,
            }
            persistSession(updates)
            Object.assign(state, updates)
        },
        signOut: (state) => {
            localStorage.clear()
            Object.assign(state, { token: '', name: 'User', role: 'AGENT', userId: '', email: '', permissions: [] })
        },
    },
})

export const { setCredentials, setPermissions, updateProfileSession, signOut } = authSlice.actions
export default authSlice.reducer