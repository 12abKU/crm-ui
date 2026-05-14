import { T, STAGE_LABELS, STAGE_STYLES } from '../../constants/theme'
import Skeleton from 'react-loading-skeleton'

export default function DealPanelDeals({ accountDeals, currentDealId, loading }) {
    if (loading) return (
        <div className="px-7 py-6 flex flex-col gap-3">
            <div className="flex gap-3 mb-2">
                <Skeleton height={72} borderRadius={12} className="flex-1" />
                <Skeleton height={72} borderRadius={12} className="flex-1" />
            </div>
            <Skeleton height={14} width={80} borderRadius={4} className="mt-1" />
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={64} borderRadius={12} />
            ))}
        </div>
    )

    const open = accountDeals.filter(d => !['WON', 'LOST'].includes(d.stage))
    const won = accountDeals.filter(d => d.stage === 'WON')
    const openTotal = open.reduce((s, d) => s + (d.amount || 0), 0)
    const wonTotal = won.reduce((s, d) => s + (d.amount || 0), 0)

    return (
        <div className="px-7 py-6">
            <div className="flex gap-3 mb-5">
                <div className="flex-1 px-4 py-3 rounded-xl" style={{ background: T.primaryDim }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.primary }}>Open Deals</p>
                    <p className="text-base font-black mt-0.5" style={{ color: T.primary }}>
                        ₹{openTotal.toLocaleString()} <span className="text-[11px] font-normal">({open.length})</span>
                    </p>
                </div>
                <div className="flex-1 px-4 py-3 rounded-xl" style={{ background: T.successDim }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.success }}>Won Deals</p>
                    <p className="text-base font-black mt-0.5" style={{ color: T.success }}>
                        ₹{wonTotal.toLocaleString()} <span className="text-[11px] font-normal">({won.length})</span>
                    </p>
                </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>All Deals</p>

            {accountDeals.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No other deals for this account</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {accountDeals.map(d => {
                        const s = STAGE_STYLES[d.stage]
                        const isCurrent = d.id === currentDealId
                        return (
                            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                style={{
                                    background: isCurrent ? T.primaryDim : T.surfaceRaised,
                                    border: isCurrent ? `1px solid ${T.primary}` : `1px solid transparent`,
                                }}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{d.title}</p>
                                        {isCurrent && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                                style={{ background: T.primary, color: '#fff' }}>Current</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: s.badgeBg, color: s.badgeColor }}>{STAGE_LABELS[d.stage]}</span>
                                        {d.expectedCloseDate && (
                                            <span className="text-[11px]" style={{ color: T.textMuted }}>· {d.expectedCloseDate}</span>
                                        )}
                                    </div>
                                </div>
                                {d.amount > 0 && (
                                    <p className="text-sm font-black shrink-0" style={{ color: T.primary }}>
                                        ₹{d.amount.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}