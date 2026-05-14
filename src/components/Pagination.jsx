import { T } from '../constants/theme'

// Props: page (0-indexed), totalPages, totalElements, pageSize, onPage(newPage)
export default function Pagination({ page, totalPages, totalElements, pageSize, onPage }) {
    if (totalPages <= 1) return null

    const from = page * pageSize + 1
    const to = Math.min((page + 1) * pageSize, totalElements)

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
                <span style={{ color: T.textPrimary, fontWeight: 700 }}>{totalElements}</span>
            </p>

            <div className="flex items-center gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => onPage(page - 1)}
                    style={{
                        ...btnBase,
                        background: page === 0 ? T.surfaceRaised : T.surface,
                        color: page === 0 ? T.textMuted : T.textPrimary,
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        opacity: page === 0 ? 0.5 : 1,
                    }}>
                    <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                    Prev
                </button>

                {/* page numbers — show up to 5 around current */}
                {getPageNumbers(page, totalPages).map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="text-[13px]" style={{ color: T.textMuted, padding: '0 4px' }}>…</span>
                    ) : (
                        <button key={p} onClick={() => onPage(p)}
                            style={{
                                ...btnBase,
                                minWidth: 36, justifyContent: 'center',
                                background: p === page ? T.primary : T.surface,
                                color: p === page ? '#fff' : T.textPrimary,
                                borderColor: p === page ? T.primary : T.border,
                                fontWeight: p === page ? 700 : 600,
                            }}>
                            {p + 1}
                        </button>
                    )
                )}

                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => onPage(page + 1)}
                    style={{
                        ...btnBase,
                        background: page >= totalPages - 1 ? T.surfaceRaised : T.surface,
                        color: page >= totalPages - 1 ? T.textMuted : T.textPrimary,
                        cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                        opacity: page >= totalPages - 1 ? 0.5 : 1,
                    }}>
                    Next
                    <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
            </div>
        </div>
    )
}

function getPageNumbers(current, total) {
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