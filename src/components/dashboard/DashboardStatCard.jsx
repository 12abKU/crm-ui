import Skeleton from 'react-loading-skeleton'
import { T } from '../../constants/theme'

export default function DashboardStatCard({ icon, label, value, sub, loading }) {
    return (
        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl" style={{ background: T.primaryDim }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: T.primary }}>{icon}</span>
                </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>{label}</p>
            {loading
                ? <Skeleton height={36} width={100} borderRadius={8} />
                : <h3 className="text-3xl font-black" style={{ color: T.textPrimary }}>{value}</h3>
            }
            {sub && <p className="text-[12px] mt-1" style={{ color: T.textMuted }}>{sub}</p>}
        </div>
    )
}
