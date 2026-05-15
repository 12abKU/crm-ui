import { useSelector } from 'react-redux'

// Returns true if current user has the given permission string
// e.g. usePermission('ACCOUNTS_CREATE')
export default function usePermission(permission) {
    const permissions = useSelector(state => state.auth.permissions ?? [])
    const role = useSelector(state => state.auth.role)
    if (role === 'SUPER_ADMIN') return true
    return permissions.includes(permission)
}

// Helper to check multiple permissions at once
export function usePermissions(permissionList) {
    const permissions = useSelector(state => state.auth.permissions ?? [])
    const role = useSelector(state => state.auth.role)
    if (role === 'SUPER_ADMIN') return Object.fromEntries(permissionList.map(p => [p, true]))
    return Object.fromEntries(permissionList.map(p => [p, permissions.includes(p)]))
}