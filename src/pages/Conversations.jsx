import { useEffect, useState, useCallback } from 'react'
import Skeleton from 'react-loading-skeleton'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import ContactRow from '../components/conversations/ContactRow'
import EmailBubble from '../components/conversations/EmailBubble'
import GmailNotConnected from '../components/conversations/GmailNotConnected'
import api from '../api'

export default function Conversations() {
    // ── State (unchanged) ──────────────────────────────────────
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

    // ── Data handlers (unchanged) ──────────────────────────────
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
                    style={{
                        background: T.surface,
                        borderRight: `1px solid ${T.border}`,
                    }}>

                    {/* Sidebar header */}
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

                        {/* Search */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                            style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                            <span className="material-symbols-outlined text-[15px]"
                                style={{ color: T.textMuted }}>search</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search contacts..."
                                className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: T.textPrimary }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')}
                                    style={{ color: T.textMuted }}>
                                    <span className="material-symbols-outlined text-[13px]">close</span>
                                </button>
                            )}
                        </div>

                        {/* Contact count */}
                        {!contactsLoading && (
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-3 px-1"
                                style={{ color: T.textMuted }}>
                                {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
                            </p>
                        )}
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
                            <div className="px-5 py-10 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-[24px]"
                                    style={{ color: T.textMuted }}>person_search</span>
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

                    {/* Gmail status footer (unchanged logic) */}
                    {!statusLoading && (
                        <div className="px-4 py-3 shrink-0"
                            style={{ borderTop: `1px solid ${T.border}` }}>
                            {gmailStatus?.connected ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
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
                        /* Empty state */
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
                                {/* Decorative dots */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                                    style={{ background: T.primary + '40' }} />
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full"
                                    style={{ background: T.primary + '25' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-black" style={{ color: T.textPrimary }}>
                                    Select a contact
                                </p>
                                <p className="text-[13px] mt-1.5 max-w-xs" style={{ color: T.textMuted }}>
                                    Pick a contact from the left to view their email thread
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Contact header bar */}
                            <div className="px-6 py-4 flex items-center gap-4 shrink-0"
                                style={{
                                    background: T.surface,
                                    borderBottom: `1px solid ${T.border}`,
                                }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${T.primary} 0%, #1D4ED8 100%)`,
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
                                        className="p-2 rounded-xl transition-all"
                                        style={{ color: T.textMuted }}
                                        onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.textPrimary }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                    </button>
                                </div>
                            </div>

                            {/* Email thread (unchanged logic) */}
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
