import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import api from '../../../api'
import { T, STAGE_STYLES } from '../../../constants/theme'
import { fmtPipeline, getInitials } from './OrgNodeCard'
import AssignDealModal from '../../deals/AssignDealModal'
import AssignLeadModal from '../../leadPanel/AssignLeadModal'
import { getArchetypeConfig } from '../../../constants/archetypes'

const ROLE_TAGS = {
    COMPANY_SUPER_ADMIN: {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
        border: 'rgba(245, 158, 11, 0.40)',
        label: '👑 SUPER ADMIN',
    },
    ADMIN: {
        bg: 'rgba(124, 58, 237, 0.12)',
        color: '#7C3AED',
        border: 'rgba(124, 58, 237, 0.28)',
        label: 'ADMIN',
    },
    AGENT: {
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10B981',
        border: 'rgba(16, 185, 129, 0.28)',
        label: 'AGENT',
    },
    SUPER_ADMIN: {
        bg: 'rgba(139, 92, 246, 0.15)',
        color: '#8B5CF6',
        border: 'rgba(139, 92, 246, 0.32)',
        label: 'SUPER ADMIN',
    },
}

/**
 * Toast feedback helper that triggers both react-hot-toast and internal CRM event-based toasts.
 */
function notifySuccess(title, body) {
    const text = body ? `${title}: ${body}` : title
    if (typeof toast !== 'undefined' && toast?.success) {
        toast.success(text)
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm-notification', {
            detail: {
                title,
                body: body || title,
                type: 'TICKET_RESOLVED', // Displays green check icon in WebSocketToast
            },
        }))
    }
}

function notifyError(message) {
    if (typeof toast !== 'undefined' && toast?.error) {
        toast.error(message)
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm-api-error', {
            detail: {
                message,
                status: 400,
            },
        }))
    }
}

/**
 * AgentDetailsDrawer slides out from the right when an agent node is clicked on the Org Chart.
 * Provides micro-metrics, team roll-up summary, 3 segmented tabs (Deals, Leads, Direct Reports),
 * 1-click Revoke actions, Reassign modal reuse, Quick-reassign manager with cycle detection,
 * and reactive org chart refresh without full page reloads.
 */
export default function AgentDetailsDrawer({
    agent,
    isOpen = Boolean(agent),
    onClose,
    onRefreshChart,
    onSelectAgent,
    onNavigateProfile,
}) {
    const userRole = useSelector(state => state.auth?.role)
    const currentUserId = useSelector(state => state.auth?.userId || state.auth?.id)
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_SUPER_ADMIN'

    const isPlatformSuperAdmin = userRole === 'SUPER_ADMIN'
    const isCompanySuperAdmin = userRole === 'COMPANY_SUPER_ADMIN'
    const isRegularAdmin = userRole === 'ADMIN'

    // Supervisory authority matrix:
    // COMPANY_SUPER_ADMIN can manage both ADMINs and AGENTs.
    // Regular ADMIN can only manage AGENTs (read-only for peer ADMINs or COMPANY_SUPER_ADMIN).
    const canManageAgent = (() => {
        if (isPlatformSuperAdmin || isCompanySuperAdmin) {
            return true
        }
        if (isRegularAdmin) {
            // Read-only when inspecting superiors
            if (agent?.role === 'COMPANY_SUPER_ADMIN' || agent?.role === 'SUPER_ADMIN') {
                return false
            }
            // Read-only when inspecting peer ADMINs (unless inspecting own node)
            if (agent?.role === 'ADMIN') {
                const isSelf = currentUserId && String(agent?.id) === String(currentUserId)
                return Boolean(isSelf)
            }
            // Can manage AGENTs
            return true
        }
        return false
    })()

    const [activeTab, setActiveTab] = useState('deals') // 'deals' | 'leads' | 'reports'

    // Tab 1: Deals state
    const [deals, setDeals] = useState([])
    const [loadingDeals, setLoadingDeals] = useState(true)
    const [dealError, setDealError] = useState(null)
    const [revokingDealIds, setRevokingDealIds] = useState(new Set())
    const [reassignDealTarget, setReassignDealTarget] = useState(null)

    // Tab 2: Leads state
    const [leads, setLeads] = useState([])
    const [loadingLeads, setLoadingLeads] = useState(true)
    const [leadError, setLeadError] = useState(null)
    const [revokingLeadIds, setRevokingLeadIds] = useState(new Set())
    const [reassignLeadTarget, setReassignLeadTarget] = useState(null)

    // Tab 3: Direct Reports state
    const [companyUsers, setCompanyUsers] = useState([])
    const [reassigningSubId, setReassigningSubId] = useState(null)
    const [subErrors, setSubErrors] = useState({}) // { [subordinateId]: errorMessage }

    const agentId = agent?.id

    // ── Body Scroll Lock & Esc Key ─────────────────────────────
    useEffect(() => {
        if (!isOpen) return
        const origOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = origOverflow
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // ── Fetch Deals callback (for manual re-fetch after actions)
    const fetchDeals = useCallback(async () => {
        if (!agentId) return
        setLoadingDeals(true)
        setDealError(null)
        try {
            const res = await api.get(`/api/dashboard/org-chart/node/${agentId}/deals`)
            setDeals(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error('Failed to load agent deals:', err)
            setDealError(err?.response?.data?.message || 'Failed to load active deals.')
        } finally {
            setLoadingDeals(false)
        }
    }, [agentId])

    // ── Fetch Leads callback (for manual re-fetch after actions)
    const fetchLeads = useCallback(async () => {
        if (!agentId) return
        setLoadingLeads(true)
        setLeadError(null)
        try {
            const res = await api.get(`/api/dashboard/org-chart/node/${agentId}/leads`)
            setLeads(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error('Failed to load agent leads:', err)
            setLeadError(err?.response?.data?.message || 'Failed to load active leads.')
        } finally {
            setLoadingLeads(false)
        }
    }, [agentId])

    // ── Fetch Company Users for Manager Dropdown ───────────────
    useEffect(() => {
        let mounted = true
        api.get('/api/management/users')
            .then(res => {
                if (mounted && Array.isArray(res.data)) {
                    setCompanyUsers(res.data.filter(u => u.active !== false))
                }
            })
            .catch(err => {
                console.error('Failed to load company users directory:', err)
            })
        return () => { mounted = false }
    }, [])

    // Asynchronously fetch deals and leads whenever agentId or isOpen changes
    useEffect(() => {
        if (!agentId || !isOpen) return
        let mounted = true

        api.get(`/api/dashboard/org-chart/node/${agentId}/deals`)
            .then(res => {
                if (mounted) {
                    setDeals(Array.isArray(res.data) ? res.data : [])
                    setDealError(null)
                }
            })
            .catch(err => {
                if (mounted) {
                    setDealError(err?.response?.data?.message || 'Failed to load active deals.')
                }
            })
            .finally(() => {
                if (mounted) setLoadingDeals(false)
            })

        api.get(`/api/dashboard/org-chart/node/${agentId}/leads`)
            .then(res => {
                if (mounted) {
                    setLeads(Array.isArray(res.data) ? res.data : [])
                    setLeadError(null)
                }
            })
            .catch(err => {
                if (mounted) {
                    setLeadError(err?.response?.data?.message || 'Failed to load active leads.')
                }
            })
            .finally(() => {
                if (mounted) setLoadingLeads(false)
            })

        return () => {
            mounted = false
        }
    }, [agentId, isOpen])

    // ── 1-Click Revoke Deal ────────────────────────────────────
    const handleRevokeDeal = async (deal) => {
        if (!canManageAgent) return
        setRevokingDealIds(prev => new Set(prev).add(deal.id))
        try {
            const remainingUserIds = (deal.assignees || [])
                .map(u => u.id)
                .filter(uid => uid !== agent.id)

            await api.post(`/api/deals/${deal.id}/assign`, { userIds: remainingUserIds })

            notifySuccess(
                'Deal Revoked',
                `Removed ${agent.name} from "${deal.title}"`
            )

            // Optimistic removal from list
            setDeals(prev => prev.filter(d => d.id !== deal.id))

            // Trigger reactive org chart tree refresh
            if (typeof onRefreshChart === 'function') {
                onRefreshChart()
            }
        } catch (err) {
            console.error('Failed to revoke deal assignment:', err)
            notifyError(err?.response?.data?.message || 'Failed to revoke deal assignment.')
        } finally {
            setRevokingDealIds(prev => {
                const next = new Set(prev)
                next.delete(deal.id)
                return next
            })
        }
    }

    // ── 1-Click Revoke Lead ────────────────────────────────────
    const handleRevokeLead = async (lead) => {
        if (!canManageAgent) return
        setRevokingLeadIds(prev => new Set(prev).add(lead.id))
        try {
            const remainingUserIds = (lead.assignees || [])
                .map(u => u.id)
                .filter(uid => uid !== agent.id)

            await api.post(`/api/leads/${lead.id}/assign`, { userIds: remainingUserIds })

            notifySuccess(
                'Lead Revoked',
                `Removed ${agent.name} from "${lead.name}"`
            )

            // Optimistic removal from list
            setLeads(prev => prev.filter(l => l.id !== lead.id))

            // Trigger reactive org chart tree refresh
            if (typeof onRefreshChart === 'function') {
                onRefreshChart()
            }
        } catch (err) {
            console.error('Failed to revoke lead assignment:', err)
            notifyError(err?.response?.data?.message || 'Failed to revoke lead assignment.')
        } finally {
            setRevokingLeadIds(prev => {
                const next = new Set(prev)
                next.delete(lead.id)
                return next
            })
        }
    }

    // ── Subtree Descendant Collector for Client Cycle Prevention
    const getSubtreeUserIds = useCallback((node) => {
        const ids = new Set([node.id])
        function dfs(n) {
            if (Array.isArray(n?.directReports)) {
                for (const child of n.directReports) {
                    ids.add(child.id)
                    dfs(child)
                }
            }
        }
        dfs(node)
        return ids
    }, [])

    // ── Quick-Reassign Subordinate Manager ─────────────────────
    const handleReassignSubordinateManager = async (subordinate, newManagerValue) => {
        if (!canManageAgent) return
        const newManagerId = (!newManagerValue || newManagerValue === 'NONE')
            ? null
            : Number(newManagerValue)

        // No-op if unchanged
        if (newManagerId === agent.id) return

        const targetManager = companyUsers.find(u => u.id === newManagerId)
        const targetManagerName = targetManager ? targetManager.name : 'Top-Level Root Leader'

        setReassigningSubId(subordinate.id)
        setSubErrors(prev => ({ ...prev, [subordinate.id]: null }))

        try {
            await api.put(`/api/management/users/${subordinate.id}/manager`, {
                managerId: newManagerId,
            }, { suppressErrorToast: true })

            notifySuccess(
                'Reporting Line Updated',
                newManagerId
                    ? `${subordinate.name} now reports to ${targetManagerName}.`
                    : `${subordinate.name} is now a top-level root leader.`
            )

            // Reactively refresh org chart tree
            if (typeof onRefreshChart === 'function') {
                await onRefreshChart()
            }
        } catch (err) {
            const serverMsg = err?.response?.data?.message || err?.message || 'Failed to reassign manager.'
            const isCycle = err?.response?.status === 400 && (
                serverMsg.toLowerCase().includes('cycle') ||
                serverMsg.toLowerCase().includes('loop') ||
                serverMsg.toLowerCase().includes('own manager')
            )
            const formattedError = isCycle
                ? `Hierarchy cycle detected: ${subordinate.name} cannot report to ${targetManagerName}. (${serverMsg})`
                : serverMsg

            notifyError(formattedError)
            setSubErrors(prev => ({ ...prev, [subordinate.id]: formattedError }))
        } finally {
            setReassigningSubId(null)
        }
    }

    if (!isOpen || !agent) return null

    const personal = agent.personalMetrics || {}
    const team = agent.teamMetrics || {}
    const directReports = Array.isArray(agent.directReports) ? agent.directReports : []

    const roleStyle = ROLE_TAGS[agent.role] || {
        bg: T.primaryDim,
        color: T.primaryText,
        border: `${T.primary}30`,
        label: agent.role || 'AGENT',
    }

    const avatarGradient = agent.role === 'COMPANY_SUPER_ADMIN'
        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
        : agent.role === 'ADMIN'
            ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
            : agent.role === 'SUPER_ADMIN'
                ? 'linear-gradient(135deg, #8B5CF6, #C4B5FD)'
                : 'linear-gradient(135deg, #10B981, #059669)'

    const isOnline = agent.active !== false

    return (
        <>
            {/* Slide-in CSS Animation Keyframes */}
            <style>{`
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>

            {/* Dark Blurred Backdrop */}
            <div
                className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-200 cursor-pointer"
                style={{ background: 'rgba(10, 22, 40, 0.55)' }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-Over Drawer Container (540px width) */}
            <aside
                className="fixed right-0 top-0 h-full w-full sm:w-[540px] z-50 flex flex-col shadow-2xl transition-all"
                style={{
                    background: T.surface,
                    borderLeft: `1px solid ${T.border}`,
                    animation: 'slideInFromRight 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
                role="dialog"
                aria-modal="true"
                aria-label={`${agent.name} Details`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Fixed Drawer Header ─────────────────────────── */}
                <div
                    className="p-5 flex flex-col gap-4 shrink-0"
                    style={{
                        background: T.surface,
                        borderBottom: `1px solid ${T.borderSubtle}`,
                    }}
                >
                    {/* Top Action Row: Navigation & Close Buttons */}
                    <div className="flex items-center justify-between">
                        {/* Reports-to Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold truncate" style={{ color: T.textMuted }}>
                            <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>
                                account_tree
                            </span>
                            {agent.managerName ? (
                                <span className="truncate">
                                    Reports to: <strong style={{ color: T.textPrimary }}>{agent.managerName}</strong>
                                </span>
                            ) : (
                                <span className="font-bold text-emerald-600">
                                    Top-Level Root Leader
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Optional View Full Profile Link */}
                            {typeof onNavigateProfile === 'function' && (
                                <button
                                    type="button"
                                    onClick={() => onNavigateProfile(agent.id)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
                                    style={{
                                        background: T.primaryFaint,
                                        color: T.primaryText,
                                        border: `1px solid ${T.primary}25`,
                                    }}
                                    title="View full teammate page"
                                >
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    <span>View Profile</span>
                                </button>
                            )}

                            {/* Close Button (X) */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-75 transition-opacity cursor-pointer"
                                style={{
                                    background: T.surfaceRaised,
                                    border: `1px solid ${T.borderSubtle}`,
                                    color: T.textMuted,
                                }}
                                title="Close drawer (Esc)"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Agent Identity: Avatar, Name, Designation, Role, Email */}
                    <div className="flex items-start gap-3.5 min-w-0">
                        {/* 52px Avatar with Initials & Live Online Dot */}
                        <div className="relative shrink-0">
                            <div
                                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center font-black text-base shadow-md"
                                style={{
                                    background: avatarGradient,
                                    color: '#FFFFFF',
                                }}
                            >
                                {getInitials(agent.name)}
                            </div>
                            <span
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                                style={{
                                    background: isOnline ? '#22C55E' : '#94A3B8',
                                    borderColor: T.surface,
                                }}
                                title={isOnline ? 'Active' : 'Offline'}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-lg truncate leading-tight" style={{ color: T.textPrimary }}>
                                    {agent.name}
                                </h3>
                                {/* System Role Tag */}
                                <span
                                    className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0"
                                    style={{
                                        background: roleStyle.bg,
                                        color: roleStyle.color,
                                        border: `1px solid ${roleStyle.border}`,
                                    }}
                                >
                                    {roleStyle.label}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {/* Dynamic Designation Badge */}
                                <span
                                    className="px-2 py-0.5 rounded-lg text-xs font-semibold truncate max-w-[200px]"
                                    style={{
                                        background: T.primaryFaint,
                                        color: T.textSecondary,
                                        border: `1px solid ${T.borderSubtle}`,
                                    }}
                                    title={agent.designation || 'Team Member'}
                                >
                                    {agent.designation || 'Team Member'}
                                </span>

                                {/* Email Address */}
                                <a
                                    href={`mailto:${agent.email}`}
                                    className="text-xs truncate hover:underline flex items-center gap-1"
                                    style={{ color: T.textMuted }}
                                >
                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                    <span>{agent.email}</span>
                                </a>
                            </div>

                            {/* Archetype & Scope Indicator Pill */}
                            {(() => {
                                const arch = getArchetypeConfig(agent.archetype, agent.role, directReports.length > 0)
                                return (
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                            style={{
                                                background: arch.bg,
                                                color: arch.color,
                                                border: `1px solid ${arch.border}`,
                                            }}
                                            title={arch.description}
                                        >
                                            <span>{arch.emoji}</span>
                                            <span>{arch.label}</span>
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                            style={{
                                                background: T.surfaceRaised,
                                                color: T.textSecondary,
                                                border: `1px solid ${T.borderSubtle}`,
                                            }}
                                            title={`Data Scope: ${arch.scopeLabel}`}
                                        >
                                            <span className="material-symbols-outlined text-[13px]" style={{ color: arch.color }}>visibility</span>
                                            <span>{arch.scopeLabel}</span>
                                        </span>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>

                    {/* Micro-Metrics Grid Strip (4 Metrics) */}
                    <div
                        className="grid grid-cols-4 gap-2 p-3 rounded-2xl"
                        style={{
                            background: T.surfaceRaised,
                            border: `1px solid ${T.borderSubtle}`,
                        }}
                    >
                        {/* Deals Leading */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                Deals Leading
                            </span>
                            <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                {personal.dealsLeadingCount || 0}
                            </span>
                            <span className="text-[11px] font-bold truncate text-emerald-600">
                                {fmtPipeline(personal.pipelineValue || 0)}
                            </span>
                        </div>

                        {/* Deals Won */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                Deals Won
                            </span>
                            <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                {personal.dealsWonCount || 0}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600">
                                Won
                            </span>
                        </div>

                        {/* Leads Leading */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                Leads Leading
                            </span>
                            <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                {personal.leadsLeadingCount || 0}
                            </span>
                            <span className="text-[10px] font-semibold" style={{ color: T.textMuted }}>
                                Active
                            </span>
                        </div>

                        {/* Completed Activities */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                Activities
                            </span>
                            <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                {personal.completedActivitiesCount || 0}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600">
                                Done
                            </span>
                        </div>
                    </div>

                    {/* Team Roll-up Banner for Managers */}
                    {team && team.teamMembersCount > 0 && (
                        <div
                            className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold"
                            style={{
                                background: 'rgba(234, 88, 12, 0.08)',
                                border: '1px solid rgba(234, 88, 12, 0.22)',
                                color: T.textSecondary,
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>
                                    groups
                                </span>
                                <span>Team Roll-up:</span>
                                <span style={{ color: T.primary }}>{team.teamMembersCount} members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>·</span>
                                <span>{team.teamDealsLeadingCount || 0} Deals</span>
                                <span className="text-emerald-600 font-black">
                                    ({fmtPipeline(team.teamPipelineValue || 0)})
                                </span>
                                <span>·</span>
                                <span>{team.teamLeadsLeadingCount || 0} Leads</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 3 Segmented Tabs Header ──────────────────────── */}
                <div
                    className="flex items-center gap-1.5 p-1.5 mx-5 mt-3 rounded-2xl shrink-0"
                    style={{
                        background: T.surfaceRaised,
                        border: `1px solid ${T.borderSubtle}`,
                    }}
                >
                    {/* Tab 1: Deals */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('deals')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                        style={{
                            background: activeTab === 'deals' ? T.primary : 'transparent',
                            color: activeTab === 'deals' ? '#FFFFFF' : T.textSecondary,
                            boxShadow: activeTab === 'deals' ? `0 2px 8px ${T.primary}33` : 'none',
                        }}
                    >
                        <span>💼 Deals</span>
                        <span
                            className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
                            style={{
                                background: activeTab === 'deals' ? 'rgba(255,255,255,0.25)' : T.surface,
                                color: activeTab === 'deals' ? '#FFFFFF' : T.textPrimary,
                            }}
                        >
                            {loadingDeals ? '…' : deals.length}
                        </span>
                    </button>

                    {/* Tab 2: Leads */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('leads')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                        style={{
                            background: activeTab === 'leads' ? T.primary : 'transparent',
                            color: activeTab === 'leads' ? '#FFFFFF' : T.textSecondary,
                            boxShadow: activeTab === 'leads' ? `0 2px 8px ${T.primary}33` : 'none',
                        }}
                    >
                        <span>🎯 Leads</span>
                        <span
                            className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
                            style={{
                                background: activeTab === 'leads' ? 'rgba(255,255,255,0.25)' : T.surface,
                                color: activeTab === 'leads' ? '#FFFFFF' : T.textPrimary,
                            }}
                        >
                            {loadingLeads ? '…' : leads.length}
                        </span>
                    </button>

                    {/* Tab 3: Direct Reports */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('reports')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                        style={{
                            background: activeTab === 'reports' ? T.primary : 'transparent',
                            color: activeTab === 'reports' ? '#FFFFFF' : T.textSecondary,
                            boxShadow: activeTab === 'reports' ? `0 2px 8px ${T.primary}33` : 'none',
                        }}
                    >
                        <span>👥 Reports</span>
                        <span
                            className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
                            style={{
                                background: activeTab === 'reports' ? 'rgba(255,255,255,0.25)' : T.surface,
                                color: activeTab === 'reports' ? '#FFFFFF' : T.textPrimary,
                            }}
                        >
                            {directReports.length}
                        </span>
                    </button>
                </div>

                {/* ── Scrollable Tab Body ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                    {/* TAB 1: DEALS */}
                    {activeTab === 'deals' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1 mb-1">
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                    Active Deals ({deals.length})
                                </span>
                                <span className="text-[11px]" style={{ color: T.textMuted }}>
                                    1-Click Revoke & Reassign
                                </span>
                            </div>

                            {loadingDeals ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-3xl animate-spin" style={{ color: T.primary }}>
                                        progress_activity
                                    </span>
                                    <p className="text-xs font-semibold" style={{ color: T.textMuted }}>
                                        Loading active deals...
                                    </p>
                                </div>
                            ) : dealError ? (
                                <div
                                    className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2"
                                    style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.20)' }}
                                >
                                    <p className="text-xs font-bold text-red-500">{dealError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchDeals}
                                        className="text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer"
                                        style={{ background: T.primary, color: '#fff' }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : deals.length === 0 ? (
                                <div
                                    className="py-12 px-6 flex flex-col items-center justify-center text-center rounded-2xl"
                                    style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                                        style={{ background: T.primaryFaint, border: `1px solid ${T.primary}20` }}
                                    >
                                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>
                                            work_off
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>
                                        No Active Deals
                                    </h4>
                                    <p className="text-xs max-w-xs mt-1" style={{ color: T.textMuted }}>
                                        {agent.name} has no active deals owned or assigned at this time.
                                    </p>
                                </div>
                            ) : (
                                deals.map(deal => {
                                    const isRevoking = revokingDealIds.has(deal.id)
                                    const stageStyle = STAGE_STYLES[deal.stage?.toUpperCase()] || {
                                        badgeBg: 'rgba(234, 88, 12, 0.12)',
                                        badgeColor: '#EA580C',
                                    }
                                    const isOwner = deal.ownershipRole === 'OWNER'

                                    return (
                                        <div
                                            key={deal.id}
                                            className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
                                            style={{
                                                background: T.surface,
                                                border: `1px solid ${T.border}`,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                            }}
                                        >
                                            {/* Deal Title + Stage + Ownership Badge */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h5
                                                        className="font-extrabold text-sm truncate"
                                                        style={{ color: T.textPrimary }}
                                                        title={deal.title}
                                                    >
                                                        {deal.title}
                                                    </h5>
                                                    {(deal.contactName || deal.accountName) && (
                                                        <p className="text-xs mt-0.5 truncate flex items-center gap-1" style={{ color: T.textMuted }}>
                                                            <span className="material-symbols-outlined text-[14px]">business</span>
                                                            <span>
                                                                {[deal.contactName, deal.accountName].filter(Boolean).join(' · ')}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {/* Stage Badge */}
                                                    <span
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                                                        style={{
                                                            background: stageStyle.badgeBg,
                                                            color: stageStyle.badgeColor,
                                                        }}
                                                    >
                                                        {deal.stage || 'NEW'}
                                                    </span>

                                                    {/* Ownership Badge */}
                                                    {isOwner ? (
                                                        <span
                                                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                                                            style={{
                                                                background: 'rgba(245, 158, 11, 0.15)',
                                                                color: '#D97706',
                                                                border: '1px solid rgba(245, 158, 11, 0.28)',
                                                            }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            OWNER
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                                                            style={{
                                                                background: 'rgba(37, 99, 235, 0.12)',
                                                                color: '#2563EB',
                                                                border: '1px solid rgba(37, 99, 235, 0.24)',
                                                            }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            ASSIGNEE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Value & Assignees Preview */}
                                            <div
                                                className="flex items-center justify-between p-2.5 rounded-xl text-xs"
                                                style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                                        Value:
                                                    </span>
                                                    <span className="font-black text-emerald-600 text-sm">
                                                        ₹{Number(deal.amount || 0).toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 text-[11px] font-semibold truncate max-w-[220px]" style={{ color: T.textSecondary }}>
                                                    <span className="material-symbols-outlined text-[14px]">groups</span>
                                                    <span className="truncate">
                                                        {deal.assignees?.map(u => u.name).join(', ') || 'No assignees'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons: Revoke & Reassign */}
                                            {canManageAgent && (
                                                <div className="flex items-center justify-end gap-2 pt-1 border-t" style={{ borderColor: T.borderSubtle }}>
                                                    {/* 1-Click Revoke Button */}
                                                    <button
                                                        type="button"
                                                        disabled={isRevoking}
                                                        onClick={() => handleRevokeDeal(deal)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 hover:opacity-85"
                                                        style={{
                                                            background: T.errorDim,
                                                            color: T.error,
                                                            border: `1px solid ${T.error}25`,
                                                        }}
                                                        title={`Remove ${agent.name} from this deal`}
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                                        <span>{isRevoking ? 'Revoking...' : 'Revoke'}</span>
                                                    </button>

                                                    {/* Reassign Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setReassignDealTarget(deal)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer hover:opacity-90 shadow-sm"
                                                        style={{
                                                            background: T.primary,
                                                            color: '#FFFFFF',
                                                        }}
                                                        title="Open assignment modal"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">person_add</span>
                                                        <span>Reassign</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {/* TAB 2: LEADS */}
                    {activeTab === 'leads' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1 mb-1">
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                    Active Leads ({leads.length})
                                </span>
                                <span className="text-[11px]" style={{ color: T.textMuted }}>
                                    1-Click Revoke & Reassign
                                </span>
                            </div>

                            {loadingLeads ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-3xl animate-spin" style={{ color: T.primary }}>
                                        progress_activity
                                    </span>
                                    <p className="text-xs font-semibold" style={{ color: T.textMuted }}>
                                        Loading active leads...
                                    </p>
                                </div>
                            ) : leadError ? (
                                <div
                                    className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2"
                                    style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.20)' }}
                                >
                                    <p className="text-xs font-bold text-red-500">{leadError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchLeads}
                                        className="text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer"
                                        style={{ background: T.primary, color: '#fff' }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : leads.length === 0 ? (
                                <div
                                    className="py-12 px-6 flex flex-col items-center justify-center text-center rounded-2xl"
                                    style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                                        style={{ background: T.primaryFaint, border: `1px solid ${T.primary}20` }}
                                    >
                                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>
                                            person_off
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>
                                        No Active Leads
                                    </h4>
                                    <p className="text-xs max-w-xs mt-1" style={{ color: T.textMuted }}>
                                        {agent.name} has no active leads owned or assigned at this time.
                                    </p>
                                </div>
                            ) : (
                                leads.map(lead => {
                                    const isRevoking = revokingLeadIds.has(lead.id)
                                    const statusStyle = STAGE_STYLES[lead.status?.toUpperCase()] || {
                                        badgeBg: 'rgba(83, 141, 141, 0.12)',
                                        badgeColor: '#538D8D',
                                    }
                                    const isOwner = lead.ownershipRole === 'OWNER'

                                    return (
                                        <div
                                            key={lead.id}
                                            className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
                                            style={{
                                                background: T.surface,
                                                border: `1px solid ${T.border}`,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                            }}
                                        >
                                            {/* Lead Name + Status + Ownership Badge */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h5
                                                        className="font-extrabold text-sm truncate"
                                                        style={{ color: T.textPrimary }}
                                                        title={lead.name}
                                                    >
                                                        {lead.name}
                                                    </h5>
                                                    <p className="text-xs mt-0.5 truncate" style={{ color: T.textMuted }}>
                                                        {lead.company || 'Individual Prospect'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {/* Status Badge */}
                                                    <span
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                                                        style={{
                                                            background: statusStyle.badgeBg,
                                                            color: statusStyle.badgeColor,
                                                        }}
                                                    >
                                                        {lead.status || 'NEW'}
                                                    </span>

                                                    {/* Ownership Badge */}
                                                    {isOwner ? (
                                                        <span
                                                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                                                            style={{
                                                                background: 'rgba(245, 158, 11, 0.15)',
                                                                color: '#D97706',
                                                                border: '1px solid rgba(245, 158, 11, 0.28)',
                                                            }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            OWNER
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                                                            style={{
                                                                background: 'rgba(37, 99, 235, 0.12)',
                                                                color: '#2563EB',
                                                                border: '1px solid rgba(37, 99, 235, 0.24)',
                                                            }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            ASSIGNEE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Details & Assignees Preview */}
                                            <div
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl text-xs"
                                                style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}
                                            >
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    {lead.phone && (
                                                        <a
                                                            href={`tel:${lead.phone}`}
                                                            className="hover:underline flex items-center gap-1 font-semibold"
                                                            style={{ color: T.textSecondary }}
                                                        >
                                                            <span>📞</span>
                                                            <span>{lead.phone}</span>
                                                        </a>
                                                    )}
                                                    {lead.email && (
                                                        <a
                                                            href={`mailto:${lead.email}`}
                                                            className="hover:underline flex items-center gap-1 font-semibold truncate max-w-[180px]"
                                                            style={{ color: T.textSecondary }}
                                                        >
                                                            <span>✉️</span>
                                                            <span className="truncate">{lead.email}</span>
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 text-[11px] font-semibold truncate max-w-[200px]" style={{ color: T.textMuted }}>
                                                    <span className="material-symbols-outlined text-[14px]">groups</span>
                                                    <span className="truncate">
                                                        {lead.assignees?.map(u => u.name).join(', ') || 'No assignees'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons: Revoke & Reassign */}
                                            {canManageAgent && (
                                                <div className="flex items-center justify-end gap-2 pt-1 border-t" style={{ borderColor: T.borderSubtle }}>
                                                    {/* 1-Click Revoke Button */}
                                                    <button
                                                        type="button"
                                                        disabled={isRevoking}
                                                        onClick={() => handleRevokeLead(lead)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 hover:opacity-85"
                                                        style={{
                                                            background: T.errorDim,
                                                            color: T.error,
                                                            border: `1px solid ${T.error}25`,
                                                        }}
                                                        title={`Remove ${agent.name} from this lead`}
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                                        <span>{isRevoking ? 'Revoking...' : 'Revoke'}</span>
                                                    </button>

                                                    {/* Reassign Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setReassignLeadTarget(lead)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer hover:opacity-90 shadow-sm"
                                                        style={{
                                                            background: T.primary,
                                                            color: '#FFFFFF',
                                                        }}
                                                        title="Open assignment modal"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">person_add</span>
                                                        <span>Reassign</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {/* TAB 3: DIRECT REPORTS */}
                    {activeTab === 'reports' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1 mb-1">
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                    Direct Subordinates ({directReports.length})
                                </span>
                                <span className="text-[11px]" style={{ color: T.textMuted }}>
                                    Live Manager Reassignment
                                </span>
                            </div>

                            {directReports.length === 0 ? (
                                <div
                                    className="py-12 px-6 flex flex-col items-center justify-center text-center rounded-2xl"
                                    style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                                        style={{ background: T.primaryFaint, border: `1px solid ${T.primary}20` }}
                                    >
                                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>
                                            account_tree
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>
                                        No Direct Reports
                                    </h4>
                                    <p className="text-xs max-w-xs mt-1" style={{ color: T.textMuted }}>
                                        {agent.name} currently does not have any direct subordinates reporting to them.
                                    </p>
                                </div>
                            ) : (
                                directReports.map(sub => {
                                    const p = sub.personalMetrics || {}
                                    const subRoleStyle = ROLE_TAGS[sub.role] || {
                                        bg: T.primaryDim,
                                        color: T.primaryText,
                                        border: `${T.primary}30`,
                                        label: sub.role || 'AGENT',
                                    }
                                    const subAvatarGradient = sub.role === 'COMPANY_SUPER_ADMIN'
                                        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                        : sub.role === 'ADMIN'
                                            ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
                                            : sub.role === 'SUPER_ADMIN'
                                                ? 'linear-gradient(135deg, #8B5CF6, #C4B5FD)'
                                                : 'linear-gradient(135deg, #10B981, #059669)'

                                    const subIsOnline = sub.active !== false
                                    const isReassigning = reassigningSubId === sub.id
                                    const inlineError = subErrors[sub.id]
                                    const forbiddenDescendantIds = getSubtreeUserIds(sub)

                                    return (
                                        <div
                                            key={sub.id}
                                            className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
                                            style={{
                                                background: T.surface,
                                                border: `1px solid ${inlineError ? '#EF4444' : T.border}`,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                            }}
                                        >
                                            {/* Subordinate Identity Row */}
                                            <div className="flex items-start justify-between gap-3 min-w-0">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {/* Avatar */}
                                                    <div className="relative shrink-0">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm"
                                                            style={{ background: subAvatarGradient, color: '#FFFFFF' }}
                                                        >
                                                            {getInitials(sub.name)}
                                                        </div>
                                                        <span
                                                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                                            style={{
                                                                background: subIsOnline ? '#22C55E' : '#94A3B8',
                                                                borderColor: T.surface,
                                                            }}
                                                            title={subIsOnline ? 'Active' : 'Offline'}
                                                        />
                                                    </div>

                                                    {/* Name & Details */}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h5 className="font-extrabold text-sm truncate" style={{ color: T.textPrimary }}>
                                                                {sub.name}
                                                            </h5>
                                                            {sub.designation && (
                                                                <span
                                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[140px]"
                                                                    style={{ background: T.surfaceRaised, color: T.textSecondary }}
                                                                    title={sub.designation}
                                                                >
                                                                    {sub.designation}
                                                                </span>
                                                            )}
                                                            <span
                                                                className="text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider uppercase"
                                                                style={{
                                                                    background: subRoleStyle.bg,
                                                                    color: subRoleStyle.color,
                                                                    border: `1px solid ${subRoleStyle.border}`,
                                                                }}
                                                            >
                                                                {subRoleStyle.label}
                                                            </span>
                                                            {(() => {
                                                                const subArch = getArchetypeConfig(
                                                                    sub.archetype,
                                                                    sub.role,
                                                                    Array.isArray(sub.directReports) && sub.directReports.length > 0
                                                                )
                                                                return (
                                                                    <span
                                                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                                                        style={{
                                                                            background: subArch.bg,
                                                                            color: subArch.color,
                                                                            border: `1px solid ${subArch.border}`,
                                                                        }}
                                                                        title={`${subArch.label} · ${subArch.scopeLabel}`}
                                                                    >
                                                                        {subArch.emoji} {subArch.label}
                                                                    </span>
                                                                )
                                                            })()}
                                                        </div>
                                                        <p className="text-xs truncate mt-0.5" style={{ color: T.textMuted }}>
                                                            {sub.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Drill-down Button */}
                                                {typeof onSelectAgent === 'function' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onSelectAgent(sub.id)}
                                                        className="p-1.5 rounded-xl hover:opacity-80 transition-all cursor-pointer shrink-0"
                                                        style={{ background: T.surfaceRaised, color: T.primary }}
                                                        title={`Inspect ${sub.name}'s details`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Subordinate Personal Metrics Grid */}
                                            <div
                                                className="grid grid-cols-4 gap-2 p-2.5 rounded-xl text-center"
                                                style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                                        Deals
                                                    </span>
                                                    <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                                        {p.dealsLeadingCount || 0}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-emerald-600 truncate max-w-[80px]">
                                                        {fmtPipeline(p.pipelineValue || 0)}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                                        Won
                                                    </span>
                                                    <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                                        {p.dealsWonCount || 0}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-emerald-600">
                                                        Won
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                                        Leads
                                                    </span>
                                                    <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                                        {p.leadsLeadingCount || 0}
                                                    </span>
                                                    <span className="text-[10px] font-semibold" style={{ color: T.textMuted }}>
                                                        Active
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                                        Acts
                                                    </span>
                                                    <span className="text-xs font-black mt-0.5" style={{ color: T.textPrimary }}>
                                                        {p.completedActivitiesCount || 0}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-emerald-600">
                                                        Done
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Subordinate's Own Team Footnote */}
                                            {Array.isArray(sub.directReports) && sub.directReports.length > 0 && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: T.textMuted }}>
                                                    <span className="material-symbols-outlined text-[14px]">groups</span>
                                                    <span>
                                                        Manages {sub.directReports.length} team {sub.directReports.length === 1 ? 'member' : 'members'}
                                                    </span>
                                                    {sub.teamMetrics?.teamPipelineValue > 0 && (
                                                        <span className="text-emerald-600 font-bold">
                                                            · Team: {fmtPipeline(sub.teamMetrics.teamPipelineValue)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Quick-Reassign Manager Dropdown */}
                                            <div
                                                className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t"
                                                style={{ borderColor: T.borderSubtle }}
                                            >
                                                <label className="text-[11px] font-extrabold flex items-center gap-1" style={{ color: T.textSecondary }}>
                                                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.primary }}>
                                                        swap_horiz
                                                    </span>
                                                    <span>Reports To:</span>
                                                </label>

                                                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                                                    <select
                                                        disabled={!canManageAgent || isReassigning}
                                                        value={agent.id}
                                                        onChange={(e) => handleReassignSubordinateManager(sub, e.target.value)}
                                                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                                                        style={{
                                                            background: T.surfaceRaised,
                                                            border: `1px solid ${T.border}`,
                                                            color: T.textPrimary,
                                                        }}
                                                    >
                                                        <option value={agent.id} disabled>
                                                            ✓ Current: {agent.name}
                                                        </option>
                                                        <option value="NONE">
                                                            — None (Top-Level Root Leader) —
                                                        </option>
                                                        <optgroup label="Reassign to Manager">
                                                            {companyUsers
                                                                .filter(u => u.id !== agent.id)
                                                                .map(u => {
                                                                    const isCycle = forbiddenDescendantIds.has(u.id)
                                                                    return (
                                                                        <option
                                                                            key={u.id}
                                                                            value={u.id}
                                                                            disabled={isCycle}
                                                                        >
                                                                            {u.name} {u.designation ? `(${u.designation})` : `(${u.role})`}
                                                                            {isCycle ? ' [Creates Cycle]' : ''}
                                                                        </option>
                                                                    )
                                                                })}
                                                        </optgroup>
                                                    </select>

                                                    {isReassigning && (
                                                        <span className="material-symbols-outlined text-[16px] animate-spin shrink-0" style={{ color: T.primary }}>
                                                            progress_activity
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Inline Error Notice */}
                                            {inlineError && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[13px]">error</span>
                                                    <span>{inlineError}</span>
                                                </p>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Nested Modals (Z-[70]) ─────────────────────────── */}
            {reassignDealTarget && (
                <div className="relative z-[70]">
                    <AssignDealModal
                        deal={{
                            id: reassignDealTarget.id,
                            title: reassignDealTarget.title,
                            assignees: reassignDealTarget.assignees || [],
                        }}
                        onClose={() => setReassignDealTarget(null)}
                        onAssigned={() => {
                            setReassignDealTarget(null)
                            notifySuccess('Deal Reassigned', `Assignees updated for "${reassignDealTarget.title}"`)
                            fetchDeals()
                            if (typeof onRefreshChart === 'function') {
                                onRefreshChart()
                            }
                        }}
                    />
                </div>
            )}

            {reassignLeadTarget && (
                <div className="relative z-[70]">
                    <AssignLeadModal
                        profile={{
                            id: reassignLeadTarget.id,
                            title: reassignLeadTarget.name,
                            senderName: leadName(reassignLeadTarget),
                            assignees: reassignLeadTarget.assignees || [],
                        }}
                        onClose={() => setReassignLeadTarget(null)}
                        onAssigned={() => {
                            setReassignLeadTarget(null)
                            notifySuccess('Lead Reassigned', `Assignees updated for "${reassignLeadTarget.name}"`)
                            fetchLeads()
                            if (typeof onRefreshChart === 'function') {
                                onRefreshChart()
                            }
                        }}
                    />
                </div>
            )}
        </>
    )
}

function leadName(lead) {
    return lead?.name || lead?.title || 'Lead'
}
