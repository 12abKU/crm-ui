import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import AgentSettings from '../components/settings/AgentSettings'
import AdminSettings from '../components/settings/AdminSettings'
import SuperAdminSettings from '../components/settings/SuperAdminSettings'
import { T } from '../constants/theme'

// ── Role metadata (unchanged) ─────────────────────────────────
const ROLE_META = {
    SUPER_ADMIN: {
        icon: 'shield_person',
        label: 'Super Admin Settings',
        description: 'Full control over users, roles, and system configuration',
        accent: '#7C3AED',
        accentBg: 'rgba(139,92,246,0.12)',
        gradient: 'linear-gradient(135deg, #1e1033 0%, #2d1b69 55%, #1a0f40 100%)',
    },
    ADMIN: {
        icon: 'admin_panel_settings',
        label: 'Admin Settings',
        description: 'Manage your team agents and your own profile',
        accent: T.primary,
        accentBg: T.primaryDim,
        gradient: `linear-gradient(135deg, ${T.sidebar} 0%, #1a3a6b 55%, #0d2d5e 100%)`,
    },
    AGENT: {
        icon: 'manage_accounts',
        label: 'My Settings',
        description: 'Manage your profile and view your permissions',
        accent: T.success,
        accentBg: T.successDim,
        gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 55%, #052e16 100%)',
    },
}

const ROLE_BADGE = {
    SUPER_ADMIN: { bg: 'rgba(139,92,246,0.20)', color: '#A78BFA', label: 'Super Admin' },
    ADMIN:       { bg: T.primaryDim,             color: T.primary,  label: 'Admin' },
    AGENT:       { bg: T.successDim,             color: T.success,  label: 'Agent' },
}

export default function Settings() {
    // ── Logic (unchanged) ──────────────────────────────────────
    const role = useSelector(state => state.auth.role)
    const meta = ROLE_META[role] || ROLE_META.AGENT
    const badge = ROLE_BADGE[role] || ROLE_BADGE.AGENT

    const renderPanel = () => {
        if (role === 'SUPER_ADMIN') return <SuperAdminSettings />
        if (role === 'ADMIN') return <AdminSettings />
        return <AgentSettings />
    }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-275 mx-auto">

                {/* ── Hero Banner ──────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-8"
                    style={{ background: meta.gradient, minHeight: 120 }}>
                    {/* Orb */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${meta.accent}35 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '40%', width: 140, height: 140,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${meta.accent}12 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-9 py-7 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: 'rgba(255,255,255,0.90)' }}>{meta.icon}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    {meta.label}
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    {meta.description}
                                </p>
                            </div>
                        </div>

                        {/* Role badge */}
                        <span className="px-4 py-2 rounded-xl text-sm font-black shrink-0"
                            style={{
                                background: 'rgba(255,255,255,0.12)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.20)',
                                letterSpacing: '0.02em',
                            }}>
                            {badge.label}
                        </span>
                    </div>
                </div>

                {/* Settings panel (unchanged) */}
                {renderPanel()}
            </main>
        </div>
    )
}
