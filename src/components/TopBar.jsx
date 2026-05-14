import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { T } from '../constants/theme'
import UserMenu from './UserMenu'
import api from '../api'

function highlight(text, query) {
    if (!query || !text) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{ background: T.primaryDim, color: T.primary, borderRadius: 2, padding: '0 1px' }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    )
}

export default function TopBar() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    // ✅ FIX: activities added to initial state
    const [results, setResults] = useState({ accounts: [], contacts: [], deals: [], activities: [] })
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const inputRef = useRef(null)

    // close on outside click
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // debounced search
    useEffect(() => {
        // ✅ FIX: activities added here too
        if (!query.trim()) { setResults({ accounts: [], contacts: [], deals: [], activities: [] }); setOpen(false); return }
        const t = setTimeout(async () => {
            setLoading(true)
            try {
                const q = query.trim()
                const [accRes, conRes, dealRes, actRes] = await Promise.all([
                    api.get(`/api/accounts?page=0&size=5&search=${encodeURIComponent(q)}`),
                    api.get(`/api/contacts?page=0&size=5&search=${encodeURIComponent(q)}`),
                    api.get('/api/deals/all'),
                    api.get(`/api/activities/search?q=${encodeURIComponent(q)}`)
                ])
                const accounts = accRes.data.content ?? []
                const contacts = conRes.data.content ?? []
                const ql = q.toLowerCase()
                const deals = (dealRes.data ?? [])
                    .filter(d => d.title.toLowerCase().includes(ql) || (d.account?.name || '').toLowerCase().includes(ql))
                    .slice(0, 5)
                const activities = actRes.data ?? []

                setResults({ accounts, contacts, deals, activities })
                setOpen(true)
            } finally {
                setLoading(false)
            }
        }, 300)
        return () => clearTimeout(t)
    }, [query])

    const totalResults = results.accounts.length + results.contacts.length + results.deals.length + results.activities.length

    const go = (path) => {
        setQuery('')
        setOpen(false)
        navigate(path)
    }

    return (
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-40"
            style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>

            <div className="relative w-full max-w-lg" ref={ref}>
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]"
                    style={{ color: T.textMuted }}>search</span>
                <input
                    ref={inputRef}
                    className="w-full pl-10 pr-4 py-2.5 text-sm outline-none rounded-full"
                    style={{
                        background: T.surface,
                        color: T.textPrimary,
                        border: `1px solid ${open ? T.primary : T.border}`,
                        boxShadow: open ? `0 0 0 3px ${T.primaryDim}` : '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    placeholder="Search deals, contacts, or accounts..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { if (totalResults > 0) setOpen(true) }}
                />
                {query && (
                    <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
                        className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[16px]"
                        style={{ color: T.textMuted }}>close</button>
                )}

                {/* Dropdown */}
                {open && (
                    <div className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}>

                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-6">
                                <div className="w-4 h-4 rounded-full border-2 animate-spin"
                                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                                <span className="text-xs" style={{ color: T.textMuted }}>Searching...</span>
                            </div>
                        ) : totalResults === 0 ? (
                            <div className="py-8 text-center">
                                <span className="material-symbols-outlined text-[32px] block mb-2" style={{ color: T.border }}>search_off</span>
                                <p className="text-sm" style={{ color: T.textMuted }}>No results for "<strong>{query}</strong>"</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 440, overflowY: 'auto' }}>

                                {/* Accounts */}
                                {results.accounts.length > 0 && (
                                    <div>
                                        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{ color: T.textMuted }}>Accounts</p>
                                        {results.accounts.map(a => (
                                            <button key={a.id} onClick={() => go(`/accounts/${a.id}`)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                                                onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                                                    style={{ background: T.primaryDim, color: T.primary }}>
                                                    {a.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                        {highlight(a.name, query)}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: T.textMuted }}>
                                                        {a.industry || a.website || 'Account'}
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-[14px] ml-auto shrink-0"
                                                    style={{ color: T.textMuted }}>arrow_forward</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Contacts */}
                                {results.contacts.length > 0 && (
                                    <div>
                                        {results.accounts.length > 0 && <div style={{ borderTop: `1px solid ${T.borderSubtle}` }} />}
                                        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{ color: T.textMuted }}>Contacts</p>
                                        {results.contacts.map(c => (
                                            <button key={c.id} onClick={() => go(`/contacts/${c.id}`)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                                                onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                                    style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                                    {c.firstName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                        {highlight(`${c.firstName} ${c.lastName}`, query)}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: T.textMuted }}>
                                                        {c.designation || 'Contact'}{c.account ? ` · ${c.account.name}` : ''}
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-[14px] ml-auto shrink-0"
                                                    style={{ color: T.textMuted }}>arrow_forward</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Deals */}
                                {results.deals.length > 0 && (
                                    <div>
                                        {(results.accounts.length > 0 || results.contacts.length > 0) && <div style={{ borderTop: `1px solid ${T.borderSubtle}` }} />}
                                        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{ color: T.textMuted }}>Deals</p>
                                        {results.deals.map(d => (
                                            <button key={d.id} onClick={() => go(`/deals?highlight=${d.id}`)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                                                onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ background: T.tertiaryDim }}>
                                                    <span className="material-symbols-outlined text-[15px]"
                                                        style={{ color: T.tertiaryText }}>handshake</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                        {highlight(d.title, query)}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: T.textMuted }}>
                                                        {d.stage}{d.account ? ` · ${d.account.name}` : ''}{d.amount ? ` · ₹${d.amount.toLocaleString()}` : ''}
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-[14px] ml-auto shrink-0"
                                                    style={{ color: T.textMuted }}>arrow_forward</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Activities */}
                                {results.activities.length > 0 && (
                                    <div>
                                        {(results.accounts.length > 0 || results.contacts.length > 0 || results.deals.length > 0) &&
                                            <div style={{ borderTop: `1px solid ${T.borderSubtle}` }} />}
                                        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{ color: T.textMuted }}>Activities</p>
                                        {results.activities.map(a => {
                                            const typeColors = { CALL: T.primary, EMAIL: '#10b981', MEETING: '#8b5cf6', NOTE: '#f59e0b' }
                                            const typeIcons = { CALL: 'call', EMAIL: 'mail', MEETING: 'groups', NOTE: 'sticky_note_2' }
                                            return (
                                                <button key={a.id} onClick={() => go(`/activities?highlight=${a.id}`)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ background: T.primaryDim }}>
                                                        <span className="material-symbols-outlined text-[15px]"
                                                            style={{ color: typeColors[a.type] || T.primary }}>
                                                            {typeIcons[a.type] || 'event_note'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                                            {highlight(a.subject, query)}
                                                        </p>
                                                        <p className="text-xs truncate" style={{ color: T.textMuted }}>
                                                            {a.type}{a.account ? ` · ${a.account.name}` : ''}{a.contact ? ` · ${a.contact.firstName} ${a.contact.lastName}` : ''}
                                                        </p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[14px] ml-auto shrink-0"
                                                        style={{ color: T.textMuted }}>arrow_forward</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Footer hint */}
                                <div className="px-4 py-2.5 flex items-center gap-1.5"
                                    style={{ borderTop: `1px solid ${T.borderSubtle}`, background: T.surfaceRaised }}>
                                    <span className="material-symbols-outlined text-[13px]" style={{ color: T.textMuted }}>info</span>
                                    <p className="text-[11px]" style={{ color: T.textMuted }}>
                                        {totalResults} result{totalResults !== 1 ? 's' : ''} — click to navigate
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 ml-6">
                {['notifications', 'help'].map((icon) => (
                    <div key={icon} className="relative">
                        <button className="p-2 rounded-full transition-colors"
                            style={{ color: T.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                            <span className="material-symbols-outlined text-[22px]">{icon}</span>
                        </button>
                        {icon === 'notifications' && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
                                style={{ background: T.primary, borderColor: T.bg }} />
                        )}
                    </div>
                ))}
                <div className="w-px h-6 mx-3" style={{ background: T.border }} />
                <UserMenu />
            </div>
        </header>
    )
}