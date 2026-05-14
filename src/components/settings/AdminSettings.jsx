import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import ProfileForm from './ProfileForm'
import ChangePasswordForm from './ChangePasswordForm'
import UserTable from './UserTable'
import InviteUserModal from './InviteUserModal'
import api from '../../api'

export default function AdminSettings() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showInvite, setShowInvite] = useState(false)
    const currentUserId = Number(useSelector(state => state.auth.userId))

    const load = () => {
        setLoading(true)
        api.get('/api/management/users')
            .then(r => setUsers(r.data))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load()
    }, [])

    const createUser = async (form) => {
        await api.post('/api/management/users', { ...form, role: 'AGENT' })
        load()
    }

    const deleteUser = async (id) => {
        if (!confirm('Delete this user? This cannot be undone.')) return
        await api.delete(`/api/management/users/${id}`)
        load()
    }

    const agents = users.filter(u => u.role === 'AGENT')

    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />
            <SettingsSection title="Agent Management" description="Create and manage agents on your team"
                noPad>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                        {agents.length} agent{agents.length !== 1 ? 's' : ''}
                    </p>
                    <button onClick={() => setShowInvite(true)} className="crm-btn-primary flex items-center gap-2 text-sm">
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
        </div>
    )
}
