import { useState } from 'react'
import { T } from '../../constants/theme'
import { extractApiErrorMessage } from '../../api'

export default function InviteUserModal({ onClose, onSubmit, allowAdminRole = false }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await onSubmit(form)
            onClose()
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Failed to create user'))
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%', background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: '10px 14px', fontSize: 14, color: T.textPrimary, outline: 'none'
    }

    return (
        <>
            <div className="fixed inset-0 z-40 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.5)' }} onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <div>
                            <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>Add New User</h3>
                            <p className="text-sm" style={{ color: T.textMuted }}>They'll receive an account immediately</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: T.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                    <form onSubmit={submit} className="p-6 flex flex-col gap-4">
                        {error && (
                            <div className="px-4 py-3 rounded-xl text-sm font-medium"
                                style={{ background: T.errorDim, color: T.error }}>{error}</div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>Full Name</label>
                            <input className="crm-input" placeholder="Jane Doe" value={form.name}
                                onChange={e => set('name', e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>Email</label>
                            <input className="crm-input" type="email" placeholder="jane@company.com" value={form.email}
                                onChange={e => set('email', e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>Password</label>
                            <input className="crm-input" type="password" placeholder="Min 6 characters" value={form.password}
                                onChange={e => set('password', e.target.value)} required minLength={6} />
                        </div>
                        {allowAdminRole && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>Role</label>
                                <select className="crm-select" value={form.role} onChange={e => set('role', e.target.value)}>
                                    <option value="AGENT">Agent</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="crm-btn-ghost flex-1">Cancel</button>
                            <button type="submit" disabled={loading} className="crm-btn-primary flex-1 flex items-center justify-center gap-2">
                                {loading ? (
                                    <div className="w-4 h-4 rounded-full border-2 animate-spin"
                                        style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                                )}
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
