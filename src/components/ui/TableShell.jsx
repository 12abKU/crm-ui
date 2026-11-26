import { T } from '../../constants/theme'

export default function TableShell({
    headers,
    children,
    footer,
    colWidths = [],
    sort = [],
    onSort,
    selectable = false,
    allSelected = false,
    onToggleAll,
}) {
    const getSortMeta = (sortKey) => {
        if (!sortKey || !Array.isArray(sort)) return null
        const idx = sort.findIndex(entry => entry.split(',')[0] === sortKey)
        if (idx === -1) return null
        return {
            index: idx + 1,
            dir: (sort[idx].split(',')[1] || 'asc').toLowerCase(),
        }
    }

    return (
        <div className="rounded-2xl overflow-hidden shadow-xs transition-all duration-200"
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.02)'
            }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left break-words" style={{ tableLayout: 'auto', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                            {selectable && (
                                <th className="pl-5 pr-2 py-3.5 w-10">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all rows"
                                        checked={allSelected}
                                        onChange={e => onToggleAll?.(e.target.checked)}
                                        className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                                    />
                                </th>
                            )}
                            {headers.map((header, idx) => {
                                const isObj = header && typeof header === 'object'
                                const label = isObj ? header.label : header
                                const sortKey = isObj ? header.sortKey : null
                                const sortable = Boolean(sortKey && onSort)
                                const sortMeta = getSortMeta(sortKey)

                                return (
                                    <th
                                        key={sortKey || label || idx}
                                        className={`px-6 py-3.5 text-[10.5px] font-bold uppercase tracking-wider select-none ${sortable ? 'cursor-pointer hover:opacity-80' : ''}`}
                                        style={{ color: sortMeta ? T.primaryText : T.textMuted, width: colWidths[idx] || 'auto' }}
                                        title={sortable ? 'Click to sort, Shift+Click to add secondary sort column' : undefined}
                                        onClick={sortable ? (e) => onSort(sortKey, e.shiftKey) : undefined}
                                    >
                                        <span className="inline-flex items-center gap-1.5">
                                            <span>{label}</span>
                                            {sortable && (
                                                <span className="inline-flex items-center gap-0.5 text-[13px]">
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {sortMeta?.dir === 'asc'
                                                            ? 'arrow_upward'
                                                            : sortMeta?.dir === 'desc'
                                                                ? 'arrow_downward'
                                                                : 'unfold_more'}
                                                    </span>
                                                    {sort.length > 1 && sortMeta && (
                                                        <span
                                                            className="text-[9px] font-black px-1 rounded-full leading-tight"
                                                            style={{ background: T.primaryDim, color: T.primary }}
                                                        >
                                                            {sortMeta.index}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    {children}
                </table>
            </div>
            {footer}
        </div>
    )
}
