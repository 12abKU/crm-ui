import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { T } from '../../../constants/theme'
import {
    Card,
    Empty,
    TabSkeleton,
    TableCard,
    TableCell,
    TableHeaderCell,
    TableRow,
} from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt, fmtK, tableSurface } from '../dashboardDesign'
import OrgChartTab from '../orgchart/OrgChartTab'

export default function TeamTab({ data, onAgentClick }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const urlView = searchParams.get('view')

    // Initial view preference derived from searchParams > localStorage > 'table'
    const [view, setView] = useState(() => {
        if (urlView === 'table' || urlView === 'orgchart') return urlView
        try {
            const saved = localStorage.getItem('crm_team_view')
            if (saved === 'table' || saved === 'orgchart') return saved
        } catch {
            // ignore localStorage errors in restricted environments
        }
        return 'table'
    })

    // Synchronize URL and state bidirectionally
    useEffect(() => {
        if (urlView === 'table' || urlView === 'orgchart') {
            if (urlView !== view) {
                setView(urlView)
                try {
                    localStorage.setItem('crm_team_view', urlView)
                } catch {
                    // ignore
                }
            }
        } else {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev)
                next.delete('tab')
                next.set('view', view)
                return next
            }, { replace: true })
        }
    }, [urlView, view, setSearchParams])

    const handleViewChange = (nextView) => {
        if (nextView === view) return
        setView(nextView)
        try {
            localStorage.setItem('crm_team_view', nextView)
        } catch {
            // ignore
        }
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            next.delete('tab')
            next.set('view', nextView)
            return next
        })
    }

    // When viewing table, wait for parent team summary data
    if (view === 'table' && !data) return <TabSkeleton />

    const agents = data?.agents || []
    const firstCell = {
        color: T.textPrimary,
        borderLeft: `1px solid ${T.borderSubtle}`,
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
    }
    const lastCell = {
        borderRight: `1px solid ${T.borderSubtle}`,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
    }

    return (
        <Card accent={DASHBOARD_ACCENTS.violet}>
            {/* View Switcher Header */}
            <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4"
                style={{ borderBottom: `1px solid ${T.borderSubtle}` }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{
                            borderRadius: 14,
                            background: `linear-gradient(135deg, ${DASHBOARD_ACCENTS.violet}1A, ${DASHBOARD_ACCENTS.violet}08)`,
                            border: `1px solid ${DASHBOARD_ACCENTS.violet}30`,
                        }}
                    >
                        <span
                            className="material-symbols-outlined text-[22px]"
                            style={{ color: DASHBOARD_ACCENTS.violet }}
                        >
                            {view === 'orgchart' ? 'account_tree' : 'people'}
                        </span>
                    </div>
                    <div>
                        <h3
                            className="text-sm sm:text-base font-black uppercase tracking-wider"
                            style={{ color: T.textPrimary }}
                        >
                            {view === 'orgchart' ? 'Organizational Chart & Hierarchy' : 'Team Performance'}
                        </h3>
                        <p className="text-xs" style={{ color: T.textMuted }}>
                            {view === 'orgchart'
                                ? 'Visual reporting lines, leadership pipelines & team roll-up metrics'
                                : 'Individual performance metrics, deals won and sales activities'}
                        </p>
                    </div>
                </div>

                {/* Segmented View Switcher: [ 📋 Table View | 🌳 Org Chart ] */}
                <div
                    className="inline-flex items-center p-1 rounded-2xl shrink-0 self-start sm:self-auto"
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => handleViewChange('table')}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer"
                        style={{
                            background: view === 'table' ? T.primary : 'transparent',
                            color: view === 'table' ? '#FFFFFF' : T.textMuted,
                            boxShadow: view === 'table' ? `0 4px 14px ${T.primary}33` : 'none',
                        }}
                    >
                        <span>📋</span>
                        <span>Table View</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleViewChange('orgchart')}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer"
                        style={{
                            background: view === 'orgchart' ? T.primary : 'transparent',
                            color: view === 'orgchart' ? '#FFFFFF' : T.textMuted,
                            boxShadow: view === 'orgchart' ? `0 4px 14px ${T.primary}33` : 'none',
                        }}
                    >
                        <span>🌳</span>
                        <span>Org Chart</span>
                    </button>
                </div>
            </div>

            {/* Sub-view Rendering */}
            {view === 'orgchart' ? (
                <OrgChartTab onAgentClick={onAgentClick} />
            ) : agents.length ? (
                <TableCard>
                    <table className="w-full text-sm" style={tableSurface}>
                        <thead>
                            <tr>
                                {['Agent', 'Role', 'Won', 'Active', 'Revenue Won', 'Open Pipeline', 'Activities', 'Contacts', ''].map(h => (
                                    <TableHeaderCell key={h}>{h}</TableHeaderCell>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((a) => (
                                <TableRow key={a.id} onClick={() => onAgentClick(a.id)}>
                                    <TableCell style={firstCell}>
                                        <div className="flex items-center gap-3 min-w-[230px]">
                                            <div
                                                className="w-10 h-10 flex items-center justify-center font-black text-sm shrink-0"
                                                style={{
                                                    borderRadius: 14,
                                                    background: `linear-gradient(135deg, ${T.primary}, ${DASHBOARD_ACCENTS.gold})`,
                                                    color: '#fff',
                                                    boxShadow: `0 10px 20px ${T.primary}24`,
                                                }}
                                            >
                                                {a.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm truncate" style={{ color: T.textPrimary }}>
                                                    {a.name}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: T.textMuted }}>
                                                    {a.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                                            style={{ background: T.primaryDim, color: T.primaryText, letterSpacing: '0.08em' }}
                                        >
                                            {a.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-black" style={{ color: DASHBOARD_ACCENTS.green }}>
                                        {fmt(a.dealsWon)}
                                    </TableCell>
                                    <TableCell className="font-bold" style={{ color: T.textPrimary }}>
                                        {fmt(a.activeDeals)}
                                    </TableCell>
                                    <TableCell className="font-bold" style={{ color: T.textPrimary }}>
                                        {fmtK(a.revenueWon)}
                                    </TableCell>
                                    <TableCell style={{ color: T.textMuted }}>
                                        {fmtK(a.openRevenue)}
                                    </TableCell>
                                    <TableCell>
                                        <span style={{ color: T.textPrimary, fontWeight: 800 }}>
                                            {fmt(a.completedActivities)}
                                        </span>
                                        <span style={{ color: T.textMuted }}>
                                            /{fmt(a.totalActivities)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-bold" style={{ color: T.textPrimary }}>
                                        {fmt(a.contacts)}
                                    </TableCell>
                                    <TableCell style={lastCell}>
                                        <div
                                            className="w-8 h-8 flex items-center justify-center transition-colors"
                                            style={{
                                                borderRadius: 12,
                                                background: T.primaryDim,
                                                border: `1px solid ${T.primary}20`,
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined text-[15px]"
                                                style={{ color: T.primary }}
                                            >
                                                arrow_forward
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </table>
                </TableCard>
            ) : (
                <Empty />
            )}
        </Card>
    )
}
