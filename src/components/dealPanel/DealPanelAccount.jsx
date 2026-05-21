import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'

const InfoCard = ({ label, children }) => (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <div className="text-sm font-semibold">{children}</div>
    </div>
)

export default function DealPanelAccount({ deal }) {
    const navigate = useNavigate()
    const acc = deal.account

    if (!acc) return (
        <div className="px-7 py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined filled text-[26px]"
                    style={{ color: T.primary }}>business</span>
            </div>
            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No account linked</p>
        </div>
    )

    const websiteUrl = acc.website
        ? (acc.website.startsWith('http') ? acc.website : `https://${acc.website}`)
        : null

    return (
        <div className="px-6 py-5 flex flex-col gap-5">

            {/* Account hero card — clickable → account profile (unchanged nav logic) */}
            <button onClick={() => navigate(`/accounts/${acc.id}`)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-150"
                style={{
                    background: `linear-gradient(135deg, ${T.primaryDim} 0%, ${T.primaryFaint} 100%)`,
                    border: `1.5px solid ${T.primary}25`,
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${T.primary}50`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `0 6px 20px ${T.primary}15`
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${T.primary}25`
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                    style={{ background: T.primary, color: '#fff', boxShadow: `0 4px 12px ${T.primary}40` }}>
                    {acc.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-black" style={{ color: T.textPrimary }}>{acc.name}</p>
                    {acc.website && (
                        <p className="text-[12px] truncate mt-0.5" style={{ color: T.primary }}>{acc.website}</p>
                    )}
                </div>
                <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: T.primary }}>
                    arrow_forward
                </span>
            </button>

            {/* Basic info grid */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                    Basic Information
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="Company Name">
                        <button onClick={() => navigate(`/accounts/${acc.id}`)}
                            className="hover:underline text-left font-bold"
                            style={{ color: acc.name ? T.primary : T.textMuted }}>
                            {acc.name || 'Not provided'}
                        </button>
                    </InfoCard>

                    <InfoCard label="Website">
                        {websiteUrl ? (
                            <a href={websiteUrl} target="_blank" rel="noreferrer"
                                className="hover:underline flex items-center gap-1 w-fit font-bold"
                                style={{ color: T.primary }}>
                                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                {acc.website}
                            </a>
                        ) : <span style={{ color: T.textMuted }}>Not provided</span>}
                    </InfoCard>

                    <InfoCard label="Phone">
                        {acc.phone ? (
                            <a href={`tel:${acc.phone}`}
                                className="hover:underline flex items-center gap-1 w-fit font-bold"
                                style={{ color: T.primary }}>
                                <span className="material-symbols-outlined text-[13px]">call</span>
                                {acc.phone}
                            </a>
                        ) : <span style={{ color: T.textMuted }}>Not provided</span>}
                    </InfoCard>

                    <InfoCard label="Industry">
                        <span style={{ color: acc.industry ? T.textPrimary : T.textMuted }}>
                            {acc.industry || 'Not provided'}
                        </span>
                    </InfoCard>

                    <InfoCard label="Employees">
                        <span style={{ color: acc.employeeRange ? T.textPrimary : T.textMuted }}>
                            {acc.employeeRange || 'Not provided'}
                        </span>
                    </InfoCard>

                    <InfoCard label="Tag">
                        <span style={{ color: acc.tag ? T.textPrimary : T.textMuted }}>
                            {acc.tag || 'Not provided'}
                        </span>
                    </InfoCard>
                </div>
            </div>
        </div>
    )
}