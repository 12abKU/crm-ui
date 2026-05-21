import { T } from '../../constants/theme'
import { IconSend, IconTicket, IconCircleCheckFilled } from '@tabler/icons-react'

export default function SubmitTicketTab({
    form, setForm, submitting, submitSuccess, submitError,
    onSubmit, onViewTickets, onSubmitAnother,
    name, email, companyName,
}) {
    const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    if (submitSuccess) {
        return (
            <div className="max-w-2xl">
                <div className="rounded-2xl p-12 flex flex-col items-center gap-5 text-center"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(22,163,74,0.10)' }}>
                        <IconCircleCheckFilled size={40} style={{ color: '#16A34A' }} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black" style={{ color: T.textPrimary }}>Ticket Submitted!</h3>
                        <p className="text-sm mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: T.textMuted }}>
                            We've received your request. You can track it in My Tickets. Our team typically responds within 24 hours.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-1">
                        <button onClick={onViewTickets} className="crm-btn-primary flex items-center gap-2">
                            <IconTicket size={16} /> View My Tickets
                        </button>
                        <button onClick={onSubmitAnother} className="crm-btn-ghost">
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl">
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                {/* Form header */}
                <div className="px-8 py-5" style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                    <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>Submit a Support Ticket</h3>
                    <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                        Describe your issue and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="p-8" style={{ background: T.surface }}>
                    {submitError && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2"
                            style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                        {/* Submitter card */}
                        <div className="flex gap-4 p-4 rounded-xl" style={{ background: T.surfaceRaised, border: `1px solid ${T.borderSubtle}` }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{name}</p>
                                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{email} · {companyName}</p>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                Subject *
                            </label>
                            <input className="crm-input" placeholder="Brief description of your issue"
                                value={form.subject} onChange={setF('subject')} required />
                        </div>

                        {/* Category + Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                    Category *
                                </label>
                                <select className="crm-select" value={form.category} onChange={setF('category')} required>
                                    <option value="">Select category</option>
                                    <option value="BILLING">Billing</option>
                                    <option value="TECHNICAL">Technical Issue</option>
                                    <option value="FEATURE_REQUEST">Feature Request</option>
                                    <option value="BUG_REPORT">Bug Report</option>
                                    <option value="ACCOUNT">Account / Access</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                    Priority
                                </label>
                                <select className="crm-select" value={form.priority} onChange={setF('priority')}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                Description *
                            </label>
                            <textarea className="crm-input" rows={6}
                                placeholder="Describe your issue in detail. Include steps to reproduce, what you expected vs what happened, and any error messages you saw."
                                value={form.description} onChange={setF('description')}
                                style={{ resize: 'vertical', minHeight: 120 }} required />
                        </div>

                        <button type="submit" disabled={submitting}
                            className="crm-btn-primary flex items-center justify-center gap-2 py-3">
                            {submitting
                                ? <><div className="w-4 h-4 rounded-full border-2 animate-spin"
                                    style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />Submitting…</>
                                : <><IconSend size={15} />Submit Ticket</>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}