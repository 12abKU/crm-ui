import { T } from '../../constants/theme'

export default function TableShell({ headers, children, footer, colWidths = [] }) {
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
                            {headers.map((header, idx) => (
                                <th key={header} className="px-6 py-3.5 text-[10.5px] font-bold uppercase tracking-wider"
                                    style={{ color: T.textMuted, width: colWidths[idx] || 'auto' }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {children}
                </table>
            </div>
            {footer}
        </div>
    )
}
