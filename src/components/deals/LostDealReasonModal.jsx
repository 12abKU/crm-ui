import { useState } from 'react'
import { LOST_DEAL_REASONS, T } from '../../constants/theme'

export default function LostDealReasonModal({ deal, open, saving = false, onClose, onConfirm }) {
    const [reason, setReason] = useState(deal?.lostReason || LOST_DEAL_REASONS[0])
    const [note, setNote] = useState(deal?.lostReasonNote || '')
    const [touched, setTouched] = useState(false)

    if (!open) return null

    const valid = reason.trim().length > 0

    const submit = (e) => {
        e.preventDefault()
        setTouched(true)
        if (!valid) return
        onConfirm?.({ lostReason: reason.trim(), lostReasonNote: note.trim() || null })
    }

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm"
                style={{ background: 'rgba(15,23,42,0.55)', zIndex: 70 }}
                onClick={saving ? undefined : onClose} />
            <form onSubmit={submit}
                className="fixed left-1/2 top-1/2 w-[440px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
                style={{ background: T.surface, border: `1.5px solid ${T.border}`, boxShadow: '0 24px 70px rgba(0,0,0,0.25)', zIndex: 80 }}>
                <div className="px-6 py-5 flex items-start justify-between gap-4"
                    style={{ borderBottom: `1px solid ${T.border}`, background: T.errorDim }}>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(220,38,38,0.16)' }}>
                            <span className="material-symbols-outlined filled text-[20px]" style={{ color: T.error }}>
                                flag
                            </span>
                        </div>
                        <div>
                            <h2 className="text-base font-black" style={{ color: T.textPrimary }}>Why was this deal lost?</h2>
                            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: T.textSecondary }}>
                                This keeps forecasting and lost-deal reports useful for the team.
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} disabled={saving}
                        className="material-symbols-outlined text-[20px] p-1.5 rounded-lg"
                        style={{ color: T.textMuted }}>
                        close
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                    {deal?.title && (
                        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                            style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                            <span className="material-symbols-outlined text-[15px]" style={{ color: T.error }}>handshake</span>
                            <span className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>{deal.title}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                            Lost Reason *
                        </label>
                        <select className="crm-select" value={reason}
                            onChange={e => setReason(e.target.value)}
                            disabled={saving}>
                            {LOST_DEAL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {touched && !valid && (
                            <p className="text-[11px] font-semibold" style={{ color: T.error }}>Choose a reason.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                            Note
                        </label>
                        <textarea className="crm-input min-h-24 resize-y"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            disabled={saving}
                            placeholder="Optional context, competitor name, pricing issue, next chance..." />
                    </div>
                </div>

                <div className="px-6 py-4 flex gap-3" style={{ borderTop: `1px solid ${T.border}` }}>
                    <button type="button" onClick={onClose} disabled={saving} className="crm-btn-ghost flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="crm-btn-primary flex-1"
                        style={{ background: T.error }}>
                        {saving ? 'Saving...' : 'Mark Lost'}
                    </button>
                </div>
            </form>
        </>
    )
}
