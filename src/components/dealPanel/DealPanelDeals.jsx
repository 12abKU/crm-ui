import { T, STAGE_LABELS, STAGE_STYLES } from '../../constants/theme'
import Skeleton from 'react-loading-skeleton'

export default function DealPanelDeals({ accountDeals, currentDealId, loading }) {
    if (loading) return (
        <div className="px-6 py-5 flex flex-col gap-3">
            <div className="flex gap-3 mb-2">
                <Skeleton height={80} borderRadius={16} className="flex-1" />
                <Skeleton height={80} borderRadius={16} className="flex-1" />
            </div>
            <Skeleton height={12} width={80} borderRadius={4} className="mt-1" />
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={64} borderRadius={12} />
            ))}
        </div>
    )

    // ── Logic (unchanged) ──────────────────────────────────────
    const open = accountDeals.filter(d => !['WON', 'LOST'].includes(d.stage))
    const won = accountDeals.filter(d => d.stage === 'WON')
    const openTotal = open.reduce((s, d) => s + (d.amount || 0), 0)
    const wonTotal = won.reduce((s, d) => s + (d.amount || 0), 0)

    return (
        <div className="px-6 py-5 flex flex-col gap-5">

            {/* Summary cards */}
            <div className="flex gap-3">
                <div className="flex-1 px-4 py-4 rounded-2xl flex flex-col gap-1"
                    style={{
                        background: 'rgba(37,99,235,0.08)',
                        border: '1.5px solid rgba(37,99,235,0.18)',
                    }}>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined filled text-[14px]" style={{ color: T.primary }}>
                            handshake
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.primary }}>
                            Open Deals
                        </p>
                    </div>
                    <p className="text-lg font-black" style={{ color: T.primary }}>
                        ₹{openTotal.toLocaleString()}
                        <span className="text-[12px] font-normal ml-1.5" style={{ color: T.textMuted }}>
                            ({open.length})
                        </span>
                    </p>
                </div>
                <div className="flex-1 px-4 py-4 rounded-2xl flex flex-col gap-1"
                    style={{
                        background: 'rgba(22,163,74,0.08)',
                        border: '1.5px solid rgba(22,163,74,0.18)',
                    }}>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined filled text-[14px]" style={{ color: T.success }}>
                            trophy
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.success }}>
                            Won Deals
                        </p>
                    </div>
                    <p className="text-lg font-black" style={{ color: T.success }}>
                        ₹{wonTotal.toLocaleString()}
                        <span className="text-[12px] font-normal ml-1.5" style={{ color: T.textMuted }}>
                            ({won.length})
                        </span>
                    </p>
                </div>
            </div>

            {/* All deals list */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                    All Deals
                </p>

                {accountDeals.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.textMuted }}>
                            inventory_2
                        </span>
                        <p className="text-sm font-semibold" style={{ color: T.textMuted }}>
                            No other deals for this account
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {accountDeals.map(d => {
                            const s = STAGE_STYLES[d.stage]
                            const isCurrent = d.id === currentDealId
                            return (
                                <div key={d.id}
                                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-150"
                                    style={{
                                        background: isCurrent ? T.primaryFaint : T.borderSubtle,
                                        border: isCurrent ? `1.5px solid ${T.primary}40` : `1.5px solid transparent`,
                                        boxShadow: isCurrent ? `0 2px 8px ${T.primary}10` : 'none',
                                    }}
                                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = T.primaryFaint }}
                                    onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = T.borderSubtle }}>
                                    <div className="w-1.5 h-8 rounded-full shrink-0"
                                        style={{ background: s.accent }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                {d.title}
                                            </p>
                                            {isCurrent && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                                    style={{ background: T.primary, color: '#fff' }}>Current</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: s.badgeBg, color: s.badgeColor }}>
                                                {STAGE_LABELS[d.stage]}
                                            </span>
                                            {d.expectedCloseDate && (
                                                <span className="text-[11px]" style={{ color: T.textMuted }}>
                                                    · {d.expectedCloseDate}
                                                </span>
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
        </div>
    )
}