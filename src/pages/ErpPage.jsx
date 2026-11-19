import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import ErpSettings from '../components/settings/ErpSettings'
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
        <div>
            <TopBar />
            <main className="p-4 sm:p-8">
                {/* Hero Banner */}
                <div
                    className="relative rounded-3xl overflow-hidden mb-8"
                    style={{
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #1e1b4b 100%)',
                        minHeight: 120,
                    }}
                >
                    {/* Glowing Orbs */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 220,
                            height: 220,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -20,
                            left: '40%',
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />

                    <div className="relative px-6 py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}
                            >
                                <span
                                    className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: 'rgba(255,255,255,0.90)' }}
                                >
                                    account_balance
                                </span>
                            </div>
                            <div>
                                <h2
                                    className="text-xl sm:text-2xl font-black"
                                    style={{ color: '#fff', letterSpacing: '-0.02em' }}
                                >
                                    Accounting &amp; ERP Integration
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Connect TallyPrime and BUSY ERP 21, manage material centers, and automate order-to-cash fulfillment
                                </p>
                            </div>
                        </div>

                        <span
                            className="px-4 py-2 rounded-xl text-sm font-black shrink-0 w-full lg:w-auto text-center"
                            style={{
                                background: T.heroBadgeBg,
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.20)',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {badge.label}
                        </span>
                    </div>
                </div>

                {/* Main ERP Configuration Component */}
                <ErpSettings />
            </main>
        </div>
    )
}
