import { useEffect, useState, useMemo } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import Pagination from '../components/Pagination'
import api from '../api'

const PAGE_SIZE = 50

// ── Helpers ─────────────────────────────────────────────────────────────────
const PRIORITY_STYLES = {
    URGENT: { bg: 'rgba(220,38,38,0.12)', color: '#DC2626', label: 'Urgent' },
    HIGH:   { bg: 'rgba(234,88,12,0.12)', color: '#EA580C', label: 'High' },
    MEDIUM: { bg: 'rgba(217,119,6,0.12)', color: '#D97706', label: 'Medium' },
    LOW:    { bg: 'rgba(22,163,74,0.10)', color: '#16A34A', label: 'Low' },
}
const STATUS_STYLES = {
    OPEN:        { bg: 'rgba(37,99,235,0.12)', color: '#2563EB', label: 'Open', icon: 'radio_button_unchecked' },
    IN_PROGRESS: { bg: 'rgba(217,119,6,0.12)', color: '#D97706', label: 'In Progress', icon: 'pending' },
    RESOLVED:    { bg: 'rgba(22,163,74,0.10)', color: '#16A34A', label: 'Resolved', icon: 'check_circle' },
    CLOSED:      { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'Closed', icon: 'cancel' },
}
const CATEGORY_LABELS = {
    BILLING: 'Billing', TECHNICAL: 'Technical', FEATURE_REQUEST: 'Feature Request',
    BUG_REPORT: 'Bug Report', ACCOUNT: 'Account', OTHER: 'Other',
}

function fmt(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
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

// ── Ticket detail drawer ─────────────────────────────────────────────────────
function TicketDrawer({ ticket, onClose, onStatusChange, statusUpdating }) {
    if (!ticket) return null
    const priority = PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES.LOW
    const statusSt = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.OPEN

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
                zIndex: 200, backdropFilter: 'blur(2px)',
            }} />

            {/* Drawer panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '100%', maxWidth: 520, zIndex: 201,
                background: T.surface, borderLeft: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
                animation: 'slideInRight 0.22s ease',
            }}>
                <style>{`@keyframes slideInRight { from { transform: translateX(40px); opacity:0; } to { transform: none; opacity:1; } }`}</style>

                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: `1px solid ${T.borderSubtle}`,
                    background: T.surfaceRaised, flexShrink: 0,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>#{ticket.id}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: priority.bg, color: priority.color }}>
                                {priority.label}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: statusSt.bg, color: statusSt.color }}>
                                {statusSt.label}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: T.secondaryDim, color: T.textMuted }}>
                                {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                            </span>
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, margin: 0, lineHeight: 1.3 }}>
                            {ticket.subject}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, flexShrink: 0, padding: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Submitter info */}
                    <div style={{ background: T.surfaceRaised, borderRadius: 14, padding: 16, border: `1px solid ${T.borderSubtle}` }}>
                        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, marginBottom: 12 }}>
                            Submitted By
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                background: `linear-gradient(135deg, ${T.avatarGradFrom}, ${T.avatarGradTo})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 900, color: '#fff',
                            }}>
                                {(ticket.submitterName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, margin: 0 }}>{ticket.submitterName}</p>
                                <p style={{ fontSize: 12, color: T.textMuted, margin: '2px 0 0' }}>{ticket.submitterEmail}</p>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: T.primary, margin: 0 }}>{ticket.companyName}</p>
                                <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>{timeAgo(ticket.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, marginBottom: 10 }}>
                            Description
                        </p>
                        <div style={{
                            background: T.surfaceRaised, borderRadius: 12, padding: 16,
                            border: `1px solid ${T.borderSubtle}`,
                            fontSize: 13, color: T.textPrimary, lineHeight: 1.7,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                            {ticket.description}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, marginBottom: 10 }}>
                            Timeline
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'Submitted', value: fmt(ticket.createdAt), icon: 'schedule', color: T.primary },
                                { label: 'Resolved / Closed', value: fmt(ticket.resolvedAt), icon: 'check_circle', color: '#16A34A' },
                            ].map(({ label, value, icon, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16, color }}>{icon}</span>
                                    <span style={{ fontSize: 12, color: T.textMuted, minWidth: 130 }}>{label}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer — status actions */}
                <div style={{
                    padding: '16px 24px', borderTop: `1px solid ${T.border}`,
                    background: T.surfaceRaised, flexShrink: 0,
                }}>
                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, marginBottom: 12 }}>
                        Update Status
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {Object.entries(STATUS_STYLES).map(([key, s]) => {
                            const isCurrent = ticket.status === key
                            const isLoading = statusUpdating === ticket.id
                            return (
                                <button key={key}
                                    disabled={isCurrent || isLoading}
                                    onClick={() => onStatusChange(ticket.id, key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 7,
                                        padding: '9px 14px', borderRadius: 10, cursor: isCurrent ? 'default' : 'pointer',
                                        background: isCurrent ? s.bg : T.surfaceHigh,
                                        border: `1.5px solid ${isCurrent ? s.color + '50' : T.border}`,
                                        color: isCurrent ? s.color : T.textSecondary,
                                        fontSize: 12, fontWeight: 700,
                                        transition: 'all 0.15s', opacity: isLoading ? 0.6 : 1,
                                    }}
                                    onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.background = s.bg; e.currentTarget.style.color = s.color } }}
                                    onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textSecondary } }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{s.icon}</span>
                                    {s.label}
                                    {isCurrent && <span className="material-symbols-outlined" style={{ fontSize: 13, marginLeft: 'auto' }}>check</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function PlatformTickets() {
    const [tickets, setTickets] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [statusUpdating, setStatusUpdating] = useState(null)

    // Filters
    const [searchQ, setSearchQ] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterPriority, setFilterPriority] = useState('ALL')

    const load = async (pageNum = 0) => {
        setLoading(true)
        try {
            const r = await api.get(`/api/support/tickets/platform?page=${pageNum}&size=${PAGE_SIZE}`)
            const data = r.data
            setTickets(data.content ?? [])
            setTotalPages(data.totalPages ?? 0)
            setTotalElements(data.totalElements ?? 0)
            setPage(data.number ?? pageNum)
        } catch { }
        finally { setLoading(false) }
    }

    useEffect(() => { load(0) }, [])

    const updateStatus = async (ticketId, status) => {
        setStatusUpdating(ticketId)
        try {
            const r = await api.patch(`/api/support/tickets/${ticketId}/status`, { status })
            setTickets(prev => prev.map(t => t.id === ticketId ? r.data : t))
            if (selectedTicket?.id === ticketId) setSelectedTicket(r.data)
        } catch { }
        finally { setStatusUpdating(null) }
    }

    const filtered = useMemo(() => tickets.filter(t => {
        const q = searchQ.toLowerCase()
        const matchQ = !q || t.subject?.toLowerCase().includes(q) || t.submitterName?.toLowerCase().includes(q) || t.companyName?.toLowerCase().includes(q)
        const matchStatus = filterStatus === 'ALL' || t.status === filterStatus
        const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
        return matchQ && matchStatus && matchPriority
    }), [tickets, searchQ, filterStatus, filterPriority])

    // Summary stats
    const stats = useMemo(() => ({
        total: totalElements,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
        urgent: tickets.filter(t => t.priority === 'URGENT').length,
    }), [tickets, totalElements])

    const DOT_GRID = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E")`

    return (
        <div style={{ background: T.bg, minHeight: '100vh' }}>
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
            `}</style>
            <TopBar />

            {/* ── Hero ──────────────────────────────────────────── */}
            <div style={{
                background: `linear-gradient(140deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                backgroundImage: `${DOT_GRID}, linear-gradient(140deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -70, right: -70, width: 300, height: 300, borderRadius: '50%', background: T.heroAccentGlow, filter: 'blur(75px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: T.heroOrb2, filter: 'blur(50px)', pointerEvents: 'none' }} />

                <div className="px-4 py-8 md:px-9 md:py-9" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Title row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span className="material-symbols-outlined filled" style={{ fontSize: 26, color: T.heroSubText }}>support_agent</span>
                            </div>
                            <div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: T.heroBadgeBg, border: `1px solid ${T.heroBadgeBorder}`,
                                    borderRadius: 999, padding: '3px 12px', marginBottom: 8,
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 11, color: T.heroBadgeText }}>shield_person</span>
                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: T.heroBadgeText, textTransform: 'uppercase' }}>Platform Admin</span>
                                </div>
                                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                    Support Tickets
                                </h1>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: '6px 0 0' }}>
                                    Manage all support tickets raised by companies
                                </p>
                            </div>
                        </div>
                        <button onClick={load}
                            className="w-full md:w-auto justify-center"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                                color: '#fff', borderRadius: 12, padding: '9px 18px',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                            Refresh
                        </button>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { label: 'Total', value: stats.total, icon: 'confirmation_number', accent: '#60A5FA' },
                            { label: 'Open', value: stats.open, icon: 'radio_button_unchecked', accent: '#2563EB' },
                            { label: 'In Progress', value: stats.inProgress, icon: 'pending', accent: '#FBBF24' },
                            { label: 'Resolved', value: stats.resolved, icon: 'check_circle', accent: '#4ADE80' },
                            { label: 'Urgent', value: stats.urgent, icon: 'priority_high', accent: '#F87171' },
                        ].map(({ label, value, icon, accent }) => (
                            <div key={label} style={{
                                flex: 1, padding: '16px 18px',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 10,
                                transition: 'background 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            >
                                <div style={{ width: 30, height: 30, borderRadius: 9, background: accent + '28', border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
                                    <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.50)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main content ──────────────────────────────────── */}
            <main className="px-4 py-8 md:px-9 md:py-10" style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Filters bar */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5"
                    style={{
                        background: T.surface, borderRadius: 16, padding: '14px 18px',
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    }}>
                    {/* Search */}
                    <div className="w-full md:flex-1" style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            fontSize: 16, color: T.textMuted,
                        }}>search</span>
                        <input
                            placeholder="Search tickets by subject, company or name..."
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: 36, paddingRight: 12,
                                height: 36, borderRadius: 10,
                                background: T.surfaceRaised, border: `1px solid ${T.border}`,
                                color: T.textPrimary, fontSize: 13, outline: 'none',
                            }}
                        />
                    </div>

                    {/* Status filter */}
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="w-full md:w-auto"
                        style={{ height: 36, borderRadius: 10, background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary, fontSize: 13, padding: '0 12px', cursor: 'pointer', outline: 'none' }}>
                        <option value="ALL">All Status</option>
                        {Object.entries(STATUS_STYLES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                    </select>

                    {/* Priority filter */}
                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                        className="w-full md:w-auto"
                        style={{ height: 36, borderRadius: 10, background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary, fontSize: 13, padding: '0 12px', cursor: 'pointer', outline: 'none' }}>
                        <option value="ALL">All Priority</option>
                        {Object.entries(PRIORITY_STYLES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                    </select>

                    <span className="w-full md:w-auto text-right md:text-left" style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, whiteSpace: 'nowrap' }}>
                        {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Ticket table */}
                <div className="overflow-x-auto"
                    style={{
                        background: T.surface, borderRadius: 20,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                    }}>
                    <div className="min-w-[900px]">
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 180px 100px 90px 90px 110px',
                            padding: '12px 20px',
                            background: T.surfaceRaised,
                            borderBottom: `1px solid ${T.border}`,
                        }}>
                            {['Subject & Company', 'Submitter', 'Category', 'Priority', 'Status', 'Raised'].map(h => (
                                <span key={h} style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.textMuted }}>{h}</span>
                            ))}
                        </div>

                    {/* Rows */}
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', border: `3px solid ${T.primary}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ fontSize: 13, color: T.textMuted }}>Loading tickets...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 40, color: T.textMuted, display: 'block', marginBottom: 10 }}>inbox</span>
                            <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 600 }}>No tickets found</p>
                            <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div>
                            {filtered.map((ticket, i) => {
                                const priority = PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES.LOW
                                const statusSt = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.OPEN
                                return (
                                    <div key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 180px 100px 90px 90px 110px',
                                            padding: '14px 20px',
                                            borderBottom: i < filtered.length - 1 ? `1px solid ${T.borderSubtle}` : 'none',
                                            cursor: 'pointer',
                                            transition: 'background 0.12s',
                                            alignItems: 'center',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Subject + company */}
                                        <div style={{ minWidth: 0, paddingRight: 16 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {ticket.subject}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 12, color: T.primary }}>domain</span>
                                                <span style={{ fontSize: 11, color: T.primary, fontWeight: 600 }}>{ticket.companyName}</span>
                                                <span style={{ fontSize: 11, color: T.textMuted }}>· #{ticket.id}</span>
                                            </div>
                                        </div>

                                        {/* Submitter */}
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.submitterName}</p>
                                            <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.submitterEmail}</p>
                                        </div>

                                        {/* Category */}
                                        <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>
                                            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                                        </span>

                                        {/* Priority */}
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: priority.bg, color: priority.color, display: 'inline-block', width: 'fit-content' }}>
                                            {priority.label}
                                        </span>

                                        {/* Status */}
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: statusSt.bg, color: statusSt.color, display: 'inline-block', width: 'fit-content' }}>
                                            {statusSt.label}
                                        </span>

                                        {/* Time */}
                                        <span style={{ fontSize: 11, color: T.textMuted }}>{timeAgo(ticket.createdAt)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div style={{ marginTop: 16 }}>
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={PAGE_SIZE}
                            onPage={(p) => load(p)}
                        />
                    </div>
                )}
            </main>

            {/* Ticket drawer */}
            <TicketDrawer
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onStatusChange={updateStatus}
                statusUpdating={statusUpdating}
            />
        </div>
    )
}
