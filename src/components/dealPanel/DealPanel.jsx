import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDealSyncStatus } from '../../store/dealsSlice'
import { T, SHADOW } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import api from '../../api'
import { profileCache, profileCacheGet, profileCacheSet, getCachePrefix, isFresh, PROFILE_TTL } from '../../utils/cacheUtils'
import DealPanelOverview from './DealPanelOverview'
import DealPanelAccount from './DealPanelAccount'
import DealPanelConversation from './DealPanelConversation'
import DealPanelActivities from './DealPanelActivities'
import DealPanelContacts from './DealPanelContacts'
import DealPanelDeals from './DealPanelDeals'
import DealPanelJourney from './DealPanelJourney'
import InternalNotes from '../notes/InternalNotes'
import { usePermissions } from '../../hooks/usePermission'
import RequirePermission from '../RequirePermission'
import EntityAuditHistory from '../audit/EntityAuditHistory'
import DealQuoteBuilder from '../deals/DealQuoteBuilder'
import TallySyncBadge from '../deals/TallySyncBadge'
import tallyAPI from '../../api/tally'

// ── Tab config ──────────────────────────────────────────────────
const TABS = [
    { id: 'overview',      icon: 'dashboard',     label: 'Overview' },
    { id: 'quote',         icon: 'receipt_long',  label: 'Quote & Line Items' },
    { id: 'account',       icon: 'business',       label: 'Account Details' },
    { id: 'conversation',  icon: 'forum',          label: 'Conversations' },
    { id: 'activities',    icon: 'event_note',     label: 'Activities' },
    { id: 'journey',       icon: 'route',          label: 'Journey' },
    { id: 'notes',         icon: 'rate_review',    label: 'Internal Notes' },
    { id: 'contacts',      icon: 'person',         label: 'Contacts' },
    { id: 'deals',         icon: 'handshake',      label: 'Deals' },
    { id: 'audit',         icon: 'history',        label: 'Audit', adminOnly: true },
]

export default function DealPanel({ deal, onClose, onDelete, onEdit, canEdit, initialTab, onDealUpdated }) {
    const { getStageLabel, getStageStyle } = usePipelineStages()
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState(() => initialTab || new URLSearchParams(window.location.search).get('tab') || 'overview')
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const s = getStageStyle(deal.stage)

    const onDealUpdatedRef = useRef(onDealUpdated)
    useEffect(() => {
        onDealUpdatedRef.current = onDealUpdated
    }, [onDealUpdated])

    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.userId)
    const reduxSync = useSelector(state => state.deals?.syncStatuses?.[deal.id])
    const { isConfigured } = useSelector(state => state.deals?.tallyConnection || {})

    const isAgent = role === 'AGENT'
    const isAssignedToMe = deal.assignedTo?.id === Number(userId) || deal.assignedTo?.id === userId
        || deal.owner?.id === Number(userId) || deal.owner?.id === userId
    const canDelete = !isAgent
    const can = usePermissions(['NOTES_VIEW'])

    const visibleTabs = TABS.filter(t => {
        if (t.id === 'notes' && !can.NOTES_VIEW) return false
        if (t.adminOnly && isAgent) return false
        return true
    })

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        try {
            const params = new URLSearchParams(window.location.search)
            params.set('tab', tabId)
            window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
        } catch {
            // safe fallback
        }
    }

    // Sync external initialTab if given
    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            setActiveTab(initialTab)
        }
    }, [initialTab])

    // ── Data loading ─────────────────────────────────────────
    const loadProfile = useCallback((dealId = deal.id, bypassCache = false) => {
        const cacheKey = `${getCachePrefix()}:${dealId}`
        const cachedValue = profileCacheGet(cacheKey)

        if (cachedValue && !bypassCache) {
            setProfile(cachedValue)
            setLoading(false)
        } else {
            setProfile(prev => prev ? prev : null)
            if (!cachedValue) setLoading(true)
        }

        // Always fetch fresh profile from API in background to ensure real-time accuracy
        api.get(`/api/deals/${dealId}/profile`)
            .then(r => {
                setProfile(r.data)
                profileCacheSet(cacheKey, r.data)
                if (r.data?.deal) {
                    dispatch(setDealSyncStatus({
                        dealId,
                        tallySyncStatus: r.data.deal.tallySyncStatus,
                        tallySalesOrderNo: r.data.deal.tallySalesOrderNo,
                        tallyDeliveryNoteNo: r.data.deal.tallyDeliveryNoteNo,
                        tallySalesInvoiceNo: r.data.deal.tallySalesInvoiceNo,
                        tallyLastSyncError: r.data.deal.tallyLastSyncError,
                    }))
                    if (onDealUpdatedRef.current) onDealUpdatedRef.current(r.data.deal)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [deal.id, dispatch])

    useEffect(() => {
        if (!deal?.id) return
        const currentTabInUrl = new URLSearchParams(window.location.search).get('tab')
        setActiveTab(initialTab || currentTabInUrl || 'overview')
        loadProfile(deal.id)

        // Always fetch fresh Tally sync status on open to bypass any stale cache
        tallyAPI.getDealSyncStatus(deal.id)
            .then(res => {
                if (res?.data) {
                    dispatch(setDealSyncStatus({
                        dealId: deal.id,
                        tallySyncStatus: res.data.tallySyncStatus,
                        tallySalesOrderNo: res.data.tallySalesOrderNo,
                        tallyDeliveryNoteNo: res.data.tallyDeliveryNoteNo,
                        tallySalesInvoiceNo: res.data.tallySalesInvoiceNo,
                        tallyLastSyncError: res.data.lastSyncError,
                    }))
                }
            })
            .catch(() => {})
    }, [deal?.id])

    const activities = profile?.activities ?? []
    const accountDeals = profile?.accountDeals ?? []
    const leadInfo = profile?.leadInfo ?? null
    const baseDeal = profile?.deal || deal
    const activeDeal = {
        ...baseDeal,
        ...(reduxSync ? {
            tallySyncStatus: reduxSync.tallySyncStatus || baseDeal.tallySyncStatus,
            tallySalesOrderNo: reduxSync.tallySalesOrderNo ?? baseDeal.tallySalesOrderNo,
            tallyDeliveryNoteNo: reduxSync.tallyDeliveryNoteNo ?? baseDeal.tallyDeliveryNoteNo,
            tallySalesInvoiceNo: reduxSync.tallySalesInvoiceNo ?? baseDeal.tallySalesInvoiceNo,
            tallyLastSyncError: reduxSync.tallyLastSyncError ?? baseDeal.tallyLastSyncError,
        } : {})
    }
    const liveSyncStatus = reduxSync?.tallySyncStatus !== undefined ? reduxSync.tallySyncStatus : activeDeal.tallySyncStatus
    const liveSO = reduxSync?.tallySalesOrderNo ?? activeDeal.tallySalesOrderNo
    const liveDN = reduxSync?.tallyDeliveryNoteNo ?? activeDeal.tallyDeliveryNoteNo
    const liveINV = reduxSync?.tallySalesInvoiceNo ?? activeDeal.tallySalesInvoiceNo
    const liveErr = reduxSync?.tallyLastSyncError ?? activeDeal.tallyLastSyncError
    const showHeaderBadge = isConfigured && liveSyncStatus && liveSyncStatus !== 'NONE'

    // ── Tab content renderer (unchanged) ────────────────────
    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return (
                <DealPanelOverview
                    deal={activeDeal}
                    isAgent={isAgent}
                    isAssignedToMe={isAssignedToMe}
                    canEdit={canEdit}
                    leadInfo={leadInfo}
                    onOpenQuoteTab={() => handleTabChange('quote')}
                    onDealUpdated={() => loadProfile(deal.id, true)}
                />
            )
            case 'quote': return (
                <DealQuoteBuilder
                    deal={profile?.deal || deal}
                    canEdit={canEdit}
                    onQuoteSaved={() => {
                        loadProfile(deal.id, true)
                    }}
                />
            )
            case 'account':      return <DealPanelAccount deal={activeDeal} />
            case 'conversation': return <DealPanelConversation deal={activeDeal} />
            case 'activities':   return (
                <DealPanelActivities
                    activities={activities}
                    loading={loading}
                    deal={activeDeal}
                    onActivityAdded={() => loadProfile(deal.id, true)}
                />
            )
            case 'journey':  return <DealPanelJourney deal={activeDeal} />
            case 'notes':    return can.NOTES_VIEW ? <InternalNotes dealId={deal.id} /> : null
            case 'contacts': return <DealPanelContacts deal={activeDeal} />
            case 'deals':    return <DealPanelDeals accountDeals={accountDeals} currentDealId={deal.id} loading={loading} />
            case 'audit':    return <EntityAuditHistory entityType="DEAL" entityId={deal.id} />
            default: return null
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(10,22,40,0.60)' }}
                onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full z-50 flex overflow-hidden w-full max-w-[1000px]"
                style={{ boxShadow: '0 0 60px rgba(0,0,0,0.30)' }}>

                {/* ── Vertical icon sidebar ──────────────── */}
                <div className="flex flex-col items-center pt-5 pb-4 gap-1 shrink-0"
                    style={{
                        width: 60,
                        background: T.sidebar,
                        borderRight: `1px solid ${T.sidebarBorder}`,
                    }}>
                    {/* Close button at top */}
                    <button onClick={onClose}
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all"
                        style={{ color: T.heroSubText }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#F87171' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText }}>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>

                    {/* Divider */}
                    <div className="w-8 mb-2" style={{ height: 1, background: T.sidebarBorder }} />

                    {visibleTabs.map(tab => {
                        const isActive = activeTab === tab.id
                        return (
                            <button key={tab.id} onClick={() => handleTabChange(tab.id)} title={tab.label}
                                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group"
                                style={{
                                    background: isActive ? T.sidebarHover : 'transparent',
                                    color: isActive ? T.sidebarActiveText : T.sidebarText,
                                    borderLeft: isActive ? `2px solid ${T.sidebarActiveText}` : '2px solid transparent',
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = T.sidebarBorder; e.currentTarget.style.color = T.sidebarActiveText } }}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText } }}>
                                <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>{tab.icon}</span>
                                {/* Tooltip */}
                                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-[11px] font-bold
                                    pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                                    style={{ background: '#0A1628', color: '#DBEAFE', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', border: `1px solid ${T.sidebarBorder}` }}>
                                    {tab.label}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* ── Main content area ─────────────────── */}
                <div className="flex flex-col flex-1 overflow-hidden" style={{ background: T.surface }}>

                    {/* ── Header banner ─────────────────── */}
                    <div className="shrink-0 relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                            borderBottom: `1px solid ${T.sidebarBorder}`,
                        }}>
                        {/* Orb */}
                        <div style={{
                            position: 'absolute', top: -30, right: -30, width: 140, height: 140,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, ${T.heroAccentGlow} 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        <div className="relative px-6 pt-5 pb-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{
                                            background: T.heroBadgeBg,
                                            border: '1px solid rgba(255,255,255,0.18)',
                                        }}>
                                        <span className="material-symbols-outlined filled text-[18px]"
                                            style={{ color: s.accent ?? T.sidebarActiveText }}>handshake</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-black truncate" style={{ color: '#fff' }}>
                                            {deal.title}
                                        </h2>
                                        {deal.account && (
                                            <p className="text-[12px] mt-0.5" style={{ color: T.heroSubText }}>
                                                <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">business</span>
                                                {deal.account.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Header actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {onEdit && (
                                        <button onClick={() => onEdit(deal)}
                                            className="p-1.5 rounded-lg transition-all" title="Edit deal"
                                            style={{ color: T.heroSubText }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.color = '#60A5FA' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText }}>
                                            <span className="material-symbols-outlined text-[17px]">edit</span>
                                        </button>
                                    )}
                                    {canDelete && onDelete && (
                                        <button onClick={() => onDelete(deal.id)}
                                            className="p-1.5 rounded-lg transition-all" title="Delete deal"
                                            style={{ color: T.heroSubText }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)'; e.currentTarget.style.color = '#F87171' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText }}>
                                            <span className="material-symbols-outlined text-[17px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Meta badges row */}
                            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                    style={{ background: s.badgeBg, color: s.badgeColor }}>
                                    {getStageLabel(deal.stage)}
                                </span>
                                {deal.amount > 0 && (
                                    <span className="text-sm font-black" style={{ color: T.sidebarActiveText }}>
                                        ₹{deal.amount.toLocaleString()}
                                    </span>
                                )}
                                {deal.expectedCloseDate && (
                                    <span className="flex items-center gap-1 text-[11px]"
                                        style={{ color: T.heroSubText }}>
                                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                                        Closes {deal.expectedCloseDate}
                                    </span>
                                )}
                                {isAgent && isAssignedToMe && (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                        style={{ background: T.heroBadgeBg, color: '#DBEAFE' }}>
                                        Assigned to you
                                    </span>
                                )}
                                {showHeaderBadge && (
                                    <TallySyncBadge
                                        status={liveSyncStatus}
                                        salesOrderNo={liveSO}
                                        deliveryNoteNo={liveDN}
                                        invoiceNo={liveINV}
                                        lastError={liveErr}
                                        dealId={activeDeal.id}
                                        onRetry={() => {
                                            loadProfile(deal.id, true)
                                            tallyAPI.getDealSyncStatus(deal.id).then(r => {
                                                if (r?.data) {
                                                    dispatch(setDealSyncStatus({
                                                        dealId: deal.id,
                                                        tallySyncStatus: r.data.tallySyncStatus,
                                                        tallySalesOrderNo: r.data.tallySalesOrderNo,
                                                        tallyDeliveryNoteNo: r.data.tallyDeliveryNoteNo,
                                                        tallySalesInvoiceNo: r.data.tallySalesInvoiceNo,
                                                        tallyLastSyncError: r.data.lastSyncError,
                                                    }))
                                                }
                                            }).catch(() => {})
                                        }}
                                    />
                                )}
                            </div>

                            {/* Active tab label */}
                            <p className="text-[10px] font-black uppercase tracking-widest mt-3"
                                style={{ color: T.heroSubText }}>
                                {visibleTabs.find(t => t.id === activeTab)?.label}
                            </p>
                        </div>
                    </div>

                    {/* ── Scrollable tab content ─────────── */}
                    <div className="flex-1 overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    )
}
