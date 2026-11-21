import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import ErpSettings from '../components/settings/ErpSettings'
import PageHeroBanner from '../components/ui/PageHeroBanner'
import { T } from '../constants/theme'

const ROLE_BADGE = {
    SUPER_ADMIN: { bg: T.superAdminDim, color: T.superAdminLight, label: 'Super Admin' },
    COMPANY_SUPER_ADMIN: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', label: '👑 Company Super Admin' },
    ADMIN: { bg: T.primaryDim, color: T.primary, label: 'Admin' },
    AGENT: { bg: T.successDim, color: T.success, label: 'Agent' },
}

export default function ErpPage() {
    const navigate = useNavigate()
    const role = useSelector(state => state.auth?.role)
    const badge = ROLE_BADGE[role] || ROLE_BADGE.ADMIN

    // Access control: only ADMIN, SUPER_ADMIN, COMPANY_SUPER_ADMIN are allowed
    useEffect(() => {
        if (role === 'AGENT') {
            navigate('/', { replace: true })
        }
    }, [role, navigate])

    if (role === 'AGENT') return null

    return (
        <div className="min-h-screen" style={{ background: 'var(--crm-bg)' }}>
            <TopBar />
            <main className="p-4 sm:p-8">
                {/* Ultra-Premium Hero Banner */}
                <PageHeroBanner
                    icon="account_balance"
                    title="Accounting & ERP Integration"
                    subtitle="Connect TallyPrime and BUSY ERP 21, manage material centers, and automate order-to-cash fulfillment"
                    badge={badge.label}
                    stats={[
                        { label: 'Protocols', value: 'Port 9000 / 981', icon: 'hub', color: '#818CF8' },
                        { label: 'Pipeline Engine', value: 'AWS SQS FIFO', icon: 'sync_alt', color: '#34D399' },
                    ]}
                />

                {/* Main Content Area */}
                <ErpSettings />
            </main>
        </div>
    )
}
