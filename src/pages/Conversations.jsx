import { useEffect, useState, useCallback, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import ContactRow from '../components/conversations/ContactRow'
import EmailBubble from '../components/conversations/EmailBubble'
import GmailNotConnected from '../components/conversations/GmailNotConnected'
import api from '../api'

// ── Compose Panel ──────────────────────────────────────────────────────────────
function ComposePanel({ contact, replyTo, onSent, onClose }) {
    const [subject, setSubject] = useState(
        replyTo ? (replyTo.subject?.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`) : ''
    )
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const bodyRef = useRef(null)

    useEffect(() => {
        bodyRef.current?.focus()
    }, [])

    const send = async () => {
        if (!subject.trim()) { setError('Subject is required.'); return }
        if (!body.trim()) { setError('Message body cannot be empty.'); return }
        setSending(true)
        setError('')
        try {
            await api.post('/api/gmail/send', {
                contactId: contact.id,
                subject: subject.trim(),
                body: body.trim(),
                threadId: replyTo?.threadId ?? null,
            })
            onSent()
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to send email. Please try again.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: T.surface,
            borderTop: `2px solid ${T.primary}30`,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
            zIndex: 20,
            display: 'flex', flexDirection: 'column',
            maxHeight: '60%',
            animation: 'composeSlideUp 0.2s ease',
        }}>
            <style>{`@keyframes composeSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>

            {/* Header */}
            <div style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSubtle}`,
                background: T.surfaceRaised, flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 16, color: T.primary }}>
                        {replyTo ? 'reply' : 'edit'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary }}>
                        {replyTo ? 'Reply' : 'New Email'} — {contact.firstName} {contact.lastName}
                    </span>
                </div>
                <button onClick={onClose} style={{ color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
            </div>

            {/* To field (read-only) */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.borderSubtle}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, width: 40 }}>To</span>
                <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600 }}>{contact.email}</span>
            </div>

            {/* Subject */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.borderSubtle}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, width: 40 }}>Subject</span>
                <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    style={{
                        flex: 1, border: 'none', outline: 'none', background: 'transparent',
                        fontSize: 13, color: T.textPrimary, fontFamily: 'Manrope, sans-serif',
                    }}
                />
            </div>

            {/* Body */}
            <textarea
                ref={bodyRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your message here..."
                style={{
                    flex: 1, padding: '14px 16px', border: 'none', outline: 'none',
                    resize: 'none', background: 'transparent',
                    fontSize: 13, color: T.textPrimary, lineHeight: 1.6,
                    fontFamily: 'Manrope, sans-serif', minHeight: 120,
                }}
            />

            {/* Footer */}
            <div style={{
                padding: '10px 16px', borderTop: `1px solid ${T.borderSubtle}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                background: T.surfaceRaised,
            }}>
                <div>
                    {error && (
                        <p style={{ fontSize: 12, color: T.error, fontWeight: 600 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>error</span>
                            {error}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onClose} className="crm-btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
                        Discard
                    </button>
                    <button
                        onClick={send}
                        disabled={sending}
                        className="crm-btn-primary"
                        style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <span className="material-symbols-outlined filled" style={{ fontSize: 14 }}>send</span>
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
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
    const [emailCounts, setEmailCounts] = useState({})
    const [compose, setCompose] = useState(null) // null | 'new' | { replyTo: email }
    const [sentSuccess, setSentSuccess] = useState(false)

    useEffect(() => {
        api.get('/api/gmail/status')
            .then(r => setGmailStatus(r.data))
            .catch(() => setGmailStatus({ connected: false }))
            .finally(() => setStatusLoading(false))
    }, [])

    useEffect(() => {
        api.get('/api/contacts?page=0&size=100')
            .then(r => setContacts(r.data.content ?? []))
            .catch(() => setContacts([]))
            .finally(() => setContactsLoading(false))
    }, [])

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
        setCompose(null)
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

    const handleSent = () => {
        setCompose(null)
        setSentSuccess(true)
        setTimeout(() => setSentSuccess(false), 3000)
        // Refresh thread
        if (selectedContact) fetchEmails(selectedContact)
    }

    const filtered = contacts.filter(contact => {
        const q = search.toLowerCase()
        return (
            contact.firstName?.toLowerCase().includes(q) ||
            contact.lastName?.toLowerCase().includes(q) ||
            contact.email?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <TopBar />
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* ── Left contact sidebar ─────────────────── */}
                <div className="w-72 shrink-0 flex flex-col overflow-hidden"
                    style={{ background: T.surface, borderRight: `1px solid ${T.border}` }}>

                    <div className="px-5 pt-5 pb-4 shrink-0"
                        style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: T.primaryDim }}>
                                <span className="material-symbols-outlined filled text-[16px]"
                                    style={{ color: T.primary }}>forum</span>
                            </div>
                            <h2 className="text-base font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>
                                Conversations
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                            style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                            <span className="material-symbols-outlined text-[15px]" style={{ color: T.textMuted }}>search</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search contacts..."
                                className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: T.textPrimary }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} style={{ color: T.textMuted }}>
                                    <span className="material-symbols-outlined text-[13px]">close</span>
                                </button>
                            )}
                        </div>

                        {!contactsLoading && (
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-3 px-1"
                                style={{ color: T.textMuted }}>
                                {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

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
                            <div className="px-5 py-10 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-[24px]" style={{ color: T.textMuted }}>person_search</span>
                                <p className="text-[13px]" style={{ color: T.textMuted }}>No contacts found</p>
                            </div>
                        ) : (
                            filtered.map(contact => (
                                <ContactRow
                                    key={contact.id}
                                    contact={contact}
                                    selected={selectedContact}
                                    emailCount={emailCounts[contact.id] ?? null}
                                    onClick={() => selectContact(contact)}
                                />
                            ))
                        )}
                    </div>

                    {!statusLoading && (
                        <div className="px-4 py-3 shrink-0"
                            style={{ borderTop: `1px solid ${T.border}` }}>
                            {gmailStatus?.connected ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: T.onlineDot }} />
                                        <p className="text-[11px] font-semibold truncate max-w-35"
                                            style={{ color: T.textSecondary }}>
                                            {gmailStatus.email}
                                        </p>
                                    </div>
                                    <button onClick={disconnect}
                                        className="text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
                                        style={{ color: T.error }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button onClick={connectGmail}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold transition-all"
                                    style={{ background: T.primaryDim, color: T.primary }}
                                    onMouseEnter={e => e.currentTarget.style.background = `${T.primary}25`}
                                    onMouseLeave={e => e.currentTarget.style.background = T.primaryDim}>
                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                    Connect Gmail
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Main email area ──────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: T.bg }}>
                    {!gmailStatus?.connected && !statusLoading ? (
                        <GmailNotConnected connecting={connecting} onConnect={connectGmail} />
                    ) : !selectedContact ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-5">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${T.primaryDim} 0%, ${T.primaryFaint} 100%)`,
                                        border: `1.5px solid ${T.primary}20`,
                                    }}>
                                    <span className="material-symbols-outlined filled text-[36px]"
                                        style={{ color: T.primary }}>mark_email_read</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: T.primary + '40' }} />
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full" style={{ background: T.primary + '25' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-black" style={{ color: T.textPrimary }}>Select a contact</p>
                                <p className="text-[13px] mt-1.5 max-w-xs" style={{ color: T.textMuted }}>
                                    Pick a contact from the left to view their email thread
                                </p>
                            </div>
                        </div>
                    ) : (
                        // relative so compose panel can be position:absolute
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">

                            {/* Sent success toast */}
                            {sentSuccess && (
                                <div style={{
                                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                                    background: T.success, color: '#fff', padding: '8px 18px', borderRadius: 20,
                                    fontSize: 13, fontWeight: 700, zIndex: 30, display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    animation: 'fadeIn 0.2s ease',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span>
                                    Email sent successfully!
                                </div>
                            )}

                            {/* Contact header bar */}
                            <div className="px-6 py-4 flex items-center gap-4 shrink-0"
                                style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                        color: '#fff',
                                    }}>
                                    {selectedContact.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-black" style={{ color: T.textPrimary }}>
                                            {selectedContact.firstName} {selectedContact.lastName}
                                        </p>
                                        {selectedContact.account?.name && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                style={{ background: T.surfaceHigh, color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}>
                                                <span className="material-symbols-outlined text-[11px]">business</span>
                                                {selectedContact.account.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[12px] mt-0.5" style={{ color: T.textMuted }}>
                                        {selectedContact.email || 'No email address'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {emails.length > 0 && (
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                                            style={{ background: T.primaryDim, color: T.primary }}>
                                            {emails.length} emails
                                        </span>
                                    )}
                                    <button onClick={() => fetchEmails(selectedContact)}
                                        className="p-2 rounded-xl transition-all"
                                        style={{ color: T.textMuted }}
                                        title="Refresh emails"
                                        onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.textPrimary }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                    </button>
                                    {/* ── Compose button ── */}
                                    {gmailStatus?.connected && selectedContact.email && (
                                        <button
                                            onClick={() => setCompose('new')}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] transition-all"
                                            style={{ background: T.primary, color: '#fff', boxShadow: `0 2px 8px ${T.primary}40` }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                            onMouseLeave={e => e.currentTarget.style.background = T.primary}>
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                            Compose
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Email thread */}
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
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{ background: T.errorDim }}>
                                            <span className="material-symbols-outlined filled text-[22px]"
                                                style={{ color: T.error }}>person_off</span>
                                        </div>
                                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No email address</p>
                                        <p className="text-[12px]" style={{ color: T.textMuted }}>Add an email to this contact first</p>
                                    </div>
                                ) : emails.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined filled text-[22px]"
                                                style={{ color: T.primary }}>mail</span>
                                        </div>
                                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No emails found</p>
                                        <p className="text-[12px] text-center" style={{ color: T.textMuted }}>
                                            No emails with <strong>{selectedContact.email}</strong> in your Gmail
                                        </p>
                                        {gmailStatus?.connected && selectedContact.email && (
                                            <button
                                                onClick={() => setCompose('new')}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold mt-2"
                                                style={{ background: T.primaryDim, color: T.primary }}>
                                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                                Send first email
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    emails.map(email => (
                                        <EmailBubble
                                            key={email.id}
                                            email={email}
                                            onReply={() => setCompose({ replyTo: email })}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Compose panel slides up from bottom */}
                            {compose && (
                                <ComposePanel
                                    contact={selectedContact}
                                    replyTo={compose === 'new' ? null : compose.replyTo}
                                    onSent={handleSent}
                                    onClose={() => setCompose(null)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}