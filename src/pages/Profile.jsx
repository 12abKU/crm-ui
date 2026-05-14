import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api, { extractApiErrorMessage } from '../api'
import { signOut, updateProfileSession } from '../store/authSlice'

// Outside component — prevents focus loss on keystroke
const InputField = ({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</label>
        <div className="relative">
            <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
                className="crm-input w-full" style={{ paddingRight: rightSlot ? '40px' : undefined }} />
            {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
        </div>
    </div>
)

const EyeToggle = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle}
        className="material-symbols-outlined text-[18px] transition-colors"
        style={{ color: show ? T.primary : T.textMuted, lineHeight: 1 }}>
        {show ? 'visibility' : 'visibility_off'}
    </button>
)

export default function Profile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        api.get('/api/user/profile').then(r => {
            setProfile(r.data)
            setForm(f => ({ ...f, name: r.data.name, email: r.data.email }))
        }).finally(() => setLoading(false))
    }, [])

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault(); setError(''); setSuccess('')
        if (form.newPassword && form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return }
        setSaving(true)
        try {
            const r = await api.put('/api/user/profile', { name: form.name, email: form.email, currentPassword: form.currentPassword, newPassword: form.newPassword || null })
            dispatch(updateProfileSession(r.data))
            setProfile(r.data); setSuccess('Profile updated successfully')
            setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
        } catch (err) { setError(extractApiErrorMessage(err, 'Update failed')) }
        finally { setSaving(false) }
    }

    if (loading) return (
        <div><TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
            </div>
        </div>
    )

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>My Profile</h2>
                        <p className="text-sm mt-1" style={{ color: T.textMuted }}>Manage your personal information and password</p>
                    </div>
                    <button onClick={() => { dispatch(signOut()); navigate('/login') }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{ color: T.error, border: `1px solid ${T.errorDim}` }}
                        onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span className="material-symbols-outlined text-[16px]">logout</span>Sign out
                    </button>
                </div>

                {/* Header card */}
                <div className="rounded-2xl p-6 mb-6 flex items-center gap-5"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shrink-0"
                        style={{ background: T.primary }}>
                        {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xl font-black" style={{ color: T.textPrimary }}>{profile?.name}</h3>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{profile?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold"
                                style={{ background: T.primaryDim, color: T.primaryText }}>{profile?.role}</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="rounded-2xl p-6 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <h4 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Personal Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" />
                            <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
                        </div>
                    </div>

                    <div className="rounded-2xl p-6 mb-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <h4 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Change Password</h4>
                        <div className="flex flex-col gap-4">
                            <InputField label="Current Password *" type={showCurrent ? 'text' : 'password'} value={form.currentPassword} onChange={set('currentPassword')} placeholder="Enter current password" required rightSlot={<EyeToggle show={showCurrent} onToggle={() => setShowCurrent(s => !s)} />} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="New Password" type={showNew ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')} placeholder="Leave blank to keep" rightSlot={<EyeToggle show={showNew} onToggle={() => setShowNew(s => !s)} />} />
                                <InputField label="Confirm Password" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat new password" rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(s => !s)} />} />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"
                            style={{ background: T.errorDim, color: T.error }}>
                            <span className="material-symbols-outlined text-[16px]">error</span>{error}
                        </div>
                    )}
                    {success && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"
                            style={{ background: T.successDim, color: T.success }}>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>{success}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button type="button" className="crm-btn-ghost"
                            onClick={() => setForm(f => ({ ...f, name: profile?.name, email: profile?.email, currentPassword: '', newPassword: '', confirmPassword: '' }))}>
                            Reset
                        </button>
                        <button type="submit" disabled={saving} className="crm-btn-primary flex items-center gap-2">
                            {saving
                                ? <><div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />Saving...</>
                                : <><span className="material-symbols-outlined text-[16px]">save</span>Save Changes</>
                            }
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
