import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'

export default function DealPanelAccount({ deal }) {
    const navigate = useNavigate()
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

    const websiteUrl = acc.website
        ? (acc.website.startsWith('http') ? acc.website : `https://${acc.website}`)
        : null

    return (
        <div className="px-7 py-6">
            {/* Account header — clickable → account profile */}
            <button
                onClick={() => navigate(`/accounts/${acc.id}`)}
                className="w-full flex items-center gap-3 mb-6 p-4 rounded-xl text-left transition-colors"
                style={{ background: T.surfaceRaised }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0"
                    style={{ background: T.primaryDim, color: T.primary }}>
                    {acc.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black" style={{ color: T.textPrimary }}>{acc.name}</p>
                    {acc.website && (
                        <p className="text-[12px] truncate" style={{ color: T.primary }}>{acc.website}</p>
                    )}
                </div>
                <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: T.textMuted }}>
                    arrow_forward
                </span>
            </button>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: T.textMuted }}>Basic Information</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {/* Company Name */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Company Name</p>
                    <button onClick={() => navigate(`/accounts/${acc.id}`)}
                        className="text-sm font-semibold hover:underline text-left"
                        style={{ color: acc.name ? T.primary : T.border }}>
                        {acc.name || 'Not provided'}
                    </button>
                </div>

                {/* Website */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Website</p>
                    {websiteUrl ? (
                        <a href={websiteUrl} target="_blank" rel="noreferrer"
                            className="text-sm font-semibold hover:underline flex items-center gap-1 w-fit"
                            style={{ color: T.primary }}>
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                            {acc.website}
                        </a>
                    ) : (
                        <p className="text-sm font-semibold" style={{ color: T.border }}>Not provided</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Phone</p>
                    {acc.phone ? (
                        <a href={`tel:${acc.phone}`}
                            className="text-sm font-semibold hover:underline flex items-center gap-1 w-fit"
                            style={{ color: T.primary }}>
                            <span className="material-symbols-outlined text-[13px]">call</span>
                            {acc.phone}
                        </a>
                    ) : (
                        <p className="text-sm font-semibold" style={{ color: T.border }}>Not provided</p>
                    )}
                </div>

                {/* Industry */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Industry</p>
                    <p className="text-sm font-semibold" style={{ color: acc.industry ? T.textPrimary : T.border }}>
                        {acc.industry || 'Not provided'}
                    </p>
                </div>

                {/* Employees */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Employees</p>
                    <p className="text-sm font-semibold" style={{ color: acc.employeeRange ? T.textPrimary : T.border }}>
                        {acc.employeeRange || 'Not provided'}
                    </p>
                </div>

                {/* Tag */}
                <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>Tag</p>
                    <p className="text-sm font-semibold" style={{ color: acc.tag ? T.textPrimary : T.border }}>
                        {acc.tag || 'Not provided'}
                    </p>
                </div>
            </div>
        </div>
    )
}