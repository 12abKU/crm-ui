// src/components/platform/CompanyDetail.jsx
import { useState } from 'react'
import { IconArrowLeft, IconTrash, IconClock, IconUsers, IconPlug } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import TopBar from '../TopBar'
import TrialBadge from './TrialBadge'
import CompanyControls from './CompanyControls'
import CompanyStatsGrid from './CompanyStatsGrid'
import CompanyNotes from './CompanyNotes'
import CompanyUsersTable from './CompanyUsersTable'
import IntegrationsPanel from './IntegrationsPanel'
import { TrialModal, DeleteCompanyModal, AddUserModal, ResetPasswordModal } from './CompanyModals'
import { daysLeft } from './platformConstants'

const TABS = [
    { id: 'overview', label: 'Overview', Icon: IconUsers },
    { id: 'integrations', label: 'Integrations', Icon: IconPlug },
]

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
    const days = daysLeft(company.trialEndsAt)
    const trialExpired = company.status === 'TRIAL' && company.trialEndsAt && days <= 0

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={onBack}
                        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl"
                        style={{ color: T.textMuted, background: T.surfaceRaised }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                        onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                        <IconArrowLeft size={15} /> Back
                    </button>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black" style={{ color: T.textPrimary }}>{company.name}</h1>
                            <TrialBadge trialEndsAt={company.trialEndsAt} status={company.status} />
                        </div>
                        <p className="text-xs font-mono" style={{ color: T.textMuted }}>{company.slug}</p>
                    </div>
                    <button onClick={() => { setFormError(''); setShowDeleteCompany(true) }}
                        className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl"
                        style={{ background: T.errorDim, color: T.error }}>
                        <IconTrash size={13} /> Delete Company
                    </button>
                </div>

                {/* Trial expired warning */}
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

                <CompanyStatsGrid stats={companyStats} />

                <CompanyNotes notes={notes} onChange={onNotesChange} saving={notesSaving} saved={notesSaved} />

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl mb-5"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, width: 'fit-content' }}>
                    {TABS.map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                            style={{
                                background: tab === id ? T.primary : 'transparent',
                                color: tab === id ? '#fff' : T.textMuted,
                            }}>
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'overview' ? (
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
                ) : (
                    <IntegrationsPanel companyId={company.id} />
                )}
            </main>

            {/* Modals */}
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