import { T } from '../constants/theme'

// Props: page (0-indexed), totalPages, totalElements, pageSize, onPage(newPage)
export default function Pagination({ page, totalPages, totalElements, pageSize, onPage }) {
    // Guard all inputs against NaN/undefined
    const safePage = Number.isFinite(page) ? page : 0
    const safeTotalPages = Number.isFinite(totalPages) ? totalPages : 0
    const safeTotalElements = Number.isFinite(totalElements) ? totalElements : 0

    if (safeTotalPages <= 1) return null

    const from = safePage * pageSize + 1
    const to = Math.min((safePage + 1) * pageSize, safeTotalElements)

    const btnBase = {
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 14px', borderRadius: 8, fontSize: 13,
        fontWeight: 600, cursor: 'pointer', border: `1px solid ${T.border}`,
        transition: 'all 0.15s',
    }

    return (
        <div className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
            <p className="text-[12px]" style={{ color: T.textMuted }}>
                Showing <span style={{ color: T.textPrimary, fontWeight: 700 }}>{from}–{to}</span> of{' '}
                <span style={{ color: T.textPrimary, fontWeight: 700 }}>{safeTotalElements}</span>
            </p>

            <div className="flex items-center gap-2">
                <button
                    disabled={safePage === 0}
                    onClick={() => onPage(safePage - 1)}
                    style={{
                        ...btnBase,
                        background: safePage === 0 ? T.surfaceRaised : T.surface,
                        color: safePage === 0 ? T.textMuted : T.textPrimary,
                        cursor: safePage === 0 ? 'not-allowed' : 'pointer',
                        opacity: safePage === 0 ? 0.5 : 1,
                    }}>
                    <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                    Prev
                </button>

                {getPageNumbers(safePage, safeTotalPages).map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="text-[13px]" style={{ color: T.textMuted, padding: '0 4px' }}>…</span>
                    ) : (
                        <button key={p} onClick={() => onPage(p)}
                            style={{
                                ...btnBase,
                                minWidth: 36, justifyContent: 'center',
                                background: p === safePage ? T.primary : T.surface,
                                color: p === safePage ? '#fff' : T.textPrimary,
                                borderColor: p === safePage ? T.primary : T.border,
                                fontWeight: p === safePage ? 700 : 600,
                            }}>
                            {p + 1}
                        </button>
                    )
                )}

                <button
                    disabled={safePage >= safeTotalPages - 1}
                    onClick={() => onPage(safePage + 1)}
                    style={{
                        ...btnBase,
                        background: safePage >= safeTotalPages - 1 ? T.surfaceRaised : T.surface,
                        color: safePage >= safeTotalPages - 1 ? T.textMuted : T.textPrimary,
                        cursor: safePage >= safeTotalPages - 1 ? 'not-allowed' : 'pointer',
                        opacity: safePage >= safeTotalPages - 1 ? 0.5 : 1,
                    }}>
                    Next
                    <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
            </div>
        </div>
    )
}

function getPageNumbers(current, total) {
    if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 0) return []
    if (total <= 7) return Array.from({ length: total }, (_, i) => i)
    const pages = []
    if (current <= 3) {
        pages.push(0, 1, 2, 3, 4, '…', total - 1)
    } else if (current >= total - 4) {
        pages.push(0, '…', total - 5, total - 4, total - 3, total - 2, total - 1)
    } else {
        pages.push(0, '…', current - 1, current, current + 1, '…', total - 1)
    }
    return pages
}