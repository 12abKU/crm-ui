import { IconCalendar } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { Modal, InputField } from './PlatformModal'
import { daysLeft } from './platformConstants'

// ── Trial Modal ──────────────────────────────────────────────────────────────
export function TrialModal({
    company, onClose,
    trialMode, setTrialMode,
    trialDays, setTrialDays,
    trialDate, setTrialDate,
    formSaving, formError, onSubmit,
}) {
    return (
        <Modal title={`Trial Period — ${company.name}`} onClose={onClose}>
            <div className="flex gap-2 mb-4">
                {[['days', 'By Days'], ['date', 'By Date']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setTrialMode(val)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold"
                        style={{
                            background: trialMode === val ? T.primaryDim : T.surfaceRaised,
                            color: trialMode === val ? T.primary : T.textSecondary,
                            border: `1.5px solid ${trialMode === val ? T.primary : T.border}`,
                        }}>
                        {lbl}
                    </button>
                ))}
            </div>

            {trialMode === 'days' ? (
                <div>
                    <p className="text-xs mb-3" style={{ color: T.textMuted }}>
                        Sets trial end to <strong>N days from today</strong>. Enter 0 to clear and activate.
                    </p>
                    <div className="flex gap-2 mb-4">
                        {[7, 14, 30, 60, 90].map(d => (
                            <button key={d} onClick={() => setTrialDays(String(d))}
                                className="flex-1 py-2 rounded-xl text-xs font-bold"
                                style={{
                                    background: trialDays === String(d) ? T.primaryDim : T.surfaceRaised,
                                    color: trialDays === String(d) ? T.primary : T.textMuted,
                                    border: `1px solid ${trialDays === String(d) ? T.primary : T.border}`,
                                }}>
                                {d}d
                            </button>
                        ))}
                    </div>
                    <InputField label="Custom Days" type="number" value={trialDays}
                        onChange={e => setTrialDays(e.target.value)} placeholder="e.g. 45" />
                </div>
            ) : (
                <div>
                    <p className="text-xs mb-3" style={{ color: T.textMuted }}>Pick a specific end date for the trial.</p>
                    <InputField label="Trial End Date" type="date" value={trialDate}
                        onChange={e => setTrialDate(e.target.value)} />
                </div>
            )}

            {company.trialEndsAt && (
                <div className="mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                    <IconCalendar size={13} style={{ color: T.textMuted }} />
                    <span className="text-xs" style={{ color: T.textMuted }}>
                        Current: {new Date(company.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ({daysLeft(company.trialEndsAt)} days left)
                    </span>
                </div>
            )}

            {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                <button onClick={onSubmit} disabled={formSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#D97706', color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                    {formSaving ? 'Saving...' : 'Set Trial'}
                </button>
            </div>
        </Modal>
    )
}

// ── Delete Company Modal ─────────────────────────────────────────────────────
export function DeleteCompanyModal({ company, onClose, formSaving, formError, onSubmit }) {
    return (
        <Modal title="Delete Company" onClose={onClose}>
            <div className="mb-5 px-4 py-3 rounded-xl" style={{ background: T.errorDim, border: `1px solid ${T.error}33` }}>
                <p className="text-sm font-bold mb-1" style={{ color: T.error }}>This cannot be undone.</p>
                <p className="text-xs" style={{ color: T.textSecondary }}>
                    Deletes <strong>{company.name}</strong> and all its users permanently.
                </p>
            </div>
            {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                <button onClick={onSubmit} disabled={formSaving} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: T.error, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                    {formSaving ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </Modal>
    )
}

// ── Add User Modal ───────────────────────────────────────────────────────────
export function AddUserModal({ company, newUser, setNewUser, onClose, formSaving, formError, onSubmit }) {
    const set = (key) => (e) => setNewUser(p => ({ ...p, [key]: e.target.value }))
    return (
        <Modal title={`Add User to ${company.name}`} onClose={onClose}>
            <InputField label="Full Name" value={newUser.name} onChange={set('name')} placeholder="John Doe" />
            <InputField label="Email" type="email" value={newUser.email} onChange={set('email')} placeholder="john@company.com" />
            <InputField label="Password" type="password" value={newUser.password} onChange={set('password')} placeholder="Min 6 characters" />
            <div className="mb-4">
                <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: T.textMuted }}>Role</label>
                <select value={newUser.role} onChange={set('role')}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary }}>
                    <option value="AGENT">Agent</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
            {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                <button onClick={onSubmit} disabled={formSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.primary, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                    {formSaving ? 'Creating...' : 'Create User'}
                </button>
            </div>
        </Modal>
    )
}

// ── Reset Password Modal ─────────────────────────────────────────────────────
export function ResetPasswordModal({ user, newPw, setNewPw, onClose, formSaving, formError, onSubmit }) {
    return (
        <Modal title={`Reset Password — ${user.name}`} onClose={onClose}>
            <InputField label="New Password" type="password" value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
            {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                <button onClick={onSubmit} disabled={formSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.primary, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                    {formSaving ? 'Saving...' : 'Reset Password'}
                </button>
            </div>
        </Modal>
    )
}

// ── Add Company Modal ────────────────────────────────────────────────────────
export function AddCompanyModal({ newCompany, setNewCompany, onClose, formSaving, formError, onSubmit }) {
    const set = (key) => (e) => setNewCompany(p => ({ ...p, [key]: e.target.value }))
    return (
        <Modal title="Create New Company" onClose={onClose}>
            <InputField label="Company Name" value={newCompany.companyName} onChange={set('companyName')} placeholder="Acme Corp" />
            <InputField label="Admin Name" value={newCompany.adminName} onChange={set('adminName')} placeholder="John Doe" />
            <InputField label="Admin Email" type="email" value={newCompany.adminEmail} onChange={set('adminEmail')} placeholder="admin@acme.com" />
            <InputField label="Admin Password" type="password" value={newCompany.adminPassword} onChange={set('adminPassword')} placeholder="Min 6 characters" />
            <p className="text-[11px] mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(217,119,6,0.08)', color: '#D97706' }}>
                New company starts on a 14-day free trial automatically.
            </p>
            {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                <button onClick={onSubmit} disabled={formSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.primary, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                    {formSaving ? 'Creating...' : 'Create Company'}
                </button>
            </div>
        </Modal>
    )
}