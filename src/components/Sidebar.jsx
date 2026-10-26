import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, NAV_GROUPS } from '../constants/theme'
import { usePermissions } from '../hooks/usePermission'
import api from '../api'

export default function Sidebar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [userHover, setUserHover] = useState(false)
    const [overdue, setOverdue] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    // Collapsible group state with persistence in localStorage
    const [collapsedGroups, setCollapsedGroups] = useState(() => {
        try {
            const saved = localStorage.getItem('crm_sidebar_collapsed')
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    const toggleGroup = (groupId) => {
        setCollapsedGroups(prev => {
            const next = { ...prev, [groupId]: !prev[groupId] }
            try {
                localStorage.setItem('crm_sidebar_collapsed', JSON.stringify(next))
            } catch {}
            return next
        })
    }

    // Auto-close sidebar on mobile route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Auto-expand group if current route is inside a collapsed group
    useEffect(() => {
        const activeGroup = NAV_GROUPS.find(g =>
            g.items.some(item => item.to === pathname || (item.to !== '/' && pathname.startsWith(item.to)))
        )
        if (activeGroup && collapsedGroups[activeGroup.id]) {
            setCollapsedGroups(prev => {
                const next = { ...prev, [activeGroup.id]: false }
                try {
                    localStorage.setItem('crm_sidebar_collapsed', JSON.stringify(next))
                } catch {}
                return next
            })
        }
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
            <div className="px-5 pt-6 pb-4">
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
            <div className="mx-4 mb-2.5" style={{ height: 1, background: T.sidebarHover }} />

            {/* ── Nav ─────────────────────────────────────── */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto scrollbar-thin">

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
                    // CRM users (ADMIN / AGENT) see cleanly grouped navigation
                    <>
                        {/* ── Top Dashboard ── */}
                        <div className="mb-1">
                            <NavLink to="/" end
                                className="flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-150 text-sm"
                                style={navStyle}>
                                {({ isActive }) => (
                                    <>
                                        <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>
                                            dashboard
                                        </span>
                                        <span className="flex-1 font-semibold">Dashboard</span>
                                    </>
                                )}
                            </NavLink>
                        </div>

                        {/* ── Grouped Navigation ── */}
                        {NAV_GROUPS.map(group => {
                            // Check adminOnly group
                            if (group.adminOnly && role === 'AGENT') return null

                            // Filter visible items in group based on user role
                            const visibleItems = group.items.filter(item => {
                                if (role === 'AGENT') {
                                    if (item.adminOnly) return false
                                    if (item.to === '/documents' || item.to === '/de-duplication' || item.to === '/org' || item.to === '/audit-log' || item.to === '/privacy') {
                                        return false
                                    }
                                }
                                return true
                            })

                            if (visibleItems.length === 0) return null

                            const isCollapsed = Boolean(collapsedGroups[group.id])

                            // Calculate any active badges inside this group for collapsed state
                            let groupBadgeCount = 0
                            if (group.id === 'communication') {
                                groupBadgeCount = (overdue > 0 ? overdue : 0) + (unreadChatCount > 0 ? unreadChatCount : 0)
                            }

                            return (
                                <div key={group.id} className="pt-2 pb-0.5">
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors select-none group cursor-pointer hover:bg-white/5"
                                        style={{ color: T.heroSubText }}
                                    >
                                        <span className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                                            {group.label}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {isCollapsed && groupBadgeCount > 0 && (
                                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center"
                                                    style={{ background: '#DC2626', color: '#fff' }}>
                                                    {groupBadgeCount > 99 ? '99+' : groupBadgeCount}
                                                </span>
                                            )}
                                            <span className="material-symbols-outlined text-[14px] transition-transform duration-200"
                                                style={{
                                                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                    color: T.heroSubText,
                                                }}>
                                                expand_more
                                            </span>
                                        </div>
                                    </button>

                                    {!isCollapsed && (
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                            {visibleItems.map(({ to, icon, label }) => (
                                                <NavLink key={to} to={to} end={to === '/'}
                                                    className="flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-150 text-sm"
                                                    style={navStyle}>
                                                    {({ isActive }) => (
                                                        <>
                                                            <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>
                                                                {icon}
                                                            </span>
                                                            <span className="flex-1">{label}</span>
                                                            {to === '/activities' && overdue > 0 && (
                                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4.5 text-center"
                                                                    style={{ background: '#DC2626', color: '#fff' }}>
                                                                    {overdue > 99 ? '99+' : overdue}
                                                                </span>
                                                            )}
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
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </>
                )}
            </nav>

            {/* ── User footer (unchanged logic) ───────────── */}
            <button
                onClick={() => navigate(isSuperAdmin ? '/platform/profile' : '/settings')}
                onMouseEnter={() => setUserHover(true)}
                onMouseLeave={() => setUserHover(false)}
                className="px-4 py-3.5 flex items-center gap-3 w-full text-left transition-all duration-150"
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
