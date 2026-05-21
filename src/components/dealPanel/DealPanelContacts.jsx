import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'

export default function DealPanelContacts({ deal }) {
    const navigate = useNavigate()
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

    const fullName = `${contact.firstName} ${contact.lastName || ''}`.trim()

    return (
        <div className="px-7 py-6">
            {/* Contact header — clickable → contact profile */}
            <button
                onClick={() => navigate(`/contacts/${contact.id}`)}
                className="w-full flex items-center gap-3 mb-6 p-4 rounded-xl text-left transition-colors"
                style={{ background: T.surfaceRaised }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base shrink-0"
                    style={{ background: T.secondaryDim, color: T.secondaryText }}>
                    {contact.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black" style={{ color: T.textPrimary }}>{fullName}</p>
                    {contact.designation && (
                        <p className="text-[12px]" style={{ color: T.textMuted }}>{contact.designation}</p>
                    )}
                    {contact.email && (
                        <p className="text-[12px] truncate" style={{ color: T.primary }}>{contact.email}</p>
                    )}
                </div>
                <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: T.textMuted }}>
                    arrow_forward
                </span>
            </button>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: T.textMuted }}>Contact Details</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {/* Full Name */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Full Name</p>
                    <button onClick={() => navigate(`/contacts/${contact.id}`)}
                        className="text-sm font-semibold hover:underline text-left"
                        style={{ color: T.primary }}>
                        {fullName}
                    </button>
                </div>

                {/* Designation */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Designation</p>
                    <p className="text-sm font-semibold" style={{ color: contact.designation ? T.textPrimary : T.border }}>
                        {contact.designation || 'Not provided'}
                    </p>
                </div>

                {/* Email */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Email</p>
                    {contact.email ? (
                        <a href={`mailto:${contact.email}`}
                            className="text-sm font-semibold hover:underline flex items-center gap-1 w-fit"
                            style={{ color: T.primary }}>
                            <span className="material-symbols-outlined text-[13px]">mail</span>
                            {contact.email}
                        </a>
                    ) : (
                        <p className="text-sm font-semibold" style={{ color: T.border }}>Not provided</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Phone</p>
                    {contact.phone ? (
                        <a href={`tel:${contact.phone}`}
                            className="text-sm font-semibold hover:underline flex items-center gap-1 w-fit"
                            style={{ color: T.primary }}>
                            <span className="material-symbols-outlined text-[13px]">call</span>
                            {contact.phone}
                        </a>
                    ) : (
                        <p className="text-sm font-semibold" style={{ color: T.border }}>Not provided</p>
                    )}
                </div>

                {/* Account */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Account</p>
                    {deal.account ? (
                        <button onClick={() => navigate(`/accounts/${deal.account.id}`)}
                            className="text-sm font-semibold hover:underline text-left"
                            style={{ color: T.primary }}>
                            {deal.account.name}
                        </button>
                    ) : (
                        <p className="text-sm font-semibold" style={{ color: T.border }}>Not provided</p>
                    )}
                </div>
            </div>
        </div>
    )
}