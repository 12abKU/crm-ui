import { useEffect, useState, useCallback } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

// ── Helpers ───────────────────────────────────────────────────
const timeAgo = (str) => {
    if (!str) return '—'
    const d = new Date(str)
    if (isNaN(d)) return str
    const h = Math.floor((Date.now() - d) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const days = Math.floor(h / 24)
    return days === 1 ? 'Yesterday' : `${days}d ago`
}

const decodeHtml = (str) => {
    if (!str) return ''
    return str
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
}

// ── Email Bubble ──────────────────────────────────────────────
function EmailBubble({ email }) {
    const [expanded, setExpanded] = useState(false)
    const isReceived = email.received
    const senderName = isReceived ? (email.from?.split('<')[0].trim() || email.from) : 'You'
    const initial = senderName.charAt(0).toUpperCase()

    return (
        <div className={`flex gap-2.5 mb-5 ${isReceived ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0 mt-1"
                style={{ background: isReceived ? T.secondaryDim : T.primaryDim, color: isReceived ? T.secondary : T.primary }}>
                {initial}
            </div>
            <div className={`flex flex-col max-w-[72%] ${isReceived ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                    <p className="text-[12px] font-bold" style={{ color: T.textPrimary }}>{senderName}</p>
                    <p className="text-[12px]" style={{ color: T.textMuted }}>{timeAgo(email.date)}</p>
                </div>
                {email.subject && (
                    <div className="mb-1.5 px-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: isReceived ? T.surfaceHigh : T.primaryDim, color: isReceived ? T.textMuted : T.primary }}>
                            {email.subject}
                        </span>
                    </div>
                )}
                <div className="px-4 py-3"
                    style={{
                        background: isReceived ? T.surfaceRaised : T.primaryDim,
                        border: `1px solid ${isReceived ? T.border : T.primary + '30'}`,
                        borderRadius: isReceived ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
                    }}>
                    <p className="text-[13px] leading-relaxed"
                        style={{ color: isReceived ? T.textPrimary : T.primaryText, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {expanded && email.body
                            ? decodeHtml(email.body.trim().split('\n')
                                .filter(l => !l.startsWith('>') && !(l.startsWith('On ') && l.includes('wrote:')))
                                .join('\n').trim())
                            : decodeHtml((email.snippet || '').slice(0, 160) + ((email.snippet?.length || 0) > 160 ? '...' : ''))
                        }
                    </p>
                    {email.body?.trim().length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-[13px]"
                                style={{ color: isReceived ? T.textMuted : T.primary }}>
                                {expanded ? 'expand_less' : 'expand_more'}
                            </span>
                            <p className="text-[11px] font-semibold cursor-pointer"
                                style={{ color: isReceived ? T.textMuted : T.primary }}
                                onClick={() => {
                                    if (window.getSelection()?.toString().length > 0) return
                                    setExpanded(e => !e)
                                }}>
                                {expanded ? 'Show less' : 'Show full email'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Contact Row (left panel) ──────────────────────────────────
function ContactRow({ contact, selected, onClick, emailCount }) {
    const name = `${contact.firstName} ${contact.lastName}`.trim()
    const initial = name.charAt(0).toUpperCase()
    const isActive = selected?.id === contact.id

    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
            style={{
                background: isActive ? T.primaryDim : 'transparent',
                borderLeft: `3px solid ${isActive ? T.primary : 'transparent'}`,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.surfaceHigh }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: isActive ? T.primaryDim : T.surfaceHigh, color: isActive ? T.primary : T.textSecondary }}>
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{name}</p>
                <p className="text-[11px] truncate" style={{ color: T.textMuted }}>{contact.email || 'No email'}</p>
            </div>
            {emailCount != null && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: isActive ? T.primary : T.surfaceHigh, color: isActive ? '#fff' : T.textMuted }}>
                    {emailCount}
                </span>
            )}
        </button>
    )
}

// ── Main Page ─────────────────────────────────────────────────
export default function Conversations() {
    const [gmailStatus, setGmailStatus] = useState(null)
    const [statusLoading, setStatusLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)

    const [contacts, setContacts] = useState([])
    const [contactsLoading, setContactsLoading] = useState(true)
    const [search, setSearch] = useState('')

    const [selectedContact, setSelectedContact] = useState(null)
    const [emails, setEmails] = useState([])
    const [emailsLoading, setEmailsLoading] = useState(false)
    const [emailCounts, setEmailCounts] = useState({}) // contactId → count

    // ── Load Gmail status ─────────────────────────────────────
    useEffect(() => {
        api.get('/api/gmail/status')
            .then(r => setGmailStatus(r.data))
            .catch(() => setGmailStatus({ connected: false }))
            .finally(() => setStatusLoading(false))
    }, [])

    // ── Load contacts ─────────────────────────────────────────
    useEffect(() => {
        api.get('/api/contacts?page=0&size=100')
            .then(r => setContacts(r.data.content ?? []))
            .catch(() => setContacts([]))
            .finally(() => setContactsLoading(false))
    }, [])

    // ── Fetch emails for selected contact ─────────────────────
    const fetchEmails = useCallback(async (contact) => {
        if (!contact?.email) { setEmails([]); return }
        setEmailsLoading(true)
        try {
            const r = await api.get(`/api/gmail/emails/contact?contactId=${contact.id}`)
            const data = r.data ?? []
            setEmails(data)
            setEmailCounts(prev => ({ ...prev, [contact.id]: data.length }))
        } catch {
            setEmails([])
        } finally {
            setEmailsLoading(false)
        }
    }, [])

    const selectContact = (contact) => {
        setSelectedContact(contact)
        setEmails([])
        if (gmailStatus?.connected) fetchEmails(contact)
    }

    const connectGmail = async () => {
        setConnecting(true)
        try {
            const r = await api.get('/api/gmail/auth-url')
            window.location.href = r.data.url
        } catch { setConnecting(false) }
    }

    const disconnect = async () => {
        await api.delete('/api/gmail/disconnect')
        setGmailStatus({ connected: false })
        setEmails([])
    }

    const filtered = contacts.filter(c => {
        const q = search.toLowerCase()
        return (
            c.firstName?.toLowerCase().includes(q) ||
            c.lastName?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q)
        )
    })

    // ── Not connected overlay ─────────────────────────────────
    const NotConnected = () => (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[30px]" style={{ color: T.primary }}>forum</span>
            </div>
            <div className="text-center max-w-xs">
                <p className="text-base font-black" style={{ color: T.textPrimary }}>Connect Gmail to view conversations</p>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ color: T.textMuted }}>
                    See all email threads with your contacts in one place
                </p>
            </div>
            <button onClick={connectGmail} disabled={connecting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: T.primary, color: '#fff', opacity: connecting ? 0.7 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {connecting ? 'Redirecting...' : 'Connect Gmail'}
            </button>
        </div>
    )

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <TopBar />
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* ── Left panel: contacts list ─────────────────── */}
                <div className="w-72 flex-shrink-0 flex flex-col border-r overflow-hidden"
                    style={{ background: T.surface, borderColor: T.border }}>

                    {/* Header */}
                    <div className="px-5 pt-6 pb-4 flex-shrink-0">
                        <h2 className="text-lg font-black mb-3" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>
                            Conversations
                        </h2>
                        {/* Search */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                            <span className="material-symbols-outlined text-[15px]" style={{ color: T.textMuted }}>search</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search contacts..."
                                className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: T.textPrimary }}
                            />
                        </div>
                    </div>

                    {/* Contact list */}
                    <div className="flex-1 overflow-y-auto">
                        {contactsLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3">
                                    <Skeleton circle width={36} height={36} />
                                    <div>
                                        <Skeleton height={11} width={110} borderRadius={4} />
                                        <Skeleton height={10} width={80} borderRadius={4} className="mt-1" />
                                    </div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-[13px]" style={{ color: T.textMuted }}>No contacts found</p>
                            </div>
                        ) : (
                            filtered.map(c => (
                                <ContactRow
                                    key={c.id}
                                    contact={c}
                                    selected={selectedContact}
                                    emailCount={emailCounts[c.id] ?? null}
                                    onClick={() => selectContact(c)}
                                />
                            ))
                        )}
                    </div>

                    {/* Gmail status footer */}
                    {!statusLoading && (
                        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
                            {gmailStatus?.connected ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                                        <p className="text-[11px] font-semibold truncate max-w-[140px]" style={{ color: T.textSecondary }}>
                                            {gmailStatus.email}
                                        </p>
                                    </div>
                                    <button onClick={disconnect}
                                        className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                        style={{ color: T.error }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button onClick={connectGmail}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                    Connect Gmail
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right panel: email thread ─────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: T.bg }}>

                    {!gmailStatus?.connected && !statusLoading ? (
                        <NotConnected />
                    ) : !selectedContact ? (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: T.primaryDim }}>
                                <span className="material-symbols-outlined text-[26px]" style={{ color: T.primary }}>mark_email_read</span>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Select a contact</p>
                                <p className="text-[12px] mt-1" style={{ color: T.textMuted }}>
                                    Pick a contact from the left to view their email thread
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Contact header */}
                            <div className="px-6 py-4 flex items-center gap-4 flex-shrink-0"
                                style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {selectedContact.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black" style={{ color: T.textPrimary }}>
                                        {selectedContact.firstName} {selectedContact.lastName}
                                    </p>
                                    <p className="text-[12px]" style={{ color: T.textMuted }}>
                                        {selectedContact.email || 'No email address'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!selectedContact.email && (
                                        <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                                            style={{ background: T.errorDim, color: T.error }}>
                                            No email on contact
                                        </span>
                                    )}
                                    {emails.length > 0 && (
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                                            style={{ background: T.primaryDim, color: T.primary }}>
                                            {emails.length} emails
                                        </span>
                                    )}
                                    <button onClick={() => fetchEmails(selectedContact)}
                                        className="p-2 rounded-xl transition-colors"
                                        style={{ color: T.textMuted }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                    </button>
                                </div>
                            </div>

                            {/* Thread */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {emailsLoading ? (
                                    [false, true, false, true].map((right, i) => (
                                        <div key={i} className={`flex gap-2.5 mb-5 ${right ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <Skeleton circle width={32} height={32} />
                                            <div className={`flex flex-col gap-1.5 ${right ? 'items-end' : 'items-start'}`}>
                                                <Skeleton height={10} width={80} borderRadius={4} />
                                                <Skeleton height={80} width={260} borderRadius={12} />
                                            </div>
                                        </div>
                                    ))
                                ) : !selectedContact.email ? (
                                    <div className="flex flex-col items-center py-16 gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: T.errorDim }}>
                                            <span className="material-symbols-outlined text-[22px]" style={{ color: T.error }}>person_off</span>
                                        </div>
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No email address</p>
                                        <p className="text-[12px]" style={{ color: T.textMuted }}>Add an email to this contact first</p>
                                    </div>
                                ) : emails.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined text-[22px]" style={{ color: T.primary }}>mail</span>
                                        </div>
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No emails found</p>
                                        <p className="text-[12px]" style={{ color: T.textMuted }}>
                                            No emails with <strong>{selectedContact.email}</strong> in your Gmail
                                        </p>
                                    </div>
                                ) : (
                                    emails.map(email => <EmailBubble key={email.id} email={email} />)
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}