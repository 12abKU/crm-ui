import { T } from '../../constants/theme'

export default function CallStatCard({ icon, label, value, bg, color }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value}</p>
            </div>
        </div>
    )
}
