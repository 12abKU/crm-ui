import { useSelector } from 'react-redux'

/**
 * Pure function: returns true if role has full administrative authority.
 */
export function isAdmin(role) {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN'
}

/**
 * Pure function: returns true if role is the tenant apex leader.
 */
export function isCompanySuperAdmin(role) {
    return role === 'COMPANY_SUPER_ADMIN'
}

/**
 * Pure evaluation function for role + permission list + target permission string.
 */
export function hasPermission(role, permissions, permission) {
    if (isAdmin(role)) return true
    return (permissions ?? []).includes(permission)
}

/**
 * Hook to test if current user has administrative rights.
 */
export function useIsAdmin() {
    const role = useSelector(state => state.auth.role)
    return isAdmin(role)
}

/**
 * Hook to test if current user is Company Super Admin.
 */
export function useIsCompanySuperAdmin() {
    const role = useSelector(state => state.auth.role)
    return isCompanySuperAdmin(role)
}

// Returns true if current user has the given permission string
// e.g. usePermission('ACCOUNTS_CREATE')
export default function usePermission(permission) {
    const permissions = useSelector(state => state.auth.permissions ?? [])
    const role = useSelector(state => state.auth.role)
    return hasPermission(role, permissions, permission)
}

// Helper to check multiple permissions at once
export function usePermissions(permissionList) {
    const permissions = useSelector(state => state.auth.permissions ?? [])
    const role = useSelector(state => state.auth.role)
    if (isAdmin(role)) return Object.fromEntries(permissionList.map(p => [p, true]))
    return Object.fromEntries(permissionList.map(p => [p, permissions.includes(p)]))
}