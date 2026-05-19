import { IconBuilding, IconBook, IconCurrencyRupee, IconUsers } from '@tabler/icons-react'
import { T } from '../../constants/theme'

export default function CompanyStatsGrid({ stats }) {
    if (!stats) return null

    const cards = [
        { icon: <IconBuilding size={16} />, label: 'Accounts', value: stats.accounts, color: T.primary },
        { icon: <IconBook size={16} />, label: 'Contacts', value: stats.contacts, color: '#16a34a' },
        { icon: <IconCurrencyRupee size={16} />, label: 'Deals', value: stats.deals, color: '#7c3aed' },
        { icon: <IconUsers size={16} />, label: 'Users', value: stats.users, color: '#D97706' },
    ]

    return (
        <div className="grid grid-cols-4 gap-4 mb-5">
            {cards.map(({ icon, label, value, color }) => (
                <div key={label} className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: color + '18', color }}>{icon}</div>
                    <div>
                        <p className="text-xl font-black" style={{ color: T.textPrimary }}>{value ?? 0}</p>
                        <p className="text-[10px] font-semibold" style={{ color: T.textMuted }}>{label}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}