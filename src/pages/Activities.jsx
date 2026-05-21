import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import { T, ACTIVITY_TYPES, ACTIVITY_STYLES, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import Pagination from '../components/Pagination'
import SearchableSelect from '../components/SearchableSelect'
import { Input, Select } from '../components/FormField'
import SearchInput from '../components/ui/SearchInput'
import EmptyTableRow from '../components/ui/EmptyTableRow'
import ActivityRow from '../components/activities/ActivityRow'
import ActivityStatCard from '../components/activities/ActivityStatCard'
import MyTasksPanel from '../components/activities/MyTasksPanel'
import TimelineView from '../components/activities/TimelineView'
import TodayFocus from '../components/activities/TodayFocus'
import api from '../api'
import { useSelector } from 'react-redux'

// ── Constants (unchanged) ──────────────────────────────────────
const PAGE_SIZE = 20
const EMPTY_FORM = { type: 'CALL', subject: '', description: '', scheduledAt: '', accountId: '', contactId: '', dealId: '' }
const VIEW_MODES = [
    { mode: 'table',    icon: 'table_rows', label: 'All Activities' },
    { mode: 'tasks',    icon: 'checklist',  label: 'My Tasks' },
    { mode: 'timeline', icon: 'timeline',   label: 'Timeline' },
]

export default function Activities() {
    // ── State (unchanged) ──────────────────────────────────────
    const [activities, setActivities] = useState([])
    const [accounts, setAccounts] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [filterAccountId, setFilterAccountId] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [viewMode, setViewMode] = useState('table')
    const [loadCount, setLoadCount] = useState(0)
    const [allTasks, setAllTasks] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [filteredContacts, setFilteredContacts] = useState([])
    const [filteredDeals, setFilteredDeals] = useState([])
    const [loadingRelated, setLoadingRelated] = useState(false)

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')
    const initialLoad = useRef(true)

    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

    // ── Data handlers (all unchanged) ─────────────────────────
    const loadAllTasks = useCallback(async () => {
        const r = await api.get('/api/activities/my-tasks')
        setAllTasks(r.data ?? [])
    }, [])

    const stats = useMemo(() => {
        const now = new Date()
        const overdue = allTasks.filter(a => !a.completed && a.scheduledAt && new Date(a.scheduledAt) < now).length
        const dueToday = allTasks.filter(a => {
            if (!a.scheduledAt || a.completed) return false
            const d = new Date(a.scheduledAt)
            const n = new Date()
            return d >= new Date(n.setHours(0, 0, 0, 0)) && d <= new Date(n.setHours(23, 59, 59, 999))
        }).length
        const done = activities.filter(a => a.completed).length
        const pending = allTasks.filter(a => !a.completed && a.scheduledAt).length
        return { overdue, dueToday, done, pending }
    }, [allTasks, activities])

    const { overdueList, upcomingList } = useMemo(() => {
        const now = new Date()
        const overdueList = allTasks
            .filter(a => !a.completed && a.scheduledAt && new Date(a.scheduledAt) < now)
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        const upcomingList = allTasks
            .filter(a => !a.completed && a.scheduledAt && new Date(a.scheduledAt) >= now)
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
            .slice(0, 3)
        return { overdueList, upcomingList }
    }, [allTasks])

    const displayActivities = useMemo(() => {
        if (typeFilter === 'ALL') return activities
        return activities.filter(a => a.type === typeFilter)
    }, [activities, typeFilter])

    const loadPage = async (pageNum, accountId = filterAccountId, q = search) => {
        setLoading(true)
        try {
            let url
            if (accountId) {
                url = `/api/activities/account/${accountId}?page=${pageNum}&size=${PAGE_SIZE}`
            } else {
                const params = new URLSearchParams({ page: pageNum, size: PAGE_SIZE })
                if (q.trim()) params.set('search', q.trim())
                url = `/api/activities?${params}`
            }
            const r = await api.get(url)
            setActivities(r.data.content ?? [])
            setTotalPages(r.data.totalPages ?? 0)
            setTotalElements(r.data.totalElements ?? 0)
        } finally {
            setLoading(false)
            setLoadCount(c => c + 1)
        }
    }

    useEffect(() => {
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content ?? []))
        loadAllTasks()
        if (highlightId) {
            api.get(`/api/activities/position/${highlightId}?size=${PAGE_SIZE}`)
                .then(r => { const p = r.data.page ?? 0; setPage(p); loadPage(p, '') })
                .catch(() => loadPage(0, ''))
        } else {
            loadPage(0, '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (filterAccountId) return
        if (initialLoad.current) { initialLoad.current = false; return }
        const t = setTimeout(() => { setPage(0); loadPage(0, '', search) }, 350)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const resetForm = () => { setForm(EMPTY_FORM); setFilteredContacts([]); setFilteredDeals([]) }
    const goToPage = (p) => { setPage(p); loadPage(p, filterAccountId, search) }
    const onFilterChange = (accountId) => { setFilterAccountId(accountId); setSearch(''); setPage(0); loadPage(0, accountId, '') }

    const onFormAccountChange = async (accountId) => {
        setForm(f => ({ ...f, accountId, contactId: '', dealId: '' }))
        setFilteredContacts([]); setFilteredDeals([])
        if (!accountId) return
        setLoadingRelated(true)
        try {
            const r = await api.get(`/api/accounts/${accountId}/profile`)
            setFilteredContacts((r.data.contacts ?? []).map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` })))
            setFilteredDeals((r.data.openDeals ?? []).map(d => ({ id: d.id, label: d.title })))
        } finally { setLoadingRelated(false) }
    }

    const setF = (key, value) => setForm(f => ({ ...f, [key]: value }))

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/api/activities', {
            ...form,
            accountId: form.accountId || null,
            contactId: form.contactId || null,
            dealId: form.dealId || null
        })
        setOpen(false); resetForm(); setPage(0)
        loadPage(0, filterAccountId, search)
    }

    const remove = async (id) => {
        await api.delete(`/api/activities/${id}`)
        const newTotal = totalElements - 1
        const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1)
        const targetPage = Math.min(page, maxPage)
        setPage(targetPage)
        loadPage(targetPage, filterAccountId, search)
        loadAllTasks()
    }

    const updateActivity = async (id, field, value) => {
        const activity = activities.find(x => x.id === id)
        await api.put(`/api/activities/${id}`, {
            type: activity.type, subject: activity.subject,
            description: activity.description, scheduledAt: activity.scheduledAt,
            [field]: value,
        })
        setActivities(prev => prev.map(x => x.id === id ? { ...x, [field]: value } : x))
    }

    const toggleComplete = async (id, completed) => {
        await api.patch(`/api/activities/${id}/complete`, { completed })
        setActivities(prev => prev.map(x => x.id === id ? { ...x, completed } : x))
        loadAllTasks()
    }

    const saveOutcome = async (id, outcome) => {
        await api.patch(`/api/activities/${id}/outcome`, { outcome })
        setActivities(prev => prev.map(x => x.id === id ? { ...x, outcome } : x))
        loadAllTasks()
    }

    return (
        <div>
            <TopBar />
            <main className="p-8">

                {/* ── Hero Banner ──────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 120,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '45%', width: 140, height: 140,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-9 py-7 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: T.sidebarActiveText }}>event_note</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    Activities
                                </h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-sm" style={{ color: T.heroSubText }}>
                                        {totalElements} logged
                                    </p>
                                    {stats.overdue > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: 'rgba(220,38,38,0.25)', color: T.errorLight }}>
                                            {stats.overdue} overdue
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 shrink-0"
                            style={{
                                background: T.heroBadgeBg,
                                border: '1px solid rgba(255,255,255,0.22)',
                                color: '#fff',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                            onMouseLeave={e => e.currentTarget.style.background = T.heroBadgeBg}>
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Log Activity
                        </button>
                    </div>
                </div>

                {/* ── Stat cards ───────────────────────────── */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <ActivityStatCard icon="warning"         label="Overdue"   value={loading ? '—' : stats.overdue}   sub="need follow-up"    loading={loading} accent="#DC2626" />
                    <ActivityStatCard icon="today"           label="Due today"  value={loading ? '—' : stats.dueToday}  sub="scheduled today"   loading={loading} accent="#D97706" />
                    <ActivityStatCard icon="task_alt"        label="Completed"  value={loading ? '—' : stats.done}      sub="on this page"      loading={loading} accent={T.success} />
                    <ActivityStatCard icon="pending_actions" label="Pending"    value={loading ? '—' : stats.pending}   sub="scheduled, open"   loading={loading} />
                </div>

                {/* ── Today focus ──────────────────────────── */}
                <TodayFocus overdue={overdueList} upcoming={upcomingList} loading={loading} />

                {/* ── Toolbar ──────────────────────────────── */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    {/* View mode switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        {VIEW_MODES.map(({ mode, icon, label }) => (
                            <button key={mode} onClick={() => setViewMode(mode)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                                style={{
                                    background: viewMode === mode ? T.primary : 'transparent',
                                    color: viewMode === mode ? '#fff' : T.textMuted,
                                }}>
                                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Filters (unchanged logic) */}
                    {viewMode !== 'tasks' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <SearchInput
                                value={search}
                                onChange={(value) => { setSearch(value); setFilterAccountId('') }}
                                placeholder="Search activities..."
                                minWidth={200}
                            />
                            <div className="flex items-center gap-1 p-1 rounded-xl"
                                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                {['ALL', ...ACTIVITY_TYPES].map(type => {
                                    const isActive = typeFilter === type
                                    const s = ACTIVITY_STYLES[type]
                                    return (
                                        <button key={type} onClick={() => setTypeFilter(type)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                            style={{
                                                background: isActive ? (type === 'ALL' ? T.primary : s?.bg) : 'transparent',
                                                color: isActive ? (type === 'ALL' ? '#fff' : s?.color) : T.textMuted,
                                            }}>
                                            {type !== 'ALL' && <span className="material-symbols-outlined text-[12px]">{s?.icon}</span>}
                                            {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                                        </button>
                                    )
                                })}
                            </div>
                            <SearchableSelect value={filterAccountId} onChange={onFilterChange}
                                options={[{ id: '', label: 'All Accounts' }, ...accounts.map(a => ({ id: String(a.id), label: a.name }))]}
                                placeholder="Filter by account..." />
                        </div>
                    )}
                </div>

                {/* ── Main content (unchanged logic) ─────── */}
                {viewMode === 'tasks' ? (
                    <MyTasksPanel onComplete={toggleComplete} onOutcome={saveOutcome} />
                ) : (
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        {viewMode === 'table' ? (
                            <>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                            {['', 'Type', 'Subject · Outcome', 'Account · Contact', 'Scheduled', 'Status', ''].map((header, i) => (
                                                <th key={i} className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                                    style={{ color: T.textMuted }}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            Array.from({ length: 8 }).map((_, i) => (
                                                <tr key={i} style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                                    {[20, 80, 160, 130, 100, 70, 20].map((width, j) => (
                                                        <td key={j} className="px-4 py-3.5">
                                                            <Skeleton height={14} width={width} borderRadius={6} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : displayActivities.map((activity, i) => {
                                            const isHighlighted = String(activity.id) === highlightId
                                            return (
                                                <ActivityRow
                                                    key={isHighlighted ? `${activity.id}-${loadCount}` : activity.id}
                                                    activity={activity}
                                                    rowBg={ROW_COLORS[i % ROW_COLORS.length]}
                                                    highlighted={isHighlighted}
                                                    onRemove={remove}
                                                    onUpdate={updateActivity}
                                                    onComplete={toggleComplete}
                                                    onOutcome={saveOutcome}
                                                    showOwner={isAdmin}
                                                />
                                            )
                                        })}
                                        {!loading && displayActivities.length === 0 && (
                                            <EmptyTableRow colSpan={7} icon="event_note" title="No activities yet" />
                                        )}
                                    </tbody>
                                </table>
                                <Pagination page={page} totalPages={totalPages}
                                    totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />
                            </>
                        ) : (
                            <TimelineView activities={displayActivities} loading={loading}
                                onComplete={toggleComplete} onOutcome={saveOutcome} />
                        )}
                    </div>
                )}
            </main>

            {/* SlideForm (unchanged) */}
            <SlideForm title="Log Activity" open={open}
                onClose={() => { setOpen(false); resetForm() }}
                onSubmit={submit}>
                <Select label="Type" value={form.type} onChange={e => setF('type', e.target.value)}>
                    {ACTIVITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </Select>
                <Input label="Subject *" value={form.subject} onChange={e => setF('subject', e.target.value)}
                    placeholder="Initial discussion" required />
                <Input label="Description" value={form.description} onChange={e => setF('description', e.target.value)}
                    placeholder="Details..." />
                <Input label="Scheduled At" type="datetime-local" value={form.scheduledAt}
                    onChange={e => setF('scheduledAt', e.target.value)} />
                <SearchableSelect label="Account" value={form.accountId} onChange={onFormAccountChange}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))} placeholder="Select account" />
                <SearchableSelect label="Contact" value={form.contactId} onChange={value => setF('contactId', value)}
                    options={filteredContacts}
                    placeholder={form.accountId ? 'Select contact' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingRelated} />
                <SearchableSelect label="Deal" value={form.dealId} onChange={value => setF('dealId', value)}
                    options={filteredDeals}
                    placeholder={form.accountId ? 'Select deal' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingRelated} />
            </SlideForm>
        </div>
    )
}
