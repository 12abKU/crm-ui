import { T } from '../../constants/theme'
import { IconAlertTriangle } from '@tabler/icons-react'

export default function SupportHeader({ isAdmin, companyName, badge }) {
    return (
        <div className="mb-8 flex items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>
                    Support Center
                </h1>
                <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                    {isAdmin
                        ? `Managing support for ${companyName || 'your company'} · ${badge.companyTotalTickets ?? 0} total tickets`
                        : 'Find answers, submit tickets, and get help fast'}
                </p>
            </div>

            {badge.myOpenTickets > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl shrink-0"
                    style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)' }}>
                    <IconAlertTriangle size={15} style={{ color: '#DC2626' }} />
                    <span className="text-sm font-bold" style={{ color: '#DC2626' }}>
                        {badge.myOpenTickets} open ticket{badge.myOpenTickets !== 1 ? 's' : ''}
                    </span>
                </div>
            )}
        </div>
    )
}