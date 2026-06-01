import { IconSearch, IconChevronRight, IconNote } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { STATUS_STYLES, PLAN_STYLES } from './platformConstants'
import TrialBadge from './TrialBadge'

export default function CompaniesTable({
    companies, filteredCompanies,
    loading, searchQ, setSearchQ,
    filterStatus, setFilterStatus,
    filterPlan, setFilterPlan,
    onManage,
}) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {/* Toolbar */}
            <div className="px-6 py-4 flex flex-wrap items-center gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px] max-w-xs"
                    style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                    <IconSearch size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search companies..."
                        className="bg-transparent outline-none text-sm w-full" style={{ color: T.textPrimary }} />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl outline-none border-0 cursor-pointer"
                    style={{ background: T.surfaceRaised, color: T.textSecondary, border: `1px solid ${T.border}` }}>
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="TRIAL">Trial</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INACTIVE">Inactive (Deleted)</option>
                </select>
                <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl outline-none border-0 cursor-pointer"
                    style={{ background: T.surfaceRaised, color: T.textSecondary, border: `1px solid ${T.border}` }}>
                    <option value="ALL">All Plans</option>
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                </select>
                <span className="sm:ml-auto text-xs" style={{ color: T.textMuted }}>
                    {filteredCompanies.length} of {companies.length}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                            {['Company', 'Plan', 'Status', 'Trial', 'Created', ''].map(h => (
                                <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: T.textMuted }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: T.textMuted }}>Loading...</td></tr>
                        ) : filteredCompanies.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: T.textMuted }}>No companies match your filters</td></tr>
                        ) : filteredCompanies.map((company, i) => {
                            const ss = company.active === false ? { bg: 'rgba(239,68,68,0.10)', color: '#EF4444' } : (STATUS_STYLES[company.status] || STATUS_STYLES.ACTIVE)
                            const ps = PLAN_STYLES[company.plan] || PLAN_STYLES.FREE
                            const hasNotes = company.notes?.trim().length > 0
                            return (
                                <tr key={company.id}
                                    style={{ background: i % 2 === 0 ? 'transparent' : T.surfaceRaised, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                                                style={{ background: T.primaryDim, color: T.primary }}>
                                                {company.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{company.name}</p>
                                                    {hasNotes && <IconNote size={11} style={{ color: T.textMuted }} title="Has internal notes" />}
                                                </div>
                                                <p className="text-[10px] font-mono" style={{ color: T.textMuted }}>{company.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                            style={{ background: ps.bg, color: ps.color }}>{company.plan}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                            style={{ background: ss.bg, color: ss.color }}>{company.active === false ? 'INACTIVE' : company.status}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {company.status === 'TRIAL'
                                            ? <TrialBadge trialEndsAt={company.trialEndsAt} status={company.status} />
                                            : <span className="text-xs" style={{ color: T.textMuted }}>—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>
                                        {company.createdAt
                                            ? new Date(company.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => onManage(company)}
                                            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                                            style={{ background: T.surfaceHigh, color: T.textSecondary }}
                                            onMouseEnter={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.color = T.primary }}
                                            onMouseLeave={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textSecondary }}>
                                            Manage <IconChevronRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}