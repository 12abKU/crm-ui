import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import { useSelector } from 'react-redux'
import api from '../../api'

const PERMISSION_GROUPS = [
    {
        label: 'Accounts',
        icon: 'business',
        perms: [
            { key: 'ACCOUNTS_VIEW', label: 'View accounts' },
            { key: 'ACCOUNTS_CREATE', label: 'Create accounts' },
            { key: 'ACCOUNTS_EDIT', label: 'Edit accounts' },
            { key: 'ACCOUNTS_DELETE', label: 'Delete accounts' },
        ]
    },
    {
        label: 'Contacts',
        icon: 'groups',
        perms: [
            { key: 'CONTACTS_VIEW', label: 'View contacts' },
            { key: 'CONTACTS_CREATE', label: 'Create contacts' },
            { key: 'CONTACTS_EDIT', label: 'Edit contacts' },
            { key: 'CONTACTS_DELETE', label: 'Delete contacts' },
        ]
    },
    {
        label: 'Deals',
        icon: 'handshake',
        perms: [
            { key: 'DEALS_VIEW', label: 'View deals' },
            { key: 'DEALS_CREATE', label: 'Create deals' },
            { key: 'DEALS_EDIT', label: 'Edit & move deals' },
            { key: 'DEALS_DELETE', label: 'Delete deals' },
            { key: 'DEALS_ASSIGN', label: 'Assign deals to users' },
        ]
    },
    {
        label: 'Activities',
        icon: 'event_note',
        perms: [
            { key: 'ACTIVITIES_VIEW', label: 'View activities' },
            { key: 'ACTIVITIES_CREATE', label: 'Log activities' },
            { key: 'ACTIVITIES_EDIT', label: 'Edit activities' },
            { key: 'ACTIVITIES_DELETE', label: 'Delete activities' },
        ]
    },
    {
        label: 'Calls & Conversations',
        icon: 'forum',
        perms: [
            { key: 'CALLS_VIEW', label: 'View call logs' },
            { key: 'CALLS_MAKE', label: 'Make outbound calls' },
            { key: 'CONVERSATIONS_VIEW', label: 'View conversations' },
            { key: 'CONVERSATIONS_SEND', label: 'Send emails' },
        ]
    },
    {
        label: 'Dashboard & Reports',
        icon: 'dashboard',
        perms: [
            { key: 'DASHBOARD_VIEW', label: 'View dashboard' },
            { key: 'REPORTS_EXPORT', label: 'Export reports' },
        ]
    },
    {
        label: 'User Management',
        icon: 'manage_accounts',
        perms: [
            { key: 'USERS_VIEW', label: 'View all users' },
            { key: 'USERS_CREATE', label: 'Create users' },
            { key: 'USERS_DELETE', label: 'Delete users' },
        ]
    },
]

export default function PermissionEditor({ user, onClose, onSaved }) {
    const callerRole = useSelector(state => state.auth.role)
    const [active, setActive] = useState(new Set())
    const [isCustom, setIsCustom] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [resetting, setResetting] = useState(false)

    useEffect(() => {
        api.get(`/api/permissions/user/${user.id}`)
            .then(r => {
                setActive(new Set(r.data.permissions))
                setIsCustom(r.data.isCustom)
            })
            .finally(() => setLoading(false))
    }, [user.id])

    const toggle = (key) => {
        setActive(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const toggleGroup = (perms) => {
        const allOn = perms.every(p => active.has(p.key))
        setActive(prev => {
            const next = new Set(prev)
            if (allOn) perms.forEach(p => next.delete(p.key))
            else perms.forEach(p => next.add(p.key))
            return next
        })
    }

    const save = async () => {
        setSaving(true)
        try {
            await api.put(`/api/permissions/user/${user.id}`, {
                permissions: [...active]
            })
            onSaved?.()
            onClose()
        } finally { setSaving(false) }
    }

    const reset = async () => {
        setResetting(true)
        try {
            await api.delete(`/api/permissions/user/${user.id}`)
            onSaved?.()
            onClose()
        } finally { setResetting(false) }
    }

    // Admins can only edit agents, not other admins
    const isEditable = !(callerRole === 'ADMIN' && user.role === 'ADMIN')

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-xl rounded-2xl flex flex-col overflow-hidden"
                style={{ background: T.surface, border: `1px solid ${T.border}`, maxHeight: '88vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-base font-bold" style={{ color: T.textPrimary }}>{user.name}</h2>
                            <div className="flex items-center gap-2">
                                <p className="text-xs" style={{ color: T.textMuted }}>{user.email} · {user.role}</p>
                                {isCustom && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: T.warningDim, color: T.warning }}>
                                        Custom
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg"
                        style={{ color: T.textMuted }}>
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    {loading ? (
                        <div className="py-12 flex items-center justify-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                            <span className="text-sm" style={{ color: T.textMuted }}>Loading permissions...</span>
                        </div>
                    ) : !isEditable ? (
                        <div className="py-8 text-center text-sm" style={{ color: T.textMuted }}>
                            You cannot edit permissions of another Admin.
                        </div>
                    ) : (
                        PERMISSION_GROUPS.map(group => {
                            const allOn = group.perms.every(p => active.has(p.key))
                            const someOn = group.perms.some(p => active.has(p.key))
                            return (
                                <div key={group.label}>
                                    {/* Group header with toggle-all */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]"
                                                style={{ color: T.primary }}>{group.icon}</span>
                                            <span className="text-sm font-bold" style={{ color: T.textPrimary }}>
                                                {group.label}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => toggleGroup(group.perms)}
                                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                                            style={{
                                                background: allOn ? T.primaryDim : T.surfaceRaised,
                                                color: allOn ? T.primary : T.textMuted
                                            }}>
                                            {allOn ? 'Revoke all' : someOn ? 'Grant all' : 'Grant all'}
                                        </button>
                                    </div>
                                    {/* Permission rows */}
                                    <div className="flex flex-col gap-1.5 pl-2">
                                        {group.perms.map(perm => {
                                            const on = active.has(perm.key)
                                            return (
                                                <button
                                                    key={perm.key}
                                                    onClick={() => toggle(perm.key)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all"
                                                    style={{
                                                        background: on ? T.successDim : T.surfaceRaised,
                                                        border: `1px solid ${on ? T.success + '44' : 'transparent'}`,
                                                    }}>
                                                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                                        style={{ background: on ? T.success : T.border }}>
                                                        {on && <span className="material-symbols-outlined text-[13px] text-white">check</span>}
                                                    </div>
                                                    <span className="text-sm" style={{ color: on ? T.textPrimary : T.textSecondary }}>
                                                        {perm.label}
                                                    </span>
                                                    <span className="ml-auto text-[10px] font-mono"
                                                        style={{ color: T.textMuted }}>{perm.key}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                {isEditable && !loading && (
                    <div className="flex gap-2 px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
                        {isCustom && (
                            <button onClick={reset} disabled={resetting}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: T.warningDim, color: T.warning }}>
                                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                                {resetting ? 'Resetting...' : 'Reset to defaults'}
                            </button>
                        )}
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                            Cancel
                        </button>
                        <button onClick={save} disabled={saving}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                            style={{ background: T.primary, color: '#fff', opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving...' : 'Save Permissions'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}