import { T } from '../../constants/theme'

const ROLE_STYLES = {
    SUPER_ADMIN: { bg: T.superAdminDim, color: T.superAdminColor, border: '1px solid transparent', label: 'Super Admin' },
    COMPANY_SUPER_ADMIN: {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        label: 'Company Super Admin',
        hasCrown: true,
    },
    ADMIN: { bg: T.primaryDim, color: T.primary, border: '1px solid transparent', label: 'Admin' },
    AGENT: { bg: T.successDim, color: T.success, border: '1px solid transparent', label: 'Agent' },
}

export default function RoleBadge({ role }) {
    const s = ROLE_STYLES[role] || ROLE_STYLES.AGENT
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: s.bg, color: s.color, border: s.border || '1px solid transparent' }}>
            {s.hasCrown && <span>👑</span>}
            <span>{s.label}</span>
        </span>
    )
}