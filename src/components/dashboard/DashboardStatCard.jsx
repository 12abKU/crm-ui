import Skeleton from 'react-loading-skeleton'
import { T } from '../../constants/theme'
import { DASHBOARD_ACCENTS, luxeShadow, luxeSurface } from './dashboardDesign'

const ICON_COLORS = {
    handshake: { bg: 'rgba(56,189,248,0.12)', color: DASHBOARD_ACCENTS.blue },
    payments: { bg: 'rgba(16,185,129,0.12)', color: DASHBOARD_ACCENTS.green },
    business: { bg: 'rgba(245,158,11,0.12)', color: DASHBOARD_ACCENTS.gold },
    groups: { bg: 'rgba(45,212,191,0.12)', color: DASHBOARD_ACCENTS.teal },
    person_add: { bg: 'rgba(251,113,133,0.12)', color: DASHBOARD_ACCENTS.rose },
    task_alt: { bg: 'rgba(129,140,248,0.12)', color: DASHBOARD_ACCENTS.indigo },
    money_off: { bg: 'rgba(239,68,68,0.12)', color: DASHBOARD_ACCENTS.red },
    check_circle: { bg: 'rgba(16,185,129,0.12)', color: DASHBOARD_ACCENTS.green },
    cancel: { bg: 'rgba(239,68,68,0.12)', color: DASHBOARD_ACCENTS.red },
    percent: { bg: 'rgba(56,189,248,0.12)', color: DASHBOARD_ACCENTS.blue },
    bar_chart: { bg: 'rgba(245,158,11,0.12)', color: DASHBOARD_ACCENTS.gold },
    warning: { bg: 'rgba(239,68,68,0.12)', color: DASHBOARD_ACCENTS.red },
    timer: { bg: 'rgba(56,189,248,0.12)', color: DASHBOARD_ACCENTS.blue },
    grid_view: { bg: 'rgba(245,158,11,0.12)', color: DASHBOARD_ACCENTS.gold },
    call: { bg: 'rgba(45,212,191,0.12)', color: DASHBOARD_ACCENTS.teal },
    event: { bg: 'rgba(129,140,248,0.12)', color: DASHBOARD_ACCENTS.indigo },
    notes: { bg: 'rgba(167,139,250,0.12)', color: DASHBOARD_ACCENTS.violet },
    trending_up: { bg: 'rgba(16,185,129,0.12)', color: DASHBOARD_ACCENTS.green },
}

export default function DashboardStatCard({ icon, label, value, sub, loading }) {
    const accent = ICON_COLORS[icon] || { bg: T.primaryDim, color: T.primary }

    return (
        <div
            className="p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group cursor-default"
            style={{
                borderRadius: 16,
                minHeight: 118,
                ...luxeSurface(accent.color),
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = luxeShadow(accent.color, true)
                e.currentTarget.style.borderColor = `${accent.color}45`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = luxeShadow(accent.color)
                e.currentTarget.style.borderColor = isDark() ? 'rgba(255,255,255,0.08)' : `${T.border}`
            }}
        >
            {/* Top hairline accent */}
            <div
                className="absolute left-0 right-0 top-0 h-[2px]"
                style={{
                    background: `linear-gradient(90deg, ${accent.color} 0%, ${accent.color}30 100%)`,
                }}
            />

            {/* Ambient hover glow */}
            <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle, ${accent.color}25 0%, transparent 70%)`,
                    filter: 'blur(10px)',
                }}
            />

            {/* Header: Icon + Label + Sub badge */}
            <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
                        style={{
                            background: accent.bg,
                            border: `1px solid ${accent.color}30`,
                        }}
                    >
                        <span
                            className="material-symbols-outlined filled text-[18px]"
                            style={{ color: accent.color }}
                        >
                            {icon}
                        </span>
                    </div>
                    <span
                        className="text-[11px] font-bold uppercase tracking-wider truncate"
                        style={{ color: T.textMuted, letterSpacing: '0.06em' }}
                    >
                        {label}
                    </span>
                </div>

                {sub && (
                    <span
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                        style={{
                            background: `${accent.color}14`,
                            color: accent.color,
                            border: `1px solid ${accent.color}25`,
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: accent.color }} />
                        <span className="truncate max-w-[85px]">{sub}</span>
                    </span>
                )}
            </div>

            {/* Metric Value */}
            <div className="mt-3 relative z-10">
                {loading ? (
                    <Skeleton height={28} width={90} borderRadius={6} />
                ) : (
                    <h3
                        className="text-2xl sm:text-[26px] font-black leading-none tracking-tight truncate"
                        style={{ color: T.textPrimary }}
                    >
                        {value}
                    </h3>
                )}
            </div>

            {/* Micro bottom progress bar accent */}
            <div className="mt-2.5 h-[2px] w-full rounded-full overflow-hidden bg-white/[0.04]">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: '100%',
                        background: `linear-gradient(90deg, ${accent.color}90, ${accent.color}20)`,
                    }}
                />
            </div>
        </div>
    )
}

function isDark() {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}
