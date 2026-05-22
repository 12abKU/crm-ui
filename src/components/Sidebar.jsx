import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, NAV_LINKS } from '../constants/theme'
import api from '../api'

export default function Sidebar() {
    const navigate = useNavigate()
    const [userHover, setUserHover] = useState(false)
    const [overdue, setOverdue] = useState(0)

    const { name, role, companyName } = useSelector(state => state.auth)
    const isSuperAdmin = role === 'SUPER_ADMIN'
    const [openTickets, setOpenTickets] = useState(0)

    // Badge polling — completely unchanged
    useEffect(() => {
        if (isSuperAdmin) {
            // Poll open ticket count for super admin
            const loadBadge = () =>
                api.get('/api/support/badge').then(r => setOpenTickets(r.data.myOpenTickets ?? 0)).catch(() => { })
            loadBadge()
            const iv = setInterval(loadBadge, 120000)
            return () => clearInterval(iv)
        }
        api.get('/api/activities/badge')
            .then(r => setOverdue(r.data.overdue ?? 0))
            .catch(() => { })
        const interval = setInterval(() => {
            api.get('/api/activities/badge')
                .then(r => setOverdue(r.data.overdue ?? 0))
                .catch(() => { })
        }, 300000)
        return () => clearInterval(interval)
    }, [isSuperAdmin])

    // Shared NavLink style factory
    const navStyle = ({ isActive }) => ({
        background: isActive ? T.sidebarHover : 'transparent',
        color: isActive ? '#DBEAFE' : T.sidebarText,
        fontWeight: isActive ? 700 : 500,
        borderLeft: isActive ? `3px solid ${T.sidebarActiveText}` : '3px solid transparent',
    })

    return (
        <aside className="crm-sidebar flex flex-col h-screen w-64 fixed left-0 top-0 z-50"
            style={{ background: T.sidebar }}>

            {/* ── Logo ────────────────────────────────────── */}
            <div className="px-5 pt-6 pb-5">
                <div className="flex items-center gap-3 px-1">
                    {/* Logo icon with glow */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
                        style={{
                            background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                            boxShadow: `0 0 16px ${T.avatarGlow}`,
                        }}>
                        <span className="material-symbols-outlined filled text-white text-[18px]">dataset</span>
                    </div>
                    <div>
                        <h1 className="text-[15px] font-black leading-tight" style={{ color: '#FFFFFF' }}>
                            Iinventive CRM
                        </h1>
                        <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5"
                            style={{ color: T.heroSubText }}>
                            {isSuperAdmin ? 'Platform Admin' : 'Enterprise Edition'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Divider ──────────────────────────────────── */}
            <div className="mx-4 mb-3" style={{ height: 1, background: T.sidebarHover }} />

            {/* ── Nav ─────────────────────────────────────── */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">

                {isSuperAdmin ? (
                    // SUPER_ADMIN sees ONLY platform nav (unchanged logic)
                    <>
                        <p className="px-4 pt-2 pb-2 text-[9px] font-black uppercase tracking-widest"
                            style={{ color: T.heroSubText }}>Platform</p>

                        <NavLink to="/platform" end
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                            style={navStyle}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>domain</span>
                                    <span className="flex-1">Companies</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/platform/profile"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                            style={navStyle}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>manage_accounts</span>
                                    <span className="flex-1">My Profile</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/platform/tickets"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                            style={navStyle}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>support_agent</span>
                                    <span className="flex-1">Support Tickets</span>
                                    {openTickets > 0 && (
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4.5 text-center"
                                            style={{ background: '#DC2626', color: '#fff' }}>
                                            {openTickets > 99 ? '99+' : openTickets}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    </>
                ) : (
                    // CRM users (ADMIN / AGENT) see CRM nav (unchanged logic)
                    <>
                        <p className="px-4 pt-2 pb-2 text-[9px] font-black uppercase tracking-widest"
                            style={{ color: T.heroSubText }}>Main Menu</p>

                        {NAV_LINKS.map(({ to, icon, label }) => (
                            <NavLink key={to} to={to} end={to === '/'}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                                style={navStyle}>
                                {({ isActive }) => (
                                    <>
                                        <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>
                                            {icon}
                                        </span>
                                        <span className="flex-1">{label}</span>
                                        {/* Overdue badge on Activities (unchanged) */}
                                        {to === '/activities' && overdue > 0 && (
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4.5 text-center"
                                                style={{ background: '#DC2626', color: '#fff' }}>
                                                {overdue > 99 ? '99+' : overdue}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* ── Create New — only for CRM users (unchanged logic) ── */}
            {!isSuperAdmin && (
                <div className="px-4 py-3">
                    <button onClick={() => navigate('/accounts')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold py-2.5 transition-all duration-150"
                        style={{
                            background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                            color: '#fff',
                            boxShadow: `0 4px 14px ${T.primary}66`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = `0 6px 20px ${T.avatarGlow}`
                            e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = `0 4px 14px ${T.primary}66`
                            e.currentTarget.style.transform = 'none'
                        }}>
                        <span className="material-symbols-outlined text-[17px]">add_circle</span>
                        Create New
                    </button>
                </div>
            )}

            {/* ── Support — only for CRM users (unchanged logic) ── */}
            {!isSuperAdmin && (
                <div className="flex flex-col gap-0.5 px-3 py-2"
                    style={{ borderTop: `1px solid ${T.sidebarBorder}` }}>
                    <NavLink to="/support"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-sm transition-all duration-150"
                        style={navStyle}>
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'filled' : ''}`}>contact_support</span>
                                <span>Support</span>
                            </>
                        )}
                    </NavLink>
                </div>
            )}

            {/* ── User footer (unchanged logic) ───────────── */}
            <button
                onClick={() => navigate(isSuperAdmin ? '/platform/profile' : '/settings')}
                onMouseEnter={() => setUserHover(true)}
                onMouseLeave={() => setUserHover(false)}
                className="px-4 py-4 flex items-center gap-3 w-full text-left transition-all duration-150"
                style={{
                    borderTop: `1px solid ${T.sidebarBorder}`,
                    background: userHover ? T.sidebarHover : 'transparent',
                }}>
                {/* Avatar with gradient ring */}
                <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                            background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                            color: '#fff',
                            boxShadow: userHover ? `0 0 0 2px ${T.heroOrb2}` : 'none',
                            transition: 'box-shadow 0.15s',
                        }}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    {/* Online dot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                            background: T.onlineDot,
                            borderColor: T.sidebar,
                        }} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#FFFFFF' }}>{name}</p>
                    <p className="text-[11px] truncate" style={{ color: T.heroSubText }}>
                        {isSuperAdmin ? 'Super Admin' : (companyName ? `${companyName} · ${role}` : role)}
                    </p>
                </div>

                {userHover && (
                    <span className="material-symbols-outlined text-[15px]"
                        style={{ color: T.sidebarText }}>
                        {isSuperAdmin ? 'manage_accounts' : 'settings'}
                    </span>
                )}
            </button>
        </aside>
    )
}