import { T } from '../../constants/theme'

export default function TableShell({ headers, children, footer }) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                            {headers.map((header) => (
                                <th key={header} className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
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
