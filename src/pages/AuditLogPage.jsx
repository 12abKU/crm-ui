import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import api from '../api'
import TopBar from '../components/TopBar'
import CustomSelect from '../components/ui/CustomSelect'
import { useDialog } from '../contexts/DialogContext'

const ACTION_META = {
    CREATED:       { label: 'Created',       color: '#10B981', bg: '#10B98120', icon: 'add_circle' },
    UPDATED:       { label: 'Updated',       color: '#3B82F6', bg: '#3B82F620', icon: 'edit' },
    DELETED:       { label: 'Deleted',       color: '#EF4444', bg: '#EF444420', icon: 'delete' },
    STAGE_CHANGED: { label: 'Stage Changed', color: '#F59E0B', bg: '#F59E0B20', icon: 'swap_horiz' },
    ASSIGNED:      { label: 'Assigned',      color: '#8B5CF6', bg: '#8B5CF620', icon: 'person_add' },
    COMPLETED:     { label: 'Completed',     color: '#06B6D4', bg: '#06B6D420', icon: 'task_alt' },
    IMPORTED:      { label: 'Imported',      color: '#6366F1', bg: '#6366F120', icon: 'upload' },
}

const ENTITY_META = {
    ACCOUNT:  { label: 'Account',  icon: 'business',      color: '#3B82F6' },
    CONTACT:  { label: 'Contact',  icon: 'person',        color: '#10B981' },
    DEAL:     { label: 'Deal',     icon: 'handshake',     color: '#F59E0B' },
    ACTIVITY: { label: 'Activity', icon: 'event_note',    color: '#8B5CF6' },
}

const ENTITY_ROUTE = {
    ACCOUNT:  id => `/accounts/${id}`,
    CONTACT:  id => `/contacts/${id}`,
    DEAL:     id => `/deals?highlight=${id}`,
    ACTIVITY: id => `/activities/${id}`,
}

function timeAgo(dateStr) {
    const now = new Date()
    const d = new Date(dateStr)
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    })
}

function Avatar({ name, size = 32 }) {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4','#6366F1']
    const color = colors[(name || '').charCodeAt(0) % colors.length]
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color + '22', border: `2px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0
        }}>
            {initials}
        </div>
    )
}

function ActionBadge({ action }) {
    const meta = ACTION_META[action] || { label: action, color: T.textMuted, bg: T.surfaceHigh, icon: 'info' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 20,
            background: meta.bg, color: meta.color,
            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap'
        }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{meta.icon}</span>
            {meta.label}
        </span>
    )
}

function EntityBadge({ entityType }) {
    const meta = ENTITY_META[entityType] || { label: entityType, icon: 'category', color: T.textMuted }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 8,
            background: meta.color + '15', color: meta.color,
            fontSize: 11, fontWeight: 600
        }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 12 }}>{meta.icon}</span>
            {meta.label}
        </span>
    )
}

function renderDetail(detail, users, navigate) {
    if (!detail) return 'No value'
    if (!users || users.length === 0) return detail

    const sortedUsers = [...users].sort((a, b) => (b.name || '').length - (a.name || '').length)
    const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    
    const userMap = {}
    const names = []
    for (const u of sortedUsers) {
        if (u.name) {
            userMap[u.name.toLowerCase()] = u
            names.push(escapeRegex(u.name))
        }
    }

    if (names.length === 0) return detail

    const pattern = new RegExp(`\\b(${names.join('|')})\\b`, 'gi')
    const parts = detail.split(pattern)

    return parts.map((part, index) => {
        const lowerPart = part.toLowerCase()
        const matchedUser = userMap[lowerPart]
        if (matchedUser) {
            return (
                <span
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/team/${matchedUser.id}`)
                    }}
                    className="cursor-pointer font-semibold transition-colors hover:underline text-primary"
                    style={{ color: T.primary }}
                    title={`View ${matchedUser.name}'s Profile`}
                >
                    {part}
                </span>
            )
        }
        return part
    })
}

export default function AuditLogPage() {
    const navigate = useNavigate()
    const { role } = useSelector(state => state.auth)

    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const { confirm } = useDialog()

    const [entityFilter, setEntityFilter] = useState('')
    const [users, setUsers] = useState([])
    const [actorFilter, setActorFilter] = useState('')
    const [hoveredRow, setHoveredRow] = useState(null)

    const PAGE_SIZE = 25

    // Redirect non-admins
    useEffect(() => {
        if (role === 'AGENT') navigate('/')
    }, [role, navigate])

    // Load users for filter dropdown
    useEffect(() => {
        api.get('/api/management/users').then(r => setUsers(r.data || [])).catch(() => {})
    }, [])

    const fetchLogs = useCallback(async (reset = false) => {
        setLoading(true)
        try {
            const currentPage = reset ? 0 : page
            const params = new URLSearchParams({ page: currentPage, size: PAGE_SIZE })
            if (entityFilter) params.set('entityType', entityFilter)
            if (actorFilter) params.set('actorId', actorFilter)

            const res = await api.get(`/api/audit-logs?${params.toString()}`)
            const data = res.data
            const content = data.content || []
            const totalElements = data.totalElements || 0

            if (reset) {
                setLogs(content)
                setPage(1)
            } else {
                setLogs(prev => [...prev, ...content])
                setPage(prev => prev + 1)
            }
            setTotal(totalElements)
            setHasMore((reset ? content.length : logs.length + content.length) < totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, entityFilter, actorFilter, logs.length])

    // Initial load and re-fetch on filter change
    useEffect(() => {
        fetchLogs(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityFilter, actorFilter])

    const handleClearAll = async () => {
        const isConfirmed = await confirm({
            title: 'Clear Audit Logs',
            message: 'Are you sure you want to clear all audit logs? This action cannot be undone.',
            confirmText: 'Clear All'
        })
        if (!isConfirmed) return

        try {
            setLoading(true)
            await api.delete('/api/audit-logs')
            fetchLogs(true)
        } catch (err) {
            // error is already globally handled
        } finally {
            setLoading(false)
        }
    }

    const filterChips = ['', 'ACCOUNT', 'CONTACT', 'DEAL', 'ACTIVITY']
    const chipLabels = { '': 'All', ACCOUNT: 'Accounts', CONTACT: 'Contacts', DEAL: 'Deals', ACTIVITY: 'Activities' }

    return (
        <div className="max-w-[100vw] overflow-x-hidden">
            <TopBar />
            <main className="p-4 md:p-8 w-full max-w-full min-w-0">

                    {/* ── Header ─────────────────────────────── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: T.primaryDim }}>
                                    <span className="material-symbols-outlined filled text-[19px]"
                                        style={{ color: T.primary }}>history</span>
                                </div>
                                <h1 className="text-2xl font-black truncate" style={{ color: T.textPrimary }}>Audit Log</h1>
                            </div>
                            <p className="text-sm sm:ml-12" style={{ color: T.textMuted }}>
                                Complete history of every action performed in your CRM
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold w-full lg:w-auto justify-center shrink-0"
                            style={{ background: T.surfaceHigh, color: T.textMuted }}>
                            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                            {total.toLocaleString()} total events
                        </div>
                    </div>

                    {/* ── Filters ────────────────────────────── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto min-w-0">
                            {/* Entity type chips */}
                            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl w-full sm:w-auto"
                                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                {filterChips.map(chip => (
                                    <button key={chip}
                                        onClick={() => setEntityFilter(chip)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex-1 sm:flex-none text-center justify-center min-w-[70px]"
                                        style={{
                                            background: entityFilter === chip ? T.primary : 'transparent',
                                            color: entityFilter === chip ? '#fff' : T.textMuted,
                                        }}>
                                        {chip && (
                                            <span className="material-symbols-outlined filled mr-1"
                                                style={{ fontSize: 11, verticalAlign: 'middle' }}>
                                                {ENTITY_META[chip]?.icon}
                                            </span>
                                        )}
                                        {chipLabels[chip]}
                                    </button>
                                ))}
                            </div>

                            {/* User filter */}
                            <div className="w-full sm:w-auto min-w-[140px] flex-1 sm:flex-none">
                                <CustomSelect
                                    value={actorFilter}
                                    onChange={e => setActorFilter(e.target.value)}
                                    className="px-3 py-2 rounded-xl font-bold"
                                    style={{
                                        border: `1px solid ${actorFilter ? T.primary : T.border}`,
                                    }}>
                                    <option value="">All Users</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </CustomSelect>
                            </div>

                            {(entityFilter || actorFilter) && (
                                <button
                                    onClick={() => { setEntityFilter(''); setActorFilter('') }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto"
                                    style={{ background: '#EF444420', color: '#EF4444' }}>
                                    <span className="material-symbols-outlined text-[13px]">close</span>
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Clear All Logs button (Admin Only) */}
                        <button
                            onClick={handleClearAll}
                            disabled={loading || logs.length === 0}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer w-full lg:w-auto"
                            style={{
                                background: logs.length === 0 ? T.surfaceRaised : '#EF444415',
                                color: logs.length === 0 ? T.textMuted : '#EF4444',
                                border: `1px solid ${logs.length === 0 ? T.borderSubtle : '#EF444430'}`,
                                opacity: loading || logs.length === 0 ? 0.6 : 1,
                                cursor: loading || logs.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={e => {
                                if (logs.length > 0 && !loading) {
                                    e.currentTarget.style.background = '#EF444422';
                                }
                            }}
                            onMouseLeave={e => {
                                if (logs.length > 0 && !loading) {
                                    e.currentTarget.style.background = '#EF444415';
                                }
                            }}
                        >
                            <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                            Clear All Logs
                        </button>
                    </div>

                    {/* ── Table ──────────────────────────────── */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>

                        <div className="overflow-x-auto">
                            <div className="min-w-[900px]">
                                {/* Table header */}
                                <div className="grid gap-4 px-5 py-3"
                                    style={{
                                        gridTemplateColumns: '2fr 1fr 1.5fr 2fr 1fr',
                                        borderBottom: `1px solid ${T.border}`,
                                        background: T.surfaceHigh,
                                    }}>
                                    {['Actor', 'Action', 'Entity', 'Detail', 'Time'].map(h => (
                                        <span key={h} className="text-[10px] font-black uppercase tracking-widest"
                                            style={{ color: T.textMuted }}>{h}</span>
                                    ))}
                                </div>

                        {/* Rows */}
                        {loading && logs.length === 0 ? (
                            <div className="flex items-center justify-center gap-3 py-16">
                                <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                                <span className="text-sm font-medium" style={{ color: T.textMuted }}>
                                    Loading audit logs...
                                </span>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <span className="material-symbols-outlined text-[52px]"
                                    style={{ color: T.border }}>history</span>
                                <p className="text-sm font-semibold" style={{ color: T.textMuted }}>
                                    No audit events found
                                </p>
                                <p className="text-xs" style={{ color: T.textMuted }}>
                                    Events will appear here as actions are taken in the CRM
                                </p>
                            </div>
                        ) : (
                            logs.map((log, idx) => {
                                const actMeta = ACTION_META[log.action] || {}
                                const entMeta = ENTITY_META[log.entityType] || {}
                                const route = ENTITY_ROUTE[log.entityType]
                                const isHovered = hoveredRow === log.id
                                return (
                                    <div key={log.id}
                                        className="grid gap-4 px-5 py-3.5 items-center transition-colors duration-100"
                                        style={{
                                            gridTemplateColumns: '2fr 1fr 1.5fr 2fr 1fr',
                                            borderBottom: idx < logs.length - 1 ? `1px solid ${T.borderSubtle}` : 'none',
                                            background: isHovered ? T.primaryFaint : 'transparent',
                                            cursor: 'default',
                                        }}
                                        onMouseEnter={() => setHoveredRow(log.id)}
                                        onMouseLeave={() => setHoveredRow(null)}>

                                        {/* Actor */}
                                        <div className="flex items-center gap-2.5 min-w-0 cursor-pointer group/actor"
                                            onClick={() => log.actor?.id && navigate(`/team/${log.actor.id}`)}
                                            title={log.actor?.name ? `View ${log.actor.name}'s Profile` : ''}>
                                            <div className="transition-transform duration-150 group-hover/actor:scale-105 active:scale-95">
                                                <Avatar name={log.actor?.name} size={30} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate group-hover/actor:text-primary transition-colors group-hover/actor:underline" style={{ color: T.textPrimary }}>
                                                    {log.actor?.name || 'Unknown'}
                                                </p>
                                                <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                                                    {log.actor?.email || ''}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div><ActionBadge action={log.action} /></div>

                                        {/* Entity */}
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <EntityBadge entityType={log.entityType} />
                                            <button
                                                onClick={() => route && navigate(route(log.entityId))}
                                                className="text-xs font-semibold truncate text-left hover:underline"
                                                style={{ color: entMeta.color, maxWidth: 180 }}>
                                                {log.entityName}
                                            </button>
                                        </div>

                                         {/* Detail */}
                                         <p className="text-xs truncate" style={{ color: T.textSecondary }}
                                             title={log.detail}>
                                             {renderDetail(log.detail, users, navigate)}
                                         </p>

                                        {/* Time */}
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-semibold" style={{ color: T.textPrimary }}>
                                                {timeAgo(log.createdAt)}
                                            </span>
                                            <span className="text-[10px]" style={{ color: T.textMuted }}>
                                                {formatDateTime(log.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                            </div>
                        </div>

                        {/* Load more */}
                        {hasMore && logs.length > 0 && (
                            <div className="flex justify-center px-5 py-4"
                                style={{ borderTop: `1px solid ${T.border}` }}>
                                <button
                                    onClick={() => fetchLogs(false)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
                                    style={{
                                        background: T.primaryDim,
                                        color: T.primary,
                                        opacity: loading ? 0.5 : 1,
                                    }}>
                                    {loading ? (
                                        <div className="w-4 h-4 rounded-full border-2 animate-spin"
                                            style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                                    ) : (
                                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                    )}
                                    {loading ? 'Loading...' : `Load more (${total - logs.length} remaining)`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer count */}
                    {logs.length > 0 && (
                        <p className="text-center text-xs mt-3" style={{ color: T.textMuted }}>
                            Showing {logs.length} of {total.toLocaleString()} events
                        </p>
                    )}
                </main>

        </div>
    )
}
