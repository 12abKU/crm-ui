import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import { Empty } from './DashboardWidgets'
import { fmt, fmtK } from './dashboardDesign'
import {
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  FunnelChart as RechartFunnelChart,
  Funnel,
  Cell,
  LabelList,
  PieChart,
  Pie
} from 'recharts';

// ── BarChart ───────────────────────────────────────────────────
export function BarChart({ data, valueKey = 'count', labelKey = 'label', colorKey }) {
    if (!data?.length) return <Empty />
    
    const chartData = data.map(d => ({
        name: d[labelKey],
        value: Number(d[valueKey] || 0),
        color: colorKey ? d[colorKey] : d.color
    }));

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RechartBarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={T.textMuted} 
                        fontSize={11} 
                        tickLine={false}
                        axisLine={false}
                        width={90}
                    />
                    <Tooltip
                        contentStyle={{ 
                            background: T.surfaceHigh, 
                            border: `1px solid ${T.primary}50`, 
                            borderRadius: '12px',
                            color: T.textPrimary,
                            fontSize: '12px'
                        }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Bar 
                        dataKey="value" 
                        fill={T.primary} 
                        radius={[0, 10, 10, 0]}
                        barSize={14}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || `url(#barGradient)`} />
                        ))}
                    </Bar>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={T.primary} />
                            <stop offset="100%" stopColor={T.primaryHover || T.primary} />
                        </linearGradient>
                    </defs>
                </RechartBarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ── Interactive Pipeline Blueprint (Onboarding State) ────────
function PipelineBlueprint() {
    const navigate = useNavigate()
    const blueprintStages = [
        { key: 'NEW', label: 'Lead In', desc: 'Inbound & SDR Qualified', time: 'Day 1-2', color: '#38BDF8' },
        { key: 'QUALIFIED', label: 'Qualified', desc: 'Needs Analysis & Fit', time: 'Day 3-5', color: '#818CF8' },
        { key: 'PROPOSAL', label: 'Proposal', desc: 'Custom Quote & Terms', time: 'Day 6-10', color: '#A78BFA' },
        { key: 'NEGOTIATION', label: 'Review', desc: 'Legal & Procurement', time: 'Day 11-15', color: '#F59E0B' },
        { key: 'WON', label: 'Closed Won', desc: 'Contract Signed', time: 'Active', color: '#10B981' },
    ]

    return (
        <div className="py-2 px-1 flex flex-col justify-between h-full min-h-[220px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3">
                {blueprintStages.map((stg, i) => (
                    <div
                        key={stg.key}
                        className="p-3 rounded-xl border flex flex-col justify-between transition-all"
                        style={{
                            background: `${stg.color}08`,
                            borderColor: `${stg.color}25`,
                        }}
                    >
                        <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md"
                                style={{ background: `${stg.color}20`, color: stg.color }}>
                                0{i + 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{stg.time}</span>
                        </div>
                        <div>
                            <p className="text-xs font-black truncate" style={{ color: T.textPrimary }}>{stg.label}</p>
                            <p className="text-[10.5px] truncate text-slate-400 mt-0.5">{stg.desc}</p>
                        </div>
                        <div className="mt-3 h-1 w-full rounded-full overflow-hidden bg-white/[0.04]">
                            <div className="h-full rounded-full" style={{ width: `${(i + 1) * 20}%`, background: stg.color }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 rounded-xl border"
                style={{ background: T.surfaceHigh, borderColor: T.borderSubtle }}>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-emerald-400">tune</span>
                    <span className="text-xs font-medium" style={{ color: T.textSecondary }}>
                        Your automated stage drop-off and conversion telemetry will activate with your first live deal.
                    </span>
                </div>
                <button
                    onClick={() => navigate('/deals')}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg text-white transition-all cursor-pointer shadow-xs shrink-0"
                    style={{ background: T.primary }}
                >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Create Deal
                </button>
            </div>
        </div>
    )
}

// ── FunnelChart ────────────────────────────────────────────────
export function FunnelChart({ stages, activeStages = [] }) {
    const { getStageStyle } = usePipelineStages()
    if (!stages?.length) return <PipelineBlueprint />
    
    const activeKeys = activeStages.length > 0 
        ? activeStages.filter(s => s.stageKey !== 'WON' && s.stageKey !== 'LOST').map(s => s.stageKey)
        : stages.map(x => x.stage);

    const ordered = activeKeys
        .map(k => stages.find(x => x.stage === k))
        .filter(Boolean);

    if (ordered.length === 0) return <PipelineBlueprint />

    const chartData = ordered.map((s, i) => {
        const stageObj = activeStages.find(x => x.stageKey === s.stage);
        const label = stageObj ? stageObj.label : s.stage;
        const style = getStageStyle(s.stage);
        return {
            value: s.count,
            name: label,
            amount: s.amount,
            fill: style.accent
        };
    });

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RechartFunnelChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                    <Tooltip
                        contentStyle={{ 
                            background: T.surfaceHigh, 
                            border: `1px solid ${T.primary}50`, 
                            borderRadius: '12px',
                            color: T.textPrimary,
                            fontSize: '12px'
                        }}
                        formatter={(value, name, props) => [
                            `${value} deals (${props?.payload?.amount !== undefined ? fmtK(props.payload.amount) : ''})`, 
                            name
                        ]}
                    />
                    <Funnel
                        dataKey="value"
                        data={chartData}
                        isAnimationActive
                    >
                        <LabelList 
                            position="right" 
                            fill={T.textPrimary} 
                            stroke="none" 
                            dataKey="name" 
                            fontSize={11} 
                        />
                        <LabelList 
                            position="center" 
                            fill="#FFF" 
                            stroke="none" 
                            dataKey="value" 
                            fontSize={12} 
                            fontWeight="bold"
                            formatter={(v, entry) => `${v} deals · ${entry?.amount !== undefined ? fmtK(entry.amount) : ''}`}
                        />
                    </Funnel>
                </RechartFunnelChart>
            </ResponsiveContainer>
        </div>
    );
}

// ── ForecastChart ──────────────────────────────────────────────
export function ForecastChart({ data, activeStages = [] }) {
    const { getStageStyle } = usePipelineStages()
    if (!data?.length) return <Empty />
    
    const allStages = activeStages.length > 0
        ? activeStages.filter(s => s.stageKey !== 'WON' && s.stageKey !== 'LOST').map(s => s.stageKey)
        : ['NEW', 'QUALIFIED', 'PROPOSAL'];

    const getStageColor = (stageKey) => {
        return getStageStyle(stageKey).accent;
    }

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RechartBarChart
                    data={data}
                    margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                    <XAxis 
                        dataKey="quarter" 
                        stroke={T.textMuted} 
                        fontSize={11} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke={T.textMuted} 
                        fontSize={11} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmtK(v)}
                    />
                    <Tooltip
                        contentStyle={{ 
                            background: T.surfaceHigh, 
                            border: `1px solid ${T.primary}50`, 
                            borderRadius: '12px',
                            color: T.textPrimary,
                            fontSize: '12px'
                        }}
                    />
                    {allStages.map(st => (
                        <Bar 
                            key={st} 
                            dataKey={st} 
                            stackId="a" 
                            fill={getStageColor(st)} 
                            radius={[4, 4, 4, 4]}
                            barSize={30}
                        />
                    ))}
                </RechartBarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ── WinRateDonut ───────────────────────────────────────────────
export function WinRateDonut({ winRate = 0, wonCount = 0, lostCount = 0 }) {
    if (wonCount === 0 && lostCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-2 px-2 text-center w-full">
                <div className="relative w-22 h-22 mb-3 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="rgba(255, 255, 255, 0.08)"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            strokeDasharray="45, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="rgba(16, 185, 129, 0.6)"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black leading-tight" style={{ color: T.textPrimary }}>45%</span>
                        <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-400">Target</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        0 Won
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        0 Lost
                    </span>
                </div>

                <p className="text-[11px] leading-tight max-w-[210px]" style={{ color: T.textMuted }}>
                    Close won pipeline opportunities to calibrate your sales conversion velocity.
                </p>
            </div>
        )
    }

    const chartData = [
        { name: 'Won', value: winRate, fill: T.success },
        { name: 'Lost', value: 100 - winRate, fill: T.surfaceHigh }
    ];

    return (
        <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={38}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            isAnimationActive
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
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
                    <div className="w-3 h-3 rounded-full" style={{ background: T.textMuted }} />
                    <span className="text-sm font-bold" style={{ color: T.textSecondary }}>{fmt(lostCount)} Lost</span>
                </div>
            </div>
        </div>
    );
}

// ── RevenueDonut ───────────────────────────────────────────────
export function RevenueDonut({ wonPct, totalWon, totalLost }) {
    const chartData = [
        { name: 'Won', value: totalWon, fill: T.success },
        { name: 'Lost', value: totalLost, fill: T.error }
    ];

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={40}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            isAnimationActive
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
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
    );
}
