import { T, STAGE_STYLES, STAGE_LABELS } from '../../constants/theme'
import { Empty, fmt, fmtK } from './DashboardWidgets'

// ── BarChart ───────────────────────────────────────────────────
// Props: data[], valueKey, labelKey  (unchanged)
export function BarChart({ data, valueKey = 'count', labelKey = 'label' }) {
    if (!data?.length) return <Empty />
    const max = Math.max(...data.map(d => Number(d[valueKey] || 0)))
    return (
        <div className="flex flex-col gap-3">
            {data.map((row, i) => {
                const val = Number(row[valueKey] || 0)
                const pct = max > 0 ? (val / max) * 100 : 0
                return (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs w-24 truncate text-right shrink-0 font-medium"
                            style={{ color: T.textMuted }}>{row[labelKey]}</span>
                        <div className="flex-1 h-6 rounded-xl overflow-hidden"
                            style={{ background: T.surfaceHigh }}>
                            <div className="h-full rounded-xl transition-all duration-500"
                                style={{
                                    width: `${pct}%`,
                                    background: `linear-gradient(90deg, ${T.primary}, ${T.primaryHover})`,
                                    minWidth: pct > 0 ? 8 : 0,
                                }} />
                        </div>
                        <span className="text-xs font-black w-12 shrink-0 text-right"
                            style={{ color: T.textPrimary }}>{fmt(val)}</span>
                    </div>
                )
            })}
        </div>
    )
}

// ── FunnelChart ────────────────────────────────────────────────
// Props: stages[], activeStages[]
export function FunnelChart({ stages, activeStages = [] }) {
    if (!stages?.length) return <Empty />
    
    // Filter to active stages (exclude terminal won/lost)
    const activeKeys = activeStages.length > 0 
        ? activeStages.filter(s => s.stageKey !== 'WON' && s.stageKey !== 'LOST').map(s => s.stageKey)
        : ['NEW', 'QUALIFIED', 'PROPOSAL'];

    const ordered = activeKeys
        .map(k => stages.find(x => x.stage === k))
        .filter(Boolean);

    return (
        <div className="flex flex-col gap-2.5">
            {ordered.map((s, i) => {
                const stageObj = activeStages.find(x => x.stageKey === s.stage);
                const label = stageObj ? stageObj.label : s.stage;
                const style = STAGE_STYLES[s.stage] || {
                    accent: T.primary,
                    badgeBg: T.primaryFaint,
                    badgeColor: T.primary
                };
                const w = 100 - (i * (100 / (ordered.length || 1)) * 0.3)
                return (
                    <div key={s.stage} className="flex items-center gap-3">
                        <span className="text-xs w-24 text-right shrink-0 font-semibold truncate"
                            style={{ color: style.accent }}>
                            {label}
                        </span>
                        <div className="flex-1 flex justify-center">
                            <div className="h-9 rounded-xl flex items-center justify-center px-4 transition-all duration-300"
                                style={{
                                    width: `${w}%`,
                                    background: style.badgeBg,
                                    border: `1px solid ${style.accent}50`,
                                }}>
                                <span className="text-xs font-bold" style={{ color: style.badgeColor }}>
                                    {s.count} deals · {fmtK(s.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── ForecastChart ──────────────────────────────────────────────
// Props: data[], activeStages[]
export function ForecastChart({ data, activeStages = [] }) {
    if (!data?.length) return <Empty />
    
    const allStages = activeStages.length > 0
        ? activeStages.filter(s => s.stageKey !== 'WON' && s.stageKey !== 'LOST').map(s => s.stageKey)
        : ['NEW', 'QUALIFIED', 'PROPOSAL'];

    const getStageColor = (stageKey) => {
        const predefined = {
            NEW: '#78716C',
            LEAD: '#78716C',
            QUALIFIED: T.chartBlue,
            DISCOVERY: T.chartBlue,
            PROPOSAL: T.chartTeal,
            NEGOTIATION: T.chartTeal,
        }
        return predefined[stageKey.toUpperCase()] || T.primary;
    }

    const maxVal = Math.max(...data.map(q => allStages.reduce((s, st) => s + Number(q[st] || 0), 0)))

    return (
        <div className="flex gap-3 items-end h-40">
            {data.map(q => {
                const total = allStages.reduce((s, st) => s + Number(q[st] || 0), 0)
                const heightPct = maxVal > 0 ? (total / maxVal) * 100 : 0
                return (
                    <div key={q.quarter} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: T.textMuted }}>
                            {fmtK(total)}
                        </span>
                        <div className="w-full rounded-xl overflow-hidden flex flex-col-reverse"
                            style={{
                                height: `${Math.max(heightPct, 8)}%`,
                                background: T.surfaceHigh,
                                minHeight: 8,
                            }}>
                            {allStages.map(st => {
                                const v = Number(q[st] || 0)
                                const pct = total > 0 ? (v / total) * 100 : 0
                                return pct > 0
                                    ? <div key={st} style={{ height: `${pct}%`, background: getStageColor(st) }} />
                                    : null
                            })}
                        </div>
                        <span className="text-xs font-bold" style={{ color: T.textMuted }}>{q.quarter}</span>
                    </div>
                )
            })}
        </div>
    )
}

// ── WinRateDonut ───────────────────────────────────────────────
// Props: winRate, wonCount, lostCount  (unchanged)
export function WinRateDonut({ winRate, wonCount, lostCount }) {
    const circumference = 2 * Math.PI * 15.9
    return (
        <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5"
                        stroke={T.surfaceHigh} />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5"
                        stroke={T.success}
                        strokeDasharray={`${winRate} ${100 - winRate}`}
                        strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black" style={{ color: T.textPrimary }}>{winRate}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Win</span>
                </div>
            </div>
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: T.success }} />
                    <span className="text-sm font-bold" style={{ color: T.success }}>{fmt(wonCount)} Won</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: T.error }} />
                    <span className="text-sm font-bold" style={{ color: T.error }}>{fmt(lostCount)} Lost</span>
                </div>
            </div>
        </div>
    )
}

// ── RevenueDonut ───────────────────────────────────────────────
// Props: wonPct, totalWon, totalLost  (unchanged)
export function RevenueDonut({ wonPct, totalWon, totalLost }) {
    return (
        <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke={T.error} />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke={T.success}
                        strokeDasharray={`${wonPct} ${100 - wonPct}`}
                        strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black" style={{ color: T.textPrimary }}>{wonPct}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Won</span>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: T.success }} />
                    <span className="text-sm font-semibold" style={{ color: T.textSecondary }}>Won: {fmtK(totalWon)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: T.error }} />
                    <span className="text-sm font-semibold" style={{ color: T.textSecondary }}>Lost: {fmtK(totalLost)}</span>
                </div>
            </div>
        </div>
    )
}