import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import AgentSettings from '../components/settings/AgentSettings'
import AdminSettings from '../components/settings/AdminSettings'
import SuperAdminSettings from '../components/settings/SuperAdminSettings'
import RoleBadge from '../components/settings/RoleBadge'

const ROLE_META = {
    SUPER_ADMIN: { icon: 'shield_person', label: 'Super Admin Settings', description: 'Full control over users, roles, and system configuration' },
    ADMIN: { icon: 'admin_panel_settings', label: 'Admin Settings', description: 'Manage your team agents and your own profile' },
    AGENT: { icon: 'manage_accounts', label: 'My Settings', description: 'Manage your profile and view your permissions' },
}

export default function Settings() {
    const role = localStorage.getItem('role') || 'AGENT'
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
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: T.primaryDim }}>
                            <span className="material-symbols-outlined text-[24px]" style={{ color: T.primary }}>{meta.icon}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>
                                {meta.label}
                            </h2>
                            <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{meta.description}</p>
                        </div>
                    </div>
                    <RoleBadge role={role} />
                </div>
                {renderPanel()}
            </main>
        </div>
    )
}