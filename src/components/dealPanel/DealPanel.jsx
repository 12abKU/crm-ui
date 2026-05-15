import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { T, STAGE_LABELS, STAGE_STYLES, SHADOW } from '../../constants/theme'
import api from '../../api'
import DealPanelOverview from './DealPanelOverview'
import DealPanelAccount from './DealPanelAccount'
import DealPanelConversation from './DealPanelConversation'
import DealPanelActivities from './DealPanelActivities'
import DealPanelContacts from './DealPanelContacts'
import DealPanelDeals from './DealPanelDeals'

const TABS = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'account', icon: 'business', label: 'Account Details' },
    { id: 'conversation', icon: 'forum', label: 'Conversations' },
    { id: 'activities', icon: 'event_note', label: 'Activities' },
    { id: 'contacts', icon: 'person', label: 'Contacts' },
    { id: 'deals', icon: 'handshake', label: 'Deals' },
]

export default function DealPanel({ deal, onClose, onDelete, canEdit }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const s = STAGE_STYLES[deal.stage]

    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.userId)

    const isAgent = role === 'AGENT'
    const isAssignedToMe = deal.assignedTo?.id === Number(userId) || deal.assignedTo?.id === userId
        || deal.owner?.id === Number(userId) || deal.owner?.id === userId
    const canDelete = !isAgent  // only admin / super_admin

    useEffect(() => {
        setLoading(true)
        setProfile(null)
        setActiveTab('overview')
        api.get(`/api/deals/${deal.id}/profile`)
            .then(r => setProfile(r.data))
            .finally(() => setLoading(false))
    }, [deal.id])

    const activities = profile?.activities ?? []
    const accountDeals = profile?.accountDeals ?? []

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return (
                <DealPanelOverview
                    deal={deal}
                    isAgent={isAgent}
                    isAssignedToMe={isAssignedToMe}
                    canEdit={canEdit}
                />
            )
            case 'account': return <DealPanelAccount deal={deal} />
            case 'conversation': return <DealPanelConversation deal={deal} />
            case 'activities': return <DealPanelActivities activities={activities} loading={loading} />
            case 'contacts': return <DealPanelContacts deal={deal} />
            case 'deals': return <DealPanelDeals accountDeals={accountDeals} currentDealId={deal.id} loading={loading} />
            default: return null
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(15,23,42,0.5)' }}
                onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full z-50 flex overflow-hidden"
                style={{ width: 1000, boxShadow: SHADOW.xl }}>

                {/* Vertical icon sidebar */}
                <div className="flex flex-col items-center py-5 gap-1 shrink-0"
                    style={{
                        width: 56,
                        background: T.sidebar,
                        borderRight: `1px solid rgba(255,255,255,0.06)`,
                    }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                title={tab.label}
                                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group"
                                style={{
                                    background: isActive ? T.sidebarActive : 'transparent',
                                    color: isActive ? '#fff' : T.sidebarText,
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = T.sidebarHover
                                        e.currentTarget.style.color = T.sidebarTextHover
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = T.sidebarText
                                    }
                                }}>
                                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold
                                    pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                                    style={{ background: T.sidebar, color: '#fff', boxShadow: SHADOW.md }}>
                                    {tab.label}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Main content area */}
                <div className="flex flex-col flex-1 overflow-hidden" style={{ background: T.surface }}>

                    {/* Header */}
                    <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: s.badgeBg }}>
                                    <span className="material-symbols-outlined text-[17px]"
                                        style={{ color: s.badgeColor }}>handshake</span>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-black truncate" style={{ color: T.textPrimary }}>
                                        {deal.title}
                                    </h2>
                                    {deal.account && (
                                        <p className="text-[12px]" style={{ color: T.textMuted }}>
                                            <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">business</span>
                                            {deal.account.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                {/* Delete — hidden for agents */}
                                {canDelete && onDelete && (
                                    <button onClick={() => onDelete(deal.id)}
                                        className="p-1.5 rounded-lg transition-colors"
                                        style={{ color: T.textMuted }}
                                        title="Delete deal"
                                        onMouseEnter={e => { e.currentTarget.style.background = T.errorDim; e.currentTarget.style.color = T.error }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                        <span className="material-symbols-outlined text-[17px]">delete</span>
                                    </button>
                                )}
                                <button onClick={onClose}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: T.textMuted }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                    <span className="material-symbols-outlined text-[19px]">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Stage + amount + close date */}
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                style={{ background: s.badgeBg, color: s.badgeColor }}>
                                {STAGE_LABELS[deal.stage]}
                            </span>
                            {deal.amount > 0 && (
                                <span className="text-sm font-black" style={{ color: T.primary }}>
                                    ₹{deal.amount.toLocaleString()}
                                </span>
                            )}
                            {deal.expectedCloseDate && (
                                <span className="flex items-center gap-1 text-[11px]" style={{ color: T.textMuted }}>
                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                    Closes {deal.expectedCloseDate}
                                </span>
                            )}
                            {/* Agent assigned badge */}
                            {isAgent && isAssignedToMe && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                    style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                    Assigned to you
                                </span>
                            )}
                        </div>

                        <p className="text-[11px] font-bold uppercase tracking-widest mt-3" style={{ color: T.primary }}>
                            {TABS.find(t => t.id === activeTab)?.label}
                        </p>
                    </div>

                    {/* Scrollable tab content */}
                    <div className="flex-1 overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    )
}