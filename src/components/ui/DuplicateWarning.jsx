import { T } from '../../constants/theme'

export default function DuplicateWarning({ matches = [], loading = false, onOpen }) {
    if (!loading && matches.length === 0) return null

    return (
        <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: T.warningDim, border: `1.5px solid ${T.warning}30` }}>
            <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(217,119,6,0.16)' }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: T.warning }}>
                        content_copy
                    </span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black" style={{ color: T.textPrimary }}>
                        {loading ? 'Checking for duplicates...' : 'Possible duplicate found'}
                    </p>
                    <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: T.textSecondary }}>
                        Review the existing record before saving. You can still save if this is a separate record.
                    </p>
                </div>
            </div>

            {!loading && matches.length > 0 && (
                <div className="flex flex-col gap-2">
                    {matches.map(match => (
                        <button key={`${match.type}-${match.id}`} type="button"
                            onClick={() => onOpen?.(match)}
                            className="w-full text-left rounded-xl px-3 py-2.5 transition-all"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = T.surfaceHigh
                                e.currentTarget.style.borderColor = `${T.warning}55`
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = T.surface
                                e.currentTarget.style.borderColor = T.border
                            }}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[13px] font-bold truncate" style={{ color: T.textPrimary }}>
                                        {match.primaryText}
                                    </p>
                                    {match.secondaryText && (
                                        <p className="text-[11px] truncate mt-0.5" style={{ color: T.textMuted }}>
                                            {match.secondaryText}
                                        </p>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: T.warning }}>
                                    open_in_new
                                </span>
                            </div>
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-black"
                                style={{ background: 'rgba(217,119,6,0.12)', color: T.warning }}>
                                <span className="material-symbols-outlined text-[11px]">warning</span>
                                {match.reason || 'Potential match'}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
