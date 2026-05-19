import { IconAlertTriangle, IconChevronRight } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { daysLeft } from './platformConstants'

export default function ExpiringTrialsBanner({ trials, onManage }) {
    if (!trials.length) return null
    return (
        <div className="mb-6 rounded-2xl overflow-hidden"
            style={{ border: '1.5px solid rgba(217,119,6,0.35)', background: 'rgba(217,119,6,0.05)' }}>
            <div className="px-5 py-3 flex items-center gap-2.5"
                style={{ borderBottom: '1px solid rgba(217,119,6,0.20)', background: 'rgba(217,119,6,0.08)' }}>
                <IconAlertTriangle size={15} style={{ color: '#D97706', flexShrink: 0 }} />
                <p className="text-sm font-bold" style={{ color: '#D97706' }}>
                    {trials.length} company trial{trials.length !== 1 ? 's' : ''} expiring within 7 days
                </p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(217,119,6,0.12)' }}>
                {trials.map(c => {
                    const days = daysLeft(c.trialEndsAt)
                    return (
                        <div key={c.id} className="px-5 py-3 flex items-center gap-4">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{c.name}</p>
                                <p className="text-[11px]" style={{ color: T.textMuted }}>
                                    Expires {new Date(c.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-1 rounded-full"
                                style={{ background: days <= 2 ? 'rgba(220,38,38,0.10)' : 'rgba(217,119,6,0.12)', color: days <= 2 ? '#DC2626' : '#D97706' }}>
                                {days <= 0 ? 'Expired' : `${days}d left`}
                            </span>
                            <button onClick={() => onManage(c)}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                                style={{ background: 'rgba(217,119,6,0.12)', color: '#D97706' }}>
                                Manage <IconChevronRight size={11} />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}