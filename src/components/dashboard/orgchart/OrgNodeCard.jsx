import { T } from '../../../constants/theme'

/**
 * Currency formatter supporting Crores (Cr), Lakhs (L), and Thousands (K).
 */
export function fmtPipeline(value) {
    const n = Number(value || 0)
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${n.toLocaleString('en-IN')}`
}

/**
 * Extracts 1-2 uppercase initials from a person's full name.
 */
export function getInitials(name) {
    if (!name || typeof name !== 'string') return '?'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const ROLE_TAGS = {
    COMPANY_SUPER_ADMIN: {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
        border: 'rgba(245, 158, 11, 0.40)',
        label: '👑 SUPER ADMIN',
    },
    ADMIN: {
        bg: 'rgba(124, 58, 237, 0.12)',
        color: '#7C3AED',
        border: 'rgba(124, 58, 237, 0.28)',
        label: 'ADMIN',
    },
    AGENT: {
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10B981',
        border: 'rgba(16, 185, 129, 0.28)',
        label: 'AGENT',
    },
    SUPER_ADMIN: {
        bg: 'rgba(139, 92, 246, 0.15)',
        color: '#8B5CF6',
        border: 'rgba(139, 92, 246, 0.32)',
        label: 'SUPER ADMIN',
    },
}

/**
 * OrgNodeCard renders an employee node in the organizational chart.
 * Fixed width 280px with spatial anchors for SVG connectors and expandable manager pill.
 */
export default function OrgNodeCard({
    node,
    isSelected = false,
    isMatched = false,
    isAncestorOfMatch = false,
    isDimmed = false,
    isCollapsed = false,
    onSelect,
    onToggleCollapse,
}) {
    if (!node) return null

    const hasReports = Array.isArray(node.directReports) && node.directReports.length > 0
    const personal = node.personalMetrics || {}
    const team = node.teamMetrics || {}

    const dealsCount = personal.dealsLeadingCount || 0
    const pipelineVal = personal.pipelineValue || 0
    const leadsCount = personal.leadsLeadingCount || 0
    const actsCount = personal.completedActivitiesCount || 0

    const reportsCount = hasReports ? node.directReports.length : 0
    const teamDealsCount = team.teamDealsLeadingCount || 0
    const teamPipelineVal = team.teamPipelineValue || 0

    const roleStyle = ROLE_TAGS[node.role] || {
        bg: T.primaryDim,
        color: T.primaryText,
        border: `${T.primary}30`,
        label: node.role || 'MEMBER',
    }

    const isOnline = node.active !== false

    // Avatar gradient based on role
    const avatarGradient = node.role === 'COMPANY_SUPER_ADMIN'
        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
        : node.role === 'ADMIN'
            ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
            : node.role === 'SUPER_ADMIN'
                ? 'linear-gradient(135deg, #8B5CF6, #C4B5FD)'
                : 'linear-gradient(135deg, #10B981, #059669)'

    // Dynamic card styling based on match/dim/select states
    const isSupremeSupervisor = node.role === 'COMPANY_SUPER_ADMIN'
    let cardBorder = isSupremeSupervisor ? '1.5px solid #F59E0B' : `1px solid ${T.border}`
    let cardShadow = isSupremeSupervisor
        ? '0 0 0 1px rgba(245, 158, 11, 0.25), 0 6px 20px rgba(245, 158, 11, 0.15)'
        : '0 4px 16px rgba(0,0,0,0.06)'
    let cardOpacity = 1

    if (isMatched) {
        cardBorder = `2px solid ${T.primary}`
        cardShadow = `0 0 0 3px ${T.primary}40, 0 0 24px ${T.primary}50, 0 10px 24px rgba(0,0,0,0.12)`
    } else if (isSelected) {
        cardBorder = isSupremeSupervisor ? '2px solid #F59E0B' : `2px solid ${T.primary}`
        cardShadow = isSupremeSupervisor
            ? '0 0 0 3px rgba(245, 158, 11, 0.35), 0 8px 24px rgba(245, 158, 11, 0.22)'
            : `0 0 0 2px ${T.primary}30, 0 8px 24px rgba(0,0,0,0.14)`
    } else if (isAncestorOfMatch) {
        cardBorder = isSupremeSupervisor ? '2px solid #F59E0B' : `1.5px solid ${T.border}`
        cardShadow = isSupremeSupervisor
            ? '0 0 0 2px rgba(245, 158, 11, 0.30), 0 6px 20px rgba(245, 158, 11, 0.18)'
            : '0 6px 20px rgba(0,0,0,0.09)'
    }

    if (isDimmed) {
        cardOpacity = 0.35
    }

    const handleCardClick = () => {
        if (typeof onSelect === 'function') {
            onSelect(node.id)
        }
    }

    const handlePillClick = (e) => {
        e.stopPropagation() // Prevent triggering card selection / details drawer
        if (typeof onToggleCollapse === 'function') {
            onToggleCollapse(node.id)
        }
    }

    return (
        <div
            data-node-id={node.id}
            data-parent-id={node.managerId || ''}
            onClick={handleCardClick}
            className="w-[280px] min-h-[156px] relative rounded-2xl p-4 flex flex-col justify-between cursor-pointer select-none transition-all duration-200"
            style={{
                background: T.surface,
                border: cardBorder,
                boxShadow: cardShadow,
                opacity: cardOpacity,
                filter: isDimmed ? 'grayscale(35%)' : 'none',
            }}
        >
            {/* Top Row: Avatar + Info */}
            <div className="flex items-start gap-3 min-w-0">
                {/* Avatar with Online Dot */}
                <div className="relative shrink-0">
                    <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-md"
                        style={{
                            background: avatarGradient,
                            color: '#FFFFFF',
                        }}
                    >
                        {getInitials(node.name)}
                    </div>
                    {/* Live Online Indicator */}
                    <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{
                            background: isOnline ? '#22C55E' : '#94A3B8',
                            borderColor: T.surface,
                        }}
                        title={isOnline ? 'Active' : 'Offline'}
                    />
                </div>

                {/* Name, Designation, and Role Tag */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                        <p
                            className="font-extrabold text-[13px] leading-tight truncate"
                            style={{ color: T.textPrimary }}
                            title={node.name}
                        >
                            {node.name}
                        </p>
                        {/* System Role Tag */}
                        <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0"
                            style={{
                                background: roleStyle.bg,
                                color: roleStyle.color,
                                border: `1px solid ${roleStyle.border}`,
                            }}
                        >
                            {roleStyle.label}
                        </span>
                    </div>

                    {/* Dynamic Designation Badge */}
                    <div className="flex items-center gap-1">
                        <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold truncate max-w-[170px]"
                            style={{
                                background: T.primaryFaint,
                                color: T.textSecondary,
                                border: `1px solid ${T.borderSubtle}`,
                            }}
                            title={node.designation || 'Team Member'}
                        >
                            {node.designation || 'Team Member'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics Micro-Grid */}
            <div
                className="grid grid-cols-3 gap-1.5 pt-2.5 mt-3 border-t"
                style={{ borderColor: `${T.borderSubtle}` }}
            >
                {/* Col 1: Deals Leading & Pipeline */}
                <div
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl text-center"
                    style={{ background: `${T.surfaceRaised}` }}
                >
                    <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: T.textMuted }}>
                        Deals
                    </span>
                    <span className="text-xs font-black" style={{ color: T.textPrimary }}>
                        {dealsCount}
                    </span>
                    <span
                        className="text-[10px] font-bold truncate max-w-[75px]"
                        style={{ color: T.primary }}
                        title={fmtPipeline(pipelineVal)}
                    >
                        {fmtPipeline(pipelineVal)}
                    </span>
                </div>

                {/* Col 2: Leads Leading */}
                <div
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl text-center"
                    style={{ background: `${T.surfaceRaised}` }}
                >
                    <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: T.textMuted }}>
                        Leads
                    </span>
                    <span className="text-xs font-black" style={{ color: T.textPrimary }}>
                        {leadsCount}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: T.textMuted }}>
                        Leading
                    </span>
                </div>

                {/* Col 3: Completed Activities */}
                <div
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl text-center"
                    style={{ background: `${T.surfaceRaised}` }}
                >
                    <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: T.textMuted }}>
                        Acts
                    </span>
                    <span className="text-xs font-black" style={{ color: T.textPrimary }}>
                        {actsCount}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">
                        Done
                    </span>
                </div>
            </div>

            {/* Expandable Manager Bottom Pill */}
            {hasReports && (
                <button
                    type="button"
                    onClick={handlePillClick}
                    className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    style={{
                        background: isCollapsed
                            ? `linear-gradient(135deg, ${T.primary}, #C2410C)`
                            : T.surface,
                        color: isCollapsed ? '#FFFFFF' : T.primaryText,
                        border: isCollapsed ? 'none' : `1.5px solid ${T.primary}60`,
                        boxShadow: isCollapsed
                            ? `0 4px 12px ${T.primary}40`
                            : '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    title={isCollapsed ? 'Click to expand reports' : 'Click to collapse reports'}
                >
                    <span>{isCollapsed ? '▶' : '▼'}</span>
                    <span>
                        {reportsCount} {reportsCount === 1 ? 'Report' : 'Reports'} · Team: {teamDealsCount} Deals ({fmtPipeline(teamPipelineVal)})
                    </span>
                </button>
            )}
        </div>
    )
}
