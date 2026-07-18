import { T } from '../../constants/theme'

export default function CallStatCard({ icon, label, value, bg, color }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-150"
            style={{
                background: T.surface,
                border: `1.5px solid ${color}22`,
                boxShadow: `0 2px 12px ${color}08`,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 6px 20px ${color}18`
                e.currentTarget.style.borderColor = `${color}40`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = `0 2px 12px ${color}08`
                e.currentTarget.style.borderColor = `${color}22`
            }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}>
                <span className="material-symbols-outlined filled text-[22px]" style={{ color }}>{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: T.textMuted }}>{label}</p>
                <p className="text-xl sm:text-2xl font-black" style={{ color }}>{value}</p>
            </div>
        </div>
    )
}
