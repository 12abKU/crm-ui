import { T, STAGE_STYLES, STAGE_LABELS } from '../../constants/theme'
import { Empty, fmt, fmtK } from './DashboardWidgets'
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
export function BarChart({ data, valueKey = 'count', labelKey = 'label' }) {
    if (!data?.length) return <Empty />
    
    const chartData = data.map(d => ({
        name: d[labelKey],
        value: Number(d[valueKey] || 0)
    }));

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
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
                            <Cell key={`cell-${index}`} fill={`url(#barGradient)`} />
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

// ── FunnelChart ────────────────────────────────────────────────
export function FunnelChart({ stages, activeStages = [] }) {
    if (!stages?.length) return <Empty />
    
    const activeKeys = activeStages.length > 0 
        ? activeStages.filter(s => s.stageKey !== 'WON' && s.stageKey !== 'LOST').map(s => s.stageKey)
        : ['NEW', 'QUALIFIED', 'PROPOSAL'];

    const ordered = activeKeys
        .map(k => stages.find(x => x.stage === k))
        .filter(Boolean);

    const chartData = ordered.map((s, i) => {
        const stageObj = activeStages.find(x => x.stageKey === s.stage);
        const label = stageObj ? stageObj.label : s.stage;
        const style = STAGE_STYLES[s.stage] || { accent: T.primary };
        return {
            value: s.count,
            name: label,
            amount: s.amount,
            fill: style.accent
        };
    });

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
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

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
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
export function WinRateDonut({ winRate, wonCount, lostCount }) {
    const chartData = [
        { name: 'Won', value: winRate, fill: T.success },
        { name: 'Lost', value: 100 - winRate, fill: T.surfaceHigh }
    ];

    return (
        <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
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
                <ResponsiveContainer width="100%" height="100%">
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