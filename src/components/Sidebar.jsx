import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, NAV_LINKS } from '../constants/theme'
import { usePermissions } from '../hooks/usePermission'
import api from '../api'

export default function Sidebar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [userHover, setUserHover] = useState(false)
    const [overdue, setOverdue] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    // Auto-close sidebar on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const { userId, name, role, companyName } = useSelector(state => state.auth)
    const isSuperAdmin = role === 'SUPER_ADMIN'
    const displayRole = isSuperAdmin ? 'Super Admin' : role === 'COMPANY_SUPER_ADMIN' ? 'Company Super Admin' : role === 'ADMIN' ? 'Admin' : 'Agent'
    const [openTickets, setOpenTickets] = useState(0)
    const [unreadChatCount, setUnreadChatCount] = useState(0)
    const can = usePermissions(['ACCOUNTS_CREATE'])

    // Listen to sidebar toggle events
    useEffect(() => {
        const handleToggle = () => setIsOpen(open => !open)
        const handleClose = () => setIsOpen(false)
        window.addEventListener('crm-toggle-sidebar', handleToggle)
        window.addEventListener('crm-close-sidebar', handleClose)
        return () => {
            window.removeEventListener('crm-toggle-sidebar', handleToggle)
            window.removeEventListener('crm-close-sidebar', handleClose)
        }
    }, [])

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

    // Poll chat unread count and listen to chat WebSocket/read receipt events
    useEffect(() => {
        if (isSuperAdmin) return;

        const loadChatUnread = () => {
            api.get('/api/chat/messages/unread')
                .then(r => {
                    const map = r.data || {};
                    const total = Object.values(map).reduce((sum, count) => sum + count, 0);
                    setUnreadChatCount(total);
                })
                .catch(() => {});
        };

        loadChatUnread();

        const handleChatMsg = (e) => {
            const msg = e.detail;
            if (!msg) return;
            // Re-fetch to get accurate unread count from server
            loadChatUnread();
        };

        const handleUnreadUpdated = (e) => {
            if (typeof e.detail === 'number') {
                setUnreadChatCount(e.detail);
            }
        };

        window.addEventListener('crm-chat', handleChatMsg);
        window.addEventListener('crm-chat-unread-updated', handleUnreadUpdated);

        return () => {
            window.removeEventListener('crm-chat', handleChatMsg);
            window.removeEventListener('crm-chat-unread-updated', handleUnreadUpdated);
        };
    }, [isSuperAdmin]);

    // Shared NavLink style factory
    const navStyle = ({ isActive }) => ({
        background: isActive ? T.sidebarHover : 'transparent',
        color: isActive ? '#DBEAFE' : T.sidebarText,
        fontWeight: isActive ? 700 : 500,
        borderLeft: isActive ? `3px solid ${T.sidebarActiveText}` : '3px solid transparent',
    })

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside className={`crm-sidebar flex flex-col h-screen w-64 fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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

                        {NAV_LINKS.filter(({ to }) => !(role === 'AGENT' && (to === '/documents' || to === '/de-duplication' || to === '/org'))).map(({ to, icon, label }) => (
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
                                        {/* Unread badge on Chat */}
                                        {to === '/chat' && unreadChatCount > 0 && (
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4.5 text-center"
                                                style={{ background: '#DC2626', color: '#fff' }}>
                                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>



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

                    {/* Audit Log — ADMIN and COMPANY_SUPER_ADMIN */}
                    {(role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN') && (
                        <>
                            <NavLink to="/audit-log"
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-sm transition-all duration-150"
                                style={navStyle}>
                                {({ isActive }) => (
                                    <>
                                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'filled' : ''}`}>history</span>
                                        <span>Audit Log</span>
                                    </>
                                )}
                            </NavLink>
                            <NavLink to="/privacy"
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-sm transition-all duration-150"
                                style={navStyle}>
                                {({ isActive }) => (
                                    <>
                                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'filled' : ''}`}>privacy_tip</span>
                                        <span>Privacy & Compliance</span>
                                    </>
                                )}
                            </NavLink>
                        </>
                    )}
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
                        {isSuperAdmin ? 'Super Admin' : (companyName ? `${companyName} · ${displayRole}` : displayRole)}
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
        </>
    )
}