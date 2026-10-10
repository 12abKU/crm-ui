import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'
import Skeleton from 'react-loading-skeleton'

const timeAgo = (dateStr) => {
    if (!dateStr) return 'No value'
    const d = new Date(dateStr)
    if (isNaN(d)) return dateStr
    const h = Math.floor((Date.now() - d) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const days = Math.floor(h / 24)
    return days === 1 ? 'Yesterday' : `${days}d ago`
}


const decodeHtml = (str) => {
    if (!str) return ''
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
}

function EmailBubble({ email }) {
    const [expanded, setExpanded] = useState(false)
    const isReceived = email.received
    const senderName = isReceived
        ? (email.from?.split('<')[0].trim() || email.from)
        : 'You'

    const initial = senderName.charAt(0).toUpperCase()

    return (
        <div className={`flex gap-2.5 mb-5 ${isReceived ? 'flex-row' : 'flex-row-reverse'}`}>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 mt-1"
                style={{
                    background: isReceived ? T.secondaryDim : T.primaryDim,
                    color: isReceived ? T.secondary : T.primary,
                }}>
                {initial}
            </div>

            {/* Bubble + meta */}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isReceived ? 'items-start' : 'items-end'}`}>

                {/* Sender + time */}
                <div className="flex items-center gap-2 mb-1 px-1">
                    <p className="text-[12px] font-bold" style={{ color: T.textPrimary }}>
                        {senderName}
                    </p>
                    <p className="text-[12px]" style={{ color: T.textMuted }}>
                        {timeAgo(email.date)}
                    </p>
                </div>

                {/* Subject pill */}
                {email.subject && (
                    <div className="mb-1.5 px-1">
                        <span className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                                background: isReceived ? T.surfaceHigh : T.primaryDim,
                                color: isReceived ? T.textMuted : T.primary,
                            }}>
                            {email.subject}
                        </span>
                    </div>
                )}

                {/* Bubble */}
                <div className="px-4 py-3  transition-all"
                    style={{
                        background: isReceived ? T.surfaceRaised : T.primaryDim,
                        border: `1px solid ${isReceived ? T.border : T.primary + '30'}`,
                        borderRadius: isReceived
                            ? '2px 16px 16px 16px'
                            : '16px 2px 16px 16px',
                        maxWidth: '100%',
                    }}
                >

                    {/* Body */}
                    <p className="text-[14px] leading-relaxed"
                        style={{
                            color: isReceived ? T.textPrimary : T.primaryText,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}>
                        {expanded && email.body
                            ? decodeHtml(
                                email.body.trim()
                                    .split('\n')
                                    .filter(l => !l.startsWith('>') && !(l.startsWith('On ') && l.includes('wrote:')))
                                    .join('\n').trim()
                            )
                            : decodeHtml(
                                (email.snippet || '').slice(0, 140) + ((email.snippet?.length || 0) > 140 ? '...' : '')
                            )
                        }
                    </p>

                    {/* Expand toggle */}
                    {email.body && email.body.trim().length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-[13px]"
                                style={{ color: isReceived ? T.textMuted : T.primary }}>
                                {expanded ? 'expand_less' : 'expand_more'}
                            </span>
                            <p className="text-[11px] font-semibold cursor-pointer"
                                style={{ color: isReceived ? T.textMuted : T.primary }}
                                onClick={() => {
                                    // Don't toggle if user is selecting text
                                    const selection = window.getSelection()
                                    if (selection && selection.toString().length > 0) return
                                    setExpanded(e => !e)
                                }}
                            >
                                {expanded ? 'Show less' : 'Show full email'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function DealPanelConversation({ deal }) {
    const [status, setStatus] = useState(null)
    const [emails, setEmails] = useState([])
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)

    const checkStatus = async () => {
        try {
            const r = await api.get('/api/gmail/status')
            setStatus(r.data)
        } catch {
            setStatus({ connected: false, email: null })
        }
    }

    const fetchEmails = async () => {
        setLoading(true)
        try {
            const r = await api.get(`/api/gmail/emails?dealId=${deal.id}`)
            setEmails(r.data ?? [])
        } catch {
            setEmails([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkStatus()
        fetchEmails()
    }, [deal.id])

    useEffect(() => {
        const handleEmailRealtime = (e) => {
            const emailMsg = e.detail
            if (!emailMsg) return
            const matchesDeal = deal?.id && emailMsg.dealId && Number(emailMsg.dealId) === Number(deal.id)
            const matchesContact = deal?.contact?.id && emailMsg.contactId && Number(emailMsg.contactId) === Number(deal.contact.id)
            const matchesEmail = deal?.contact?.email && (
                (emailMsg.from && emailMsg.from.includes(deal.contact.email)) ||
                (emailMsg.to && emailMsg.to.includes(deal.contact.email))
            )
            if (matchesDeal || matchesContact || matchesEmail) {
                const normalized = {
                    ...emailMsg,
                    received: emailMsg.received !== undefined ? emailMsg.received : (emailMsg.isReceived !== undefined ? emailMsg.isReceived : emailMsg.direction === 'INBOUND'),
                    date: emailMsg.date || emailMsg.createdAt || new Date().toISOString()
                }
                setEmails(prev => {
                    if (prev.some(m => (m.id && String(m.id) === String(emailMsg.id)) || (m.messageId && emailMsg.messageId && m.messageId === emailMsg.messageId))) {
                        return prev
                    }
                    return [...prev, normalized]
                })
            }
        }
        window.addEventListener('crm-email', handleEmailRealtime)
        return () => window.removeEventListener('crm-email', handleEmailRealtime)
    }, [deal?.id, deal?.contact?.id, deal?.contact?.email])

    const connectGmail = async () => {
        setConnecting(true)
        try {
            const r = await api.get('/api/gmail/auth-url')
            window.location.href = r.data.url
        } catch {
            setConnecting(false)
        }
    }

    const disconnect = async () => {
        await api.delete('/api/gmail/disconnect')
        setStatus({ connected: false, email: null })
        fetchEmails()
    }

    // ── Loading ───────────────────────────────────────────────
    if (loading) return (
        <div className="px-6 py-5 flex flex-col gap-5">
            {[false, true, false].map((right, i) => (
                <div key={i} className={`flex gap-2.5 ${right ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Skeleton circle width={32} height={32} />
                    <div className={`flex flex-col gap-1.5 ${right ? 'items-end' : 'items-start'}`}>
                        <Skeleton height={10} width={80} borderRadius={4} />
                        <Skeleton height={70} width={220} borderRadius={12} />
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Top bar */}
            <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0"
                style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                {status?.connected ? (
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: T.onlineDot }} />
                        <p className="text-[12px] font-semibold truncate" style={{ color: T.textSecondary }}>
                            {status?.email}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[14px] shrink-0" style={{ color: T.textMuted }}>info</span>
                        <p className="text-[12px] font-semibold truncate" style={{ color: T.textMuted }}>
                            Team conversation history (Gmail not connected)
                        </p>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <button onClick={fetchEmails} title="Refresh"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span className="material-symbols-outlined text-[15px]">refresh</span>
                    </button>
                    {status?.connected ? (
                        <button onClick={disconnect}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                            style={{ color: T.error }}
                            onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Disconnect
                        </button>
                    ) : (
                        <button onClick={connectGmail} disabled={connecting}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                            style={{ color: T.primary }}
                            onMouseEnter={e => e.currentTarget.style.background = T.primaryDim}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {connecting ? 'Redirecting...' : 'Connect Gmail'}
                        </button>
                    )}
                </div>
            </div>

            {/* Contact + count bar */}
            <div className="px-5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0"
                style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[13px] shrink-0"
                        style={{ color: T.textMuted }}>person</span>
                    <p className="text-[12px] truncate" style={{ color: T.textMuted }}>
                        Emails with{' '}
                        <strong className="truncate" style={{ color: T.textPrimary }}>{deal.contact?.email}</strong>
                    </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: T.primaryDim, color: T.primary }}>
                    {emails.length} emails
                </span>
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
                {emails.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: T.primaryDim }}>
                            <span className="material-symbols-outlined text-[22px]"
                                style={{ color: T.primary }}>mail</span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                            No emails found
                        </p>
                        <p className="text-xs text-center" style={{ color: T.textMuted }}>
                            No emails with <strong>{deal.contact?.email}</strong> found in deal history
                        </p>
                    </div>
                ) : (
                    emails.map(email => (
                        <EmailBubble key={email.id} email={email} />
                    ))
                )}
            </div>
        </div>
    )
}