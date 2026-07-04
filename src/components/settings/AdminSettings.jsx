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

    useEffect(() => { load() }, [])

    const limitItems = stats ? [
        { label: 'Storage (MB)', value: Math.round((stats.currentStorageBytes || 0) / 1024 / 1024), limit: stats.maxStorageBytes ? Math.round(stats.maxStorageBytes / 1024 / 1024) : 0 },
        { label: 'Accounts', value: stats.totalAccounts, limit: stats.maxAccounts },
        { label: 'Contacts', value: stats.totalContacts, limit: stats.maxContacts },
        { label: 'Deals', value: stats.activeDeals, limit: stats.maxDeals },
        { label: 'Users', value: stats.totalUsers, limit: stats.maxUsers },
    ] : []

    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />

            {/* Subscription & Resource Limits */}
            {stats && (
                <SettingsSection
                    title="Subscription & Resource Limits"
                    description={`Your company is on the ${stats.companyPlan} plan. Limits are set by your platform administrator.`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {limitItems.map(({ label, value, limit }) => {
                            const isUnlimited = !limit || limit <= 0
                            const percent = isUnlimited ? 0 : Math.min(100, Math.round((value / limit) * 100))
                            return (
                                <div key={label} className="flex flex-col gap-2 p-4 rounded-xl border"
                                    style={{ background: T.surface, borderColor: T.borderSubtle }}>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span style={{ color: T.textPrimary }}>{label} Limit</span>
                                        <span style={{ color: T.textSecondary }}>
                                            {value} / {isUnlimited ? 'Unlimited' : limit}
                                        </span>
                                    </div>
                                    {!isUnlimited && (
                                        <>
                                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: T.borderSubtle }}>
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percent}%`,
                                                        background: percent >= 90 ? T.error : percent >= 75 ? '#D97706' : T.primary
                                                    }} />
                                            </div>
                                            <span className="text-[10px] font-bold self-end"
                                                style={{ color: percent >= 90 ? T.error : T.textMuted }}>
                                                {percent}% used
                                            </span>
                                        </>
                                    )}
                                    {isUnlimited && (
                                        <span className="text-[10px] font-bold" style={{ color: T.success }}>
                                            Unlimited resources available
                                        </span>
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
