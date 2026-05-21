import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { T } from '../constants/theme'
import UserMenu from './UserMenu'
import api from '../api'

// ── Highlight helper (unchanged) ──────────────────────────────
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

// ── Result row component ───────────────────────────────────────
function ResultRow({ icon, iconBg, iconColor, title, subtitle, query, onClick, isLast }) {
    return (
        <button onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100 group"
            style={{ borderBottom: isLast ? 'none' : `1px solid ${T.borderSubtle}` }}
            onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                style={{ background: iconBg, color: iconColor }}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{title}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>
            </div>
            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                style={{ color: T.primary }}>arrow_forward</span>
        </button>
    )
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ label, count }) {
    return (
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: T.primaryDim, color: T.primary }}>{count}</span>
        </div>
    )
}

export default function TopBar() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    // ── State (unchanged) ─────────────────────────────────────
    const [results, setResults] = useState({ accounts: [], contacts: [], deals: [], activities: [] })
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const inputRef = useRef(null)

    // ── Close on outside click (unchanged) ─────────────────────
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // ── Debounced search (unchanged) ───────────────────────────
    useEffect(() => {
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

    const typeIcons = { CALL: 'call', EMAIL: 'mail', MEETING: 'groups', NOTE: 'sticky_note_2' }
    const typeColors = { CALL: T.primary, EMAIL: '#10b981', MEETING: '#8b5cf6', NOTE: '#f59e0b' }

    return (
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-40"
            style={{
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                backdropFilter: 'blur(8px)',
            }}>

            {/* ── Search bar ────────────────────────────── */}
            <div className="relative w-full max-w-lg" ref={ref}>
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px]"
                    style={{ color: open ? T.primary : T.textMuted }}>search</span>
                <input
                    ref={inputRef}
                    className="w-full pl-10 pr-10 py-2.5 text-sm outline-none rounded-xl"
                    style={{
                        background: T.surface,
                        color: T.textPrimary,
                        border: `1.5px solid ${open ? T.primary : T.border}`,
                        boxShadow: open ? `0 0 0 3px ${T.primaryDim}` : '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    placeholder="Search deals, contacts, accounts..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { if (totalResults > 0) setOpen(true) }}
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                        style={{ background: T.surfaceHigh, color: T.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}>
                        <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                )}

                {/* ── Dropdown ─────────────────────────── */}
                {open && (
                    <div className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                        style={{
                            background: T.surface,
                            border: `1.5px solid ${T.border}`,
                            boxShadow: '0 16px 48px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                        }}>

                        {loading ? (
                            <div className="flex items-center justify-center gap-2.5 py-7">
                                <div className="w-4 h-4 rounded-full border-2 animate-spin"
                                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                                <span className="text-xs font-medium" style={{ color: T.textMuted }}>Searching...</span>
                            </div>
                        ) : totalResults === 0 ? (
                            <div className="py-10 text-center">
                                <span className="material-symbols-outlined text-[36px] block mb-2"
                                    style={{ color: T.border }}>search_off</span>
                                <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                                    No results for "<strong>{query}</strong>"
                                </p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 460, overflowY: 'auto' }}>

                                {/* Accounts */}
                                {results.accounts.length > 0 && (
                                    <div>
                                        <SectionLabel label="Accounts" count={results.accounts.length} />
                                        {results.accounts.map((a, i) => (
                                            <ResultRow key={a.id}
                                                icon={a.name.charAt(0).toUpperCase()}
                                                iconBg={T.primaryDim} iconColor={T.primary}
                                                title={highlight(a.name, query)}
                                                subtitle={a.industry || a.website || 'Account'}
                                                onClick={() => go(`/accounts/${a.id}`)}
                                                isLast={i === results.accounts.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Contacts */}
                                {results.contacts.length > 0 && (
                                    <div>
                                        {results.accounts.length > 0 && (
                                            <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
                                        )}
                                        <SectionLabel label="Contacts" count={results.contacts.length} />
                                        {results.contacts.map((c, i) => (
                                            <ResultRow key={c.id}
                                                icon={c.firstName.charAt(0).toUpperCase()}
                                                iconBg={T.secondaryDim} iconColor={T.secondaryText}
                                                title={highlight(`${c.firstName} ${c.lastName}`, query)}
                                                subtitle={`${c.designation || 'Contact'}${c.account ? ` · ${c.account.name}` : ''}`}
                                                onClick={() => go(`/contacts/${c.id}`)}
                                                isLast={i === results.contacts.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Deals */}
                                {results.deals.length > 0 && (
                                    <div>
                                        {(results.accounts.length > 0 || results.contacts.length > 0) && (
                                            <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
                                        )}
                                        <SectionLabel label="Deals" count={results.deals.length} />
                                        {results.deals.map((d, i) => (
                                            <ResultRow key={d.id}
                                                icon={<span className="material-symbols-outlined filled text-[15px]">handshake</span>}
                                                iconBg={T.tertiaryDim} iconColor={T.tertiaryText}
                                                title={highlight(d.title, query)}
                                                subtitle={`${d.stage}${d.account ? ` · ${d.account.name}` : ''}${d.amount ? ` · ₹${d.amount.toLocaleString()}` : ''}`}
                                                onClick={() => go(`/deals?highlight=${d.id}`)}
                                                isLast={i === results.deals.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Activities */}
                                {results.activities.length > 0 && (
                                    <div>
                                        {(results.accounts.length > 0 || results.contacts.length > 0 || results.deals.length > 0) && (
                                            <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
                                        )}
                                        <SectionLabel label="Activities" count={results.activities.length} />
                                        {results.activities.map((a, i) => (
                                            <ResultRow key={a.id}
                                                icon={<span className="material-symbols-outlined filled text-[15px]">{typeIcons[a.type] || 'event_note'}</span>}
                                                iconBg={T.primaryDim} iconColor={typeColors[a.type] || T.primary}
                                                title={highlight(a.subject, query)}
                                                subtitle={`${a.type}${a.account ? ` · ${a.account.name}` : ''}${a.contact ? ` · ${a.contact.firstName} ${a.contact.lastName}` : ''}`}
                                                onClick={() => go(`/activities?highlight=${a.id}`)}
                                                isLast={i === results.activities.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="px-4 py-2.5 flex items-center justify-between"
                                    style={{ borderTop: `1px solid ${T.border}`, background: T.borderSubtle }}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[12px]" style={{ color: T.textMuted }}>info</span>
                                        <p className="text-[11px]" style={{ color: T.textMuted }}>
                                            {totalResults} result{totalResults !== 1 ? 's' : ''} — click to navigate
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: T.primaryDim, color: T.primary }}>
                                        ↵ to select
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Right actions ─────────────────────────── */}
            <div className="flex items-center gap-1 ml-6 shrink-0">
                {/* Notifications */}
                <div className="relative">
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    {/* Dot badge */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                        style={{ background: T.primary, borderColor: T.bg }} />
                </div>

                {/* Help / Support */}
                <button onClick={() => navigate('/support')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}
                    title="Support">
                    <span className="material-symbols-outlined text-[20px]">help</span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 mx-2" style={{ background: T.border }} />

                {/* User menu */}
                <UserMenu />
            </div>
        </header>
    )
}