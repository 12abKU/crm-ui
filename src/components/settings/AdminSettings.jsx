import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import ProfileForm from './ProfileForm'
import ChangePasswordForm from './ChangePasswordForm'
import api from '../../api'

export default function AdminSettings() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const currentUserId = Number(useSelector(state => state.auth.userId))

    const [stats, setStats] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const [usersRes, statsRes] = await Promise.all([
                api.get('/api/management/users'),
                api.get('/api/dashboard'),
            ])
            setUsers(usersRes.data)
            setStats(statsRes.data)
        } catch (err) {
            console.error('Failed to load settings data', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const limitItems = stats ? [
        { label: 'Storage (MB)', icon: 'hard_drive', value: Math.round((stats.currentStorageBytes || 0) / 1024 / 1024), limit: stats.maxStorageBytes ? Math.round(stats.maxStorageBytes / 1024 / 1024) : 0 },
        { label: 'Accounts', icon: 'business', value: stats.totalAccounts, limit: stats.maxAccounts },
        { label: 'Contacts', icon: 'groups', value: stats.totalContacts, limit: stats.maxContacts },
        { label: 'Deals', icon: 'handshake', value: stats.activeDeals, limit: stats.maxDeals },
        { label: 'Users', icon: 'badge', value: stats.totalUsers, limit: stats.maxUsers },
    ] : []

    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />

            {/* Subscription & Resource Limits */}
            {stats && (
                <SettingsSection
                    title="Subscription & Resource Limits"
                    description={`Your company is active on the ${stats.companyPlan || 'Enterprise'} plan. Resource allocation is monitored in real time.`}
                    badge={`${stats.companyPlan || 'Pro'} Tier`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {limitItems.map(({ label, icon, value, limit }) => {
                            const isUnlimited = !limit || limit <= 0
                            const percent = isUnlimited ? 0 : Math.min(100, Math.round((value / limit) * 100))
                            const isHigh = percent >= 90
                            const isMed = percent >= 75
                            const accentColor = isHigh ? T.error : isMed ? '#F59E0B' : T.primary

                            return (
                                <div
                                    key={label}
                                    className="flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden"
                                    style={{
                                        background: T.surfaceRaised,
                                        borderColor: T.borderSubtle,
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{
                                                    background: `${accentColor}15`,
                                                    border: `1px solid ${accentColor}30`,
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-[17px]" style={{ color: accentColor }}>
                                                    {icon}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold truncate" style={{ color: T.textPrimary }}>
                                                {label}
                                            </span>
                                        </div>

                                        <span
                                            className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                                            style={{
                                                background: isUnlimited ? `${T.success}15` : `${accentColor}15`,
                                                color: isUnlimited ? T.success : accentColor,
                                                border: `1px solid ${isUnlimited ? `${T.success}30` : `${accentColor}30`}`,
                                            }}
                                        >
                                            {isUnlimited ? 'Unlimited' : `${percent}%`}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-lg font-black" style={{ color: T.textPrimary }}>
                                            {value ?? 0}
                                        </span>
                                        <span className="text-xs font-medium" style={{ color: T.textMuted }}>
                                            of {isUnlimited ? 'Unlimited' : limit}
                                        </span>
                                    </div>

                                    {!isUnlimited ? (
                                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percent}%`,
                                                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}90)`,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-1.5 rounded-full bg-emerald-500/20" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </SettingsSection>
            )}

        </div>
    )
}
