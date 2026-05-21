import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { T } from '../constants/theme'
import { signOut as signOutSession } from '../store/authSlice'

// ── Role badge styles (unchanged values) ──────────────────────
const ROLE_STYLES = {
    SUPER_ADMIN: { bg: 'rgba(139,92,246,0.15)', color: '#7C3AED', label: 'Super Admin', dot: '#7C3AED' },
    ADMIN:       { bg: T.primaryDim,             color: T.primary,  label: 'Admin',       dot: T.primary },
    AGENT:       { bg: T.successDim,             color: T.success,  label: 'Agent',       dot: T.success },
}

export default function UserMenu() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const { name, role } = useSelector(state => state.auth)
    const isSuperAdmin = role === 'SUPER_ADMIN'
    const rs = ROLE_STYLES[role] || ROLE_STYLES.AGENT

    // ── Close on outside click (unchanged) ─────────────────────
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // ── signOut (unchanged) ────────────────────────────────────
    const signOut = () => {
        dispatch(signOutSession())
        navigate('/login')
    }

    // ── menuItems (unchanged) ─────────────────────────────────
    const menuItems = isSuperAdmin
        ? [{ icon: 'manage_accounts', label: 'My Profile', action: () => { navigate('/platform/profile'); setOpen(false) } }]
        : [
            { icon: 'manage_accounts', label: 'My Profile',  action: () => { navigate('/profile');   setOpen(false) } },
            { icon: 'settings',        label: 'Settings',    action: () => { navigate('/settings');  setOpen(false) } },
        ]

    return (
        <div className="relative" ref={ref}>
            {/* ── Trigger button ─────────────────────── */}
            <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl transition-all duration-150"
                style={{
                    background: open ? T.primaryFaint : 'transparent',
                    border: `1.5px solid ${open ? T.primary + '40' : 'transparent'}`,
                }}
                onMouseEnter={e => {
                    if (!open) e.currentTarget.style.background = T.surfaceHigh
                }}
                onMouseLeave={e => {
                    if (!open) e.currentTarget.style.background = 'transparent'
                }}>
                {/* Avatar with gradient */}
                <div className="relative w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                    style={{
                        background: `linear-gradient(135deg, ${T.primary} 0%, #1D4ED8 100%)`,
                        color: '#fff',
                        boxShadow: open ? `0 0 0 2px ${T.primary}40` : 'none',
                        transition: 'box-shadow 0.15s',
                    }}>
                    {name.charAt(0).toUpperCase()}
                    {/* Online dot */}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2"
                        style={{ background: '#22C55E', borderColor: T.bg }} />
                </div>
                {/* Name + role (hidden on mobile) */}
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold leading-tight" style={{ color: T.textPrimary }}>{name}</p>
                    <p className="text-[10px] font-semibold" style={{ color: rs.color }}>{rs.label}</p>
                </div>
                {/* Chevron */}
                <span className="material-symbols-outlined text-[16px] hidden sm:block transition-transform duration-200"
                    style={{ color: T.textMuted, transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
                    expand_more
                </span>
            </button>

            {/* ── Dropdown ─────────────────────────────── */}
            {open && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl overflow-hidden z-50"
                    style={{
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 6px 16px rgba(0,0,0,0.08)',
                    }}>

                    {/* ── Profile header ─────────────────── */}
                    <div className="relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${T.sidebar} 0%, #1a3a6b 100%)`,
                        }}>
                        {/* Orb */}
                        <div style={{
                            position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(37,99,235,0.40) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />
                        <div className="relative px-4 py-4 flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                                style={{
                                    background: `linear-gradient(135deg, ${T.primary} 0%, #1D4ED8 100%)`,
                                    color: '#fff',
                                    boxShadow: `0 4px 14px ${T.primary}50`,
                                }}>
                                {name.charAt(0).toUpperCase()}
                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                                    style={{ background: '#22C55E', borderColor: T.sidebar }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black truncate" style={{ color: '#fff' }}>{name}</p>
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{ background: rs.bg, color: rs.color }}>
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ background: rs.dot }} />
                                    {rs.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Menu items (unchanged logic) ───── */}
                    <div className="py-1.5">
                        {menuItems.map(({ icon, label, action }) => (
                            <button key={label} onClick={action}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-100 text-left group"
                                style={{ color: T.textSecondary }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = T.primaryFaint
                                    e.currentTarget.style.color = T.primary
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = T.textSecondary
                                }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                                    style={{ background: T.borderSubtle }}>
                                    <span className="material-symbols-outlined text-[15px]">{icon}</span>
                                </div>
                                <span className="font-semibold">{label}</span>
                                <span className="material-symbols-outlined text-[13px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: T.primary }}>arrow_forward</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Sign out (unchanged logic) ─────── */}
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                        <button onClick={signOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-100 text-left group"
                            style={{ color: T.error }}
                            onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: T.errorDim }}>
                                <span className="material-symbols-outlined text-[15px]" style={{ color: T.error }}>logout</span>
                            </div>
                            <span className="font-semibold">Sign out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}