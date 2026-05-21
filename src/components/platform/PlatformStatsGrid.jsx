import {
    IconBuilding, IconCircleCheck, IconBan, IconUsers,
    IconClock, IconBook, IconCurrencyRupee, IconAddressBook,
} from '@tabler/icons-react'
import { T } from '../../constants/theme'

export default function PlatformStatsGrid({ stats }) {
    if (!stats) return null

    const cards = [
        { icon: <IconBuilding size={18} />, label: 'Total Companies', value: stats.totalCompanies, accent: T.primary },
        { icon: <IconCircleCheck size={18} />, label: 'Active', value: stats.activeCompanies, accent: '#16a34a' },
        { icon: <IconClock size={18} />, label: 'On Trial', value: stats.trialCompanies ?? 0, accent: '#D97706' },
        { icon: <IconBan size={18} />, label: 'Suspended', value: stats.suspendedCompanies, accent: '#DC2626' },
        { icon: <IconUsers size={18} />, label: 'Total Users', value: stats.totalUsers, accent: T.superAdminColor },
        { icon: <IconBuilding size={18} />, label: 'Total Accounts', value: stats.totalAccounts ?? 0, accent: '#0891b2' },
        { icon: <IconAddressBook size={18} />, label: 'Total Contacts', value: stats.totalContacts ?? 0, accent: '#16a34a' },
        { icon: <IconCurrencyRupee size={18} />, label: 'Total Deals', value: stats.totalDeals ?? 0, accent: T.superAdminColor },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            {cards.map(({ icon, label, value, accent }) => (
                <div key={label}
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 18,
                        padding: '18px 20px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        cursor: 'default',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                >
                    {/* Accent bar on left edge */}
                    <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: '0 3px 3px 0',
                        background: accent,
                    }} />

                    <div style={{
                        width: 36, height: 36, borderRadius: 12,
                        background: accent + '18', color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 12,
                    }}>
                        {icon}
                    </div>
                    <p style={{ fontSize: 26, fontWeight: 900, color: T.textPrimary, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {value ?? '—'}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, margin: '5px 0 0', letterSpacing: '0.02em' }}>
                        {label}
                    </p>
                </div>
            ))}
        </div>
    )
}