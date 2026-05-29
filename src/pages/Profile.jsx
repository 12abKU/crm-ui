import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api, { extractApiErrorMessage } from '../api'
import { signOut, updateProfileSession } from '../store/authSlice'
import SignOutModal from '../components/SignOutModal'

// ── Outside component — prevents focus loss on keystroke (unchanged) ──
const InputField = ({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</label>
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
    const { name: authName, role: authRole } = useSelector(state => state.auth)

    // ── State ──────────────────────────────────────────────────
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showSignOut, setShowSignOut] = useState(false)

    // ── Data handlers (unchanged) ──────────────────────────────
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

    // ── Loading ────────────────────────────────────────────────
    if (loading) return (
        <div><TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
            </div>
        </div>
    )

    return (
        <>
        <div>
            <TopBar />
            <main className="p-4 sm:p-8 max-w-3xl mx-auto">

                {/* ── Hero Banner ───────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 130,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '40%', width: 120, height: 120,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            {/* Avatar */}
                            <div className="relative w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shrink-0"
                                style={{
                                    background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                    color: '#fff',
                                    boxShadow: `0 6px 20px ${T.avatarGlow}`,
                                }}>
                                {profile?.name?.charAt(0).toUpperCase()}
                                {/* Online dot */}
                                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2"
                                    style={{ background: T.onlineDot, borderColor: '' }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    {profile?.name}
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                    {profile?.email}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                        style={{ background: '', color: T.sidebarActiveText, border: `1px solid ` }}>
                                        {profile?.role}
                                    </span>
                                    <span className="text-[11px]" style={{ color: T.heroSubText }}>
                                        Member since {profile?.createdAt
                                            ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sign out — opens confirmation modal */}
                        <button
                            id="profile-signout-btn"
                            onClick={() => setShowSignOut(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 w-full sm:w-auto"
                            style={{
                                background: T.errorDim,
                                color: T.errorLight,
                                border: '1px solid rgba(239,68,68,0.25)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = T.errorDim}
                        >
                            <span className="material-symbols-outlined text-[16px]">logout</span>
                            Sign out
                        </button>
                    </div>
                </div>

                {/* ── Form ─────────────────────────────────── */}
                <form onSubmit={submit} className="flex flex-col gap-5">

                    {/* Personal info card */}
                    <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined filled text-[16px]" style={{ color: T.primary }}>
                                person
                            </span>
                            <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>Personal Information</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" />
                            <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
                        </div>
                    </div>

                    {/* Password card */}
                    <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined filled text-[16px]" style={{ color: T.primary }}>
                                lock
                            </span>
                            <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>Change Password</h4>
                        </div>
                        <div className="flex flex-col gap-4">
                            <InputField label="Current Password *" type={showCurrent ? 'text' : 'password'}
                                value={form.currentPassword} onChange={set('currentPassword')}
                                placeholder="Enter current password" required
                                rightSlot={<EyeToggle show={showCurrent} onToggle={() => setShowCurrent(s => !s)} />} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="New Password" type={showNew ? 'text' : 'password'}
                                    value={form.newPassword} onChange={set('newPassword')}
                                    placeholder="Leave blank to keep"
                                    rightSlot={<EyeToggle show={showNew} onToggle={() => setShowNew(s => !s)} />} />
                                <InputField label="Confirm Password" type={showConfirm ? 'text' : 'password'}
                                    value={form.confirmPassword} onChange={set('confirmPassword')}
                                    placeholder="Repeat new password"
                                    rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(s => !s)} />} />
                            </div>
                        </div>
                    </div>

                    {/* Error / success alerts (unchanged) */}
                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            style={{ background: T.errorDim, color: T.error, border: `1px solid ${T.error}30` }}>
                            <span className="material-symbols-outlined filled text-[16px]">error</span>{error}
                        </div>
                    )}
                    {success && (
                        <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            style={{ background: T.successDim, color: T.success, border: `1px solid ${T.success}30` }}>
                            <span className="material-symbols-outlined filled text-[16px]">check_circle</span>{success}
                        </div>
                    )}

                    {/* Action buttons (unchanged logic) */}
                    <div className="flex justify-end gap-3">
                        <button type="button"
                            onClick={() => setForm(f => ({ ...f, name: profile?.name, email: profile?.email, currentPassword: '', newPassword: '', confirmPassword: '' }))}
                            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{ background: T.surfaceHigh, color: T.textSecondary, border: `1px solid ${T.border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = T.border}
                            onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}>
                            Reset
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{
                                background: saving ? T.primaryDim : T.primary,
                                color: saving ? T.primary : '#fff',
                                boxShadow: saving ? 'none' : `0 4px 14px ${T.primary}40`,
                            }}>
                            {saving
                                ? <><div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />Saving...</>
                                : <><span className="material-symbols-outlined filled text-[16px]">save</span>Save Changes</>
                            }
                        </button>
                    </div>
                </form>
            </main>
        </div>

        {/* ── Sign-out confirmation modal ────────────────── */}
        <SignOutModal
            open={showSignOut}
            onConfirm={() => { setShowSignOut(false); dispatch(signOut()); navigate('/login') }}
            onCancel={() => setShowSignOut(false)}
            userName={authName}
            role={authRole}
        />
        </>
    )
}
