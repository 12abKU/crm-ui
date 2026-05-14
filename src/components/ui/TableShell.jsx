import { T } from '../../constants/theme'

export default function TableShell({ headers, children, footer }) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <table className="w-full text-left">
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
            {footer}
        </div>
    )
}
