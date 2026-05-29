import { IconClock } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { STATUS_STYLES, PLAN_STYLES, daysLeft } from './platformConstants'

export default function CompanyControls({
    company, updating,
    onUpdatePlan, onUpdateStatus, onOpenTrialModal,
}) {
    const ss = STATUS_STYLES[company.status] || STATUS_STYLES.ACTIVE
    const ps = PLAN_STYLES[company.plan] || PLAN_STYLES.FREE
    const days = daysLeft(company.trialEndsAt)
    const isTrial = company.status === 'TRIAL'
    const trialExpired = isTrial && company.trialEndsAt && days <= 0

    return (
        <div className="rounded-2xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {/* Plan */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Plan</p>
                <select value={company.plan} disabled={updating === company.id + 'plan'}
                    onChange={e => onUpdatePlan(company.id, e.target.value)}
                    className="w-full text-sm font-bold px-3 py-2.5 rounded-xl cursor-pointer outline-none border-0"
                    style={{ background: ps.bg, color: ps.color }}>
                    {['FREE', 'PRO', 'ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Status */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Status</p>
                <select value={company.status} disabled={updating === company.id + 'status'}
                    onChange={e => onUpdateStatus(company.id, e.target.value)}
                    className="w-full text-sm font-bold px-3 py-2.5 rounded-xl cursor-pointer outline-none border-0"
                    style={{ background: ss.bg, color: ss.color }}>
                    {['ACTIVE', 'SUSPENDED', 'TRIAL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Trial ends */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Trial Ends</p>
                {isTrial && company.trialEndsAt ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold whitespace-nowrap" style={{ color: trialExpired ? '#DC2626' : T.textPrimary }}>
                            {new Date(company.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {days > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: days <= 3 ? 'rgba(217,119,6,0.12)' : 'rgba(22,163,74,0.10)', color: days <= 3 ? '#D97706' : '#16a34a' }}>
                                {days}d left
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm font-semibold" style={{ color: T.textMuted }}>—</p>
                )}
            </div>

            {/* Trial control */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Trial Control</p>
                <button onClick={onOpenTrialModal}
                    className="flex items-center gap-2 text-sm font-bold px-3 py-2.5 rounded-xl w-full"
                    style={{ background: isTrial ? 'rgba(217,119,6,0.10)' : T.surfaceRaised, color: isTrial ? '#D97706' : T.textSecondary }}>
                    <IconClock size={14} /> {isTrial ? 'Extend Trial' : 'Set Trial'}
                </button>
            </div>
        </div>
    )
}