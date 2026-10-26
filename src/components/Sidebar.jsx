import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, NAV_GROUPS } from '../constants/theme'
import { usePermissions } from '../hooks/usePermission'
import api from '../api'

export default function Sidebar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
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
    const displayRole = isSuperAdmin
        ? 'Super Admin'
        : role === 'COMPANY_SUPER_ADMIN'
        ? 'Company Super Admin'
        : role === 'ADMIN'
        ? 'Admin'
        : 'Agent'
    const [openTickets, setOpenTickets] = useState(0)
    const [unreadChatCount, setUnreadChatCount] = useState(0)
    const can = usePermissions(['ACCOUNTS_CREATE'])

    // Listen to sidebar toggle events from TopBar
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

    // Badge polling — Super Admin tickets
    useEffect(() => {
        if (isSuperAdmin) {
            const loadBadge = () =>
                api.get('/api/support/badge')
                    .then(r => setOpenTickets(r.data.myOpenTickets ?? 0))
                    .catch(() => {})
            loadBadge()
            const iv = setInterval(loadBadge, 120000)
            return () => clearInterval(iv)
        }
        api.get('/api/activities/badge')
            .then(r => setOverdue(r.data.overdue ?? 0))
            .catch(() => {})
        const interval = setInterval(() => {
            api.get('/api/activities/badge')
                .then(r => setOverdue(r.data.overdue ?? 0))
                .catch(() => {})
        }, 300000)
        return () => clearInterval(interval)
    }, [isSuperAdmin])

    // Poll chat unread count and listen to chat WebSocket/read receipt events
    useEffect(() => {
        if (isSuperAdmin) return

        const loadChatUnread = () => {
            api.get('/api/chat/messages/unread')
                .then(r => {
                    const map = r.data || {}
                    const total = Object.values(map).reduce((sum, count) => sum + count, 0)
                    setUnreadChatCount(total)
                })
                .catch(() => {})
        }

        loadChatUnread()

        const handleChatMsg = (e) => {
            const msg = e.detail
            if (!msg) return
            loadChatUnread()
        }

        const handleUnreadUpdated = (e) => {
            if (typeof e.detail === 'number') {
                setUnreadChatCount(e.detail)
            }
        }

        window.addEventListener('crm-chat', handleChatMsg)
        window.addEventListener('crm-chat-unread-updated', handleUnreadUpdated)

        return () => {
            window.removeEventListener('crm-chat', handleChatMsg)
            window.removeEventListener('crm-chat-unread-updated', handleUnreadUpdated)
        }
    }, [isSuperAdmin])

    // Shared navigation item renderer for clean consistency
    const renderNavItem = (to, icon, label, badgeCount = 0, badgeColor = 'rose', end = false) => {
        return (
            <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 select-none ${
                        isActive
                            ? 'bg-gradient-to-r from-white/[0.12] to-white/[0.04] text-white font-semibold shadow-xs border border-white/[0.08]'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        {/* Glowing Left Indicator for active item */}
                        {isActive && (
                            <div
                                className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
                                style={{
                                    background: T.primary,
                                    boxShadow: `0 0 10px ${T.primary}`,
                                }}
                            />
                        )}

                        {/* Icon */}
                        <span
                            className={`material-symbols-outlined text-[19px] shrink-0 transition-transform duration-150 ${
                                isActive
                                    ? 'filled scale-105'
                                    : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                            }`}
                            style={{
                                color: isActive ? T.primary : undefined,
                            }}
                        >
                            {icon}
                        </span>

                        {/* Label */}
                        <span className="flex-1 truncate tracking-tight">{label}</span>

                        {/* Notification Badge */}
                        {badgeCount > 0 && (
                            <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4.5 text-center shadow-xs ${
                                    badgeColor === 'emerald'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                                }`}
                            >
                                {badgeCount > 99 ? '99+' : badgeCount}
                            </span>
                        )}
                    </>
                )}
            </NavLink>
        )
    }

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar container */}
            <aside
                className={`crm-sidebar flex flex-col h-screen w-64 fixed left-0 top-0 z-50 select-none transition-transform duration-300 ease-in-out border-r border-white/[0.08] shadow-2xl ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
                style={{ background: T.sidebar }}
            >
                {/* ── Brand / Workspace Header ────────────────────── */}
                <div className="px-4 pt-5 pb-3 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Logo with ambient glow */}
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative ring-1 ring-white/20 shadow-md"
                                style={{
                                    background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                    boxShadow: `0 0 16px ${T.avatarGlow}`,
                                }}
                            >
                                <span className="material-symbols-outlined filled text-white text-[19px]">dataset</span>
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-[15px] font-extrabold tracking-tight text-white leading-tight truncate">
                                    Iinventive CRM
                                </h1>
                            </div>
                        </div>

                        {/* Mobile close button */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Sleek Fading Hairline Divider */}
                <div className="mx-4 my-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent shrink-0" />

                {/* ── Navigation Scroll Area ───────────────────────── */}
                <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto overflow-x-hidden scrollbar-none">
                    {isSuperAdmin ? (
                        // SUPER_ADMIN Navigation
                        <>
                            <div className="px-2 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.09em] text-slate-400/70">
                                Platform Administration
                            </div>
                            {renderNavItem('/platform', 'domain', 'Companies', 0, 'rose', true)}
                            {renderNavItem('/platform/profile', 'manage_accounts', 'My Profile')}
                            {renderNavItem('/platform/tickets', 'support_agent', 'Support Tickets', openTickets, 'rose')}
                        </>
                    ) : (
                        // Standard CRM Navigation (Admin & Agents)
                        <>
                            {/* Executive Summary Anchor: Dashboard */}
                            <div className="mb-1">
                                {renderNavItem('/', 'dashboard', 'Dashboard', 0, 'rose', true)}
                            </div>

                            {/* Grouped Navigation Sections */}
                            {NAV_GROUPS.map((group, index) => {
                                if (group.adminOnly && role === 'AGENT') return null

                                const visibleItems = group.items.filter(item => {
                                    if (role === 'AGENT') {
                                        if (item.adminOnly) return false
                                        if (
                                            item.to === '/documents' ||
                                            item.to === '/de-duplication' ||
                                            item.to === '/org' ||
                                            item.to === '/audit-log' ||
                                            item.to === '/privacy'
                                        ) {
                                            return false
                                        }
                                    }
                                    return true
                                })

                                if (visibleItems.length === 0) return null

                                const isCollapsed = Boolean(collapsedGroups[group.id])

                                // Badge count bubbling for collapsed state
                                let groupBadgeCount = 0
                                if (group.id === 'communication') {
                                    groupBadgeCount = (overdue > 0 ? overdue : 0) + (unreadChatCount > 0 ? unreadChatCount : 0)
                                }

                                return (
                                    <div
                                        key={group.id}
                                        className={index > 0 ? 'pt-2 mt-1 border-t border-white/[0.04]' : 'pt-1'}
                                    >
                                        {/* Category Collapsible Header */}
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(group.id)}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.09em] transition-all select-none group cursor-pointer text-slate-400/70 hover:text-slate-200 hover:bg-white/[0.04]"
                                        >
                                            <span className="flex items-center gap-1.5 truncate">
                                                {group.label}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isCollapsed && groupBadgeCount > 0 && (
                                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs">
                                                        {groupBadgeCount > 99 ? '99+' : groupBadgeCount}
                                                    </span>
                                                )}
                                                <span
                                                    className="material-symbols-outlined text-[15px] transition-transform duration-200 text-slate-500 group-hover:text-slate-300"
                                                    style={{
                                                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                    }}
                                                >
                                                    expand_more
                                                </span>
                                            </div>
                                        </button>

                                        {/* Category Items */}
                                        {!isCollapsed && (
                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                {visibleItems.map(({ to, icon, label }) => {
                                                    let badge = 0
                                                    let badgeColor = 'rose'
                                                    if (to === '/activities' && overdue > 0) {
                                                        badge = overdue
                                                        badgeColor = 'rose'
                                                    } else if (to === '/chat' && unreadChatCount > 0) {
                                                        badge = unreadChatCount
                                                        badgeColor = 'emerald'
                                                    }
                                                    return renderNavItem(to, icon, label, badge, badgeColor)
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </nav>

                {/* ── User Profile Footer Card ────────────────────── */}
                <div className="p-3 shrink-0 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={() => navigate(isSuperAdmin ? '/platform/profile' : '/settings')}
                        className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 text-left group shadow-sm cursor-pointer"
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white ring-1 ring-white/10 shadow-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                }}
                            >
                                {name ? name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {/* Online Status Dot */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1A1E2A]" />
                        </div>

                        {/* User Meta */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-white truncate leading-tight group-hover:text-orange-300 transition-colors">
                                {name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                                {isSuperAdmin
                                    ? 'Super Admin'
                                    : companyName
                                    ? `${companyName} · ${displayRole}`
                                    : displayRole}
                            </p>
                        </div>

                        {/* Action Icon */}
                        <span className="material-symbols-outlined text-[17px] text-slate-500 group-hover:text-slate-200 group-hover:rotate-45 transition-all duration-200 shrink-0">
                            {isSuperAdmin ? 'manage_accounts' : 'settings'}
                        </span>
                    </button>
                </div>
            </aside>
        </>
    )
}
