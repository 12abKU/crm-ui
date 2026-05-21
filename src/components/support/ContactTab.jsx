import { T } from '../../constants/theme'
import { IconMail, IconMessageCircle, IconPhone, IconClock, IconShieldCheck } from '@tabler/icons-react'
import { PRIORITY_STYLES } from './supportConstants'

const CHANNELS = [
    {
        Icon: IconMail,
        title: 'Email Support',
        value: 'support@inventivecrm.com',
        sub: 'We respond within 24 hours',
        action: 'mailto:support@inventivecrm.com',
        actionLabel: 'Send Email',
        gradient: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04))',
        iconBg: 'rgba(37,99,235,0.15)',
        iconColor: '#2563EB',
        available: true,
    },
    {
        Icon: IconMessageCircle,
        title: 'Live Chat',
        value: 'Chat with us',
        sub: 'Mon–Fri, 9am–6pm IST',
        action: null,
        actionLabel: 'Coming Soon',
        gradient: 'linear-gradient(135deg, rgba(22,163,74,0.10), rgba(22,163,74,0.03))',
        iconBg: 'rgba(22,163,74,0.15)',
        iconColor: '#16A34A',
        available: false,
    },
    {
        Icon: IconPhone,
        title: 'Phone Support',
        value: '+91 98765 43210',
        sub: 'Available for Enterprise plans',
        action: 'tel:+919876543210',
        actionLabel: 'Call Now',
        gradient: 'linear-gradient(135deg, rgba(217,119,6,0.10), rgba(217,119,6,0.03))',
        iconBg: 'rgba(217,119,6,0.15)',
        iconColor: '#D97706',
        available: true,
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

            {/* Contact channel cards */}
            <div className="grid grid-cols-3 gap-4">
                {CHANNELS.map(({ Icon, title, value, sub, action, actionLabel, gradient, iconBg, iconColor, available }) => (
                    <div key={title}
                        className="rounded-2xl p-6 flex flex-col gap-5 transition-all duration-200"
                        style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}>

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: iconBg }}>
                            <Icon size={22} style={{ color: iconColor }} />
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <p className="text-sm font-black" style={{ color: T.textPrimary }}>{title}</p>
                            <p className="text-sm font-semibold mt-1" style={{ color: iconColor }}>{value}</p>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>{sub}</p>
                        </div>

                        {/* Action */}
                        {available && action ? (
                            <a href={action}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
                                style={{
                                    background: iconBg,
                                    color: iconColor,
                                    border: `1px solid ${iconColor}25`,
                                    textDecoration: 'none',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                <Icon size={14} />
                                {actionLabel}
                            </a>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
                                style={{
                                    background: T.surfaceHigh,
                                    color: T.textMuted,
                                    border: `1px solid ${T.border}`,
                                }}>
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {actionLabel}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* SLA section */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <div className="px-6 py-4 flex items-center gap-3"
                    style={{ borderBottom: `1px solid ${T.border}`, background: T.primaryFaint }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <IconClock size={16} style={{ color: T.primary }} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>
                            Response Time SLA
                        </h4>
                        <p className="text-xs" style={{ color: T.textMuted }}>
                            Guaranteed response times by priority level
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-0">
                    {SLA.map(({ priority, time, style }, i) => (
                        <div key={priority}
                            className="flex flex-col gap-2 p-5"
                            style={{
                                borderRight: i < SLA.length - 1 ? `1px solid ${T.border}` : 'none',
                            }}>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: style.color }} />
                                <span className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: style.color }}>{priority}</span>
                            </div>
                            <span className="text-base font-black" style={{ color: T.textPrimary }}>{time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust badges row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: 'verified_user', label: 'Enterprise-grade Security', sub: 'SOC 2 Type II Compliant' },
                    { icon: 'support_agent', label: 'Dedicated Support', sub: 'Expert team available' },
                    { icon: 'public', label: 'Global Infrastructure', sub: 'Hosted in India & EU' },
                ].map(({ icon, label, sub }) => (
                    <div key={label}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                        style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                        }}>
                        <span className="material-symbols-outlined filled text-[22px]"
                            style={{ color: T.primary }}>{icon}</span>
                        <div>
                            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{label}</p>
                            <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}