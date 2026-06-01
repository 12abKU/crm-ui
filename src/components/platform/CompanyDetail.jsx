import { useEffect, useState } from 'react'
import { IconArrowLeft, IconTrash, IconClock, IconUsers, IconPlug, IconTicket, IconGauge } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import TopBar from '../TopBar'
import TrialBadge from './TrialBadge'
import CompanyControls from './CompanyControls'
import CompanyStatsGrid from './CompanyStatsGrid'
import CompanyNotes from './CompanyNotes'
import CompanyUsersTable from './CompanyUsersTable'
import IntegrationsPanel from './IntegrationsPanel'
import PlanConfigPanel from './PlanConfigPanel'
import { TrialModal, DeleteCompanyModal, AddUserModal, ResetPasswordModal } from './CompanyModals'
import { daysLeft } from './platformConstants'
import { PRIORITY_STYLES, STATUS_STYLES, CATEGORY_ICONS, timeAgo } from '../support/supportConstants'
import api from '../../api'
import Skeleton from 'react-loading-skeleton'

const TABS = [
    { id: 'overview', label: 'Overview', Icon: IconUsers },
    { id: 'plan-limits', label: 'Plan Limits', Icon: IconGauge },
    { id: 'integrations', label: 'Integrations', Icon: IconPlug },
    { id: 'tickets', label: 'Tickets', Icon: IconTicket },
]

// ── Company-scoped ticket panel ──────────────────────────────────────────────
function CompanyTicketsPanel({ companyId, companyName }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusUpdating, setStatusUpdating] = useState(null)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        api.get(`/api/support/tickets/platform?companyId=${companyId}&page=0&size=100`)
            .then(r => setTickets(r.data?.content ?? []))
            .catch(() => setTickets([]))
            .finally(() => setLoading(false))
    }, [companyId])

    const handleStatusChange = async (id, status) => {
        setStatusUpdating(id)
        try {
            const r = await api.patch(`/api/support/tickets/${id}/status`, { status })
            setTickets(prev => prev.map(t => t.id === id ? r.data : t))
        } finally { setStatusUpdating(null) }
    }

    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-5">
                <div className="overflow-x-auto w-full sm:w-auto scrollbar-none">
                    <div className="flex gap-1 p-1 rounded-xl w-max" style={{ background: T.surfaceHigh }}>
                        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                                style={{
                                    background: filter === f ? T.surface : 'transparent',
                                    color: filter === f ? T.textPrimary : T.textMuted,
                                    boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                                }}>
                                {f === 'ALL' ? 'All' : STATUS_STYLES[f]?.label}
                            </button>
                        ))}
                    </div>
                </div>
                <span className="text-xs shrink-0" style={{ color: T.textMuted }}>{tickets.length} total</span>
            </div>

            {loading ? (
                [1, 2].map(i => (
                    <div key={i} className="rounded-xl mb-3 overflow-hidden"
                        style={{ border: `1px solid ${T.border}`, background: T.surface }}>
                        <div className="h-1" style={{ background: T.borderSubtle }} />
                        <div className="p-4">
                            <Skeleton height={14} width={200} borderRadius={6} />
                            <Skeleton height={12} width={280} className="mt-2" borderRadius={6} />
                        </div>
                    </div>
                ))
            ) : filtered.length === 0 ? (
                <div className="rounded-xl p-10 text-center"
                    style={{ background: T.surface, border: `1.5px dashed ${T.border}` }}>
                    <IconTicket size={22} style={{ color: T.textMuted, margin: '0 auto 8px' }} />
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No tickets</p>
                    <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                        No support tickets from {companyName}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(t => {
                        const s = STATUS_STYLES[t.status] || STATUS_STYLES.OPEN
                        const p = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.MEDIUM
                        const catIcon = CATEGORY_ICONS[t.category] || 'help'
                        const isUpdating = statusUpdating === t.id
                        return (
                            <div key={t.id} className="rounded-xl overflow-hidden"
                                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                                <div className="h-1" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}60)` }} />
                                <div className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: T.primaryFaint }}>
                                                <span className="material-symbols-outlined filled text-[15px]"
                                                    style={{ color: T.primary }}>{catIcon}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{t.subject}</p>
                                                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: T.textMuted }}>{t.description}</p>
                                            </div>
                                        </div>
                                        {t.status !== 'CLOSED' && (
                                            <div className="flex gap-1.5 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                                {t.status === 'OPEN' && (
                                                    <button disabled={isUpdating}
                                                        onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                                                        style={{ background: 'rgba(217,119,6,0.10)', color: '#D97706' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,119,6,0.18)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,119,6,0.10)'}>
                                                        {isUpdating ? '…' : 'In Progress'}
                                                    </button>
                                                )}
                                                {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                                                    <button disabled={isUpdating}
                                                        onClick={() => handleStatusChange(t.id, 'RESOLVED')}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                                                        style={{ background: 'rgba(22,163,74,0.10)', color: '#16A34A' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(22,163,74,0.10)'}>
                                                        {isUpdating ? '…' : 'Resolve'}
                                                    </button>
                                                )}
                                                {t.status === 'RESOLVED' && (
                                                    <button disabled={isUpdating}
                                                        onClick={() => handleStatusChange(t.id, 'CLOSED')}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                                                        style={{ background: 'rgba(100,116,139,0.10)', color: '#64748B' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,116,139,0.18)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(100,116,139,0.10)'}>
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                                            style={{ background: s.bg, color: s.color }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.label}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: p.bg, color: p.color }}>{p.label}</span>
                                        <span className="text-[11px]" style={{ color: T.textMuted }}>
                                            #{t.id} · {timeAgo(t.createdAt)}
                                        </span>
                                        {t.submitterName && (
                                            <span className="text-[11px] ml-auto flex items-center gap-1"
                                                style={{ color: T.textMuted }}>
                                                <span className="material-symbols-outlined text-[11px]">person</span>
                                                {t.submitterName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ── Main CompanyDetail ────────────────────────────────────────────────────────
export default function CompanyDetail({
    company, companyStats, companyUsers, usersLoading,
    updating, impersonating,
    notes, notesSaving, notesSaved, onNotesChange,
    showTrialModal, showDeleteCompany, showAddUser, showResetPw,
    setShowTrialModal, setShowDeleteCompany, setShowAddUser, setShowResetPw,
    trialMode, setTrialMode, trialDays, setTrialDays, trialDate, setTrialDate,
    newUser, setNewUser, newPw, setNewPw,
    formSaving, formError, setFormError,
    onBack,
    onUpdatePlan, onUpdateStatus,
    onSubmitTrial, onSubmitDeleteCompany, onSubmitAddUser, onSubmitResetPw,
    onImpersonate, onResetPassword, onDeleteUser, onChangeRole,
    onRefreshUsers,
}) {
    const [tab, setTab] = useState('overview')
    const [planConfig, setPlanConfig] = useState(null)
    const days = daysLeft(company.trialEndsAt)
    const trialExpired = company.status === 'TRIAL' && company.trialEndsAt && days <= 0

    // Fetch dynamic plan limits for the stats grid
    useEffect(() => {
        api.get(`/api/platform/companies/${company.id}/plan-config`)
            .then(r => setPlanConfig(r.data))
            .catch(() => setPlanConfig(null))
    }, [company.id])

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-5xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                        <button onClick={onBack}
                            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl shrink-0"
                            style={{ color: T.textMuted, background: T.surfaceRaised }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                            onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                            <IconArrowLeft size={15} /> Back
                        </button>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-black truncate" style={{ color: T.textPrimary }}>{company.name}</h1>
                                <TrialBadge trialEndsAt={company.trialEndsAt} status={company.status} />
                            </div>
                            <p className="text-xs font-mono truncate" style={{ color: T.textMuted }}>{company.slug}</p>
                        </div>
                    </div>
                    <button onClick={() => { setFormError(''); setShowDeleteCompany(true) }}
                        className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl w-full lg:w-auto shrink-0"
                        style={{ background: T.errorDim, color: T.error }}>
                        <IconTrash size={13} /> Delete Company
                    </button>
                </div>

                {trialExpired && (
                    <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
                        style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}>
                        <IconClock size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
                        <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                            Trial expired on {new Date(company.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Users cannot log in. Extend trial or activate.
                        </p>
                    </div>
                )}

                <CompanyControls
                    company={company} updating={updating}
                    onUpdatePlan={onUpdatePlan}
                    onUpdateStatus={onUpdateStatus}
                    onOpenTrialModal={() => { setFormError(''); setTrialDays('14'); setTrialDate(''); setTrialMode('days'); setShowTrialModal(true) }}
                />

                <CompanyStatsGrid stats={companyStats} plan={company.plan} planConfig={planConfig} />
                <CompanyNotes notes={notes} onChange={onNotesChange} saving={notesSaving} saved={notesSaved} />

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl mb-5 w-full sm:w-fit"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    {TABS.map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-initial"
                            style={{
                                background: tab === id ? T.primary : 'transparent',
                                color: tab === id ? '#fff' : T.textMuted,
                            }}>
                            <Icon size={15} />{label}
                        </button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <CompanyUsersTable
                        users={companyUsers} loading={usersLoading}
                        updating={updating} impersonating={impersonating}
                        onRefresh={onRefreshUsers}
                        onAddUser={() => { setFormError(''); setShowAddUser(true) }}
                        onImpersonate={onImpersonate}
                        onResetPassword={(u) => { setFormError(''); setNewPw(''); setShowResetPw(u) }}
                        onDeleteUser={onDeleteUser}
                        onChangeRole={onChangeRole}
                    />
                )}
                {tab === 'plan-limits' && (
                    <div className="rounded-2xl p-6"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <PlanConfigPanel
                            companyId={company.id}
                            onSaved={(saved) => setPlanConfig(saved)}
                        />
                    </div>
                )}
                {tab === 'integrations' && <IntegrationsPanel companyId={company.id} />}
                {tab === 'tickets' && (
                    <CompanyTicketsPanel companyId={company.id} companyName={company.name} />
                )}
            </main>

            {showTrialModal && (
                <TrialModal
                    company={company} onClose={() => setShowTrialModal(false)}
                    trialMode={trialMode} setTrialMode={setTrialMode}
                    trialDays={trialDays} setTrialDays={setTrialDays}
                    trialDate={trialDate} setTrialDate={setTrialDate}
                    formSaving={formSaving} formError={formError}
                    onSubmit={onSubmitTrial}
                />
            )}
            {showDeleteCompany && (
                <DeleteCompanyModal
                    company={company} onClose={() => setShowDeleteCompany(false)}
                    formSaving={formSaving} formError={formError}
                    onSubmit={onSubmitDeleteCompany}
                />
            )}
            {showAddUser && (
                <AddUserModal
                    company={company} newUser={newUser} setNewUser={setNewUser}
                    onClose={() => setShowAddUser(false)}
                    formSaving={formSaving} formError={formError}
                    onSubmit={onSubmitAddUser}
                />
            )}
            {showResetPw && (
                <ResetPasswordModal
                    user={showResetPw} newPw={newPw} setNewPw={setNewPw}
                    onClose={() => setShowResetPw(null)}
                    formSaving={formSaving} formError={formError}
                    onSubmit={onSubmitResetPw}
                />
            )}
        </div>
    )
}