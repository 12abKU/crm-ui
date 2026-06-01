import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { T } from '../constants/theme'
import api from '../api'

// ── Time helper ────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

// ── Icon + color per type ──────────────────────────────────────────────────
const TYPE_META = {
    TICKET_SUBMITTED: { icon: 'confirmation_number', color: '#2563EB', label: 'New Ticket' },
    TICKET_IN_PROGRESS: { icon: 'pending', color: '#D97706', label: 'In Progress' },
    TICKET_RESOLVED: { icon: 'check_circle', color: '#16A34A', label: 'Resolved' },
    TICKET_CLOSED: { icon: 'cancel', color: '#64748B', label: 'Closed' },
    ACTIVITY_REMINDER: { icon: 'notifications_active', color: '#D97706', label: 'Activity Reminder' },
    MENTION: { icon: 'alternate_email', color: '#EA580C', label: 'Mentioned You' }
}

function getMeta(type) {
    return TYPE_META[type] ?? { icon: 'notifications', color: T.primary, label: 'Notification' }
}

export default function NotificationBell({ isSuperAdmin }) {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unread, setUnread] = useState(0)
    const [loading, setLoading] = useState(false)
    const ref = useRef(null)

    // ── Poll unread count every 30s ──────────────────────────────────────────
    useEffect(() => {
        const load = () =>
            api.get('/api/notifications/unread-count')
                .then(r => setUnread(r.data.count ?? 0))
                .catch(() => { })
        load()
        const iv = setInterval(load, 30000)
        return () => clearInterval(iv)
    }, [])

    // ── Handle real-time notifications ───────────────────────────────────────
    useEffect(() => {
        const handleRealtime = (e) => {
            const notif = e.detail
            setUnread(prev => prev + 1)
            setNotifications(prev => [notif, ...prev])
        }
        window.addEventListener('crm-notification', handleRealtime)
        return () => window.removeEventListener('crm-notification', handleRealtime)
    }, [])

    // ── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // ── Open dropdown → fetch + mark all read ───────────────────────────────
    const handleOpen = async () => {
        if (open) { setOpen(false); return }
        setOpen(true)
        setLoading(true)
        try {
            const r = await api.get('/api/notifications?page=0&size=50')
            const payload = r.data?.content ?? r.data ?? []
            setNotifications(Array.isArray(payload) ? payload : [])
            if (unread > 0) {
                await api.post('/api/notifications/mark-all-read')
                setUnread(0)
            }
        } catch { }
        finally { setLoading(false) }
    }

    const handleClearAllNotifications = async (e) => {
        e.stopPropagation()
        try {
            await api.delete('/api/notifications')
            setNotifications([])
            setUnread(0)
        } catch (err) {
            console.error("Failed to clear notifications:", err)
        }
    }

    const handleNotificationClick = (n) => {
        setOpen(false)
        if (n.type === 'MENTION') {
            if (n.dealId) {
                navigate(`/deals?dealId=${n.dealId}&tab=notes`)
            } else if (n.contactId) {
                navigate(`/contacts/${n.contactId}?tab=notes`)
            }
            return
        }

        if (n.type === 'ACTIVITY_REMINDER' && n.activityId) {
            navigate(`/activities?highlight=${n.activityId}`)
            return
        }

        if (!n.ticketId) return

        if (isSuperAdmin) {
            // Super admin goes to platform tickets page
            navigate('/platform/tickets')
        } else {
            // Regular user goes directly to Support page with ticket tab active
            // Pass ticketId in state so Support page can auto-scroll/highlight it
            navigate('/support', { state: { openTicketId: n.ticketId } })
        }
    }

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 relative"
                style={{ color: open ? T.primary : T.textMuted, background: open ? T.primaryFaint : 'transparent' }}
                onMouseEnter={e => { if (!open) { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary } }}
                onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted } }}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {open ? 'notifications' : (unread > 0 ? 'notifications_active' : 'notifications')}
                </span>
            </button>

            {/* Unread badge */}
            {unread > 0 && (
                <span
                    className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-black pointer-events-none"
                    style={{ background: '#DC2626', color: '#fff', padding: '0 3px', border: `2px solid ${T.bg}` }}
                >
                    {unread > 99 ? '99+' : unread}
                </span>
            )}

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute top-[calc(100%+10px)] z-50 flex flex-col overflow-hidden -right-16 min-[400px]:-right-24 sm:right-0 w-[280px] min-[400px]:w-[320px] sm:w-[360px]"
                    style={{
                        maxHeight: 480,
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        borderRadius: 18,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                        animation: 'notifFadeIn 0.18s ease',
                    }}
                >
                    <style>{`@keyframes notifFadeIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }`}</style>

                    {/* Header */}
                    <div style={{
                        padding: '14px 18px',
                        borderBottom: `1px solid ${T.borderSubtle}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: T.surfaceRaised, flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.primary }}>notifications</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary }}>Notifications</span>
                        </div>
                        {notifications.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button
                                    onClick={handleClearAllNotifications}
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: T.error,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    Clear All
                                </button>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: T.primaryDim, color: T.primary }}>
                                    {notifications.length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0' }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `3px solid ${T.primary}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                                <span style={{ fontSize: 12, color: T.textMuted }}>Loading...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 36, color: T.border, display: 'block', marginBottom: 10 }}>notifications_off</span>
                                <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>No notifications yet</p>
                                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                                    {isSuperAdmin ? 'You\'ll be notified when companies raise tickets' : 'You\'ll be notified when your tickets are updated'}
                                </p>
                            </div>
                        ) : (
                            notifications.map((n, i) => {
                                const meta = getMeta(n.type)
                                const isLast = i === notifications.length - 1
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                                            padding: '13px 18px', textAlign: 'left', cursor: 'pointer',
                                            background: n.read ? 'transparent' : T.primaryFaint,
                                            borderBottom: isLast ? 'none' : `1px solid ${T.borderSubtle}`,
                                            borderLeft: n.read ? '3px solid transparent' : `3px solid ${meta.color}`,
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : T.primaryFaint}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                            background: meta.color + '18',
                                            border: `1px solid ${meta.color}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: meta.color }}>{meta.icon}</span>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: meta.color }}>{meta.label}</span>
                                                {!n.read && (
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
                                                )}
                                            </div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {n.title}
                                            </p>
                                            <p style={{ fontSize: 11, color: T.textSecondary, margin: '3px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {n.body}
                                            </p>
                                            <p style={{ fontSize: 10, color: T.textMuted, margin: '5px 0 0' }}>{timeAgo(n.createdAt)}</p>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={{
                            padding: '10px 18px', borderTop: `1px solid ${T.border}`,
                            background: T.surfaceRaised, flexShrink: 0, textAlign: 'center',
                        }}>
                            <button
                                onClick={() => {
                                    setOpen(false)
                                    if (isSuperAdmin) navigate('/platform/tickets')
                                    else navigate('/support')
                                }}
                                style={{ fontSize: 12, fontWeight: 700, color: T.primary, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {isSuperAdmin ? 'View all support tickets →' : 'View my tickets →'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
