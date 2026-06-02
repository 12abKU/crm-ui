import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import { CRM_LANDING_URL } from '../../constants/config'
import { luxeSurface, luxeShadow } from '../dashboard/dashboardDesign'

export default function TrialUpgradePopup() {
    const { companyStatus, trialEndsAt, companyId, companyName, email, role } = useSelector(state => state.auth)
    const [isOpen, setIsOpen] = useState(false)

    const getTrialDaysLeft = () => {
        if (!trialEndsAt) return 0
        const diff = new Date(trialEndsAt) - new Date()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    const daysLeft = getTrialDaysLeft()

    useEffect(() => {
        if (companyStatus === 'TRIAL' && trialEndsAt) {
            const days = getTrialDaysLeft()
            const dismissed = sessionStorage.getItem('dismissed_trial_upgrade_popup')
            if (days <= 3 && !dismissed) {
                setIsOpen(true)
            }
        }
    }, [companyStatus, trialEndsAt])

    if (!isOpen) return null

    const handleUpgrade = () => {
        sessionStorage.setItem('dismissed_trial_upgrade_popup', 'true')
        setIsOpen(false)
        const params = `?companyId=${companyId}&companyName=${encodeURIComponent(companyName || '')}&email=${encodeURIComponent(email || '')}`
        window.location.href = `${CRM_LANDING_URL}/pricing${params}`
    }

    const handleClose = () => {
        sessionStorage.setItem('dismissed_trial_upgrade_popup', 'true')
        setIsOpen(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div 
                className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden transition-all duration-300"
                style={{
                    ...luxeSurface('#D97706'),
                    boxShadow: luxeShadow('#D97706', true),
                }}
            >
                {/* Ambient background glow */}
                <div style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />

                {/* Glowing warning header icon */}
                <div className="flex flex-col items-center text-center gap-4 mt-2 z-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                        style={{
                            background: 'linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(217,119,6,0.05) 100%)',
                            border: '1.5px solid rgba(217,119,6,0.35)',
                            boxShadow: '0 8px 24px rgba(217,119,6,0.15)',
                        }}>
                        <span className="material-symbols-outlined filled text-[32px] animate-pulse"
                            style={{ color: '#D97706' }}>warning</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-xl font-black tracking-tight"
                            style={{ color: T.textPrimary, fontFamily: "'Outfit', sans-serif" }}>
                            Trial Period Ending Soon
                        </h3>
                        <div className="flex justify-center mt-1">
                            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                style={{
                                    background: 'rgba(217,119,6,0.1)',
                                    color: '#D97706',
                                    border: '1.2px solid rgba(217,119,6,0.25)',
                                    fontFamily: "'Outfit', sans-serif"
                                }}>
                                <span className="w-2 h-2 rounded-full shrink-0 bg-amber-600 animate-ping" />
                                {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content description */}
                <div className="text-center px-2 z-10">
                    <p className="text-sm leading-relaxed" style={{ color: T.textSecondary }}>
                        Your CRM trial is about to end. Upgrade to a premium subscription now to preserve all your pipeline deals, contact lists, custom tags, and sequences.
                    </p>
                </div>

                {/* Actions row */}
                <div className="flex flex-col gap-2.5 z-10">
                    <button
                        onClick={handleUpgrade}
                        className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: `linear-gradient(135deg, ${T.primary} 0%, #D97706 100%)`,
                            boxShadow: `0 10px 20px ${T.primary}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        Upgrade Now
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-full py-3 rounded-2xl font-black text-sm transition-all duration-200"
                        style={{
                            background: 'transparent',
                            color: T.textMuted,
                            fontFamily: "'Outfit', sans-serif",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
                        onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
                    >
                        Decide Later
                    </button>
                </div>

                <div className="absolute left-6 right-6 bottom-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.3), transparent)' }} />
            </div>
        </div>
    )
}
