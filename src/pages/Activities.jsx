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
import VirtualTableBody from '../components/ui/VirtualTableBody'
import ActivityStatCard from '../components/activities/ActivityStatCard'
import MyTasksPanel from '../components/activities/MyTasksPanel'
import TimelineView from '../components/activities/TimelineView'
import TodayFocus from '../components/activities/TodayFocus'
import CalendarView from '../components/activities/CalendarView'
import api, { extractApiErrorMessage } from '../api'
import { useSelector } from 'react-redux'
import { usePermissions } from '../hooks/usePermission'
import usePaginatedSearch from '../hooks/usePaginatedSearch'
import { useDialog } from '../contexts/DialogContext'

// ── Constants (unchanged) ──────────────────────────────────────
const PAGE_SIZE = 20
const EMPTY_FORM = { type: 'CALL', subject: '', description: '', scheduledAt: '', reminderAt: '', accountId: '', contactId: '', dealId: '', remindHourlyOneDayBefore: false }
const VIEW_MODES = [
    { mode: 'table',    icon: 'table_rows', label: 'All Activities' },
    { mode: 'tasks',    icon: 'checklist',  label: 'My Tasks' },
    { mode: 'calendar', icon: 'calendar_month', label: 'Calendar' },
    { mode: 'timeline', icon: 'timeline',   label: 'Timeline' },
]

export default function Activities() {
    // ── State ──────────────────────────────────────────────────
    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [filterAccountId, setFilterAccountId] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [viewMode, setViewMode] = useState('table')
    const [loadCount, setLoadCount] = useState(0)
    const [dashboardData, setDashboardData] = useState({
        stats: { overdue: 0, dueToday: 0, done: 0, pending: 0 },
        focus: { overdue: [], upcoming: [] }
    })
    const [dashboardLoading, setDashboardLoading] = useState(true)
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [filteredContacts, setFilteredContacts] = useState([])
    const [filteredDeals, setFilteredDeals] = useState([])
    const [loadingRelated, setLoadingRelated] = useState(false)

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')

    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const can = usePermissions(['ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE'])
    const { confirm } = useDialog()

    // The URL bakes in filterAccountId — when it changes the hook detects the
    // new string and re-fetches automatically (no unstable callback needed).
    const activitiesBaseUrl = filterAccountId
        ? `/api/activities/account/${filterAccountId}`
        : '/api/activities'

    const {
        items: activities,
        setItems: setActivities,
        page,
        setPage,
        totalPages,
        totalElements,
        loading,
        search,
        setSearch,
        loadPage,
        goToPage,
        reloadCurrentPage,
        updateItemInCache,
        invalidateCacheForKey,
    } = usePaginatedSearch({
        baseUrl: activitiesBaseUrl,
        pageSize: PAGE_SIZE,
        cacheKey: `activities:${filterAccountId}`
    })

    // ── Data handlers ──────────────────────────────────────────
    const loadDashboard = useCallback(async () => {
        setDashboardLoading(true)
        try {
            const r = await api.get('/api/activities/dashboard')
            setDashboardData(r.data ?? {
                stats: { overdue: 0, dueToday: 0, done: 0, pending: 0 },
                focus: { overdue: [], upcoming: [] }
            })
        } finally {
            setDashboardLoading(false)
        }
    }, [])

    const loadAccountOptions = useCallback(async (query = '') => {
        const params = new URLSearchParams({ page: '0', size: '10' })
        if (query.trim()) params.set('search', query.trim())
        const r = await api.get(`/api/accounts?${params}`)
        const nextAccounts = r.data.content ?? []
        setAccounts(nextAccounts)
        return nextAccounts.map(a => ({ id: a.id, label: a.name }))
    }, [])

    const loadAccountFilterOptions = useCallback(async (query = '') => {
        return [{ id: '', label: 'All Accounts' }, ...(await loadAccountOptions(query))]
    }, [loadAccountOptions])

    const displayActivities = useMemo(() => {
        if (typeFilter === 'ALL') return activities
        return activities.filter(a => a.type === typeFilter)
    }, [activities, typeFilter])

    // Increment loadCount each time the list finishes loading so that
    // highlighted activity rows re-mount and trigger their scroll animation
    const prevLoading = useRef(false)
    useEffect(() => {
        if (prevLoading.current && !loading) setLoadCount(c => c + 1)
        prevLoading.current = loading
    }, [loading])

    useEffect(() => {
        loadDashboard()
        if (highlightId) {
            api.get(`/api/activities/position/${highlightId}?size=${PAGE_SIZE}`, { suppressErrorToast: true })
                .then(r => { 
                    const p = r.data.page ?? 0
                    setPage(p)
                    loadPage(p, '') 
                })
                .catch(() => {})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const resetForm = () => { setForm(EMPTY_FORM); setFilteredContacts([]); setFilteredDeals([]); setErrors({}) }
    const handleOpenModal = () => { setErrors({}); setOpen(true) }
    const onFilterChange = (accountId) => { setFilterAccountId(accountId); setSearch(''); setPage(0) }

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

    const toDateTimeLocalValue = (date) => {
        const pad = (n) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    const applyReminderPreset = (minutesBefore) => {
        if (!form.scheduledAt) return
        const d = new Date(form.scheduledAt)
        d.setMinutes(d.getMinutes() - minutesBefore)
        setF('reminderAt', toDateTimeLocalValue(d))
    }

    const submit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/api/activities', {
                ...form,
                accountId: form.accountId || null,
                contactId: form.contactId || null,
                dealId: form.dealId || null,
                reminderAt: form.reminderAt || null,
                remindHourlyOneDayBefore: form.remindHourlyOneDayBefore || false
            })
            setOpen(false); resetForm(); setPage(0)
            invalidateCacheForKey()
            loadPage(0, search)
            setErrors({})
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            } else {
                setErrors({ general: extractApiErrorMessage(err) })
            }
        }
    }

    const remove = async (id) => {
        const isConfirmed = await confirm({
            title: 'Delete Activity?',
            message: 'Are you sure you want to delete this activity? This action cannot be undone.'
        });
        if (!isConfirmed) return;
        
        await api.delete(`/api/activities/${id}`)
        const newTotal = totalElements - 1
        const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1)
        const targetPage = Math.min(page, maxPage)
        setPage(targetPage)
        invalidateCacheForKey()
        loadPage(targetPage, search)
        loadDashboard()
    }

    const updateActivity = async (id, field, value) => {
        const activity = activities.find(x => x.id === id)
        await api.put(`/api/activities/${id}`, {
            type: activity.type, subject: activity.subject,
            description: activity.description, scheduledAt: activity.scheduledAt,
            reminderAt: activity.reminderAt,
            [field]: value,
        })
        updateItemInCache(item => item.id === id, item => ({ ...item, [field]: value }))
    }

    const toggleComplete = async (id, completed) => {
        await api.patch(`/api/activities/${id}/complete`, { completed })
        updateItemInCache(item => item.id === id, item => ({ ...item, completed }))
        loadDashboard()
    }

    const saveOutcome = async (id, outcome) => {
        await api.patch(`/api/activities/${id}/outcome`, { outcome })
        updateItemInCache(item => item.id === id, item => ({ ...item, outcome }))
        loadDashboard()
    }

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
                        position: 'absolute', bottom: -20, left: '45%', width: 140, height: 140,
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
                                    {dashboardData.stats.overdue > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: 'rgba(220,38,38,0.25)', color: T.errorLight }}>
                                            {dashboardData.stats.overdue} overdue
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {can.ACTIVITIES_CREATE && (
                            <button onClick={handleOpenModal}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 shrink-0 w-full lg:w-auto"
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
                        )}
                    </div>
                </div>

                {/* ── Stat cards ───────────────────────────── */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <ActivityStatCard icon="warning"         label="Overdue"   value={dashboardLoading ? '—' : dashboardData.stats.overdue}   sub="need follow-up"    loading={dashboardLoading} accent="#DC2626" />
                    </div>
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <ActivityStatCard icon="today"           label="Due today"  value={dashboardLoading ? '—' : dashboardData.stats.dueToday}  sub="scheduled today"   loading={dashboardLoading} accent="#D97706" />
                    </div>
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <ActivityStatCard icon="task_alt"        label="Completed"  value={dashboardLoading ? '—' : dashboardData.stats.done}      sub="completed last 30d"      loading={dashboardLoading} accent={T.success} />
                    </div>
                    <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                        <ActivityStatCard icon="pending_actions" label="Pending"    value={dashboardLoading ? '—' : dashboardData.stats.pending}   sub="scheduled, open"   loading={dashboardLoading} />
                    </div>
                </div>

                {/* ── Today focus ──────────────────────────── */}
                <TodayFocus 
                    overdue={dashboardData.focus.overdue} 
                    upcoming={dashboardData.focus.upcoming} 
                    overdueCount={dashboardData.stats.overdue}
                    loading={dashboardLoading} 
                />

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
                                onSearch={loadAccountFilterOptions}
                                placeholder="Filter by account..." />
                        </div>
                    )}
                </div>

                {/* ── Main content (unchanged logic) ─────── */}
                {viewMode === 'tasks' ? (
                    <MyTasksPanel onComplete={can.ACTIVITIES_EDIT ? toggleComplete : undefined} onOutcome={can.ACTIVITIES_EDIT ? saveOutcome : undefined} />
                ) : viewMode === 'calendar' ? (
                    <CalendarView onLogActivity={(prefillDate) => {
                        if (!can.ACTIVITIES_CREATE) return;
                        setForm({ ...EMPTY_FORM, scheduledAt: prefillDate })
                        setErrors({})
                        setOpen(true)
                    }} />
                ) : (
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        {viewMode === 'table' ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[900px]" style={{ tableLayout: 'fixed' }}>
                                        <thead>
                                            <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                            {(() => {
                                                const headers = ['', 'Type', 'Subject · Outcome', 'Account · Contact']
                                                if (isAdmin) headers.push('Owner')
                                                headers.push('Scheduled', 'Status', '')

                                                const colWidths = isAdmin
                                                    ? ['4%', '10%', '28%', '20%', '12%', '14%', '8%', '4%']
                                                    : ['4%', '10%', '32%', '24%', '16%', '10%', '4%']

                                                return headers.map((header, i) => (
                                                    <th key={i} className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                                        style={{ color: T.textMuted, width: colWidths[i] }}>{header}</th>
                                                ))
                                            })()}
                                        </tr>
                                    </thead>
                                    {loading ? (
                                        <tbody>
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <tr key={i} style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                                    {[20, 80, 160, 130, 100, 70, 20].map((width, j) => (
                                                        <td key={j} className="px-4 py-3.5">
                                                            <Skeleton height={14} width={width} borderRadius={6} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    ) : displayActivities.length === 0 ? (
                                        <tbody>
                                            <EmptyTableRow colSpan={isAdmin ? 8 : 7} icon="event_note" title="No activities yet" />
                                        </tbody>
                                    ) : (
                                        <VirtualTableBody
                                            items={displayActivities}
                                            colSpan={isAdmin ? 8 : 7}
                                            rowHeight={96}
                                            renderRow={(activity, i) => {
                                                const isHighlighted = String(activity.id) === highlightId
                                                const colWidths = isAdmin
                                                    ? ['4%', '10%', '28%', '20%', '12%', '14%', '8%', '4%']
                                                    : ['4%', '10%', '32%', '24%', '16%', '10%', '4%']
                                                return (
                                                    <ActivityRow
                                                        key={isHighlighted ? `${activity.id}-${loadCount}` : activity.id}
                                                        activity={activity}
                                                        rowBg={ROW_COLORS[i % ROW_COLORS.length]}
                                                        highlighted={isHighlighted}
                                                        onRemove={can.ACTIVITIES_DELETE ? remove : undefined}
                                                        onUpdate={can.ACTIVITIES_EDIT ? updateActivity : undefined}
                                                        onComplete={can.ACTIVITIES_EDIT ? toggleComplete : undefined}
                                                        onOutcome={can.ACTIVITIES_EDIT ? saveOutcome : undefined}
                                                        showOwner={isAdmin}
                                                        colWidths={colWidths}
                                                    />
                                                )
                                            }}
                                        />
                                    )}
                                    </table>
                                </div>
                                <Pagination page={page} totalPages={totalPages}
                                    totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />
                            </>
                        ) : (
                            <TimelineView activities={displayActivities} loading={loading}
                                onComplete={can.ACTIVITIES_EDIT ? toggleComplete : undefined} onOutcome={can.ACTIVITIES_EDIT ? saveOutcome : undefined} />
                        )}
                    </div>
                )}
            </main>

            {/* SlideForm (unchanged) */}
            <SlideForm title="Log Activity" open={open}
                onClose={() => { setOpen(false); resetForm() }}
                onSubmit={submit}>
                {errors.general && (
                    <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
                )}
                <Select label="Type" value={form.type} onChange={e => setF('type', e.target.value)} error={errors.type}>
                    {ACTIVITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </Select>
                <Input label="Subject *" value={form.subject} onChange={e => setF('subject', e.target.value)}
                    placeholder="Initial discussion" required error={errors.subject} />
                <Input label="Description" value={form.description} onChange={e => setF('description', e.target.value)}
                    placeholder="Details..." error={errors.description} />
                <Input label="Scheduled At" type="datetime-local" value={form.scheduledAt}
                    onChange={e => setF('scheduledAt', e.target.value)} error={errors.scheduledAt} />
                <div className="flex flex-col gap-2">
                    <Input label="Reminder At" type="datetime-local" value={form.reminderAt}
                        onChange={e => setF('reminderAt', e.target.value)} error={errors.reminderAt} />
                    <div className="grid grid-cols-3 gap-2">
                        {/* Presets */}
                        {[
                            { label: '15 min', minutes: 15 },
                            { label: '1 hour', minutes: 60 },
                            { label: '1 day', minutes: 1440 },
                        ].map(item => (
                            <button key={item.label} type="button"
                                disabled={!form.scheduledAt}
                                onClick={() => applyReminderPreset(item.minutes)}
                                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                style={{
                                    background: form.scheduledAt ? T.primaryFaint : T.surfaceHigh,
                                    color: form.scheduledAt ? T.primary : T.textMuted,
                                    border: `1px solid ${form.scheduledAt ? T.primary + '22' : T.border}`,
                                    cursor: form.scheduledAt ? 'pointer' : 'not-allowed',
                                }}>
                                <span className="material-symbols-outlined text-[13px]">notifications_active</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                        <input 
                            id="remindHourlyOneDayBefore"
                            type="checkbox"
                            checked={form.remindHourlyOneDayBefore || false}
                            onChange={e => setF('remindHourlyOneDayBefore', e.target.checked)}
                            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-orange-300 cursor-pointer"
                        />
                        <label htmlFor="remindHourlyOneDayBefore" className="text-xs font-bold cursor-pointer" style={{ color: T.textPrimary }}>
                            Hourly alerts (Starting 24 hours prior)
                        </label>
                    </div>
                </div>
                <SearchableSelect label="Account" value={form.accountId} onChange={onFormAccountChange}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))}
                    onSearch={loadAccountOptions}
                    placeholder="Search account"
                    error={errors.accountId || errors.account} />
                <SearchableSelect label="Contact" value={form.contactId} onChange={value => setF('contactId', value)}
                    options={filteredContacts}
                    placeholder={form.accountId ? 'Select contact' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingRelated} error={errors.contactId || errors.contact} />
                <SearchableSelect label="Deal" value={form.dealId} onChange={value => setF('dealId', value)}
                    options={filteredDeals}
                    placeholder={form.accountId ? 'Select deal' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingRelated} error={errors.dealId || errors.deal} />
            </SlideForm>
        </div>
    )
}
