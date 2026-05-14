import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import AgentSettings from '../components/settings/AgentSettings'
import AdminSettings from '../components/settings/AdminSettings'
import SuperAdminSettings from '../components/settings/SuperAdminSettings'
import RoleBadge from '../components/settings/RoleBadge'
import PageHeader from '../components/ui/PageHeader'

const ROLE_META = {
    SUPER_ADMIN: { icon: 'shield_person', label: 'Super Admin Settings', description: 'Full control over users, roles, and system configuration' },
    ADMIN: { icon: 'admin_panel_settings', label: 'Admin Settings', description: 'Manage your team agents and your own profile' },
    AGENT: { icon: 'manage_accounts', label: 'My Settings', description: 'Manage your profile and view your permissions' },
}

export default function Settings() {
    const role = useSelector(state => state.auth.role)
    const meta = ROLE_META[role] || ROLE_META.AGENT

    const renderPanel = () => {
        if (role === 'SUPER_ADMIN') return <SuperAdminSettings />
        if (role === 'ADMIN') return <AdminSettings />
        return <AgentSettings />
    }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-[1100px] mx-auto">
                <PageHeader
                    icon={meta.icon}
                    title={meta.label}
                    subtitle={meta.description}
                    actions={<RoleBadge role={role} />}
                />
                {renderPanel()}
            </main>
        </div>
    )
}
