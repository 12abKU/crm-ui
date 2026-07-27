import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { T } from '../../constants/theme'
import api from '../../api'
import InternalNotes from '../notes/InternalNotes'
import { usePermissions } from '../../hooks/usePermission'
import EntityAuditHistory from '../audit/EntityAuditHistory'
import LeadPanelOverview from './LeadPanelOverview'

const TABS = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'notes', icon: 'rate_review', label: 'Internal Notes' },
    { id: 'audit', icon: 'history', label: 'Audit', adminOnly: true },
]

const STAGE_STYLES = {
    NEW: { accent: T.stone600, badgeBg: T.stone100, badgeColor: T.stone600, label: 'New' },
    CONTACTED: { accent: T.blue600, badgeBg: T.blue100, badgeColor: T.blue600, label: 'Contacted' },
    QUALIFIED: { accent: T.teal600, badgeBg: T.teal100, badgeColor: T.teal600, label: 'Qualified' },
    CONVERTED: { accent: T.green600, badgeBg: T.green100, badgeColor: T.green600, label: 'Converted' },
    LOST: { accent: T.red600, badgeBg: T.red100, badgeColor: T.red600, label: 'Lost' },
}

const getStageStyle = (stageKey) => STAGE_STYLES[stageKey] || STAGE_STYLES.NEW

export default function LeadPanel({ lead, onClose, onDelete, onEdit, canEdit }) {
    const location = useLocation()
    const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'overview')
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.userId)
    const isAgent = role === 'AGENT'
    const isAssignedToMe = profile?.owner?.id === Number(userId) || (profile?.assignees || []).some(a => a.id === Number(userId))
    
    const can = usePermissions(['NOTES_VIEW', 'LEADS_DELETE', 'LEADS_EDIT'])
    
    // If canEdit is not provided via prop, we calculate it
    const computedCanEdit = canEdit !== undefined ? canEdit : (!isAgent || (can.LEADS_EDIT && isAssignedToMe))
    const canDelete = !isAgent || (can.LEADS_DELETE && isAssignedToMe)

    const visibleTabs = TABS.filter(t => {
        if (t.id === 'notes' && !can.NOTES_VIEW) return false
        if (t.adminOnly && isAgent) return false
        return true
    })

    const loadProfile = useCallback((leadId = lead.id) => {
        setLoading(true)
        api.get(`/api/leads/${leadId}`)
            .then(r => setProfile(r.data))
            .catch(err => setProfile(null))
            .finally(() => setLoading(false))
    }, [lead.id])

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab')
        setActiveTab(tab || 'overview')
        loadProfile(lead.id)
    }, [lead.id, loadProfile, location.search])

    const s = getStageStyle(lead.status)
    const leadName = lead.title || lead.senderName || 'Unknown'

    const renderContent = () => {
        if (loading) {
            return <div className="p-8 text-center" style={{ color: T.textMuted }}>Loading...</div>
        }
        if (!profile) {
            return <div className="p-8 text-center" style={{ color: T.error }}>Failed to load lead.</div>
        }

        switch (activeTab) {
            case 'overview': return <LeadPanelOverview profile={profile} onUpdate={() => loadProfile()} canEdit={computedCanEdit} />
            case 'notes': return can.NOTES_VIEW ? <InternalNotes leadId={lead.id} /> : null
            case 'audit': return <EntityAuditHistory entityType="LEAD" entityId={lead.id} />
            default: return null
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(10,22,40,0.60)' }}
                onClick={onClose} />

            <div className="fixed right-0 top-0 h-full z-50 flex overflow-hidden w-full max-w-[1000px]"
                style={{ boxShadow: '0 0 60px rgba(0,0,0,0.30)' }}>

                <div className="flex flex-col items-center pt-5 pb-4 gap-1 shrink-0"
                    style={{
                        width: 60,
                        background: T.sidebar,
                        borderRight: `1px solid ${T.sidebarBorder}`,
                    }}>
                    <button onClick={onClose}
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all"
                        style={{ color: T.heroSubText }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#F87171' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText }}>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>

                    <div className="w-8 mb-2" style={{ height: 1, background: T.sidebarBorder }} />

                    {visibleTabs.map(tab => {
                        const isActive = activeTab === tab.id
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label}
                                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group"
                                style={{
                                    background: isActive ? T.sidebarHover : 'transparent',
                                    color: isActive ? T.sidebarActiveText : T.sidebarText,
                                    borderLeft: isActive ? `2px solid ${T.sidebarActiveText}` : '2px solid transparent',
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = T.sidebarBorder; e.currentTarget.style.color = T.sidebarActiveText } }}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText } }}>
                                <span className={`material-symbols-outlined text-[19px] ${isActive ? 'filled' : ''}`}>{tab.icon}</span>
                                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-[11px] font-bold
                                    pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                                    style={{ background: '#0A1628', color: '#DBEAFE', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', border: `1px solid ${T.sidebarBorder}` }}>
                                    {tab.label}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="flex flex-col flex-1 overflow-hidden" style={{ background: T.surface }}>
                    <div className="shrink-0 relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                            borderBottom: `1px solid ${T.sidebarBorder}`,
                        }}>
                        <div style={{
                            position: 'absolute', top: -30, right: -30, width: 140, height: 140,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${T.heroAccentGlow} 0%, transparent 70%)`,
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
                                            style={{ color: s.accent ?? T.sidebarActiveText }}>person_search</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-black truncate" style={{ color: '#fff' }}>
                                            {leadName}
                                        </h2>
                                        {lead.companyName && (
                                            <p className="text-[12px] mt-0.5" style={{ color: T.heroSubText }}>
                                                <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">business</span>
                                                {lead.companyName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {computedCanEdit && onEdit && (
                                        <button onClick={() => onEdit(lead)}
                                            className="p-1.5 rounded-lg transition-all" title="Edit lead"
                                            style={{ color: T.heroSubText }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.color = '#60A5FA' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText }}>
                                            <span className="material-symbols-outlined text-[17px]">edit</span>
                                        </button>
                                    )}
                                    {canDelete && onDelete && (
                                        <button onClick={() => onDelete(lead.id)}
                                            className="p-1.5 rounded-lg transition-all" title="Delete lead"
                                            style={{ color: T.heroSubText }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)'; e.currentTarget.style.color = '#F87171' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText }}>
                                            <span className="material-symbols-outlined text-[17px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                    style={{ background: s.badgeBg, color: s.badgeColor }}>
                                    {s.label}
                                </span>
                                {lead.source && (
                                    <span className="text-sm font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: T.sidebarActiveText }}>
                                        {lead.source}
                                    </span>
                                )}
                                {isAgent && isAssignedToMe && (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                        style={{ background: T.heroBadgeBg, color: '#DBEAFE' }}>
                                        Assigned to you
                                    </span>
                                )}
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-widest mt-3"
                                style={{ color: T.heroSubText }}>
                                {visibleTabs.find(t => t.id === activeTab)?.label}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    )
}
