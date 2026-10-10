import { useEffect, useState, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import Skeleton from 'react-loading-skeleton'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import ContactRow from '../components/conversations/ContactRow'
import EmailBubble from '../components/conversations/EmailBubble'
import WhatsAppBubble from '../components/conversations/WhatsAppBubble'
import CustomSelect from '../components/ui/CustomSelect'
import api from '../api'
import { useDialog } from '../contexts/DialogContext'

// ── Compose Panel ──────────────────────────────────────────────────────────────
function ComposePanel({ contact, replyTo, onSent, onClose }) {
    const { prompt } = useDialog()
    const auth = useSelector(state => state.auth)
    const [subject, setSubject] = useState(
        replyTo ? (replyTo.subject?.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`) : ''
    )
    const [body, setBody] = useState('')
    const [templates, setTemplates] = useState([])
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    
    const editorRef = useRef(null)

    useEffect(() => {
        // Load email templates
        api.get('/api/email-templates')
            .then(r => setTemplates(r.data))
            .catch(() => setTemplates([]))
    }, [])

    useEffect(() => {
        editorRef.current?.focus()
    }, [])

    const interpolateLocal = (text, contact, user) => {
        if (!text) return ''
        return text
            .replace(/\{\{contact\.firstName\}\}/g, contact.firstName || '')
            .replace(/\{\{contact\.lastName\}\}/g, contact.lastName || '')
            .replace(/\{\{contact\.email\}\}/g, contact.email || '')
            .replace(/\{\{user\.name\}\}/g, user.name || '')
            .replace(/\{\{deal\.title\}\}/g, '')
            .replace(/\{\{deal\.amount\}\}/g, '')
    }

    const handleTemplateSelect = (e) => {
        const id = e.target.value
        const selected = templates.find(t => String(t.id) === String(id))
        if (selected) {
            const interpolatedBody = interpolateLocal(selected.body, contact, auth)
            const interpolatedSubject = interpolateLocal(selected.subject, contact, auth)
            setSubject(interpolatedSubject)
            setBody(interpolatedBody)
            if (editorRef.current) {
                editorRef.current.innerHTML = interpolatedBody
            }
        }
        // No need to reset e.target.value since CustomSelect is stateless without a value prop
    }

    const execCmd = (cmd, val = null) => {
        document.execCommand(cmd, false, val)
        editorRef.current?.focus()
        if (editorRef.current) {
            setBody(editorRef.current.innerHTML)
        }
    }

    const handleInput = () => {
        if (editorRef.current) {
            setBody(editorRef.current.innerHTML)
        }
    }

    const send = async () => {
        if (!subject.trim()) { setError('Subject is required.'); return }
        if (!body.trim() || body === '<br>') { setError('Message body cannot be empty.'); return }
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
            <style>{`
                @keyframes composeSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
                .rich-editor:empty:before {
                    content: attr(placeholder);
                    color: #94a3b8;
                    cursor: text;
                }
            `}</style>

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

            {/* Formatting Toolbar */}
            <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, padding: '6px 12px',
                background: T.surfaceRaised, borderBottom: `1px solid ${T.borderSubtle}`,
                flexShrink: 0,
            }}>
                <button type="button" onClick={() => execCmd('bold')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Bold">
                    <span className="material-symbols-outlined text-[18px] font-bold">format_bold</span>
                </button>
                <button type="button" onClick={() => execCmd('italic')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Italic">
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </button>
                <button type="button" onClick={() => execCmd('underline')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Underline">
                    <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                </button>
                <button type="button" onClick={() => execCmd('strikeThrough')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Strikethrough">
                    <span className="material-symbols-outlined text-[18px]">format_strikethrough</span>
                </button>
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Bullet List">
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>
                <button type="button" onClick={() => execCmd('hiliteColor', '#FDBA74')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Highlight">
                    <span className="material-symbols-outlined text-[18px]">border_color</span>
                </button>

                <div style={{ width: 1, height: 18, background: T.borderSubtle, margin: '0 4px' }} />

                <button type="button" onClick={() => execCmd('justifyLeft')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Align Left">
                    <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                </button>
                <button type="button" onClick={() => execCmd('justifyCenter')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Align Center">
                    <span className="material-symbols-outlined text-[18px]">format_align_center</span>
                </button>
                <button type="button" onClick={() => execCmd('justifyRight')} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Align Right">
                    <span className="material-symbols-outlined text-[18px]">format_align_right</span>
                </button>

                <div style={{ width: 1, height: 18, background: T.borderSubtle, margin: '0 4px' }} />

                <button type="button" onClick={async () => {
                    const url = await prompt({
                        title: 'Insert Link',
                        message: 'Enter link URL (e.g. https://google.com):'
                    });
                    if (url) execCmd('createLink', url);
                }} className="w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }} title="Insert Link">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                </button>

                <div className="relative w-8 h-8 rounded hover:bg-orange-100 flex items-center justify-center" title="Text Color" style={{ cursor: 'pointer' }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: T.textSecondary }}>format_color_text</span>
                    <input type="color" onChange={(e) => execCmd('foreColor', e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>

                {/* Templates Selector */}
                {templates.length > 0 && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, minWidth: '140px', maxWidth: '250px', flex: '0 1 auto' }}>
                        <span className="material-symbols-outlined text-[15px]" style={{ color: T.textMuted }}>description</span>
                        <div className="flex-1 min-w-0">
                            <CustomSelect
                                onChange={handleTemplateSelect}
                                placeholder="Insert Template"
                                menuPlacement="bottom"
                            >
                                <option value="" disabled>-- Insert Template --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </CustomSelect>
                        </div>
                    </div>
                )}
            </div>

            {/* Rich Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="rich-editor"
                placeholder="Write your message here..."
                style={{
                    flex: 1, padding: '14px 16px', outline: 'none',
                    overflowY: 'auto', background: 'transparent',
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
                <div style={{ flex: 1 }}>
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

    // WhatsApp channel state
    const [channel, setChannel] = useState('email') // 'email' | 'whatsapp'
    const [whatsappMessages, setWhatsappMessages] = useState([])
    const [whatsappPage, setWhatsappPage] = useState(0)
    const [whatsappHasOlder, setWhatsappHasOlder] = useState(false)
    const [whatsappLoading, setWhatsappLoading] = useState(false)
    const [whatsappLoadingOlder, setWhatsappLoadingOlder] = useState(false)
    const [gmailNextToken, setGmailNextToken] = useState(null)
    const [gmailHasMore, setGmailHasMore] = useState(false)
    const [emailsLoadingMore, setEmailsLoadingMore] = useState(false)
    const [whatsappBody, setWhatsappBody] = useState('')
    const [sendingWhatsapp, setSendingWhatsapp] = useState(false)
    const [whatsappError, setWhatsappError] = useState('')

    const threadEndRef = useRef(null)

    const [pinnedIds, setPinnedIds] = useState(() => {
        try {
            const saved = localStorage.getItem('crm_pinned_contacts')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    const togglePin = (contactId) => {
        setPinnedIds(prev => {
            const next = prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
            localStorage.setItem('crm_pinned_contacts', JSON.stringify(next))
            return next
        })
    }

    useEffect(() => {
        // Immediate scroll to bottom
        threadEndRef.current?.scrollIntoView({ behavior: 'auto' })
        // Delayed scroll to handle any layout shifts or image renders
        const t = setTimeout(() => {
            threadEndRef.current?.scrollIntoView({ behavior: 'auto' })
        }, 100)
        return () => clearTimeout(t)
    }, [emails, whatsappMessages, channel])

    useEffect(() => {
        api.get('/api/gmail/status')
            .then(r => setGmailStatus(r.data))
            .catch(() => setGmailStatus({ connected: false }))
            .finally(() => setStatusLoading(false))
    }, [])

    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        setContactsLoading(true)
        const q = debouncedSearch.trim()
        const url = q 
            ? `/api/contacts?page=0&size=100&search=${encodeURIComponent(q)}`
            : '/api/contacts?page=0&size=100'
        api.get(url)
            .then(r => setContacts(r.data.content ?? []))
            .catch(() => setContacts([]))
            .finally(() => setContactsLoading(false))
    }, [debouncedSearch])

    const fetchEmails = useCallback(async (contact, append = false, pageToken = null) => {
        if (!contact?.email) { setEmails([]); return }
        if (append) setEmailsLoadingMore(true)
        else setEmailsLoading(true)
        try {
            const params = new URLSearchParams({ contactId: String(contact.id), size: '25' })
            if (pageToken) params.set('pageToken', pageToken)
            const r = await api.get(`/api/gmail/emails/contact?${params}`)
            const data = r.data ?? {}
            const batch = data.messages ?? []
            setEmails(prev => append ? [...prev, ...batch] : batch)
            setGmailNextToken(data.nextPageToken ?? null)
            setGmailHasMore(Boolean(data.hasMore))
            if (!append) {
                setEmailCounts(prev => ({ ...prev, [contact.id]: batch.length }))
            }
        } catch {
            if (!append) setEmails([])
        } finally {
            setEmailsLoading(false)
            setEmailsLoadingMore(false)
        }
    }, [])

    const fetchWhatsappMessages = useCallback(async (contact, loadOlder = false, currentPage = 0) => {
        if (!contact?.id) { setWhatsappMessages([]); return }
        if (loadOlder) setWhatsappLoadingOlder(true)
        else setWhatsappLoading(true)
        try {
            const page = loadOlder ? Math.max(0, currentPage - 1) : 0
            const latest = !loadOlder
            const r = await api.get(`/api/whatsapp/messages?contactId=${contact.id}&page=${page}&size=40&latest=${latest}`)
            const data = r.data ?? {}
            const batch = data.content ?? []
            setWhatsappMessages(prev => loadOlder ? [...batch, ...prev] : batch)
            setWhatsappPage(data.page ?? page)
            setWhatsappHasOlder(Boolean(data.hasMore))
        } catch {
            if (!loadOlder) setWhatsappMessages([])
        } finally {
            setWhatsappLoading(false)
            setWhatsappLoadingOlder(false)
        }
    }, [])

    useEffect(() => {
        if (selectedContact) {
            if (channel === 'email') {
                fetchEmails(selectedContact)
            } else if (channel === 'whatsapp') {
                fetchWhatsappMessages(selectedContact)
            }
        }
    }, [channel, selectedContact, fetchEmails, fetchWhatsappMessages])

    useEffect(() => {
        const handleWhatsappRealtime = (e) => {
            const msg = e.detail
            if (selectedContact && Number(msg.contactId) === Number(selectedContact.id)) {
                setWhatsappMessages(prev => {
                    if (prev.some(m => m.messageSid === msg.messageSid)) return prev
                    return [...prev, msg]
                })
            }
        }
        window.addEventListener('crm-whatsapp', handleWhatsappRealtime)
        return () => window.removeEventListener('crm-whatsapp', handleWhatsappRealtime)
    }, [selectedContact])

    useEffect(() => {
        const handleEmailRealtime = (e) => {
            const emailMsg = e.detail
            if (!emailMsg) return
            const matchesContact = selectedContact && (
                (emailMsg.contactId && Number(emailMsg.contactId) === Number(selectedContact.id)) ||
                (emailMsg.contact?.id && Number(emailMsg.contact.id) === Number(selectedContact.id)) ||
                (emailMsg.from && selectedContact.email && emailMsg.from.includes(selectedContact.email)) ||
                (emailMsg.to && selectedContact.email && emailMsg.to.includes(selectedContact.email))
            )
            if (matchesContact) {
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
                setEmailCounts(prev => ({
                    ...prev,
                    [selectedContact.id]: (prev[selectedContact.id] || 0) + 1
                }))
            }
        }
        window.addEventListener('crm-email', handleEmailRealtime)
        return () => window.removeEventListener('crm-email', handleEmailRealtime)
    }, [selectedContact])

    const selectContact = (contact) => {
        setSelectedContact(contact)
        setEmails([])
        setWhatsappMessages([])
        setGmailNextToken(null)
        setGmailHasMore(false)
        setWhatsappPage(0)
        setWhatsappHasOlder(false)
        setCompose(null)
        setWhatsappError('')
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
        if (selectedContact) fetchEmails(selectedContact)
    }

    const handleSent = () => {
        setCompose(null)
        setSentSuccess(true)
        setTimeout(() => setSentSuccess(false), 3000)
        if (selectedContact) fetchEmails(selectedContact)
    }

    const handleSendWhatsapp = async () => {
        if (!whatsappBody.trim() || sendingWhatsapp) return
        setSendingWhatsapp(true)
        setWhatsappError('')
        try {
            const r = await api.post('/api/whatsapp/send', {
                contactId: selectedContact.id,
                body: whatsappBody.trim()
            })
            setWhatsappMessages(prev => {
                if (prev.some(m => m.id === r.data.id)) return prev
                return [...prev, r.data]
            })
            setWhatsappBody('')
        } catch (err) {
            setWhatsappError(err?.response?.data?.message || 'Failed to send WhatsApp message')
        } finally {
            setSendingWhatsapp(false)
        }
    }

    const filtered = contacts.filter(contact => {
        const q = search.toLowerCase()
        return (
            contact.firstName?.toLowerCase().includes(q) ||
            contact.lastName?.toLowerCase().includes(q) ||
            contact.email?.toLowerCase().includes(q)
        )
    })

    const sortedContacts = [...filtered].sort((a, b) => {
        const aPinned = pinnedIds.includes(a.id)
        const bPinned = pinnedIds.includes(b.id)
        if (aPinned && !bPinned) return -1
        if (!aPinned && bPinned) return 1
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase()
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase()
        return nameA.localeCompare(nameB)
    })

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <TopBar />
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* ── Left contact sidebar ─────────────────── */}
                <div className={`w-full md:w-72 shrink-0 flex flex-col overflow-hidden ${selectedContact ? 'hidden md:flex' : 'flex'}`}
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
                            sortedContacts.map(contact => (
                                <ContactRow
                                    key={contact.id}
                                    contact={contact}
                                    selected={selectedContact}
                                    emailCount={emailCounts[contact.id] ?? null}
                                    isPinned={pinnedIds.includes(contact.id)}
                                    onPinToggle={() => togglePin(contact.id)}
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
                                        <p className="text-[11px] font-semibold truncate max-w-[140px]"
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

                {/* ── Main content area ──────────────────────── */}
                <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${selectedContact ? 'flex' : 'hidden md:flex'}`} style={{ background: T.bg }}>
                    {!selectedContact ? (
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
                                    Pick a contact from the left to view their conversation
                                </p>
                            </div>
                        </div>
                    ) : (
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
                            <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0"
                                style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                                
                                {/* Left side: Back, Avatar, Details */}
                                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                                    <button 
                                        onClick={() => setSelectedContact(null)}
                                        className="md:hidden flex items-center justify-center p-1.5 rounded-xl text-orange-600 transition-colors cursor-pointer shrink-0 -ml-1.5"
                                        style={{ color: T.primary }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.primaryDim}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                    </button>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                            color: '#fff',
                                        }}>
                                        {selectedContact.firstName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-black truncate" style={{ color: T.textPrimary }}>
                                                {selectedContact.firstName} {selectedContact.lastName}
                                            </p>
                                            <button 
                                                onClick={() => togglePin(selectedContact.id)}
                                                className="p-1 rounded-lg transition-all shrink-0"
                                                style={{ color: pinnedIds.includes(selectedContact.id) ? T.primary : T.textMuted }}
                                                title={pinnedIds.includes(selectedContact.id) ? "Unpin contact" : "Pin contact"}
                                                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span className="material-symbols-outlined text-[16px] block select-none" style={{ fontVariationSettings: pinnedIds.includes(selectedContact.id) ? "'FILL' 1" : "'FILL' 0" }}>
                                                    push_pin
                                                </span>
                                            </button>
                                            {selectedContact.account?.name && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 truncate max-w-[120px]"
                                                    style={{ background: T.surfaceHigh, color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}>
                                                    <span className="material-symbols-outlined text-[11px] shrink-0">business</span>
                                                    <span className="truncate">{selectedContact.account.name}</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] mt-0.5 truncate" style={{ color: T.textMuted }}>
                                            {selectedContact.email || 'No email address'} {selectedContact.phone && `· ${selectedContact.phone}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side: Actions */}
                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                    {channel === 'email' && emails.length > 0 && (
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full shrink-0"
                                            style={{ background: T.primaryDim, color: T.primary }}>
                                            {emails.length} emails
                                        </span>
                                    )}
                                    {channel === 'whatsapp' && whatsappMessages.length > 0 && (
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full shrink-0"
                                            style={{ background: T.primaryDim, color: T.primary }}>
                                            {whatsappMessages.length} messages
                                        </span>
                                    )}
                                    <button onClick={() => channel === 'email' ? fetchEmails(selectedContact) : fetchWhatsappMessages(selectedContact)}
                                        className="p-2 rounded-xl transition-all shrink-0"
                                        style={{ color: T.textMuted }}
                                        title="Refresh thread"
                                        onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.textPrimary }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                    </button>
                                    {/* ── Compose button for Email ── */}
                                    {channel === 'email' && gmailStatus?.connected && selectedContact.email && (
                                        <button
                                            onClick={() => setCompose('new')}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] transition-all shrink-0 flex-1 sm:flex-none"
                                            style={{ background: T.primary, color: '#fff', boxShadow: `0 2px 8px ${T.primary}40` }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                            onMouseLeave={e => e.currentTarget.style.background = T.primary}>
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                            Compose
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Channel Switcher Tab Bar ── */}
                            <div className="px-6 py-2 flex gap-3 shrink-0"
                                style={{ background: T.surface, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                <button
                                    onClick={() => { setChannel('email'); setCompose(null); setWhatsappError(''); }}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    style={{
                                        background: channel === 'email' ? T.primaryDim : 'transparent',
                                        color: channel === 'email' ? T.primary : T.textMuted,
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[15px]">mail</span>
                                    Email (Gmail)
                                </button>
                                <button
                                    onClick={() => { setChannel('whatsapp'); setCompose(null); setWhatsappError(''); }}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    style={{
                                        background: channel === 'whatsapp' ? T.primaryDim : 'transparent',
                                        color: channel === 'whatsapp' ? T.primary : T.textMuted,
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[15px]">sms</span>
                                    WhatsApp
                                </button>
                            </div>

                            {/* ── Dynamic Channel Contents ── */}
                            {channel === 'email' ? (
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    {!gmailStatus?.connected && !statusLoading && (
                                        <div className="mb-4 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                                            style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}>
                                            <div className="flex items-center gap-2 min-w-0" style={{ color: T.textMuted }}>
                                                <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: T.primary }}>info</span>
                                                <span className="truncate">Viewing team email conversation history. Connect your Gmail to compose or reply directly.</span>
                                            </div>
                                            <button onClick={connectGmail} disabled={connecting}
                                                className="font-bold shrink-0 hover:underline" style={{ color: T.primary }}>
                                                {connecting ? 'Redirecting...' : 'Connect Gmail'}
                                            </button>
                                        </div>
                                    )}
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
                                                No emails with <strong>{selectedContact.email}</strong> in contact history
                                            </p>
                                            {gmailStatus?.connected && selectedContact.email ? (
                                                <button
                                                    onClick={() => setCompose('new')}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold mt-2"
                                                    style={{ background: T.primaryDim, color: T.primary }}>
                                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                                    Send first email
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={connectGmail}
                                                    disabled={connecting}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold mt-2"
                                                    style={{ background: T.primaryDim, color: T.primary }}>
                                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                                    {connecting ? 'Redirecting...' : 'Connect Gmail to send email'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {gmailHasMore && (
                                                <button
                                                    type="button"
                                                    disabled={emailsLoadingMore}
                                                    onClick={() => fetchEmails(selectedContact, true, gmailNextToken)}
                                                    className="w-full mb-4 py-2 rounded-xl text-xs font-bold"
                                                    style={{ background: T.surfaceHigh, color: T.textSecondary, border: `1px solid ${T.border}` }}
                                                >
                                                    {emailsLoadingMore ? 'Loading…' : 'Load more emails'}
                                                </button>
                                            )}
                                            {emails.map(email => (
                                                <EmailBubble
                                                    key={email.id}
                                                    email={email}
                                                    onReply={gmailStatus?.connected ? () => setCompose({ replyTo: email }) : null}
                                                />
                                            ))}
                                            <div ref={threadEndRef} />
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                    {/* WhatsApp messages list */}
                                    <div className="flex-1 overflow-y-auto px-6 py-6">
                                        {whatsappLoading ? (
                                            [1, 2, 3].map((_, i) => (
                                                <div key={i} className={`flex gap-2.5 mb-4 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                                    <Skeleton height={50} width={200} borderRadius={16} />
                                                </div>
                                            ))
                                        ) : !selectedContact.phone ? (
                                            <div className="flex flex-col items-center py-16 gap-3">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ background: T.errorDim }}>
                                                    <span className="material-symbols-outlined filled text-[22px]"
                                                        style={{ color: T.error }}>phone_disabled</span>
                                                </div>
                                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No phone number</p>
                                                <p className="text-[12px]" style={{ color: T.textMuted }}>Add a phone number to this contact first to send WhatsApp messages</p>
                                            </div>
                                        ) : whatsappMessages.length === 0 ? (
                                            <div className="flex flex-col items-center py-16 gap-3">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ background: T.primaryDim }}>
                                                    <span className="material-symbols-outlined filled text-[22px]"
                                                        style={{ color: T.primary }}>forum</span>
                                                </div>
                                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No messages yet</p>
                                                <p className="text-[12px] text-center" style={{ color: T.textMuted }}>
                                                    Send your first WhatsApp message to <strong>{selectedContact.phone}</strong> below
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {whatsappHasOlder && (
                                                    <button
                                                        type="button"
                                                        disabled={whatsappLoadingOlder}
                                                        onClick={() => fetchWhatsappMessages(selectedContact, true, whatsappPage)}
                                                        className="w-full mb-4 py-2 rounded-xl text-xs font-bold"
                                                        style={{ background: T.surfaceHigh, color: T.textSecondary, border: `1px solid ${T.border}` }}
                                                    >
                                                        {whatsappLoadingOlder ? 'Loading…' : 'Load older messages'}
                                                    </button>
                                                )}
                                                {whatsappMessages.map(msg => (
                                                    <WhatsAppBubble
                                                        key={msg.id}
                                                        msg={msg}
                                                    />
                                                ))}
                                                <div ref={threadEndRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* WhatsApp messaging inputs */}
                                    {selectedContact.phone && (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderTop: `1px solid ${T.border}`,
                                            background: T.surface
                                        }}>
                                            {whatsappError && (
                                                <div style={{
                                                    padding: '10px 24px',
                                                    background: T.errorDim,
                                                    color: T.error,
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 8,
                                                    borderBottom: `1px solid ${T.border}`
                                                }}>
                                                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                                                    <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>{whatsappError}</span>
                                                    <button onClick={() => setWhatsappError('')} className="shrink-0" style={{ color: T.error, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                </div>
                                            )}
                                            <div style={{
                                                padding: '12px 24px',
                                                display: 'flex',
                                                gap: 12,
                                                alignItems: 'center'
                                            }}>
                                                <input
                                                    value={whatsappBody}
                                                    onChange={e => { setWhatsappBody(e.target.value); setWhatsappError(''); }}
                                                    placeholder="Type a WhatsApp message..."
                                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendWhatsapp(); } }}
                                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                                                    style={{
                                                        background: T.surfaceRaised,
                                                        border: `1px solid ${T.border}`,
                                                        color: T.textPrimary,
                                                    }}
                                                    disabled={sendingWhatsapp}
                                                />
                                                <button
                                                    onClick={handleSendWhatsapp}
                                                    disabled={sendingWhatsapp || !whatsappBody.trim()}
                                                    className="crm-btn-primary flex items-center justify-center"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 12,
                                                        padding: 0,
                                                        opacity: (sendingWhatsapp || !whatsappBody.trim()) ? 0.5 : 1
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Compose panel slides up from bottom (for Gmail) */}
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