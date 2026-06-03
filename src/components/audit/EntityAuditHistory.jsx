import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'
import api from '../../api'

// ── Shared meta (same as AuditLogPage) ───────────────────────────
const ACTION_META = {
    CREATED:       { label: 'Created',       color: '#10B981', bg: '#10B98118', icon: 'add_circle' },
    UPDATED:       { label: 'Updated',       color: '#3B82F6', bg: '#3B82F618', icon: 'edit' },
    DELETED:       { label: 'Deleted',       color: '#EF4444', bg: '#EF444418', icon: 'delete' },
    STAGE_CHANGED: { label: 'Stage Changed', color: '#F59E0B', bg: '#F59E0B18', icon: 'swap_horiz' },
    ASSIGNED:      { label: 'Assigned',      color: '#8B5CF6', bg: '#8B5CF618', icon: 'person_add' },
    COMPLETED:     { label: 'Completed',     color: '#06B6D4', bg: '#06B6D418', icon: 'task_alt' },
    IMPORTED:      { label: 'Imported',      color: '#6366F1', bg: '#6366F118', icon: 'upload' },
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
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    })
}

function Avatar({ name, size = 28 }) {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#6366F1']
    const color = colors[(name || '').charCodeAt(0) % colors.length]
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color + '20', border: `1.5px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 700, color, flexShrink: 0,
        }}>
            {initials}
        </div>
    )
}

function renderDetail(detail, users, navigate) {
    if (!detail) return '—'
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

/**
 * Reusable entity-level audit history widget.
 * Embeds directly inside Account, Contact, or Deal profile pages.
 *
 * Props:
 *   entityType: 'ACCOUNT' | 'CONTACT' | 'DEAL' | 'ACTIVITY'
 *   entityId:   number (the record's id)
 */
export default function EntityAuditHistory({ entityType, entityId }) {
    const role = useSelector(state => state.auth.role)
    const navigate = useNavigate()

    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [users, setUsers] = useState([])
    const PAGE_SIZE = 8

    useEffect(() => {
        if (role !== 'AGENT') {
            api.get('/api/management/users').then(r => setUsers(r.data || [])).catch(() => {})
        }
    }, [role])

    const fetchLogs = useCallback(async (reset = false) => {
        if (!entityType || !entityId) return
        setLoading(true)
        try {
            const p = reset ? 0 : page
            const res = await api.get(
                `/api/audit-logs/entity/${entityType}/${entityId}?page=${p}&size=${PAGE_SIZE}`
            )
            const content = res.data.content || []
            const totalElements = res.data.totalElements || 0
            if (reset) {
                setLogs(content)
                setPage(1)
            } else {
                setLogs(prev => [...prev, ...content])
                setPage(prev => prev + 1)
            }
            setTotal(totalElements)
            const shown = reset ? content.length : logs.length + content.length
            setHasMore(shown < totalElements)
        } catch {
            // Silently fail — agent role gets 403, which is expected
        } finally {
            setLoading(false)
        }
    }, [entityType, entityId, page, logs.length])

    useEffect(() => {
        fetchLogs(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityType, entityId])

    // Don't render for AGENTs — they can't see audit data
    if (role === 'AGENT') return null

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: `1px solid ${T.border}`, background: T.primaryFaint }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[15px]"
                            style={{ color: T.primary }}>history</span>
                    </div>
                    <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Audit History</h3>
                    {total > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black"
                            style={{ background: T.primaryDim, color: T.primaryText }}>{total}</span>
                    )}
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: '#10B98115', color: '#10B981' }}>
                    Admin Only
                </span>
            </div>

            {/* ── Timeline ────────────────────────────────── */}
            <div className="p-4">
                {loading && logs.length === 0 ? (
                    /* Skeleton shimmer */
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-start gap-3 animate-pulse">
                                <div className="w-7 h-7 rounded-full shrink-0"
                                    style={{ background: T.surfaceHigh }} />
                                <div className="flex-1">
                                    <div className="h-3 rounded-md w-2/3 mb-1.5"
                                        style={{ background: T.surfaceHigh }} />
                                    <div className="h-2.5 rounded-md w-1/3"
                                        style={{ background: T.borderSubtle }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center py-8 gap-2">
                        <span className="material-symbols-outlined text-[32px]"
                            style={{ color: T.border }}>history</span>
                        <p className="text-xs font-semibold" style={{ color: T.textMuted }}>
                            No audit events yet
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[13px] top-4 bottom-4 w-px"
                            style={{ background: T.border }} />

                        <div className="flex flex-col gap-0">
                            {logs.map((log, idx) => {
                                const meta = ACTION_META[log.action] || {
                                    label: log.action, color: T.textMuted,
                                    bg: T.surfaceHigh, icon: 'info'
                                }
                                const isLast = idx === logs.length - 1
                                return (
                                    <div key={log.id}
                                        className="flex items-start gap-3 relative"
                                        style={{ paddingBottom: isLast ? 0 : 16 }}>

                                        {/* Timeline dot */}
                                        <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: meta.bg, border: `1.5px solid ${meta.color}40` }}>
                                            <span className="material-symbols-outlined filled"
                                                style={{ fontSize: 13, color: meta.color }}>{meta.icon}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Actor */}
                                                <div className="flex items-center gap-1.5 cursor-pointer group/actor"
                                                    onClick={() => log.actor?.id && navigate(`/team/${log.actor.id}`)}
                                                    title={log.actor?.name ? `View ${log.actor.name}'s Profile` : ''}>
                                                    <div className="transition-transform duration-150 group-hover/actor:scale-105 active:scale-95">
                                                        <Avatar name={log.actor?.name} size={20} />
                                                    </div>
                                                    <span className="text-xs font-bold group-hover/actor:text-primary group-hover/actor:underline transition-colors"
                                                        style={{ color: T.textPrimary }}>
                                                        {log.actor?.name || 'Unknown'}
                                                    </span>
                                                </div>

                                                {/* Action badge */}
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: meta.bg, color: meta.color }}>
                                                    {meta.label}
                                                </span>
                                            </div>

                                            {/* Detail text */}
                                            {log.detail && (
                                                <p className="text-[11px] mt-1 leading-relaxed"
                                                    style={{ color: T.textSecondary }}>
                                                    {renderDetail(log.detail, users, navigate)}
                                                </p>
                                            )}

                                            {/* Timestamp */}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="material-symbols-outlined"
                                                    style={{ fontSize: 11, color: T.textMuted }}>schedule</span>
                                                <span className="text-[10px]" style={{ color: T.textMuted }}
                                                    title={formatDateTime(log.createdAt)}>
                                                    {timeAgo(log.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Load more */}
                        {hasMore && (
                            <button
                                onClick={() => fetchLogs(false)}
                                disabled={loading}
                                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                                style={{
                                    background: T.primaryDim,
                                    color: T.primary,
                                    opacity: loading ? 0.6 : 1,
                                }}>
                                {loading
                                    ? <div className="w-3 h-3 rounded-full border animate-spin"
                                        style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                                    : <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                }
                                {loading ? 'Loading...' : `${total - logs.length} more events`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
