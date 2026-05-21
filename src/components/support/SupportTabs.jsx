import { T } from '../../constants/theme'
import {
    IconHelpCircle, IconTicket, IconPlus,
    IconHeadset, IconUsers
} from '@tabler/icons-react'

const TAB_ICONS = {
    faq: IconHelpCircle,
    tickets: IconTicket,
    submit: IconPlus,
    contact: IconHeadset,
    team_tickets: IconUsers,
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
        <div className="flex items-center gap-1 p-1 rounded-2xl mb-8 flex-wrap"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {TABS.map(t => {
                const Icon = TAB_ICONS[t.id]
                const active = tab === t.id
                return (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: active ? T.primary : 'transparent',
                            color: active ? '#fff' : T.textMuted,
                        }}>
                        <Icon size={15} />
                        {t.label}
                        {t.badge && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                                style={{ background: '#DC2626', color: '#fff' }}>
                                {t.badge > 9 ? '9+' : t.badge}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}