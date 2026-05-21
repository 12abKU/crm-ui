import { T } from '../../constants/theme'
import { IconMail, IconMessageCircle, IconPhone } from '@tabler/icons-react'
import { PRIORITY_STYLES } from './supportConstants'

const CHANNELS = [
    {
        Icon: IconMail, title: 'Email Support',
        value: 'support@inventivecrm.com', sub: 'We respond within 24 hours',
        action: 'mailto:support@inventivecrm.com', actionLabel: 'Send Email',
    },
    {
        Icon: IconMessageCircle, title: 'Live Chat',
        value: 'Chat with us', sub: 'Mon–Fri, 9am–6pm IST',
        action: null, actionLabel: 'Start Chat (coming soon)',
    },
    {
        Icon: IconPhone, title: 'Phone Support',
        value: '+91 98765 43210', sub: 'Available for Enterprise plans',
        action: 'tel:+919876543210', actionLabel: 'Call Now',
    },
]

const SLA = [
    { priority: 'Low', time: '3 business days', style: PRIORITY_STYLES.LOW },
    { priority: 'Medium', time: '24 hours', style: PRIORITY_STYLES.MEDIUM },
    { priority: 'High', time: '8 hours', style: PRIORITY_STYLES.HIGH },
    { priority: 'Urgent', time: '2 hours', style: PRIORITY_STYLES.URGENT },
]

export default function ContactTab() {
    return (
        <div className="max-w-4xl flex flex-col gap-6">
            {/* Channel cards */}
            <div className="grid grid-cols-3 gap-5">
                {CHANNELS.map(({ Icon, title, value, sub, action, actionLabel }) => (
                    <div key={title} className="rounded-2xl p-6 flex flex-col gap-5"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: T.primaryDim }}>
                            <Icon size={22} style={{ color: T.primary }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black" style={{ color: T.textPrimary }}>{title}</p>
                            <p className="text-sm font-semibold mt-0.5" style={{ color: T.primaryText }}>{value}</p>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>{sub}</p>
                        </div>
                        {action ? (
                            <a href={action} className="crm-btn-ghost text-sm text-center">{actionLabel}</a>
                        ) : (
                            <button disabled className="crm-btn-ghost text-sm opacity-40 cursor-not-allowed">{actionLabel}</button>
                        )}
                    </div>
                ))}
            </div>

            {/* SLA table */}
            <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <h4 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Response Time SLA</h4>
                <div className="grid grid-cols-4 gap-4">
                    {SLA.map(({ priority, time, style }) => (
                        <div key={priority} className="flex flex-col gap-2 p-4 rounded-xl"
                            style={{ background: style.bg, border: `1px solid ${style.color}20` }}>
                            <span className="text-[10px] font-black uppercase tracking-widest"
                                style={{ color: style.color }}>{priority}</span>
                            <span className="text-sm font-bold" style={{ color: T.textPrimary }}>{time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}