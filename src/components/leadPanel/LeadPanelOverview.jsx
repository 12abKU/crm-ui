import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T } from '../../constants/theme'
import api from '../../api'
import { extractApiErrorMessage } from '../../api'
import { useSelector } from 'react-redux'
import AssignLeadModal from './AssignLeadModal'
import ConvertLeadModal from './ConvertLeadModal'

const InfoCard = ({ label, children }) => (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <div className="text-sm font-semibold" style={{ color: T.textPrimary }}>{children}</div>
    </div>
)

export default function LeadPanelOverview({ profile, onUpdate, canEdit }) {
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [stageError, setStageError] = useState(null)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showConvertModal, setShowConvertModal] = useState(false)

    const role = useSelector(state => state.auth.role)
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'
    
    const assignees = profile.assignees ?? []

    const handleStageChange = async (newStage) => {
        if (newStage === profile.status) return
        setStageError(null)
        setSaving(true)
        try {
            await api.patch(`/api/leads/${profile.id}/status`, { status: newStage })
            if (onUpdate) onUpdate()
        } catch (err) {
            setStageError(extractApiErrorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    const LEAD_STAGES = [
        { stageKey: 'NEW', label: 'New' },
        { stageKey: 'CONTACTED', label: 'Contacted' },
        { stageKey: 'QUALIFIED', label: 'Qualified' },
        { stageKey: 'CONVERTED', label: 'Converted' },
        { stageKey: 'LOST', label: 'Lost' }
    ]

    const STAGE_STYLES = {
        NEW: { accent: T.stone600, badgeBg: T.stone100, badgeColor: T.stone600 },
        CONTACTED: { accent: T.blue600, badgeBg: T.blue100, badgeColor: T.blue600 },
        QUALIFIED: { accent: T.teal600, badgeBg: T.teal100, badgeColor: T.teal600 },
        CONVERTED: { accent: T.green600, badgeBg: T.green100, badgeColor: T.green600 },
        LOST: { accent: T.red600, badgeBg: T.red100, badgeColor: T.red600 },
    }

    return (
        <div className="px-6 py-5 flex flex-col gap-5">
            {canEdit && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                            Change Status
                        </p>
                        {profile.status !== 'CONVERTED' && (
                            <button onClick={() => setShowConvertModal(true)}
                                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                                Convert to Deal
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {LEAD_STAGES.map(s => {
                        const ss = STAGE_STYLES[s.stageKey] || STAGE_STYLES.NEW
                        const isActive = profile.status === s.stageKey
                        return (
                            <button key={s.stageKey} disabled={saving}
                                onClick={() => handleStageChange(s.stageKey)}
                                className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
                                style={{
                                    background: isActive ? ss.badgeBg : T.surfaceRaised,
                                    color: isActive ? ss.badgeColor : T.textMuted,
                                    border: `1.5px solid ${isActive ? ss.accent : T.border}`,
                                    opacity: saving ? 0.6 : 1,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transform: isActive ? 'scale(1.04)' : 'scale(1)',
                                }}>
                                {s.label}
                            </button>
                        )
                    })}
                        {saving && <span className="text-[12px] self-center" style={{ color: T.textMuted }}>Saving…</span>}
                    </div>
                    {stageError && <p className="text-[12px] font-semibold mt-2" style={{ color: T.error }}>{stageError}</p>}
                </div>
            )}

            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                    Lead Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoCard label="Sender Name">
                        <span style={{ color: profile.senderName ? T.textPrimary : T.textMuted }}>
                            {profile.senderName || 'No value'}
                        </span>
                    </InfoCard>
                    <InfoCard label="Email">
                        <span style={{ color: profile.senderEmail ? T.textPrimary : T.textMuted }}>
                            {profile.senderEmail || 'No value'}
                        </span>
                    </InfoCard>
                    <InfoCard label="Phone">
                        <span style={{ color: profile.senderPhone ? T.textPrimary : T.textMuted }}>
                            {profile.senderPhone || 'No value'}
                        </span>
                    </InfoCard>
                    <InfoCard label="Company">
                        <span style={{ color: profile.indiamartCompany || profile.accountName || profile.companyName ? T.textPrimary : T.textMuted }}>
                            {profile.indiamartCompany || profile.accountName || profile.companyName || '0'}
                        </span>
                    </InfoCard>
                    <InfoCard label="City/Location">
                        <span style={{ color: profile.city || profile.indiamartState ? T.textPrimary : T.textMuted }}>
                            {profile.city || profile.indiamartState || 'No value'}
                        </span>
                    </InfoCard>
                    <InfoCard label="Created">
                        <span style={{ color: profile.createdAt ? T.textPrimary : T.textMuted }}>
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'No value'}
                        </span>
                    </InfoCard>
                </div>
            </div>

            {/* ── Integration Specific Details ── */}
            {profile.source === 'INDIAMART' && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                        IndiaMart Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoCard label="Product Query">
                            <span style={{ color: profile.indiamartProduct ? T.textPrimary : T.textMuted }}>{profile.indiamartProduct || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Subject">
                            <span style={{ color: profile.indiamartSubject ? T.textPrimary : T.textMuted }}>{profile.indiamartSubject || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Address">
                            <span style={{ color: profile.indiamartAddress ? T.textPrimary : T.textMuted }}>{profile.indiamartAddress || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Pincode">
                            <span style={{ color: profile.indiamartPincode ? T.textPrimary : T.textMuted }}>{profile.indiamartPincode || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Alt Email">
                            <span style={{ color: profile.indiamartAltEmail ? T.textPrimary : T.textMuted }}>{profile.indiamartAltEmail || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Lead Time">
                            <span style={{ color: profile.indiamartLeadTime ? T.textPrimary : T.textMuted }}>{profile.indiamartLeadTime || 'No value'}</span>
                        </InfoCard>
                    </div>
                </div>
            )}

            {profile.source === 'SULEKHA' && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                        Sulekha Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoCard label="Requirement">
                            <span style={{ color: profile.sulekhaRequirement ? T.textPrimary : T.textMuted }}>{profile.sulekhaRequirement || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Service">
                            <span style={{ color: profile.sulekhaService ? T.textPrimary : T.textMuted }}>{profile.sulekhaService || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Category">
                            <span style={{ color: profile.sulekhaCategory ? T.textPrimary : T.textMuted }}>{profile.sulekhaCategory || 'No value'}</span>
                        </InfoCard>
                        <InfoCard label="Date">
                            <span style={{ color: profile.sulekhaDate ? T.textPrimary : T.textMuted }}>{profile.sulekhaDate || 'No value'}</span>
                        </InfoCard>
                    </div>
                </div>
            )}

            {profile.source === 'WHATSAPP' && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                        WhatsApp Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoCard label="WhatsApp Number">
                            <span style={{ color: profile.whatsappNumber ? T.textPrimary : T.textMuted }}>{profile.whatsappNumber || 'No value'}</span>
                        </InfoCard>
                    </div>
                    {profile.whatsappFirstMessage && (
                        <div className="mt-3 p-4 rounded-xl" style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>First Message</p>
                            <p className="text-sm" style={{ color: T.textSecondary, whiteSpace: 'pre-wrap' }}>
                                {profile.whatsappFirstMessage}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {profile.message && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                        Message / Notes
                    </p>
                    <div className="p-4 rounded-xl" style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                        <p className="text-sm" style={{ color: T.textSecondary, whiteSpace: 'pre-wrap' }}>
                            {profile.message}
                        </p>
                    </div>
                </div>
            )}

            {(profile.accountId || profile.contactId) && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                        Linked Records
                    </p>
                    <div className="flex flex-col gap-3">
                        {profile.accountId && (
                            <div className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                                style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}
                                onClick={() => navigate(`/accounts/${profile.accountId}`)}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primaryDim }}>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>business</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Account</p>
                                    <p className="text-sm font-bold hover:underline" style={{ color: T.primary }}>{profile.accountName || 'View Account'}</p>
                                </div>
                            </div>
                        )}
                        {profile.contactId && (
                            <div className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                                style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}
                                onClick={() => navigate(`/contacts/${profile.contactId}`)}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primaryDim }}>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>person</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Contact</p>
                                    <p className="text-sm font-bold hover:underline" style={{ color: T.primary }}>{profile.contactName || 'View Contact'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Assignees ──────────── */}
            <div className="p-4 rounded-xl" style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                        {assignees.length > 0 ? `Assigned to (${assignees.length})` : 'Assigned to'}
                    </p>
                    {isAdminOrAbove && (
                        <button onClick={() => setShowAssignModal(true)}
                            className="text-[10px] font-bold px-2 py-1 rounded-md"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {assignees.length > 0 ? 'Manage' : 'Assign'}
                        </button>
                    )}
                </div>
                
                {assignees.length === 0 ? (
                    <p className="text-sm" style={{ color: T.textMuted }}>Unassigned</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {assignees.map(u => (
                            <div key={u.id} className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
                                onClick={() => navigate(`/team/${u.id}`)}
                                title={`View ${u.name}'s Profile`}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform duration-150 hover:scale-105 active:scale-95"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold hover:text-primary transition-colors hover:underline" style={{ color: T.textPrimary }}>{u.name}</p>
                                    <p className="text-[11px]" style={{ color: T.textMuted }}>{u.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAssignModal && (
                <AssignLeadModal 
                    profile={profile}
                    onClose={() => setShowAssignModal(false)}
                    onAssigned={() => { if (onUpdate) onUpdate() }}
                />
            )}

            {showConvertModal && (
                <ConvertLeadModal
                    lead={profile}
                    onClose={() => setShowConvertModal(false)}
                    onConverted={(newDeal) => {
                        setShowConvertModal(false)
                        if (newDeal && newDeal.id) {
                            navigate(`/deals?dealId=${newDeal.id}`)
                        } else {
                            if (onUpdate) onUpdate()
                        }
                    }}
                />
            )}
        </div>
    )
}
