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

    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />

            {/* Compact Plan Summary linking to Billing & License */}
            {stats && (
                <SettingsSection
                    title="Workspace Plan"
                    description={`Your company is currently on the ${stats.companyPlan || 'Free'} plan.`}
                    badge={`${stats.companyPlan || 'Free'} Tier`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border"
                        style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <div className="text-xs font-medium" style={{ color: T.textSecondary }}>
                            View live seat/contact quotas, upgrade your subscription, update GST details, or download tax invoices in Billing &amp; License.
                        </div>
                        <a
                            href="/settings?tab=billing"
                            className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shrink-0 text-center"
                            style={{ background: T.primary }}
                        >
                            Manage Billing →
                        </a>
                    </div>
                </SettingsSection>
            )}

        </div>
    )
}
