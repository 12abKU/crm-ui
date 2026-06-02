import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import ProfileForm from './ProfileForm'
import ChangePasswordForm from './ChangePasswordForm'
import UserTable from './UserTable'
import InviteUserModal from './InviteUserModal'
import usePermission from '../../hooks/usePermission'
import api from '../../api'
import { useSelector } from 'react-redux'
import ConfirmModal from '../ui/ConfirmModal'

const PERMISSION_META = {
    ACCOUNTS_VIEW: { icon: 'business', label: 'View accounts' },
    ACCOUNTS_CREATE: { icon: 'business', label: 'Create accounts' },
    ACCOUNTS_EDIT: { icon: 'business', label: 'Edit accounts' },
    ACCOUNTS_DELETE: { icon: 'business', label: 'Delete accounts' },
    CONTACTS_VIEW: { icon: 'groups', label: 'View contacts' },
    CONTACTS_CREATE: { icon: 'groups', label: 'Create contacts' },
    CONTACTS_EDIT: { icon: 'groups', label: 'Edit contacts' },
    CONTACTS_DELETE: { icon: 'groups', label: 'Delete contacts' },
    DEALS_VIEW: { icon: 'handshake', label: 'View deals' },
    DEALS_CREATE: { icon: 'handshake', label: 'Create deals' },
    DEALS_EDIT: { icon: 'handshake', label: 'Edit & move deals' },
    DEALS_DELETE: { icon: 'handshake', label: 'Delete deals' },
    DEALS_ASSIGN: { icon: 'handshake', label: 'Assign deals to users' },
    ACTIVITIES_VIEW: { icon: 'event_note', label: 'View activities' },
    ACTIVITIES_CREATE: { icon: 'event_note', label: 'Log activities' },
    ACTIVITIES_EDIT: { icon: 'event_note', label: 'Edit activities' },
    ACTIVITIES_DELETE: { icon: 'event_note', label: 'Delete activities' },
    CALLS_VIEW: { icon: 'call', label: 'View call logs' },
    CALLS_MAKE: { icon: 'call', label: 'Make outbound calls' },
    CONVERSATIONS_VIEW: { icon: 'forum', label: 'View conversations' },
    CONVERSATIONS_SEND: { icon: 'forum', label: 'Send emails' },
    DASHBOARD_VIEW: { icon: 'dashboard', label: 'View dashboard' },
    REPORTS_EXPORT: { icon: 'download', label: 'Export reports' },
    USERS_VIEW: { icon: 'manage_accounts', label: 'View all users' },
    USERS_CREATE: { icon: 'manage_accounts', label: 'Create users' },
    USERS_DELETE: { icon: 'manage_accounts', label: 'Delete users' },
}

const PERMISSION_GROUPS = [
    { label: 'Accounts', icon: 'business', keys: ['ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT', 'ACCOUNTS_DELETE'] },
    { label: 'Contacts', icon: 'groups', keys: ['CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE'] },
    { label: 'Deals', icon: 'handshake', keys: ['DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE', 'DEALS_ASSIGN'] },
    { label: 'Activities', icon: 'event_note', keys: ['ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE'] },
    { label: 'Calls & Conversations', icon: 'forum', keys: ['CALLS_VIEW', 'CALLS_MAKE', 'CONVERSATIONS_VIEW', 'CONVERSATIONS_SEND'] },
    { label: 'Dashboard & Reports', icon: 'dashboard', keys: ['DASHBOARD_VIEW', 'REPORTS_EXPORT'] },
    { label: 'User Management', icon: 'manage_accounts', keys: ['USERS_VIEW', 'USERS_CREATE', 'USERS_DELETE'] },
]

export default function AgentSettings() {
    const [permissions, setPermissions] = useState(null)  // null = loading
    const [error, setError] = useState(false)

    // User Management states
    const canViewUsers = usePermission('USERS_VIEW')
    const canCreateUsers = usePermission('USERS_CREATE')
    const canDeleteUsers = usePermission('USERS_DELETE')

    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [showInvite, setShowInvite] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)
    const currentUserId = Number(useSelector(state => state.auth.userId))

    const loadUsers = () => {
        setLoadingUsers(true)
        api.get('/api/management/users')
            .then(r => setUsers(r.data))
            .finally(() => setLoadingUsers(false))
    }

    useEffect(() => {
        api.get('/api/permissions/me')
            .then(r => setPermissions(new Set(r.data)))
            .catch(() => setError(true))
    }, [])

    useEffect(() => {
        if (canViewUsers) {
            loadUsers()
        }
    }, [canViewUsers])

    const createUser = async (form) => {
        await api.post('/api/management/users', { ...form, role: 'AGENT' })
        loadUsers()
    }

    const deleteUser = (id) => {
        setUserToDelete(id)
    }

    const executeDeleteUser = async () => {
        if (!userToDelete) return
        await api.delete(`/api/management/users/${userToDelete}`)
        setUserToDelete(null)
        loadUsers()
    }

    const agents = users.filter(u => u.role === 'AGENT')

    const totalCount = Object.keys(PERMISSION_META).length
    const grantedCount = permissions ? permissions.size : 0

    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />

            {canViewUsers && (
                <SettingsSection title="Agent Management" description="View and manage agents on your team" noPad>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                            {agents.length} agent{agents.length !== 1 ? 's' : ''}
                        </p>
                        {canCreateUsers && (
                            <button onClick={() => setShowInvite(true)} className="crm-btn-primary w-full sm:w-auto justify-center flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-[16px]">person_add</span>
                                Add Agent
                            </button>
                        )}
                    </div>
                    <UserTable
                        users={agents}
                        loading={loadingUsers}
                        currentUserId={currentUserId}
                        canPromote={false}
                        canDemote={false}
                        canDelete={canDeleteUsers}
                        onDelete={deleteUser}
                    />
                </SettingsSection>
            )}

            {showInvite && (
                <InviteUserModal onClose={() => setShowInvite(false)} onSubmit={createUser} allowAdminRole={false} />
            )}

            <div className="rounded-2xl overflow-hidden"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>

                {/* Header */}
                <div className="px-6 py-5" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <div>
                            <h2 className="text-base font-bold" style={{ color: T.textPrimary }}>My Permissions</h2>
                            <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                                What you are allowed to do in this CRM
                            </p>
                        </div>
                        {permissions && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-full sm:w-auto justify-center"
                                style={{ background: T.primaryFaint, border: `1px solid ${T.primaryDim}` }}>
                                <span className="material-symbols-outlined text-[14px]"
                                    style={{ color: T.primary }}>verified_user</span>
                                <span className="text-[12px] font-bold" style={{ color: T.primaryText }}>
                                    {grantedCount} / {totalCount} granted
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {error ? (
                        <div className="py-8 text-center">
                            <span className="material-symbols-outlined text-[32px] block mb-2"
                                style={{ color: T.error }}>error</span>
                            <p className="text-sm" style={{ color: T.textMuted }}>
                                Could not load permissions. Please refresh.
                            </p>
                        </div>
                    ) : permissions === null ? (
                        <div className="flex items-center justify-center gap-3 py-10">
                            <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                            <span className="text-sm" style={{ color: T.textMuted }}>
                                Loading your permissions...
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {PERMISSION_GROUPS.map(group => {
                                const rows = group.keys.map(key => ({
                                    key,
                                    ...PERMISSION_META[key],
                                    allowed: permissions.has(key),
                                }))
                                const grantedInGroup = rows.filter(r => r.allowed).length

                                return (
                                    <div key={group.label}>
                                        {/* Group header */}
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[15px]"
                                                    style={{ color: T.primary }}>{group.icon}</span>
                                                <span className="text-[12px] font-bold uppercase tracking-wider"
                                                    style={{ color: T.textSecondary }}>{group.label}</span>
                                            </div>
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: grantedInGroup === rows.length ? T.successDim : T.surfaceHigh,
                                                    color: grantedInGroup === rows.length ? T.success : T.textMuted,
                                                }}>
                                                {grantedInGroup}/{rows.length}
                                            </span>
                                        </div>

                                        {/* Permission rows */}
                                        <div className="flex flex-col gap-1.5 pl-1">
                                            {rows.map(({ key, icon, label, allowed }) => (
                                                <div key={key}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                                    style={{
                                                        background: allowed ? T.successDim : T.surfaceRaised,
                                                        border: `1px solid ${allowed ? T.success + '33' : 'transparent'}`,
                                                    }}>
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ background: allowed ? T.success : T.border }}>
                                                        <span className="material-symbols-outlined text-[14px]"
                                                            style={{ color: allowed ? '#fff' : T.textMuted }}>
                                                            {allowed ? 'check' : 'close'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm flex-1"
                                                        style={{ color: allowed ? T.textPrimary : T.textMuted }}>
                                                        {label}
                                                    </span>
                                                    <span className="text-[10px] font-mono hidden sm:block"
                                                        style={{ color: T.textMuted }}>{key}</span>
                                                    <span className="material-symbols-outlined text-[18px]"
                                                        style={{ color: allowed ? T.success : T.error }}>
                                                        {allowed ? 'check_circle' : 'cancel'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 flex items-center gap-2"
                    style={{ borderTop: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                    <span className="material-symbols-outlined text-[14px]"
                        style={{ color: T.textMuted }}>info</span>
                    <p className="text-[11px]" style={{ color: T.textMuted }}>
                        Permissions are controlled by your Admin. Contact them if you need access to something.
                    </p>
                </div>
            </div>

            {userToDelete && (
                <ConfirmModal
                    isOpen={!!userToDelete}
                    title="Delete Agent"
                    message="Are you sure you want to delete this agent? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={executeDeleteUser}
                    onCancel={() => setUserToDelete(null)}
                />
            )}
        </div>
    )
}