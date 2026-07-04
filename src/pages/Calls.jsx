import { useEffect, useState } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import Pagination from '../components/Pagination'
import CallLogTable from '../components/voice/CallLogTable'
import CallWidget from '../components/voice/CallWidget'
import CallStatCard from '../components/voice/CallStatCard'
import QuickDialerModal from '../components/voice/QuickDialerModal'
import api from '../api'

// ── Constants (unchanged) ──────────────────────────────────────
const PAGE_SIZE = 20
const FILTERS = ['ALL', 'OUTBOUND', 'INBOUND', 'ANSWERED', 'MISSED']

const FILTER_META = {
    ALL:      { icon: 'call',           color: T.primary },
    OUTBOUND: { icon: 'call_made',      color: T.chartBlue },
    INBOUND:  { icon: 'call_received',  color: '#16A34A' },
    ANSWERED: { icon: 'phone_in_talk',  color: '#0891B2' },
    MISSED:   { icon: 'phone_missed',   color: '#DC2626' },
}

export default function Calls() {
    // ── State (unchanged) ──────────────────────────────────────
    const [logs, setLogs] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [showDialer, setShowDialer] = useState(false)
    const [dialNumber, setDialNumber] = useState('')
    const [activeCall, setActiveCall] = useState(null)

    // ── Data handlers (unchanged) ──────────────────────────────
    const loadLogs = (p = 0, f = filter) => {
        setLoading(true)
        api.get(`/api/voice/logs?page=${p}&size=${PAGE_SIZE}&filter=${f}`)
            .then(r => {
                setLogs(r.data.content)
                setTotalPages(r.data.totalPages)
                setTotalElements(r.data.totalElements)
                setPage(p)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    const loadStats = () => {
        api.get('/api/voice/stats').then(r => setStats(r.data)).catch(() => { })
    }

    useEffect(() => {
        loadStats()
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadLogs(0, 'ALL')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleFilterChange = (nextFilter) => {
        setFilter(nextFilter)
        loadLogs(0, nextFilter)
    }

    const startQuickCall = (number) => {
        setShowDialer(false)
        setActiveCall({ phone: number, firstName: number })
    }

    const fmtMin = (minutes) => minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* ── Hero Banner ──────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '45%', width: 130, height: 130,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-6 lg:px-9 lg:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: T.sidebarActiveText }}>call</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    Calls
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                    Voice call history and logs
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowDialer(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 shrink-0 w-full lg:w-auto"
                            style={{
                                background: T.heroBadgeBg,
                                border: '1px solid rgba(255,255,255,0.22)',
                                color: '#fff',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                            onMouseLeave={e => e.currentTarget.style.background = T.heroBadgeBg}>
                            <span className="material-symbols-outlined text-[18px]">add_call</span>
                            New Call
                        </button>
                    </div>
                </div>

                {/* ── Stat cards ───────────────────────────── */}
                <div className="flex flex-wrap gap-4 mb-7">
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <CallStatCard icon="call"      label="Total Calls"   value={stats?.total ?? '0'}                      bg={T.primaryDim}  color={T.primary} />
                    </div>
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <CallStatCard icon="call_received" label="Answered"  value={stats?.answered ?? '0'}                   bg={T.successDim}  color={T.success} />
                    </div>
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <CallStatCard icon="schedule"  label="Talk Time"     value={stats ? fmtMin(stats.totalMinutes) : '0'} bg={T.secondaryDim} color={T.secondary} />
                    </div>
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <CallStatCard icon="avg_pace"  label="Avg Duration"  value={stats ? `${stats.avgDurationSeconds}s` : '0'} bg={T.warningDim} color={T.warning} />
                    </div>
                </div>

                {/* ── Call logs card ──────────────────────── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>

                    {/* Card header */}
                    <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
                        style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined filled text-[18px]"
                                style={{ color: T.primary }}>list_alt</span>
                            <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Call Logs</h3>
                            {!loading && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {totalElements}
                                </span>
                            )}
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full"
                            style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                            {FILTERS.map(item => {
                                const meta = FILTER_META[item]
                                const isActive = filter === item
                                return (
                                    <button key={item} onClick={() => handleFilterChange(item)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
                                        style={{
                                            background: isActive ? T.primary : 'transparent',
                                            color: isActive ? '#fff' : T.textMuted,
                                        }}>
                                        <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                                        {item.charAt(0) + item.slice(1).toLowerCase()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Table + Pagination (unchanged) */}
                    <div className="overflow-x-auto">
                        <CallLogTable logs={logs} loading={loading} />
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={PAGE_SIZE}
                            onPage={(nextPage) => loadLogs(nextPage)}
                        />
                    )}
                </div>
            </main>

            {/* QuickDialerModal (unchanged) */}
            {showDialer && !activeCall && (
                <QuickDialerModal
                    number={dialNumber}
                    onNumberChange={setDialNumber}
                    onClose={() => setShowDialer(false)}
                    onCall={startQuickCall}
                />
            )}

            {/* CallWidget (unchanged) */}
            {activeCall && (
                <CallWidget
                    contact={activeCall}
                    onClose={() => setActiveCall(null)}
                    onCallComplete={() => { setActiveCall(null); loadLogs(0); loadStats() }}
                />
            )}
        </div>
    )
}
