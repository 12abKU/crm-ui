import { useState } from 'react'
import { T, STAGE_LABELS, STAGE_STYLES, STAGES } from '../../constants/theme'
import { useSelector } from 'react-redux'
import api from '../../api'
import { extractApiErrorMessage } from '../../api'

export default function DealPanelOverview({ deal, isAgent, isAssignedToMe, canEdit }) {
    const [stage, setStage] = useState(deal.stage)
    const [saving, setSaving] = useState(false)
    const [stageError, setStageError] = useState(null)

    const role = useSelector(state => state.auth.role)
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const canChangeStage = canEdit || (isAgent && isAssignedToMe)
    const assignees = deal.assignees ?? []

    const handleStageChange = async (newStage) => {
        if (newStage === stage) return
        setStageError(null)
        setSaving(true)
        try {
            await api.put(`/api/deals/${deal.id}`, {
                title: deal.title,
                amount: deal.amount,
                stage: newStage,
                expectedCloseDate: deal.expectedCloseDate,
                accountId: deal.account?.id || null,
                contactId: deal.contact?.id || null,
            })
            setStage(newStage)
        } catch (err) {
            setStageError(extractApiErrorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    const baseFields = [
        { label: 'Amount', value: deal.amount > 0 ? `₹${deal.amount.toLocaleString()}` : '—' },
        { label: 'Expected Close', value: deal.expectedCloseDate || '—' },
        { label: 'Account', value: deal.account?.name || '—' },
        { label: 'Contact', value: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '—' },
        { label: 'Created', value: deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '—' },
    ]

    return (
        <div className="px-7 py-6">
            {/* Stage banner */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl"
                style={{ background: T.surfaceRaised }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: STAGE_STYLES[stage].badgeBg }}>
                        <span className="material-symbols-outlined text-[20px]"
                            style={{ color: STAGE_STYLES[stage].badgeColor }}>handshake</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                            Current Stage
                        </p>
                        <p className="text-base font-black" style={{ color: STAGE_STYLES[stage].badgeColor }}>
                            {STAGE_LABELS[stage]}
                        </p>
                    </div>
                </div>
                {deal.amount > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Deal Value</p>
                        <p className="text-base font-black" style={{ color: T.primary }}>
                            ₹{deal.amount.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Stage changer */}
            {canChangeStage && (
                <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>
                        {isAgent ? 'Move Stage' : 'Change Stage'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {STAGES.map(st => {
                            const ss = STAGE_STYLES[st]
                            const isActive = stage === st
                            return (
                                <button key={st} disabled={saving}
                                    onClick={() => handleStageChange(st)}
                                    className="px-3 py-1.5 rounded-full text-[12px] font-bold transition-all"
                                    style={{
                                        background: isActive ? ss.badgeBg : T.surfaceRaised,
                                        color: isActive ? ss.badgeColor : T.textMuted,
                                        border: `1.5px solid ${isActive ? ss.accent : T.border}`,
                                        opacity: saving ? 0.6 : 1,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                    }}>
                                    {STAGE_LABELS[st]}
                                </button>
                            )
                        })}
                        {saving && <span className="text-[12px] font-medium self-center" style={{ color: T.textMuted }}>Saving…</span>}
                    </div>
                    {stageError && <p className="text-[12px] font-semibold mt-2" style={{ color: T.error }}>{stageError}</p>}
                </div>
            )}

            {/* Agent locked notice
            {isAgent && !isAssignedToMe && (
                <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2"
                    style={{ background: T.warningDim, border: `1px solid ${T.warning}` }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: T.warning }}>lock</span>
                    <p className="text-[12px] font-semibold" style={{ color: T.warning }}>
                        This deal is not assigned to you. You can view it but cannot make changes.
                    </p>
                </div>
            )} */}

            {/* Admin/SuperAdmin: Created by block */}
            {isAdminOrAbove && deal.owner && (
                <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
                    style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>person_add</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Created by</p>
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                            {deal.owner.name}
                            <span className="ml-2 text-[11px] font-normal" style={{ color: T.textMuted }}>({deal.owner.role})</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Assignees block */}
            <div className="mb-5 px-4 py-3 rounded-xl"
                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>
                    {assignees.length > 0 ? `Assigned to (${assignees.length})` : 'Assigned to'}
                </p>
                {assignees.length === 0 ? (
                    <p className="text-sm" style={{ color: T.textMuted }}>Unassigned</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {assignees.map(u => (
                            <div key={u.id} className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{u.name}</p>
                                    <p className="text-[11px]" style={{ color: T.textMuted }}>{u.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>
                Deal Details
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {baseFields.map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-[11px] font-semibold mb-0.5" style={{ color: T.textMuted }}>{label}</p>
                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}