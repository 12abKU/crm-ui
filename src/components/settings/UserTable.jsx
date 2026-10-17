import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'
import RoleBadge from './RoleBadge'
import PermissionEditor from './PermissionEditor'
import EditUserModal from './EditUserModal'
import { getArchetypeConfig } from '../../constants/archetypes'

const HEADERS = ['User', 'Email', 'Role', 'Archetype & Scope', 'Designation', 'Reports To', 'Joined', 'Actions']

export default function UserTable({
    users = [],
    loading,
    currentUserId,
    canPromote,
    canDemote,
    canDelete,
    onPromote,
    onDemote,
    onDelete,
    allUsers,
    onUserUpdated,
}) {
    const [editingUser, setEditingUser] = useState(null)
    const [editingHierarchyUser, setEditingHierarchyUser] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const currentUserRole = useSelector(state => state.auth.role)
    const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'COMPANY_SUPER_ADMIN'
    const isCompanySuperAdmin = currentUserRole === 'COMPANY_SUPER_ADMIN' || currentUserRole === 'SUPER_ADMIN'
    const navigate = useNavigate()

    const managerIdSet = useMemo(
        () => new Set((allUsers || users || []).map(u => u.managerId).filter(Boolean)),
        [allUsers, users]
    )

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return users
        return users.filter(u => {
            const hasReports = managerIdSet.has(u.id)
            const arch = getArchetypeConfig(u.archetype, u.role, hasReports)
            return (
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.role && u.role.toLowerCase().includes(q)) ||
                (u.designation && u.designation.toLowerCase().includes(q)) ||
                (u.managerName && u.managerName.toLowerCase().includes(q)) ||
                (u.archetype && u.archetype.toLowerCase().includes(q)) ||
                (arch.label && arch.label.toLowerCase().includes(q)) ||
                (arch.scopeLabel && arch.scopeLabel.toLowerCase().includes(q))
            )
        })
    }, [users, searchQuery, managerIdSet])

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center gap-3">
                <div
                    className="w-5 h-5 rounded-full border-2 animate-spin"
                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }}
                />
                <span className="text-sm" style={{ color: T.textMuted }}>
                    Loading users...
                </span>
            </div>
        )
    }

    if (!users || !users.length) {
        return (
            <div className="p-12 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[36px]" style={{ color: T.border }}>
                    group_off
                </span>
                <p className="text-sm" style={{ color: T.textMuted }}>
                    No users found
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Search and Filter Toolbar */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5"
                style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: T.surface }}
            >
                <div className="relative flex-1 w-full sm:max-w-xs">
                    <span
                        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                        style={{ color: T.textMuted }}
                    >
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search name, email, designation, manager..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border outline-none transition-colors"
                        style={{
                            background: T.surfaceRaised,
                            borderColor: T.border,
                            color: T.textPrimary,
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs p-0.5 rounded"
                            style={{ color: T.textMuted }}
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <span className="text-xs font-medium" style={{ color: T.textMuted }}>
                        Showing {filteredUsers.length} of {users.length} users
                    </span>
                )}
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[980px]">
                    <thead>
                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                            {HEADERS.map(h => (
                                <th
                                    key={h}
                                    className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest"
                                    style={{ color: T.textMuted }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={HEADERS.length} className="px-6 py-10 text-center">
                                    <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                                        No users match "{searchQuery}"
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u, i) => {
                                const isSelf = u.id === currentUserId
                                const isTargetSuperAdmin = u.role === 'SUPER_ADMIN' || u.role === 'COMPANY_SUPER_ADMIN'
                                const isTargetCompanySuperAdmin = u.role === 'COMPANY_SUPER_ADMIN'
                                const adminCannotTouch = currentUserRole === 'ADMIN' && isTargetCompanySuperAdmin
                                const canInlineEdit = isAdmin && !adminCannotTouch

                                return (
                                    <tr
                                        key={u.id}
                                        className="group"
                                        style={{
                                            borderBottom: `1px solid ${T.borderSubtle}`,
                                            background: i % 2 === 0 ? T.surface : T.surfaceRaised,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = i % 2 === 0 ? T.surface : T.surfaceRaised
                                        }}
                                    >
                                        {/* User Name & Avatar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
                                                    onClick={() => navigate(`/team/${u.id}`)}
                                                    style={{ background: T.primaryDim, color: T.primary }}
                                                    title={`View ${u.name}'s Profile`}
                                                >
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p
                                                        className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => navigate(`/team/${u.id}`)}
                                                        style={{ color: T.textPrimary }}
                                                        title={`View ${u.name}'s Profile`}
                                                    >
                                                        {u.name}
                                                    </p>
                                                    {isSelf && (
                                                        <p className="text-[10px] font-bold" style={{ color: T.primary }}>
                                                            You
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            {u.email}
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <RoleBadge role={u.role} />
                                        </td>

                                        {/* Archetype & Scope */}
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const hasReports = managerIdSet.has(u.id)
                                                const arch = getArchetypeConfig(u.archetype, u.role, hasReports)
                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-opacity ${
                                                            canInlineEdit ? 'cursor-pointer hover:opacity-80' : ''
                                                        }`}
                                                        style={{
                                                            background: arch.bg,
                                                            color: arch.color,
                                                            border: `1px solid ${arch.border}`,
                                                        }}
                                                        title={canInlineEdit ? `${arch.label} (${arch.scopeLabel}) — Click to edit` : `${arch.label} (${arch.scopeLabel})`}
                                                        onClick={() => canInlineEdit && setEditingHierarchyUser(u)}
                                                    >
                                                        <span>{arch.emoji}</span>
                                                        <span>{arch.label} · {arch.scopeLabel}</span>
                                                    </span>
                                                )
                                            })()}
                                        </td>

                                        {/* Designation */}
                                        <td className="px-6 py-4">
                                            {u.designation ? (
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold truncate max-w-[170px] ${
                                                        canInlineEdit ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                                                    }`}
                                                    style={{
                                                        background: T.primaryFaint || 'rgba(234,88,12,0.07)',
                                                        color: T.primaryText || T.primary,
                                                        border: `1px solid ${T.borderSubtle}`,
                                                    }}
                                                    title={canInlineEdit ? `${u.designation} (Click to edit)` : u.designation}
                                                    onClick={() => canInlineEdit && setEditingHierarchyUser(u)}
                                                >
                                                    {u.designation}
                                                </span>
                                            ) : (
                                                <span
                                                    className={`text-sm font-medium ${
                                                        canInlineEdit ? 'cursor-pointer hover:underline text-xs' : ''
                                                    }`}
                                                    style={{ color: T.textMuted }}
                                                    onClick={() => canInlineEdit && setEditingHierarchyUser(u)}
                                                    title={canInlineEdit ? 'Click to set designation' : undefined}
                                                >
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Reports To (Manager) */}
                                        <td className="px-6 py-4">
                                            {u.managerName ? (
                                                <div
                                                    className={`flex items-center gap-1.5 min-w-0 ${
                                                        canInlineEdit ? 'cursor-pointer hover:opacity-80' : ''
                                                    }`}
                                                    title={canInlineEdit ? `Reports to ${u.managerName} (Click to edit)` : `Reports to ${u.managerName}`}
                                                    onClick={() => canInlineEdit && setEditingHierarchyUser(u)}
                                                >
                                                    <span
                                                        className="material-symbols-outlined text-[15px] shrink-0"
                                                        style={{ color: T.primary }}
                                                    >
                                                        account_tree
                                                    </span>
                                                    <span
                                                        className="text-sm font-semibold truncate"
                                                        style={{ color: T.textPrimary }}
                                                    >
                                                        {u.managerName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`text-sm font-medium ${
                                                        canInlineEdit ? 'cursor-pointer hover:underline text-xs' : ''
                                                    }`}
                                                    style={{ color: T.textMuted }}
                                                    onClick={() => canInlineEdit && setEditingHierarchyUser(u)}
                                                    title={canInlineEdit ? 'Click to assign manager' : 'Root leader (None)'}
                                                >
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textMuted }}>
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'No value'}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Profile Link Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/team/${u.id}`)}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                                                    style={{
                                                        background: T.primaryDim,
                                                        color: T.primary,
                                                        border: `1.5px solid ${T.primary}20`,
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = `${T.primary}28`
                                                        e.currentTarget.style.boxShadow = `0 2px 8px ${T.primary}15`
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = T.primaryDim
                                                        e.currentTarget.style.boxShadow = 'none'
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">person</span>
                                                    Profile
                                                </button>

                                                {/* Edit Designation & Manager button */}
                                                {isAdmin && !adminCannotTouch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingHierarchyUser(u)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                                                        style={{
                                                            background: T.primaryDim,
                                                            color: T.primary,
                                                            border: `1px solid ${T.primary}20`,
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.background = `${T.primary}28`
                                                            e.currentTarget.style.boxShadow = `0 2px 8px ${T.primary}15`
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.background = T.primaryDim
                                                            e.currentTarget.style.boxShadow = 'none'
                                                        }}
                                                        title="Edit Designation and Manager"
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">edit</span>
                                                        Edit
                                                    </button>
                                                )}

                                                {/* Permissions button */}
                                                {isAdmin && !adminCannotTouch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingUser(u)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                                                        style={{
                                                            background: T.primaryDim,
                                                            color: T.primary,
                                                            border: `1px solid ${T.primary}20`,
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.background = `${T.primary}28`
                                                            e.currentTarget.style.boxShadow = `0 2px 8px ${T.primary}15`
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.background = T.primaryDim
                                                            e.currentTarget.style.boxShadow = 'none'
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">shield</span>
                                                        Permissions
                                                    </button>
                                                )}

                                                {!isTargetSuperAdmin && !isSelf && (
                                                    <>
                                                        {canPromote && isCompanySuperAdmin && u.role === 'AGENT' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onPromote && onPromote(u.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                                                                style={{ background: T.primaryDim, color: T.primary }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = T.primary + '33' }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim }}
                                                            >
                                                                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                                                                Make Admin
                                                            </button>
                                                        )}
                                                        {canDemote && isCompanySuperAdmin && u.role === 'ADMIN' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onDemote && onDemote(u.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                                                                style={{ background: T.warningDim, color: T.warning }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = T.warning + '22' }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = T.warningDim }}
                                                            >
                                                                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                                                                Make Agent
                                                            </button>
                                                        )}
                                                        {canDelete && (isCompanySuperAdmin || (currentUserRole === 'ADMIN' && u.role === 'AGENT')) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onDelete(u.id)}
                                                                className="p-1.5 rounded-lg transition-colors ml-auto"
                                                                style={{ color: T.textMuted }}
                                                                onMouseEnter={e => {
                                                                    e.currentTarget.style.background = T.errorDim
                                                                    e.currentTarget.style.color = T.error
                                                                }}
                                                                onMouseLeave={e => {
                                                                    e.currentTarget.style.background = 'transparent'
                                                                    e.currentTarget.style.color = T.textMuted
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Permission Editor Modal */}
            {editingUser && (
                <PermissionEditor
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSaved={() => setEditingUser(null)}
                />
            )}

            {/* Edit User Hierarchy Modal */}
            {editingHierarchyUser && (
                <EditUserModal
                    user={editingHierarchyUser}
                    allUsers={allUsers || users}
                    onClose={() => setEditingHierarchyUser(null)}
                    onSuccess={(updatedUser) => {
                        setEditingHierarchyUser(null)
                        if (typeof onUserUpdated === 'function') {
                            onUserUpdated(updatedUser)
                        }
                    }}
                />
            )}
        </>
    )
}