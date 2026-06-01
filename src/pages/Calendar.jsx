import { useEffect, useState, useCallback } from 'react'
import { T, ACTIVITY_STYLES, ACTIVITY_TYPES } from '../constants/theme'
import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import { Input, Select } from '../components/FormField'
import SearchableSelect from '../components/SearchableSelect'
import CustomSelect from '../components/ui/CustomSelect'
import api from '../api'
import { toIsoDate } from '../utils/cacheUtils'

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EMPTY_FORM = { type: 'CALL', subject: '', description: '', scheduledAt: '', reminderAt: '', accountId: '', contactId: '', dealId: '', remindHourlyOneDayBefore: false }

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const [open, setOpen] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [filteredContacts, setFilteredContacts] = useState([])
    const [filteredDeals, setFilteredDeals] = useState([])
    const [loadingRelated, setLoadingRelated] = useState(false)

    // Advanced Scheduling & Team filters
    const [team, setTeam] = useState([])
    const [selectedOwnerId, setSelectedOwnerId] = useState('')
    const [syncing, setSyncing] = useState(false)
    const [syncStatus, setSyncStatus] = useState({ connected: false, email: null })
    const [syncResult, setSyncResult] = useState(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const loadActivities = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedOwnerId) params.append('ownerId', selectedOwnerId)
        const rangeStart = new Date(year, month, 1)
        const rangeEnd = new Date(year, month + 1, 0)
        params.append('start', toIsoDate(rangeStart))
        params.append('end', toIsoDate(rangeEnd))
        api.get(`/api/activities/calendar?${params}`)
            .then(res => setActivities(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    const loadTeam = async () => {
        try {
            const r = await api.get('/api/user/team')
            setTeam(r.data ?? [])
        } catch (e) {
            console.error('Failed to load team', e)
        }
    }

    const loadSyncStatus = async () => {
        try {
            const r = await api.get('/api/calendar/status')
            setSyncStatus(r.data ?? { connected: false, email: null })
        } catch (e) {
            console.error('Failed to fetch calendar status', e)
        }
    }

    const handleGoogleSync = async () => {
        setSyncing(true)
        setSyncResult(null)
        try {
            const r = await api.post('/api/calendar/sync')
            const { imported, updated } = r.data
            setSyncResult({
                success: true,
                message: `Synced: +${imported} imported, ~${updated} updated`
            })
            setTimeout(() => setSyncResult(null), 6000)
            loadActivities()
        } catch (e) {
            console.error(e)
            setSyncResult({
                success: false,
                message: 'Sync failed. Make sure Google Calendar API is enabled.'
            })
            setTimeout(() => setSyncResult(null), 6000)
        } finally {
            setSyncing(false)
        }
    }

    const loadAccountOptions = useCallback(async (query = '') => {
        const params = new URLSearchParams({ page: '0', size: '10' })
        if (query.trim()) params.set('search', query.trim())
        const r = await api.get(`/api/accounts?${params}`)
        const nextAccounts = r.data.content ?? []
        setAccounts(nextAccounts)
        return nextAccounts.map(a => ({ id: String(a.id), label: a.name }))
    }, [])

    useEffect(() => {
        loadActivities()
    }, [year, month, selectedOwnerId])

    useEffect(() => {
        loadTeam()
        loadSyncStatus()
    }, [])

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const today = () => setCurrentDate(new Date())

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const toDateTimeLocalValue = (date) => {
        const pad = (n) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    const setF = (key, value) => setForm(f => ({ ...f, [key]: value }))
    const resetForm = () => { setForm(EMPTY_FORM); setFilteredContacts([]); setFilteredDeals([]) }

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

    const applyReminderPreset = (minutesBefore) => {
        if (!form.scheduledAt) return
        const d = new Date(form.scheduledAt)
        d.setMinutes(d.getMinutes() - minutesBefore)
        setF('reminderAt', toDateTimeLocalValue(d))
    }

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/api/activities', {
            ...form,
            accountId: form.accountId || null,
            contactId: form.contactId || null,
            dealId: form.dealId || null,
            reminderAt: form.reminderAt || null,
            remindHourlyOneDayBefore: form.remindHourlyOneDayBefore || false
        })
        setOpen(false)
        resetForm()
        loadActivities()
    }

    const onDayClick = (d) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T09:00`
        setForm({ ...EMPTY_FORM, scheduledAt: dateStr })
        setOpen(true)
    }

    // Build the grid
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="min-h-[120px] p-2 border-r border-b" style={{ borderColor: T.borderSubtle, background: T.surfaceRaised }} />)
    
    const isToday = (d) => {
        const now = new Date()
        return now.getDate() === d && now.getMonth() === month && now.getFullYear() === year
    }

    const days = Array.from({ length: daysInMonth }).map((_, i) => {
        const d = i + 1
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        
        // Filter activities for this day
        const dayActs = activities.filter(a => {
            if (!a.scheduledAt) return false;
            return a.scheduledAt.startsWith(dateStr)
        })

        const todayStyle = isToday(d) ? { background: T.primary, color: '#fff' } : { color: T.textPrimary }

        return (
            <div key={`day-${d}`} onClick={() => onDayClick(d)} className="min-h-[120px] p-2 border-r border-b transition-all hover:bg-black/5 cursor-pointer flex flex-col group"
                style={{ borderColor: T.border, background: T.surface }}>
                <div className="flex justify-between items-start mb-2">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={todayStyle}>
                        {d}
                    </span>
                    <div className="flex items-center gap-1">
                        {dayActs.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: T.primaryDim, color: T.primary }}>{dayActs.length}</span>}
                        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: T.primary }}>add_circle</span>
                    </div>
                </div>
                <div className="space-y-1 flex-1 overflow-y-auto">
                    {dayActs.map(act => {
                        const style = ACTIVITY_STYLES[act.type] || ACTIVITY_STYLES.NOTE
                        const time = new Date(act.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        return (
                            <div key={act.id} onClick={(e) => e.stopPropagation()} className="text-xs px-2 py-1 rounded truncate flex flex-col cursor-pointer transition-all hover:brightness-95 mb-1"
                                style={{ background: style.bg, color: style.color }}>
                                <div className="font-bold">{time}</div>
                                <div className="truncate">{act.subject}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    })

    const totalSlots = [...blanks, ...days]
    // Fill remaining slots to make a perfect grid
    const remaining = totalSlots.length % 7
    if (remaining > 0) {
        for (let i = 0; i < 7 - remaining; i++) {
            totalSlots.push(<div key={`empty-${i}`} className="min-h-[120px] p-2 border-r border-b" style={{ borderColor: T.borderSubtle, background: T.surfaceRaised }} />)
        }
    }

    return (
        <div className="h-full flex flex-col">
            <TopBar />
            <main className="p-4 sm:p-8 flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>Calendar</h1>
                        <p className="mt-1 font-medium" style={{ color: T.textMuted }}>Manage your schedule and upcoming activities.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto">
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                            <div className="flex items-center gap-2 w-full justify-between sm:justify-start">
                                <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                                    style={{ background: T.primary, color: '#fff' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Create Event/Task
                                </button>
                                
                                <div className="w-px h-8 bg-gray-200 mx-2" style={{ backgroundColor: T.border }}></div>

                                <button onClick={today} className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                    style={{ background: T.surfaceHigh, color: T.textPrimary, border: `1px solid ${T.border}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.borderSubtle}
                                    onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}>
                                    Today
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                                {syncResult && (
                                    <div className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                                        style={{
                                            background: syncResult.success ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
                                            color: syncResult.success ? '#16A34A' : '#DC2626',
                                        }}>
                                        {syncResult.message}
                                    </div>
                                )}
                                {isAdmin && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]" style={{ color: T.textMuted }}>group</span>
                                        <div className="w-48 shrink-0 text-center">
                                            <CustomSelect
                                                value={selectedOwnerId}
                                                onChange={e => setSelectedOwnerId(e.target.value)}
                                                className="px-2 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer text-center"
                                                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary }}
                                            >
                                                <option value="">All Team Calendars</option>
                                                {team.map(user => (
                                                    <option key={user.id} value={user.id}>{user.name}'s Calendar</option>
                                                ))}
                                            </CustomSelect>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleGoogleSync}
                                    disabled={syncing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40"
                                    style={{
                                        background: syncStatus.connected ? 'rgba(79,70,229,0.12)' : T.surfaceRaised,
                                        color: syncStatus.connected ? '#4F46E5' : T.textMuted,
                                        border: `1px solid ${syncStatus.connected ? '#4F46E530' : T.border}`,
                                    }}
                                >
                                    {syncing ? (
                                        <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: '#4F46E5' }} />
                                    ) : (
                                        <span className="material-symbols-outlined text-[14px]">sync</span>
                                    )}
                                    {syncStatus.connected ? `Sync Google` : 'Google Sync Offline'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center rounded-xl p-1 self-center lg:self-auto" style={{ background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                            <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-black/5">
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.textPrimary }}>chevron_left</span>
                            </button>
                            <div className="px-4 font-black text-sm w-36 text-center" style={{ color: T.textPrimary }}>
                                {MONTHS[month]} {year}
                            </div>
                            <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-black/5">
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.textPrimary }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto w-full pb-2">
                    <div className="rounded-3xl overflow-hidden shadow-sm flex flex-col min-w-[750px] lg:min-w-0" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="grid grid-cols-7 border-b" style={{ borderColor: T.border, background: T.surfaceRaised }}>
                            {DAYS.map(day => (
                                <div key={day} className="py-3 text-center text-xs font-black uppercase tracking-wider border-r last:border-r-0"
                                    style={{ color: T.textMuted, borderColor: T.border }}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto relative min-h-[500px]">
                            {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: T.primary }}></div>
                            </div>}
                            <div className="grid grid-cols-7 border-l" style={{ borderColor: T.border }}>
                                {totalSlots}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

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
                <div className="flex flex-col gap-2">
                    <Input label="Reminder At" type="datetime-local" value={form.reminderAt}
                        onChange={e => setF('reminderAt', e.target.value)} />
                    <div className="grid grid-cols-3 gap-2">
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
                    options={accounts.map(a => ({ id: String(a.id), label: a.name }))}
                    onSearch={loadAccountOptions}
                    placeholder="Select account" />
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
