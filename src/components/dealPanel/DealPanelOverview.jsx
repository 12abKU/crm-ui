import { T, STAGE_LABELS, STAGE_STYLES } from '../../constants/theme'

export default function DealPanelOverview({ deal }) {
    const s = STAGE_STYLES[deal.stage]
    const fields = [
        { label: 'Stage', value: STAGE_LABELS[deal.stage] },
        { label: 'Amount', value: deal.amount > 0 ? `₹${deal.amount.toLocaleString()}` : '—' },
        { label: 'Expected Close', value: deal.expectedCloseDate || '—' },
        { label: 'Account', value: deal.account?.name || '—' },
        { label: 'Contact', value: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '—' },
        { label: 'Created', value: deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '—' },
    ]

    return (
        <div className="px-7 py-6">
            {/* Stage + value banner */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl"
                style={{ background: T.surfaceRaised }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: s.badgeBg }}>
                        <span className="material-symbols-outlined text-[20px]"
                            style={{ color: s.badgeColor }}>handshake</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: T.textMuted }}>Current Stage</p>
                        <p className="text-base font-black" style={{ color: s.badgeColor }}>
                            {STAGE_LABELS[deal.stage]}
                        </p>
                    </div>
                </div>
                {deal.amount > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: T.textMuted }}>Deal Value</p>
                        <p className="text-base font-black" style={{ color: T.primary }}>
                            ₹{deal.amount.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: T.textMuted }}>Deal Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {fields.map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>{label}</p>
                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}