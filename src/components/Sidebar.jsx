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

    useEffect(() => {
        // SUPER_ADMIN has no activities — skip badge polling
        if (isSuperAdmin) return
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

    return (
        <aside className="crm-sidebar flex flex-col h-screen w-64 fixed left-0 top-0 z-50"
            style={{ background: T.sidebar }}
        >
            {/* Logo */}
            <div className="px-6 pt-7 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: T.primary }}>
                        <span className="material-symbols-outlined filled text-white text-[18px]">dataset</span>
                    </div>
                    <div>
                        <h1 className="text-[16px] font-black leading-tight" style={{ color: T.textInverse }}>Inventive CRM</h1>
                        <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: T.sidebarText }}>
                            {isSuperAdmin ? 'Platform Admin' : 'Enterprise Edition'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">

                {isSuperAdmin ? (
                    // ── SUPER_ADMIN sees ONLY platform nav ──
                    <>
                        <p className="px-4 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest"
                            style={{ color: T.sidebarText + '80' }}>Platform</p>

                        <NavLink to="/platform" end
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                            style={({ isActive }) => ({
                                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                                color: isActive ? '#FFFFFF' : T.sidebarText,
                                fontWeight: isActive ? 700 : 500,
                            })}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>domain</span>
                                    <span className="flex-1">Companies</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/platform/profile"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                            style={({ isActive }) => ({
                                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                                color: isActive ? '#FFFFFF' : T.sidebarText,
                                fontWeight: isActive ? 700 : 500,
                            })}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>manage_accounts</span>
                                    <span className="flex-1">My Profile</span>
                                </>
                            )}
                        </NavLink>
                    </>
                ) : (
                    // ── CRM users (ADMIN / AGENT) see CRM nav ──
                    <>
                        {NAV_LINKS.map(({ to, icon, label }) => (
                            <NavLink key={to} to={to} end={to === '/'}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm"
                                style={({ isActive }) => ({
                                    background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                                    color: isActive ? '#FFFFFF' : T.sidebarText,
                                    fontWeight: isActive ? 700 : 500,
                                })}>
                                {({ isActive }) => (
                                    <>
                                        <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>{icon}</span>
                                        <span className="flex-1">{label}</span>
                                        {/* Overdue badge on Activities */}
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

            {/* Create New — only for CRM users */}
            {!isSuperAdmin && (
                <div className="px-4 py-4">
                    <button onClick={() => navigate('/accounts')}
                        className="crm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl text-sm">
                        <span className="material-symbols-outlined text-[17px]">add_circle</span>
                        Create New
                    </button>
                </div>
            )}

            {/* Support — only for CRM users */}
            {/* Support — only for CRM users */}
            {!isSuperAdmin && (
                <div className="flex flex-col gap-0.5 px-3 py-3" style={{ borderTop: `1px solid ${T.sidebarBorder}` }}>
                    <NavLink to="/support"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-sm transition-colors"
                        style={({ isActive }) => ({
                            background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                            color: isActive ? '#FFFFFF' : T.sidebarText,
                            fontWeight: isActive ? 700 : 500,
                        })}>
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'filled' : ''}`}>contact_support</span>
                                <span>Support</span>
                            </>
                        )}
                    </NavLink>
                </div>
            )}

            {/* User footer */}
            <button
                onClick={() => navigate(isSuperAdmin ? '/platform/profile' : '/settings')}
                onMouseEnter={() => setUserHover(true)}
                onMouseLeave={() => setUserHover(false)}
                className="px-4 py-4 flex items-center gap-3 w-full text-left transition-colors"
                style={{ borderTop: `1px solid ${T.sidebarBorder}`, background: userHover ? T.sidebarHover : 'transparent' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: T.primary, color: T.textInverse }}>
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: T.textInverse }}>{name}</p>
                    <p className="text-[11px]" style={{ color: T.sidebarText }}>
                        {isSuperAdmin ? 'Super Admin' : (companyName ? `${companyName} · ${role}` : role)}
                    </p>
                </div>
                {userHover && (
                    <span className="material-symbols-outlined text-[15px]" style={{ color: T.sidebarText }}>
                        {isSuperAdmin ? 'manage_accounts' : 'settings'}
                    </span>
                )}
            </button>
        </aside>
    )
}