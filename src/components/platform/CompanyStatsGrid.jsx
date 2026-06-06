import { IconBuilding, IconBook, IconCurrencyRupee, IconUsers, IconDatabase } from '@tabler/icons-react'
import { T } from '../../constants/theme'

function formatBytes(bytes) {
    if (bytes == null || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function CompanyStatsGrid({ stats, plan, planConfig }) {
    if (!stats) return null

    // Use dynamic plan config if available, fall back to plan-tier defaults
    const defaultStorageBytes = 5 * 1024 * 1024 * 1024; // 5 GB
    const fallbackLimits = {
        FREE: { Accounts: 10, Contacts: 50, Deals: 20, Users: 5, Storage: defaultStorageBytes },
        PRO: { Accounts: 200, Contacts: 1000, Deals: 500, Users: 25, Storage: defaultStorageBytes },
        ENTERPRISE: { Accounts: Infinity, Contacts: Infinity, Deals: Infinity, Users: Infinity, Storage: defaultStorageBytes }
    }
    const fallback = fallbackLimits[plan] || fallbackLimits.FREE

    const resolvedLimits = {
        Accounts: planConfig?.maxAccounts ?? fallback.Accounts,
        Contacts: planConfig?.maxContacts ?? fallback.Contacts,
        Deals:    planConfig?.maxDeals    ?? fallback.Deals,
        Users:    planConfig?.maxUsers    ?? fallback.Users,
        Storage:  planConfig?.maxStorageBytes ?? fallback.Storage,
    }

    const cards = [
        { icon: <IconBuilding size={16} />, label: 'Accounts', value: stats.accounts, limit: resolvedLimits.Accounts, color: T.primary },
        { icon: <IconBook size={16} />,     label: 'Contacts', value: stats.contacts, limit: resolvedLimits.Contacts, color: '#16a34a' },
        { icon: <IconCurrencyRupee size={16} />, label: 'Deals', value: stats.deals, limit: resolvedLimits.Deals, color: T.superAdminColor },
        { icon: <IconUsers size={16} />,    label: 'Users',    value: stats.users,    limit: resolvedLimits.Users,    color: '#D97706' },
        { icon: <IconDatabase size={16} />, label: 'Storage',  value: stats.storageBytes, limit: resolvedLimits.Storage, color: '#6366F1', isBytes: true },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
            {cards.map(({ icon, label, value, limit, color, isBytes }) => {
                const isUnlimited = limit === Infinity || limit <= 0
                const percent = isUnlimited ? 0 : Math.min(100, Math.max(0, (value || 0) / limit) * 100)
                
                const displayValue = isBytes ? formatBytes(value || 0) : (value ?? 0);
                const displayLimit = isBytes && !isUnlimited ? formatBytes(limit) : (isUnlimited ? '∞' : limit);
                
                return (
                    <div key={label} className="rounded-xl p-4 flex flex-col gap-3"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: color + '18', color }}>{icon}</div>
                            <div>
                                <p className="text-xl font-black" style={{ color: T.textPrimary }}>{displayValue}</p>
                                <p className="text-[10px] font-semibold" style={{ color: T.textMuted }}>{label}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                <span>Usage</span>
                                <span>{displayValue} / {displayLimit}</span>
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