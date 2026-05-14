import { T } from '../../constants/theme'

export default function DealPanelContacts({ deal }) {
    const contact = deal.contact
    if (!contact) return (
        <div className="px-7 py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: T.secondaryDim }}>
                <span className="material-symbols-outlined text-[22px]"
                    style={{ color: T.secondary }}>person</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No contact linked</p>
        </div>
    )

    const fields = [
        { label: 'Full Name', value: `${contact.firstName} ${contact.lastName}` },
        { label: 'Designation', value: contact.designation },
        { label: 'Email', value: contact.email },
        { label: 'Phone', value: contact.phone },
        { label: 'Account', value: deal.account?.name },
    ]

    return (
        <div className="px-7 py-6">
            {/* Contact header card */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl"
                style={{ background: T.surfaceRaised }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base"
                    style={{ background: T.secondaryDim, color: T.secondaryText }}>
                    {contact.firstName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-black" style={{ color: T.textPrimary }}>
                        {contact.firstName} {contact.lastName}
                    </p>
                    {contact.designation && (
                        <p className="text-[12px]" style={{ color: T.textMuted }}>{contact.designation}</p>
                    )}
                    {contact.email && (
                        <p className="text-[12px]" style={{ color: T.primary }}>{contact.email}</p>
                    )}
                </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: T.textMuted }}>Contact Details</p>
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