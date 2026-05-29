import { IconBuilding, IconBook, IconCurrencyRupee, IconUsers } from '@tabler/icons-react'
import { T } from '../../constants/theme'

export default function CompanyStatsGrid({ stats, plan }) {
    if (!stats) return null

    const limits = {
        FREE: { Accounts: 10, Contacts: 50, Deals: 20, Users: 5 },
        PRO: { Accounts: 200, Contacts: 1000, Deals: 500, Users: 25 },
        ENTERPRISE: { Accounts: Infinity, Contacts: Infinity, Deals: Infinity, Users: Infinity }
    }

    const planLimits = limits[plan] || limits.FREE;

    const cards = [
        { icon: <IconBuilding size={16} />, label: 'Accounts', value: stats.accounts, limit: planLimits.Accounts, color: T.primary },
        { icon: <IconBook size={16} />, label: 'Contacts', value: stats.contacts, limit: planLimits.Contacts, color: '#16a34a' },
        { icon: <IconCurrencyRupee size={16} />, label: 'Deals', value: stats.deals, limit: planLimits.Deals, color: T.superAdminColor },
        { icon: <IconUsers size={16} />, label: 'Users', value: stats.users, limit: planLimits.Users, color: '#D97706' },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {cards.map(({ icon, label, value, limit, color }) => {
                const percent = limit === Infinity ? 0 : Math.min(100, Math.round((value / limit) * 100))
                const isUnlimited = limit === Infinity
                return (
                    <div key={label} className="rounded-xl p-4 flex flex-col gap-3"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: color + '18', color }}>{icon}</div>
                            <div>
                                <p className="text-xl font-black" style={{ color: T.textPrimary }}>{value ?? 0}</p>
                                <p className="text-[10px] font-semibold" style={{ color: T.textMuted }}>{label}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                <span>Usage</span>
                                <span>{value ?? 0} / {isUnlimited ? '∞' : limit}</span>
                            </div>
                            {!isUnlimited && (
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: T.borderSubtle }}>
                                    <div className="h-full rounded-full transition-all duration-300"
                                         style={{
                                             width: `${percent}%`,
                                             background: percent >= 90 ? T.error : percent >= 75 ? '#D97706' : color
                                         }} />
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}