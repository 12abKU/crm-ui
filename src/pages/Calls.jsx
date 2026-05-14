import { useEffect, useState } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import Pagination from '../components/Pagination'
import PageHeader from '../components/ui/PageHeader'
import CallLogTable from '../components/voice/CallLogTable'
import CallWidget from '../components/voice/CallWidget'
import CallStatCard from '../components/voice/CallStatCard'
import QuickDialerModal from '../components/voice/QuickDialerModal'
import api from '../api'

const PAGE_SIZE = 20
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
            <main className="p-8 max-w-[1440px] mx-auto">
                <PageHeader
                    title="Calls"
                    subtitle="Voice call history and logs"
                    actions={
                        <button onClick={() => setShowDialer(true)} className="crm-btn-primary flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[17px]">add_call</span>
                            New Call
                        </button>
                    }
                />

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <CallStatCard icon="call" label="Total Calls"
                        value={stats?.total ?? '—'} bg={T.primaryDim} color={T.primary} />
                    <CallStatCard icon="call_received" label="Answered"
                        value={stats?.answered ?? '—'} bg={T.successDim} color={T.success} />
                    <CallStatCard icon="schedule" label="Talk Time"
                        value={stats ? fmtMin(stats.totalMinutes) : '—'} bg={T.secondaryDim} color={T.secondary} />
                    <CallStatCard icon="avg_pace" label="Avg Duration"
                        value={stats ? `${stats.avgDurationSeconds}s` : '—'} bg={T.warningDim} color={T.warning} />
                </div>

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
                            {FILTERS.map(item => (
                                <button key={item} onClick={() => handleFilterChange(item)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        background: filter === item ? T.primaryDim : 'transparent',
                                        color: filter === item ? T.primary : T.textMuted,
                                    }}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <CallLogTable logs={logs} loading={loading} />

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

            {showDialer && !activeCall && (
                <QuickDialerModal
                    number={dialNumber}
                    onNumberChange={setDialNumber}
                    onClose={() => setShowDialer(false)}
                    onCall={startQuickCall}
                />
            )}

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
