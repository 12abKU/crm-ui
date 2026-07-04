import Skeleton from 'react-loading-skeleton'
import { T } from '../../constants/theme'

export default function ActivityStatCard({ icon, label, value, sub, loading, accent }) {
    const color = accent || T.primary
    const bg = accent ? accent + '18' : T.primaryDim

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-150"
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
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}>
                    <span className="material-symbols-outlined filled text-[20px]"
                        style={{ color }}>{icon}</span>
                </div>
                {/* Accent dot */}
                <div className="w-2 h-2 rounded-full" style={{ background: color + '60' }} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1.5"
                    style={{ color: T.textMuted }}>{label}</p>
                {loading
                    ? <Skeleton height={30} width={80} borderRadius={8} />
                    : <p className="text-2xl font-black" style={{ color }}>{value ?? '0'}</p>
                }
                {sub && <p className="text-[11px] mt-1" style={{ color: T.textMuted }}>{sub}</p>}
            </div>
        </div>
    )
}
