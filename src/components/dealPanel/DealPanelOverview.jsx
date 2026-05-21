import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, STAGE_LABELS, STAGE_STYLES, STAGES } from '../../constants/theme'
import { useSelector } from 'react-redux'
import api from '../../api'
import { extractApiErrorMessage } from '../../api'

// ── Shared InfoCard ───────────────────────────────────────────
const InfoCard = ({ label, children }) => (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <div className="text-sm font-semibold" style={{ color: T.textPrimary }}>{children}</div>
    </div>
)

export default function DealPanelOverview({ deal, isAgent, isAssignedToMe, canEdit }) {
    const [stage, setStage] = useState(deal.stage)
    const [saving, setSaving] = useState(false)
    const [stageError, setStageError] = useState(null)
    const navigate = useNavigate()

    const role = useSelector(state => state.auth.role)
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const canChangeStage = canEdit || (isAgent && isAssignedToMe)
    const assignees = deal.assignees ?? []

    // ── Stage change handler (unchanged) ──────────────────────
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

    const contactName = deal.contact
        ? `${deal.contact.firstName} ${deal.contact.lastName}`
        : '—'

    const currentStyle = STAGE_STYLES[stage]

    return (
        <div className="px-6 py-5 flex flex-col gap-5">

            {/* ── Stage + Value Hero Card ──────────────── */}
            <div className="flex items-center justify-between p-5 rounded-2xl"
                style={{
                    background: `linear-gradient(135deg, ${currentStyle.badgeBg} 0%, ${T.surface} 100%)`,
                    border: `1.5px solid ${currentStyle.accent}30`,
                    boxShadow: `0 2px 12px ${currentStyle.accent}12`,
                }}>
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: currentStyle.badgeBg, border: `1.5px solid ${currentStyle.accent}30` }}>
                        <span className="material-symbols-outlined filled text-[20px]"
                            style={{ color: currentStyle.accent }}>handshake</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: currentStyle.accent }}>Current Stage</p>
                        <p className="text-base font-black mt-0.5" style={{ color: currentStyle.badgeColor }}>
                            {STAGE_LABELS[stage]}
                        </p>
                    </div>
                </div>
                {deal.amount > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                            Deal Value
                        </p>
                        <p className="text-xl font-black mt-0.5" style={{ color: T.primary }}>
                            ₹{deal.amount.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Stage changer (unchanged logic) ─────── */}
            {canChangeStage && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: T.textMuted }}>
                        {isAgent ? 'Move Stage' : 'Change Stage'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {STAGES.map(st => {
                            const ss = STAGE_STYLES[st]
                            const isActive = stage === st
                            return (
                                <button key={st} disabled={saving}
                                    onClick={() => handleStageChange(st)}
                                    className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
                                    style={{
                                        background: isActive ? ss.badgeBg : T.surfaceRaised,
                                        color: isActive ? ss.badgeColor : T.textMuted,
                                        border: `1.5px solid ${isActive ? ss.accent : T.border}`,
                                        opacity: saving ? 0.6 : 1,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                                    }}>
                                    {STAGE_LABELS[st]}
                                </button>
                            )
                        })}
                        {saving && <span className="text-[12px] self-center" style={{ color: T.textMuted }}>Saving…</span>}
                    </div>
                    {stageError && <p className="text-[12px] font-semibold mt-2" style={{ color: T.error }}>{stageError}</p>}
                </div>
            )}

            {/* ── Created by (unchanged logic) ─────────── */}
            {isAdminOrAbove && deal.owner && (
                <div className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {deal.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Created by</p>
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                            {deal.owner.name}
                            <span className="ml-2 text-[11px] font-normal" style={{ color: T.textMuted }}>({deal.owner.role})</span>
                        </p>
                    </div>
                </div>
            )}

            {/* ── Assignees (unchanged logic) ──────────── */}
            <div className="p-4 rounded-xl" style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                    {assignees.length > 0 ? `Assigned to (${assignees.length})` : 'Assigned to'}
                </p>
                {assignees.length === 0 ? (
                    <p className="text-sm" style={{ color: T.textMuted }}>Unassigned</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {assignees.map(u => (
                            <div key={u.id} className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
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

            {/* ── Deal details grid ─────────────────────── */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                    Deal Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="Amount">
                        <span style={{ color: deal.amount > 0 ? T.primary : T.textMuted }}>
                            {deal.amount > 0 ? `₹${deal.amount.toLocaleString()}` : '—'}
                        </span>
                    </InfoCard>
                    <InfoCard label="Expected Close">
                        <span style={{ color: deal.expectedCloseDate ? T.textPrimary : T.textMuted }}>
                            {deal.expectedCloseDate || '—'}
                        </span>
                    </InfoCard>
                    <InfoCard label="Account">
                        {deal.account ? (
                            <button onClick={() => navigate(`/accounts/${deal.account.id}`)}
                                className="hover:underline text-left font-bold"
                                style={{ color: T.primary }}>
                                {deal.account.name}
                            </button>
                        ) : <span style={{ color: T.textMuted }}>—</span>}
                    </InfoCard>
                    <InfoCard label="Contact">
                        {deal.contact ? (
                            <button onClick={() => navigate(`/contacts/${deal.contact.id}`)}
                                className="hover:underline text-left font-bold"
                                style={{ color: T.primary }}>
                                {contactName}
                            </button>
                        ) : <span style={{ color: T.textMuted }}>—</span>}
                    </InfoCard>
                    <InfoCard label="Created">
                        <span style={{ color: deal.createdAt ? T.textPrimary : T.textMuted }}>
                            {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '—'}
                        </span>
                    </InfoCard>
                </div>
            </div>
        </div>
    )
}