import { T } from '../../constants/theme'
import {
    IconHelpCircle, IconTicket, IconPlus,
    IconHeadset, IconUsers
} from '@tabler/icons-react'

const TAB_META = {
    faq: { icon: IconHelpCircle, desc: 'Browse answers' },
    tickets: { icon: IconTicket, desc: 'Track your issues' },
    submit: { icon: IconPlus, desc: 'Report a problem' },
    contact: { icon: IconHeadset, desc: 'Talk to us' },
    team_tickets: { icon: IconUsers, desc: 'Manage team' },
}

export default function SupportTabs({ tab, setTab, badge, isAdmin }) {
    const TABS = [
        { id: 'faq', label: 'FAQ' },
        { id: 'tickets', label: 'My Tickets', badge: badge.myOpenTickets > 0 ? badge.myOpenTickets : null },
        { id: 'submit', label: 'Submit Ticket' },
        { id: 'contact', label: 'Contact Us' },
        ...(isAdmin ? [{ id: 'team_tickets', label: 'Team Tickets', badge: badge.companyOpenTickets > 0 ? badge.companyOpenTickets : null }] : []),
    ]

    return (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
            {TABS.map(t => {
                const { icon: Icon, desc } = TAB_META[t.id] || {}
                const active = tab === t.id
                return (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className="relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 shrink-0"
                        style={{
                            background: active
                                ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)`
                                : T.surface,
                            color: active ? '#fff' : T.textMuted,
                            border: active
                                ? `1px solid ${T.primary}`
                                : `1px solid ${T.border}`,
                            boxShadow: active
                                ? `0 4px 14px ${T.primary}40`
                                : '0 1px 3px rgba(0,0,0,0.04)',
                            transform: active ? 'translateY(-1px)' : 'translateY(0)',
                        }}
                        onMouseEnter={e => {
                            if (!active) {
                                e.currentTarget.style.background = T.surfaceHigh
                                e.currentTarget.style.transform = 'translateY(-1px)'
                            }
                        }}
                        onMouseLeave={e => {
                            if (!active) {
                                e.currentTarget.style.background = T.surface
                                e.currentTarget.style.transform = 'translateY(0)'
                            }
                        }}
                    >
                        {Icon && <Icon size={15} style={{ opacity: active ? 1 : 0.7 }} />}
                        {t.label}
                        {t.badge && (
                            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center justify-center min-w-4.5"
                                style={{
                                    background: active ? 'rgba(255,255,255,0.25)' : '#DC2626',
                                    color: '#fff',
                                }}>
                                {t.badge > 9 ? '9+' : t.badge}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}