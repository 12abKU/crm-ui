import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import api from '../../api'
import { toIsoDate } from '../../utils/cacheUtils'

export default function CalendarView({ onLogActivity }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activities, setActivities] = useState([])
    const [team, setTeam] = useState([])
    const [selectedOwnerId, setSelectedOwnerId] = useState('')
    const [loading, setLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [syncStatus, setSyncStatus] = useState({ connected: false, email: null })
    const [syncResult, setSyncResult] = useState(null)

    const role = useSelector(state => state.auth.role)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

    // Load team members for filter
    const loadTeam = async () => {
        try {
            const r = await api.get('/api/user/team')
            setTeam(r.data ?? [])
        } catch (e) {
            console.error('Failed to load team', e)
        }
    }

    // Load calendar events from backend
    const loadEvents = async () => {
        setLoading(true)
        try {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const params = new URLSearchParams()
            if (selectedOwnerId) params.append('ownerId', selectedOwnerId)
            params.append('start', toIsoDate(new Date(year, month, 1)))
            params.append('end', toIsoDate(new Date(year, month + 1, 0)))
            const r = await api.get(`/api/activities/calendar?${params}`)
            setActivities(r.data ?? [])
        } catch (e) {
            console.error('Failed to load calendar activities', e)
        } finally {
            setLoading(false)
        }
    }

    // Fetch Google Calendar OAuth status
    const loadSyncStatus = async () => {
        try {
            const r = await api.get('/api/calendar/status')
            setSyncStatus(r.data ?? { connected: false, email: null })
        } catch (e) {
            console.error('Failed to fetch calendar status', e)
        }
    }

    // Trigger Google Calendar sync
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
            loadEvents()
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

    useEffect(() => {
        loadTeam()
        loadSyncStatus()
    }, [])

    useEffect(() => {
        loadEvents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOwnerId])

    // Calendar Math
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const startDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Format YYYY-MM-DD for matching events
    const formatDateKey = (day) => {
        const d = String(day).padStart(2, '0')
        const m = String(month + 1).padStart(2, '0')
        return `${year}-${m}-${d}`
    }

    // Group activities by date key "YYYY-MM-DD"
    const eventsByDate = activities.reduce((acc, act) => {
        if (!act.scheduledAt) return acc
        const dateKey = act.scheduledAt.substring(0, 10)
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(act)
        return acc
    }, {})

    // Color codes per Activity Type
    const getTypeColor = (type) => {
        switch (type) {
            case 'MEETING': return { bg: '#EEF2FF', text: '#312E81', border: '#4F46E5', label: 'Meeting' }
            case 'CALL': return { bg: '#ECFDF5', text: '#064E3B', border: '#10B981', label: 'Call' }
            case 'EMAIL': return { bg: '#EFF6FF', text: '#1E3A8A', border: '#3B82F6', label: 'Email' }
            case 'NOTE': return { bg: '#FDF2F8', text: '#701A75', border: '#EC4899', label: 'Note' }
            default: return { bg: '#F3F4F6', text: '#1F2937', border: '#9CA3AF', label: 'Activity' }
        }
    }

    // Render calendar grid cells
    const renderCells = () => {
        const cells = []
        
        // Prev month padding cells
        for (let i = 0; i < startDayOfWeek; i++) {
            cells.push(
                <div key={`empty-${i}`} className="min-h-[110px]" style={{ background: T.surfaceRaised, opacity: 0.25, border: `0.5px solid ${T.borderSubtle}` }} />
            )
        }

        // Current month cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateKey(day)
            const dayEvents = eventsByDate[dateStr] ?? []
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

            cells.push(
                <div key={day} 
                    className="min-h-[110px] p-2 flex flex-col gap-1 transition-colors hover:bg-neutral-800/10 cursor-pointer relative"
                    style={{ 
                        background: T.surface, 
                        border: `0.5px solid ${T.borderSubtle}`,
                    }}
                    onClick={() => {
                        // Prefill the datetime string for selected day
                        const localDateTime = `${dateStr}T10:00`
                        onLogActivity(localDateTime)
                    }}
                >
                    {/* Day number */}
                    <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${isToday ? 'bg-primary text-white shadow-md' : 'text-muted'}`}
                        style={{
                            backgroundColor: isToday ? T.primary : 'transparent',
                            color: isToday ? '#fff' : T.textMuted
                        }}>
                        {day}
                    </span>

                    {/* Events list inside cell */}
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[76px] pr-0.5 mt-1">
                        {dayEvents.map(event => {
                            const colors = getTypeColor(event.type)
                            return (
                                <div key={event.id}
                                    className="px-2 py-1 rounded text-[9.5px] font-bold border-l-2 truncate transition-all hover:scale-[1.01]"
                                    style={{
                                        background: colors.bg,
                                        color: colors.text,
                                        borderLeftColor: colors.border,
                                    }}
                                    title={`${colors.label}: ${event.subject} (${event.owner?.name ?? 'No Owner'})`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        // Redirect to view details (highlights on list)
                                        window.location.href = `/activities?highlight=${event.id}`
                                    }}
                                >
                                    {event.subject}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        return cells
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-xl border hover:bg-neutral-800/10 transition-colors"
                        style={{ borderColor: T.border, color: T.textPrimary }}>
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <h3 className="text-base font-black px-2 min-w-36 text-center" style={{ color: T.textPrimary }}>
                        {monthNames[month]} {year}
                    </h3>
                    <button onClick={nextMonth} className="p-2 rounded-xl border hover:bg-neutral-800/10 transition-colors"
                        style={{ borderColor: T.border, color: T.textPrimary }}>
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                    <button onClick={goToToday} className="px-3.5 py-2 text-xs font-bold rounded-xl border hover:bg-neutral-800/10 transition-colors"
                        style={{ borderColor: T.border, color: T.textSecondary }}>
                        Today
                    </button>
                </div>

                {/* Right: Team filter + Google Calendar sync */}
                <div className="flex items-center gap-3 flex-wrap">
                    {syncResult && (
                        <div className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: syncResult.success ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
                                color: syncResult.success ? '#16A34A' : '#DC2626',
                                border: `1.5px solid ${syncResult.success ? '#16A34A28' : '#DC262628'}`
                            }}>
                            {syncResult.message}
                        </div>
                    )}

                    {/* Team Filter */}
                    {isAdmin && (
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>group</span>
                            <select
                                value={selectedOwnerId}
                                onChange={e => setSelectedOwnerId(e.target.value)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer"
                                style={{ background: T.surfaceRaised, border: `1.5px solid ${T.border}`, color: T.textPrimary }}
                            >
                                <option value="">All Team Calendars</option>
                                {team.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}'s Calendar</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Google Sync Button */}
                    <button
                        onClick={handleGoogleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                        style={{
                            background: syncStatus.connected ? 'rgba(79,70,229,0.12)' : T.surfaceRaised,
                            color: syncStatus.connected ? '#4F46E5' : T.textMuted,
                            border: `1.5px solid ${syncStatus.connected ? '#4F46E530' : T.border}`,
                        }}
                    >
                        {syncing ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-t-transparent animate-spin" style={{ borderColor: '#4F46E5' }} />
                        ) : (
                            <span className="material-symbols-outlined text-[16px]">sync</span>
                        )}
                        {syncStatus.connected ? `Sync Google Calendar (${syncStatus.email})` : 'Google Calendar Not Connected'}
                    </button>
                </div>
            </div>

            {/* Monthly Grid */}
            <div className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: `1.5px solid ${T.border}` }}>
                <div className="overflow-x-auto">
                    <div className="min-w-[700px] md:min-w-0">
                        {/* Weekdays Header */}
                        <div className="grid grid-cols-7 text-center py-3 font-black text-[10px] uppercase tracking-wider"
                            style={{ background: T.surfaceRaised, color: T.textMuted, borderBottom: `1.5px solid ${T.border}` }}>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7" style={{ background: T.borderSubtle }}>
                            {loading && activities.length === 0 ? (
                                <div className="col-span-7 flex flex-col items-center justify-center py-24 gap-3 bg-neutral-900/5">
                                    <div className="w-8 h-8 rounded-full border-3 border-t-transparent animate-spin" style={{ borderColor: T.primary }} />
                                    <span className="text-xs font-bold" style={{ color: T.textMuted }}>Loading team schedule...</span>
                                </div>
                            ) : (
                                renderCells()
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
