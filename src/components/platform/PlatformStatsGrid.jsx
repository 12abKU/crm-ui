import {
    IconBuilding, IconCircleCheck, IconBan, IconUsers,
    IconClock, IconBook, IconCurrencyRupee,
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
        { icon: <IconBook size={18} />, label: 'Total Contacts', value: stats.totalContacts ?? 0, accent: '#16a34a' },
        { icon: <IconCurrencyRupee size={18} />, label: 'Total Deals', value: stats.totalDeals ?? 0, accent: T.superAdminColor },
    ]

    return (
        <div className="grid grid-cols-4 gap-4 mb-8">
            {cards.map(({ icon, label, value, accent }) => (
                <div key={label} className="rounded-2xl p-5"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: accent + '18', color: accent }}>{icon}</div>
                    <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value ?? '—'}</p>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: T.textMuted }}>{label}</p>
                </div>
            ))}
        </div>
    )
}