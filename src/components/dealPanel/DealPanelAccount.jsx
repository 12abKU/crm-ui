import { T } from '../../constants/theme'

export default function DealPanelAccount({ deal }) {
    const acc = deal.account
    if (!acc) return (
        <div className="px-7 py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[22px]"
                    style={{ color: T.primary }}>business</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No account linked</p>
        </div>
    )

    const fields = [
        { label: 'Company Name', value: acc.name },
        { label: 'Website', value: acc.website },
        { label: 'Phone', value: acc.phone },
        { label: 'Industry', value: acc.industry },
        { label: 'Employees', value: acc.employeeRange },
        { label: 'Tag', value: acc.tag },
    ]

    return (
        <div className="px-7 py-6">
            {/* Account header */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl"
                style={{ background: T.surfaceRaised }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
                    style={{ background: T.primaryDim, color: T.primary }}>
                    {acc.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-black" style={{ color: T.textPrimary }}>{acc.name}</p>
                    {acc.website && (
                        <p className="text-[12px]" style={{ color: T.primary }}>{acc.website}</p>
                    )}
                </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: T.textMuted }}>Basic Information</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {fields.map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>{label}</p>
                        <p className="text-sm font-semibold"
                            style={{ color: value ? T.textPrimary : T.border }}>
                            {value || 'Not provided'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}