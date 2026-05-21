import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'

const InfoCard = ({ label, children }) => (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <div className="text-sm font-semibold">{children}</div>
    </div>
)

export default function DealPanelContacts({ deal }) {
    const navigate = useNavigate()
    const contact = deal.contact

    if (!contact) return (
        <div className="px-7 py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: T.secondaryDim }}>
                <span className="material-symbols-outlined filled text-[26px]"
                    style={{ color: T.secondary }}>person</span>
            </div>
            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No contact linked</p>
        </div>
    )

    const fullName = `${contact.firstName} ${contact.lastName || ''}`.trim()

    return (
        <div className="px-6 py-5 flex flex-col gap-5">

            {/* Contact hero card — clickable → contact profile (unchanged nav logic) */}
            <button onClick={() => navigate(`/contacts/${contact.id}`)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-150"
                style={{
                    background: `linear-gradient(135deg, ${T.secondaryDim} 0%, ${T.secondaryFaint} 100%)`,
                    border: `1.5px solid ${T.secondary}20`,
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${T.secondary}40`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,0.08)`
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${T.secondary}20`
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                    style={{ background: T.secondaryDim, color: T.secondaryText, border: `2px solid ${T.secondary}20` }}>
                    {contact.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-black" style={{ color: T.textPrimary }}>{fullName}</p>
                    {contact.designation && (
                        <p className="text-[12px] mt-0.5" style={{ color: T.textMuted }}>{contact.designation}</p>
                    )}
                    {contact.email && (
                        <p className="text-[12px] truncate mt-0.5" style={{ color: T.primary }}>{contact.email}</p>
                    )}
                </div>
                <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: T.textMuted }}>
                    arrow_forward
                </span>
            </button>

            {/* Contact details grid */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                    Contact Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="Full Name">
                        <button onClick={() => navigate(`/contacts/${contact.id}`)}
                            className="hover:underline text-left font-bold"
                            style={{ color: T.primary }}>
                            {fullName}
                        </button>
                    </InfoCard>

                    <InfoCard label="Designation">
                        <span style={{ color: contact.designation ? T.textPrimary : T.textMuted }}>
                            {contact.designation || 'Not provided'}
                        </span>
                    </InfoCard>

                    <InfoCard label="Email">
                        {contact.email ? (
                            <a href={`mailto:${contact.email}`}
                                className="hover:underline flex items-center gap-1 w-fit font-bold"
                                style={{ color: T.primary }}>
                                <span className="material-symbols-outlined text-[13px]">mail</span>
                                {contact.email}
                            </a>
                        ) : <span style={{ color: T.textMuted }}>Not provided</span>}
                    </InfoCard>

                    <InfoCard label="Phone">
                        {contact.phone ? (
                            <a href={`tel:${contact.phone}`}
                                className="hover:underline flex items-center gap-1 w-fit font-bold"
                                style={{ color: T.primary }}>
                                <span className="material-symbols-outlined text-[13px]">call</span>
                                {contact.phone}
                            </a>
                        ) : <span style={{ color: T.textMuted }}>Not provided</span>}
                    </InfoCard>

                    <InfoCard label="Account">
                        {deal.account ? (
                            <button onClick={() => navigate(`/accounts/${deal.account.id}`)}
                                className="hover:underline text-left font-bold"
                                style={{ color: T.primary }}>
                                {deal.account.name}
                            </button>
                        ) : <span style={{ color: T.textMuted }}>Not provided</span>}
                    </InfoCard>
                </div>
            </div>
        </div>
    )
}