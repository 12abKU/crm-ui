import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import ProfileForm from './ProfileForm'
import ChangePasswordForm from './ChangePasswordForm'
import UserTable from './UserTable'
import InviteUserModal from './InviteUserModal'
import api from '../../api'
import ConfirmModal from '../ui/ConfirmModal'

export default function AdminSettings() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showInvite, setShowInvite] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)
    const currentUserId = Number(useSelector(state => state.auth.userId))

    const [stats, setStats] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const [usersRes, statsRes] = await Promise.all([
                api.get('/api/management/users'),
                api.get('/api/dashboard'),
            ])
            setUsers(usersRes.data)
            setStats(statsRes.data)
        } catch (err) {
            console.error('Failed to load settings data', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const createUser = async (form) => {
        await api.post('/api/management/users', { ...form, role: 'AGENT' })
        load()
    }

    const deleteUser = async (id) => { setDeleteConfirmId(id) }

    const confirmDelete = async () => {
        if (!deleteConfirmId) return
        try {
            await api.delete(`/api/management/users/${deleteConfirmId}`)
            load()
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteConfirmId(null)
        }
    }

    const agents = users.filter(u => u.role === 'AGENT')

    const limitItems = stats ? [
        { label: 'Accounts', value: stats.totalAccounts, limit: stats.maxAccounts },
        { label: 'Contacts', value: stats.totalContacts, limit: stats.maxContacts },
        { label: 'Deals', value: stats.activeDeals, limit: stats.maxDeals },
        { label: 'Users', value: stats.totalUsers, limit: stats.maxUsers },
    ] : []

    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />

            {/* Subscription & Resource Limits */}
            {stats && (
                <SettingsSection
                    title="Subscription & Resource Limits"
                    description={`Your company is on the ${stats.companyPlan} plan. Limits are set by your platform administrator.`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {limitItems.map(({ label, value, limit }) => {
                            const isUnlimited = !limit || limit <= 0
                            const percent = isUnlimited ? 0 : Math.min(100, Math.round((value / limit) * 100))
                            return (
                                <div key={label} className="flex flex-col gap-2 p-4 rounded-xl border"
                                    style={{ background: T.surface, borderColor: T.borderSubtle }}>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span style={{ color: T.textPrimary }}>{label} Limit</span>
                                        <span style={{ color: T.textSecondary }}>
                                            {value} / {isUnlimited ? 'Unlimited' : limit}
                                        </span>
                                    </div>
                                    {!isUnlimited && (
                                        <>
                                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: T.borderSubtle }}>
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percent}%`,
                                                        background: percent >= 90 ? T.error : percent >= 75 ? '#D97706' : T.primary
                                                    }} />
                                            </div>
                                            <span className="text-[10px] font-bold self-end"
                                                style={{ color: percent >= 90 ? T.error : T.textMuted }}>
                                                {percent}% used
                                            </span>
                                        </>
                                    )}
                                    {isUnlimited && (
                                        <span className="text-[10px] font-bold" style={{ color: T.success }}>
                                            Unlimited resources available
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </SettingsSection>
            )}

            {/* User Table */}
            <SettingsSection title="Agent Management" description="Create and manage agents on your team" noPad>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                        {agents.length} agent{agents.length !== 1 ? 's' : ''}
                    </p>
                    <button onClick={() => setShowInvite(true)}
                        className="crm-btn-primary w-full sm:w-auto justify-center flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        Add Agent
                    </button>
                </div>
                <UserTable
                    users={agents}
                    loading={loading}
                    currentUserId={currentUserId}
                    canPromote={false}
                    canDemote={false}
                    canDelete={true}
                    onDelete={deleteUser}
                />
            </SettingsSection>

            {showInvite && (
                <InviteUserModal onClose={() => setShowInvite(false)} onSubmit={createUser} allowAdminRole={false} />
            )}
            <ConfirmModal
                isOpen={!!deleteConfirmId}
                title="Delete User"
                message="Are you sure you want to delete this user? This cannot be undone."
                confirmText="Delete User"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmId(null)}
            />
        </div>
    )
}
