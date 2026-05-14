import { useEffect, useState } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import CallLogTable from '../components/voice/CallLogTable'
import CallWidget from '../components/voice/CallWidget'
import api from '../api'

const PAGE_SIZE = 20

const StatCard = ({ icon, label, value, bg, color }) => (
    <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: bg }}>
            <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
        </div>
        <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
            <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value}</p>
        </div>
    </div>
)

const FILTERS = ['ALL', 'OUTBOUND', 'INBOUND', 'ANSWERED', 'MISSED']

export default function Calls() {
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
        loadLogs(0, 'ALL')
    }, [])

    const handleFilterChange = (f) => {
        setFilter(f)
        loadLogs(0, f)
    }

    const fmtMin = (m) => m >= 60 ? `${(m / 60).toFixed(1)}h` : `${m}m`

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-[1440px] mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-4xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>
                            Calls
                        </h2>
                        <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                            Voice call history and logs
                        </p>
                    </div>
                    <button onClick={() => setShowDialer(true)}
                        className="crm-btn-primary flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[17px]">add_call</span>
                        New Call
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <StatCard icon="call" label="Total Calls"
                        value={stats?.total ?? '—'} bg={T.primaryDim} color={T.primary} />
                    <StatCard icon="call_received" label="Answered"
                        value={stats?.answered ?? '—'} bg={T.successDim} color={T.success} />
                    <StatCard icon="schedule" label="Talk Time"
                        value={stats ? fmtMin(stats.totalMinutes) : '—'} bg={T.secondaryDim} color={T.secondary} />
                    <StatCard icon="avg_pace" label="Avg Duration"
                        value={stats ? `${stats.avgDurationSeconds}s` : '—'} bg={T.warningDim} color={T.warning} />
                </div>

                {/* Filters + Table */}
                <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Call Logs</h3>
                            {!loading && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {totalElements}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {FILTERS.map(f => (
                                <button key={f} onClick={() => handleFilterChange(f)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        background: filter === f ? T.primaryDim : 'transparent',
                                        color: filter === f ? T.primary : T.textMuted,
                                    }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <CallLogTable logs={logs} loading={loading} />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-5 pt-5"
                            style={{ borderTop: `1px solid ${T.border}` }}>
                            <p className="text-xs font-semibold" style={{ color: T.textMuted }}>
                                Page {page + 1} of {totalPages}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 0}
                                    onClick={() => loadLogs(page - 1)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i)
                                    .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                                    .reduce((acc, i, idx, arr) => {
                                        if (idx > 0 && i - arr[idx - 1] > 1) acc.push('...')
                                        acc.push(i)
                                        return acc
                                    }, [])
                                    .map((item, idx) =>
                                        item === '...'
                                            ? <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs"
                                                style={{ color: T.textMuted }}>…</span>
                                            : <button key={item}
                                                onClick={() => loadLogs(item)}
                                                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                                                style={{
                                                    background: page === item ? T.primary : T.surfaceRaised,
                                                    color: page === item ? '#fff' : T.textSecondary,
                                                }}>
                                                {item + 1}
                                            </button>
                                    )
                                }

                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => loadLogs(page + 1)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Quick dialer modal */}
            {showDialer && !activeCall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div className="w-80 rounded-2xl p-6 flex flex-col gap-4"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Dial a number</h3>
                            <button onClick={() => setShowDialer(false)} style={{ color: T.textMuted }}>
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                        <input
                            className="crm-input text-lg font-bold tracking-widest text-center"
                            placeholder="+91XXXXXXXXXX"
                            value={dialNumber}
                            onChange={e => setDialNumber(e.target.value)}
                        />
                        <button
                            disabled={!dialNumber.trim()}
                            onClick={() => {
                                setShowDialer(false)
                                setActiveCall({ phone: dialNumber, firstName: dialNumber })
                            }}
                            className="crm-btn-primary w-full flex items-center justify-center gap-2 py-3">
                            <span className="material-symbols-outlined text-[18px]">call</span>
                            Call
                        </button>
                    </div>
                </div>
            )}

            {/* Active call widget */}
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