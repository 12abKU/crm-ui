import { IconClock } from '@tabler/icons-react'
import { daysLeft } from './platformConstants'

export default function TrialBadge({ trialEndsAt, status }) {
    if (status !== 'TRIAL' || !trialEndsAt) return null
    const days = daysLeft(trialEndsAt)
    const expired = days <= 0
    const urgent = days <= 3 && !expired
    const color = expired ? '#DC2626' : urgent ? '#D97706' : '#16a34a'
    const bg = expired ? 'rgba(220,38,38,0.10)' : urgent ? 'rgba(217,119,6,0.10)' : 'rgba(22,163,74,0.10)'
    return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: bg, color }}>
            <IconClock size={10} />
            {expired ? 'Expired' : `${days}d left`}
        </span>
    )
}