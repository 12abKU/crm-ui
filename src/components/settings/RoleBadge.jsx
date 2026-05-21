import { T } from '../../constants/theme'

const ROLE_STYLES = {
    SUPER_ADMIN: { bg: T.superAdminDim, color: T.superAdminColor, label: 'Super Admin' },
    ADMIN: { bg: T.primaryDim, color: T.primary, label: 'Admin' },
    AGENT: { bg: T.successDim, color: T.success, label: 'Agent' },
}

export default function RoleBadge({ role }) {
    const s = ROLE_STYLES[role] || ROLE_STYLES.AGENT
    return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    )
}