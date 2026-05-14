import { T } from '../../constants/theme'

export default function EmptyTableRow({ colSpan, icon, title }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>{icon}</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{title}</p>
                </div>
            </td>
        </tr>
    )
}
