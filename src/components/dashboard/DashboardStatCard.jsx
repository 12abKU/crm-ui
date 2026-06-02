import Skeleton from 'react-loading-skeleton'
import { T } from '../../constants/theme'
import { DASHBOARD_ACCENTS, luxeShadow, luxeSurface } from './dashboardDesign'

const ICON_COLORS = {
    handshake: { bg: T.primaryDim, color: DASHBOARD_ACCENTS.blue },
    payments: { bg: T.successDim, color: DASHBOARD_ACCENTS.green },
    business: { bg: T.warningDim, color: DASHBOARD_ACCENTS.gold },
    groups: { bg: 'rgba(15,118,110,0.12)', color: DASHBOARD_ACCENTS.teal },
    person_add: { bg: 'rgba(219,39,119,0.12)', color: DASHBOARD_ACCENTS.rose },
    task_alt: { bg: T.primaryDim, color: T.primary },
}

export default function DashboardStatCard({ icon, label, value, sub, loading }) {
    const accent = ICON_COLORS[icon] || { bg: T.primaryDim, color: T.primary }

    return (
        <div
            className="p-5 md:p-6 flex flex-col gap-4 transition-all duration-300 relative overflow-hidden"
            style={{
                borderRadius: 22,
                minHeight: 168,
                ...luxeSurface(accent.color),
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = luxeShadow(accent.color, true)
                e.currentTarget.style.borderColor = `${accent.color}55`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = luxeShadow(accent.color)
                e.currentTarget.style.borderColor = `${T.border}80`
            }}
        >
            <div className="absolute left-0 right-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${accent.color}E6 0%, ${accent.color}55 45%, transparent 100%)` }} />

            <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 flex items-center justify-center shrink-0"
                    style={{
                        borderRadius: 14,
                        background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.color}18 100%)`,
                        border: `1px solid ${accent.color}30`,
                        boxShadow: `0 12px 24px ${accent.color}12, inset 0 1px 0 rgba(255,255,255,0.55)`,
                    }}>
                    <span className="material-symbols-outlined filled text-[22px]"
                        style={{ color: accent.color }}>{icon}</span>
                </div>

                {sub && (
                    <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-[145px]"
                        style={{
                            letterSpacing: '0.08em',
                            background: `${accent.color}10`,
                            color: accent.color,
                            border: `1px solid ${accent.color}25`,
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent.color }} />
                        <span className="truncate">{sub}</span>
                    </span>
                )}
            </div>

            <div className="mt-auto min-w-0">
                <p className="text-[11px] font-black uppercase truncate"
                    style={{ color: T.textMuted, letterSpacing: '0.11em' }}>
                    {label}
                </p>
                {loading ? (
                    <Skeleton height={38} width={128} borderRadius={10} className="mt-2" />
                ) : (
                    <h3 className="text-[32px] md:text-[34px] font-black leading-none mt-2 truncate"
                        style={{ color: T.textPrimary }}>
                        {value}
                    </h3>
                )}
            </div>

            <div className="absolute left-5 right-5 bottom-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent.color}40, transparent)` }} />
        </div>
    )
}
