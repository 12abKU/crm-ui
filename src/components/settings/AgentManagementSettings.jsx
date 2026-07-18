import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import UserTable from './UserTable'
import InviteUserModal from './InviteUserModal'
import api from '../../api'
import ConfirmModal from '../ui/ConfirmModal'
import usePermission from '../../hooks/usePermission'

export default function AgentManagementSettings() {
    const role = useSelector(state => state.auth.role)
    const currentUserId = Number(useSelector(state => state.auth.userId))

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showInvite, setShowInvite] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    // Agent specific permissions
    const canViewUsers = usePermission('USERS_VIEW') || role === 'ADMIN' || role === 'SUPER_ADMIN'
    const canCreateUsers = usePermission('USERS_CREATE') || role === 'ADMIN' || role === 'SUPER_ADMIN'
    const canDeleteUsers = usePermission('USERS_DELETE') || role === 'ADMIN' || role === 'SUPER_ADMIN'

    const loadUsers = async () => {
        setLoading(true)
        try {
            const res = await api.get('/api/management/users')
            setUsers(res.data)
        } catch (err) {
            console.error('Failed to load users', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (canViewUsers) {
            loadUsers()
        } else {
            setLoading(false)
        }
    }, [canViewUsers])

    const createUser = async (form) => {
        await api.post('/api/management/users', { ...form, role: 'AGENT' })
        loadUsers()
    }

    const confirmDelete = async () => {
        if (!deleteConfirmId) return
        try {
            await api.delete(`/api/management/users/${deleteConfirmId}`)
            loadUsers()
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteConfirmId(null)
        }
    }

    if (!canViewUsers) {
        return (
            <div className="p-8 text-center" style={{ color: T.textMuted }}>
                You do not have permission to view team management.
            </div>
        )
    }

    const agents = users.filter(u => u.role === 'AGENT')

    return (
        <div className="flex flex-col gap-6">
            <SettingsSection title="Team Management" description="Create and manage team members on your team" noPad>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                        {agents.length} team member{agents.length !== 1 ? 's' : ''}
                    </p>
                    {canCreateUsers && (
                        <button onClick={() => setShowInvite(true)}
                            className="crm-btn-primary w-full sm:w-auto justify-center flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            Add Team Member
                        </button>
                    )}
                </div>
                <UserTable
                    users={agents}
                    loading={loading}
                    currentUserId={currentUserId}
                    canPromote={false}
                    canDemote={false}
                    canDelete={canDeleteUsers}
                    onDelete={(id) => setDeleteConfirmId(id)}
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
