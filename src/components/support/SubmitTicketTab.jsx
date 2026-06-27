import { T } from '../../constants/theme'
import { IconSend, IconTicket, IconCircleCheckFilled, IconAlertCircle } from '@tabler/icons-react'

const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low', color: '#64748B', icon: 'arrow_downward' },
    { value: 'MEDIUM', label: 'Medium', color: '#D97706', icon: 'remove' },
    { value: 'HIGH', label: 'High', color: '#DC2626', icon: 'arrow_upward' },
    { value: 'URGENT', label: 'Urgent', color: '#991B1B', icon: 'priority_high' },
]

const CATEGORY_OPTIONS = [
    { value: 'BILLING', label: 'Billing', icon: 'payments' },
    { value: 'TECHNICAL', label: 'Technical Issue', icon: 'build' },
    { value: 'FEATURE_REQUEST', label: 'Feature Request', icon: 'lightbulb' },
    { value: 'BUG_REPORT', label: 'Bug Report', icon: 'bug_report' },
    { value: 'ACCOUNT', label: 'Account / Access', icon: 'manage_accounts' },
    { value: 'OTHER', label: 'Other', icon: 'help' },
]

export default function SubmitTicketTab({
    form, setForm, submitting, submitSuccess, submitError,
    onSubmit, onViewTickets, onSubmitAnother,
    name, email, companyName,
}) {
    const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
    const setFv = (key, val) => setForm(f => ({ ...f, [key]: val }))

    if (submitSuccess) {
        return (
            <div className="max-w-xl">
                <div className="rounded-3xl overflow-hidden"
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}>
                    {/* Top green bar */}
                    <div className="h-1.5 w-full"
                        style={{ background: 'linear-gradient(90deg, #16A34A, )' }} />
                    <div className="p-12 flex flex-col items-center gap-5 text-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{
                                background: 'radial-gradient(circle, rgba(22,163,74,0.15), rgba(22,163,74,0.05))',
                                border: '2px solid rgba(22,163,74,0.20)',
                            }}>
                            <IconCircleCheckFilled size={44} style={{ color: '#16A34A' }} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black" style={{ color: T.textPrimary }}>
                                Ticket Submitted! 🎉
                            </h3>
                            <p className="text-sm mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: T.textMuted }}>
                                We've received your request and will get back to you shortly. Our team typically responds within 24 hours.
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
            </div>
        )
    }

    return (
        <div className="max-w-2xl">
            <div className="rounded-3xl overflow-hidden"
                style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}>
                {/* Gradient header */}
                <div className="px-8 py-6"
                    style={{
                        background: `linear-gradient(135deg, ${T.primaryFaint} 0%, ${T.borderSubtle} 100%)`,
                        borderBottom: `1px solid ${T.border}`,
                    }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: T.primaryDim }}>
                            <span className="material-symbols-outlined filled text-[20px]"
                                style={{ color: T.primary }}>confirmation_number</span>
                        </div>
                        <div>
                            <h3 className="text-base font-black" style={{ color: T.textPrimary }}>
                                Submit a Support Ticket
                            </h3>
                            <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                                Describe your issue and we'll get back to you as soon as possible
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {submitError && (
                        <div className="px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3"
                            style={{
                                background: 'rgba(220,38,38,0.06)',
                                color: '#DC2626',
                                border: '1px solid rgba(220,38,38,0.18)',
                            }}>
                            <IconAlertCircle size={16} />
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="flex flex-col gap-6">
                        {/* Submitter info card */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl"
                            style={{
                                background: T.primaryFaint,
                                border: `1px solid ${T.primaryDim}`,
                            }}>
                            <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                                style={{ background: T.primary, color: '#fff' }}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{name}</p>
                                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{email} · {companyName}</p>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
                                style={{ background: T.primaryDim, color: T.primaryText }}>
                                Submitter
                            </span>
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                style={{ color: T.textMuted }}>
                                <span className="material-symbols-outlined text-[13px]">edit</span>
                                Subject *
                            </label>
                            <input className="crm-input" placeholder="Brief description of your issue"
                                value={form.subject} onChange={setF('subject')} required />
                        </div>

                        {/* Category grid */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                style={{ color: T.textMuted }}>
                                <span className="material-symbols-outlined text-[13px]">category</span>
                                Category *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {CATEGORY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFv('category', opt.value)}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all duration-150"
                                        style={{
                                            background: form.category === opt.value ? T.primaryDim : T.surfaceHigh,
                                            border: `1.5px solid ${form.category === opt.value ? T.primary : T.border}`,
                                            color: form.category === opt.value ? T.primaryText : T.textMuted,
                                        }}>
                                        <span className="material-symbols-outlined filled text-[15px]">{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                style={{ color: T.textMuted }}>
                                <span className="material-symbols-outlined text-[13px]">description</span>
                                Description *
                            </label>
                            <textarea className="crm-input" rows={6}
                                placeholder="Describe your issue in detail. Include steps to reproduce, expected vs actual behavior, and any error messages."
                                value={form.description} onChange={setF('description')}
                                style={{ resize: 'vertical', minHeight: 130 }} required />
                            <p className="text-[11px]" style={{ color: T.textMuted }}>
                                {form.description.length}/2000 characters
                            </p>
                        </div>

                        <button type="submit" disabled={submitting}
                            className="crm-btn-primary flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm"
                            style={{ fontSize: '14px' }}>
                            {submitting
                                ? <>
                                    <div className="w-4 h-4 rounded-full border-2 animate-spin"
                                        style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                                    Submitting…
                                </>
                                : <>
                                    <IconSend size={15} /> Submit Ticket
                                </>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}