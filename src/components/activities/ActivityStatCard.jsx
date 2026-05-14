import Skeleton from 'react-loading-skeleton'
import { T } from '../../constants/theme'

export default function ActivityStatCard({ icon, label, value, sub, loading, accent }) {
    return (
        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: accent ? accent + '20' : T.primaryDim }}>
                    <span className="material-symbols-outlined text-[18px]"
                        style={{ color: accent || T.primary }}>{icon}</span>
                </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>{label}</p>
            {loading
                ? <Skeleton height={30} width={80} borderRadius={8} />
                : <p className="text-2xl font-black" style={{ color: accent || T.textPrimary }}>{value ?? '—'}</p>
            }
            {sub && <p className="text-[11px] mt-1" style={{ color: T.textMuted }}>{sub}</p>}
        </div>
    )
}
