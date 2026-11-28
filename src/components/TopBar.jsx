import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, getThemeName, toggleTheme, getPaletteName, setPaletteName, CURATED_PALETTES } from '../constants/theme'
import { CRM_LANDING_URL } from '../constants/config'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'
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
    const { role, companyStatus, trialEndsAt, companyId, companyName, email } = useSelector(state => state.auth)
    const isSuperAdmin = role === 'SUPER_ADMIN'

    const getTrialDaysLeft = () => {
        if (!trialEndsAt) return 0
        const diff = new Date(trialEndsAt) - new Date()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }
    const daysLeft = getTrialDaysLeft()
    const [query, setQuery] = useState('')
    const [placeholder, setPlaceholder] = useState('Search deals, contacts, accounts...')

    useEffect(() => {
        const updatePlaceholder = () => {
            if (window.innerWidth < 640) {
                setPlaceholder('Search CRM...')
            } else {
                setPlaceholder('Search deals, contacts, accounts...')
            }
        }
        updatePlaceholder()
        window.addEventListener('resize', updatePlaceholder)
        return () => window.removeEventListener('resize', updatePlaceholder)
    }, [])
    // ── State (unchanged) ─────────────────────────────────────
    const [results, setResults] = useState({ accounts: [], contacts: [], deals: [], activities: [] })
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [paletteOpen, setPaletteOpen] = useState(false)
    const [, setTick] = useState(0)
    const ref = useRef(null)
    const inputRef = useRef(null)
    const paletteRef = useRef(null)

    // Listen to theme & palette changes
    useEffect(() => {
        const handleTheme = () => setTick(t => t + 1)
        window.addEventListener('crm-theme-changed', handleTheme)
        return () => window.removeEventListener('crm-theme-changed', handleTheme)
    }, [])

    // ── Close on outside click ─────────────────────────────────
    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
            if (paletteRef.current && !paletteRef.current.contains(e.target)) setPaletteOpen(false)
        }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // ── Global Cmd/Ctrl + K shortcut ───────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // ── Debounced search (unchanged) ───────────────────────────
    useEffect(() => {
        if (!query.trim()) { setResults({ accounts: [], contacts: [], deals: [], activities: [] }); setOpen(false); return }
        const t = setTimeout(async () => {
            setLoading(true)
            try {
                const q = query.trim()
                const res = await api.get(`/api/search?q=${encodeURIComponent(q)}`)
                const data = res.data || {}
                
                const accounts = data.accounts || []
                const contacts = data.contacts || []
                const deals = data.deals || []
                const activities = data.activities || []
                
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
    const typeColors = { CALL: T.primary, EMAIL: T.activityEmail, MEETING: T.activityMeeting, NOTE: T.activityNote }

    return (
        <header className="flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 gap-3 shrink-0"
            style={{
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                paddingTop: 'env(safe-area-inset-top, 0px)',
                minHeight: 'calc(4rem + env(safe-area-inset-top, 0px))',
            }}>

            {/* Hamburger Menu Toggle Button on Mobile */}
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('crm-toggle-sidebar'))}
                className="md:hidden flex items-center justify-center p-2 rounded-xl text-orange-600 transition-colors cursor-pointer shrink-0"
                style={{ color: T.primary }}
                onMouseEnter={e => e.currentTarget.style.background = T.primaryDim}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            {/* ── Search bar — hidden for SUPER_ADMIN ─────── */}
            {!isSuperAdmin && (
            <div className="relative flex-1 max-w-[180px] min-[400px]:max-w-[240px] sm:max-w-xs md:max-w-md lg:max-w-lg" ref={ref}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] pointer-events-none"
                    style={{ color: open ? T.primary : T.textMuted }}>search</span>
                <input
                    ref={inputRef}
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-[13px] font-medium outline-none rounded-xl"
                    style={{
                        background: T.surface,
                        color: T.textPrimary,
                        border: `1px solid ${open ? T.primary : T.border}`,
                        boxShadow: open ? `0 0 0 3px ${T.primaryDim}` : '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    placeholder={placeholder}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { if (totalResults > 0) setOpen(true) }}
                />
                {query ? (
                    <button
                        onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer"
                        style={{ background: T.surfaceHigh, color: T.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}>
                        <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                ) : (
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none"
                        style={{ background: T.surfaceHigh, color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}>
                        ⌘K
                    </kbd>
                )}

                {/* ── Dropdown ─────────────────────────── */}
                {open && (
                    <div className="absolute -left-10 min-[400px]:-left-16 sm:left-0 mt-2 rounded-2xl overflow-hidden z-50 w-[280px] min-[400px]:w-[320px] sm:w-[380px] md:w-full md:left-0 md:right-0"
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
            )}

            {/* ── Right actions ─────────────────────────── */}
            <div className="flex items-center gap-1 ml-auto shrink-0">

                {!isSuperAdmin && companyStatus === 'TRIAL' && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl mr-2 font-bold text-xs"
                        style={{
                            background: T.primaryDim,
                            border: `1px solid ${T.primary}30`,
                            color: T.primaryText,
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} trial</span>
                        {(role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN') && (
                            <button onClick={() => navigate('/settings?tab=billing')}
                                className="ml-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider text-white transition-all duration-150 cursor-pointer shadow-xs hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)`,
                                }}>
                                Upgrade
                            </button>
                        )}
                    </div>
                )}

                {!isSuperAdmin && (companyStatus === 'PAST_DUE' || companyStatus === 'HALTED') && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl mr-2 font-bold text-xs"
                        style={{
                            background: companyStatus === 'HALTED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                            border: `1px solid ${companyStatus === 'HALTED' ? '#EF4444' : '#F59E0B'}`,
                            color: companyStatus === 'HALTED' ? '#EF4444' : '#D97706',
                        }}>
                        <span>{companyStatus === 'HALTED' ? 'Read-Only Lock' : 'Payment Past Due'}</span>
                        {(role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN') && (
                            <button onClick={() => navigate('/settings?tab=billing')}
                                className="ml-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider text-white cursor-pointer"
                                style={{ background: companyStatus === 'HALTED' ? '#EF4444' : '#D97706' }}>
                                Pay Now
                            </button>
                        )}
                    </div>
                )}

                {/* ── Theme & Palette Popover ── */}
                <div className="relative" ref={paletteRef}>
                    <button onClick={() => setPaletteOpen(v => !v)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer relative"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                        onMouseLeave={e => { e.currentTarget.style.background = paletteOpen ? T.surfaceHigh : 'transparent'; e.currentTarget.style.color = paletteOpen ? T.textPrimary : T.textMuted }}
                        title="Theme & Color Palette">
                        <span className="material-symbols-outlined text-[20px]">palette</span>
                        <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full border border-white"
                            style={{ background: T.primary, boxShadow: `0 0 6px ${T.primary}` }} />
                    </button>

                    {paletteOpen && (
                        <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                            style={{
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
                            }}>
                            {/* Header & Mode Switch */}
                            <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                                <span className="text-[11px] font-bold tracking-tight" style={{ color: T.textPrimary }}>
                                    Appearance
                                </span>
                                <div className="inline-flex items-center p-0.5 rounded-lg" style={{ background: T.surfaceHigh }}>
                                    <button
                                        onClick={() => { if (getThemeName() !== 'light') toggleTheme() }}
                                        className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                                            getThemeName() === 'light' ? 'shadow-xs' : ''
                                        }`}
                                        style={{
                                            background: getThemeName() === 'light' ? T.surface : 'transparent',
                                            color: getThemeName() === 'light' ? T.primary : T.textMuted,
                                        }}>
                                        <span className="material-symbols-outlined text-[14px]">light_mode</span>
                                        Light
                                    </button>
                                    <button
                                        onClick={() => { if (getThemeName() !== 'dark') toggleTheme() }}
                                        className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                                            getThemeName() === 'dark' ? 'shadow-xs' : ''
                                        }`}
                                        style={{
                                            background: getThemeName() === 'dark' ? T.surface : 'transparent',
                                            color: getThemeName() === 'dark' ? T.primary : T.textMuted,
                                        }}>
                                        <span className="material-symbols-outlined text-[14px]">dark_mode</span>
                                        Dark
                                    </button>
                                </div>
                            </div>

                            {/* Curated Color Palettes */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider px-1 mb-1.5" style={{ color: T.textMuted }}>
                                    Curated Palettes
                                </p>
                                {CURATED_PALETTES.map((p) => {
                                    const isSelected = getPaletteName() === p.id
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setPaletteName(p.id)
                                            }}
                                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all group"
                                            style={{
                                                background: isSelected ? T.primaryDim : 'transparent',
                                                border: `1px solid ${isSelected ? T.primary : 'transparent'}`,
                                            }}
                                            onMouseEnter={e => {
                                                if (!isSelected) e.currentTarget.style.background = T.surfaceHigh
                                            }}
                                            onMouseLeave={e => {
                                                if (!isSelected) e.currentTarget.style.background = 'transparent'
                                            }}>
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                                                    style={{ background: p.accentColor }} />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate" style={{ color: isSelected ? T.primary : T.textPrimary }}>
                                                        {p.name}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <span className="material-symbols-outlined text-[16px] shrink-0 font-bold"
                                                    style={{ color: T.primary }}>check</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Link to Settings Appearance tab */}
                            <div className="pt-2 mt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaletteOpen(false)
                                        navigate('/settings?tab=appearance')
                                    }}
                                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all hover:opacity-90 group cursor-pointer"
                                    style={{ background: T.primaryFaint }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>
                                            tune
                                        </span>
                                        <span className="text-[11px] font-bold" style={{ color: T.primary }}>
                                            Custom Theme Studio
                                        </span>
                                    </div>
                                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5" style={{ color: T.primary }}>
                                        chevron_right
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dark Mode Quick Toggle */}
                <button onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}
                    title={getThemeName() === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                    <span className="material-symbols-outlined text-[20px]">
                        {getThemeName() === 'light' ? 'dark_mode' : 'light_mode'}
                    </span>
                </button>

                {isSuperAdmin ? (
                    // Super admin: notification bell only (no search, no support link)
                    <>
                        <NotificationBell isSuperAdmin={true} />
                        <div className="w-px h-6 mx-2" style={{ background: T.border }} />
                    </>
                ) : (
                    // Regular CRM users: notification bell + support icon
                    <>
                        <NotificationBell isSuperAdmin={false} />

                        {/* Help / Support */}
                        <button onClick={() => navigate('/support')}
                            className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center transition-all duration-150"
                            style={{ color: T.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}
                            title="Support">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 mx-2" style={{ background: T.border }} />
                    </>
                )}

                {/* User menu */}
                <UserMenu />
            </div>
        </header>
    )
}