import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import ProfileForm from './ProfileForm'
import ChangePasswordForm from './ChangePasswordForm'
import UserTable from './UserTable'
import InviteUserModal from './InviteUserModal'
import SystemSettings from './SystemSettings'
import api from '../../api'

function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
    return (
        <>
            <div className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(15,23,42,0.5)' }} onClick={onCancel} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl overflow-hidden"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}>
                    <div className="p-6">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: confirmColor === T.error ? T.errorDim : T.primaryDim }}>
                            <span className="material-symbols-outlined text-[22px]"
                                style={{ color: confirmColor }}>
                                {confirmColor === T.error ? 'delete' : 'admin_panel_settings'}
                            </span>
                        </div>
                        <h3 className="text-base font-bold mb-1" style={{ color: T.textPrimary }}>{title}</h3>
                        <p className="text-sm" style={{ color: T.textMuted }}>{message}</p>
                    </div>
                    <div className="flex gap-3 px-6 pb-6">
                        <button onClick={onCancel} className="crm-btn-ghost flex-1">Cancel</button>
                        <button onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                            style={{ background: confirmColor }}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

const PAGE_TABS = [
    { id: 'users', label: 'User Management', icon: 'group' },
    { id: 'system', label: 'System Settings', icon: 'tune' },
]

export default function SuperAdminSettings() {
    const [pageTab, setPageTab] = useState('users')

    // --- user management state (unchanged) ---
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showInvite, setShowInvite] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    const [confirm, setConfirm] = useState(null)
    const currentUserId = Number(localStorage.getItem('userId'))

    const load = () => {
        setLoading(true)
        api.get('/api/management/users')
            .then(r => setUsers(r.data))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const ask = (config) => setConfirm(config)
    const closeConfirm = () => setConfirm(null)

    const createUser = async (form) => {
        await api.post('/api/management/users', form)
        load()
    }

    const promote = (id) => {
        const user = users.find(u => u.id === id)
        ask({
            title: 'Promote to Admin?',
            message: `${user.name} will be able to manage agents and access admin features.`,
            confirmLabel: 'Make Admin',
            confirmColor: T.primary,
            onConfirm: async () => {
                await api.put('/api/management/users/promote-admin', { userId: id })
                closeConfirm()
                load()
            }
        })
    }

    const demote = (id) => {
        const user = users.find(u => u.id === id)
        ask({
            title: 'Demote to Agent?',
            message: `${user.name} will lose admin access and become a regular agent.`,
            confirmLabel: 'Make Agent',
            confirmColor: T.warning,
            onConfirm: async () => {
                await api.put('/api/management/users/demote-agent', { userId: id })
                closeConfirm()
                load()
            }
        })
    }

    const deleteUser = (id) => {
        const user = users.find(u => u.id === id)
        ask({
            title: 'Delete User?',
            message: `This will permanently delete ${user.name}'s account. This cannot be undone.`,
            confirmLabel: 'Delete',
            confirmColor: T.error,
            onConfirm: async () => {
                await api.delete(`/api/management/users/${id}`)
                closeConfirm()
                load()
            }
        })
    }

    const USER_TABS = [
        { id: 'all', label: 'All Users' },
        { id: 'ADMIN', label: 'Admins' },
        { id: 'AGENT', label: 'Agents' },
    ]

    const filtered = activeTab === 'all' ? users : users.filter(u => u.role === activeTab)

    const stats = [
        { label: 'Total Users', value: users.length, icon: 'group', color: T.primary, bg: T.primaryDim },
        { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: 'admin_panel_settings', color: T.primary, bg: T.primaryDim },
        { label: 'Agents', value: users.filter(u => u.role === 'AGENT').length, icon: 'support_agent', color: T.success, bg: T.successDim },
    ]

    return (
        <div className="flex flex-col gap-6">
            {/* Profile + password always visible */}
            {/* <ProfileForm />
            <ChangePasswordForm /> */}

            {/* Page-level tab switcher */}
            <div className="flex gap-1 p-1 rounded-xl self-start"
                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                {PAGE_TABS.map(({ id, label, icon }) => (
                    <button key={id} onClick={() => setPageTab(id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                            background: pageTab === id ? T.surface : 'transparent',
                            color: pageTab === id ? T.textPrimary : T.textMuted,
                            boxShadow: pageTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}>
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── USER MANAGEMENT TAB ── */}
            {pageTab === 'users' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map(({ label, value, icon, color, bg }) => (
                            <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
                                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                                    <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <SettingsSection title="User Management" description="Manage all users, roles and access" noPad>
                        <div className="flex items-center justify-between px-6 py-4"
                            style={{ borderBottom: `1px solid ${T.border}` }}>
                            <div className="flex gap-1 p-1 rounded-xl" style={{ background: T.surfaceRaised }}>
                                {USER_TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                        style={{
                                            background: activeTab === tab.id ? T.surface : 'transparent',
                                            color: activeTab === tab.id ? T.textPrimary : T.textMuted,
                                            boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                                        }}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowInvite(true)}
                                className="crm-btn-primary flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-[16px]">person_add</span>
                                Add User
                            </button>
                        </div>
                        <UserTable
                            users={filtered}
                            loading={loading}
                            currentUserId={currentUserId}
                            canPromote={true}
                            canDemote={true}
                            canDelete={true}
                            onPromote={promote}
                            onDemote={demote}
                            onDelete={deleteUser}
                        />
                    </SettingsSection>

                    {showInvite && (
                        <InviteUserModal
                            onClose={() => setShowInvite(false)}
                            onSubmit={createUser}
                            allowAdminRole={true}
                        />
                    )}
                </>
            )}

            {/* ── SYSTEM SETTINGS TAB ── */}
            {pageTab === 'system' && <SystemSettings />}

            {confirm && (
                <ConfirmModal
                    title={confirm.title}
                    message={confirm.message}
                    confirmLabel={confirm.confirmLabel}
                    confirmColor={confirm.confirmColor}
                    onConfirm={confirm.onConfirm}
                    onCancel={closeConfirm}
                />
            )}
        </div>
    )
}