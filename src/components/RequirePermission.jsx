import React from 'react'
import { useSelector } from 'react-redux'

/**
 * A wrapper component that conditionally renders its children
 * based on whether the current user has ALL of the required permissions.
 *
 * @param {Object} props
 * @param {string|string[]} props.requires - A single permission or an array of permissions required.
 * @param {React.ReactNode} props.children - The UI to render if permitted.
 * @param {React.ReactNode} [props.fallback=null] - The UI to render if not permitted.
 */
export default function RequirePermission({ requires, children, fallback = null }) {
    const userRole = useSelector(state => state.auth.role)
    const userPermissions = useSelector(state => state.auth.permissions) || []

    // Super Admin has all permissions implicitly
    if (userRole === 'SUPER_ADMIN') {
        return <>{children}</>
    }

    const requiredList = Array.isArray(requires) ? requires : [requires]
    
    // Check if the user has ALL required permissions
    const hasPermission = requiredList.every(perm => userPermissions.includes(perm))

    if (!hasPermission) {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}
