import { useSelector } from 'react-redux'

// Usage: const can = usePermission()
//        if (can('DEALS_CREATE')) { ... }
//        <button disabled={!can('ACCOUNTS_DELETE')}>Delete</button>

export default function usePermission() {
    const { role, permissions } = useSelector(state => state.auth)

    return function can(permissionKey) {
        if (role === 'SUPER_ADMIN') return true
        return permissions.includes(permissionKey)
    }
}