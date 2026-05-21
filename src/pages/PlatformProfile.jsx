import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api, { extractApiErrorMessage } from '../api'
import { signOut, updateProfileSession } from '../store/authSlice'

export default function PlatformProfile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // profile form
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileStatus, setProfileStatus] = useState(null)

    // password form
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [pwSaving, setPwSaving] = useState(false)
    const [pwStatus, setPwStatus] = useState(null)
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

    useEffect(() => {
        api.get('/api/user/profile')
            .then(r => {
                setProfile(r.data)
                setName(r.data.name)
                setEmail(r.data.email)
            })
            .finally(() => setLoading(false))
    }, [])

    const saveProfile = async (e) => {
        e.preventDefault()
        setProfileSaving(true)
        setProfileStatus(null)
        try {
            const r = await api.put('/api/user/profile/info', { name, email })
            dispatch(updateProfileSession({ name: r.data.name, email: r.data.email }))
            setProfile(r.data)
            setProfileStatus({ type: 'success', msg: 'Profile updated successfully' })
        } catch (err) {
            setProfileStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Update failed') })
        } finally {
            setProfileSaving(false)
        }
    }

    const savePw = async (e) => {
        e.preventDefault()
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwStatus({ type: 'error', msg: 'New passwords do not match' })
            return
        }
        if (pwForm.newPassword.length < 6) {
            setPwStatus({ type: 'error', msg: 'Password must be at least 6 characters' })
            return
        }
        setPwSaving(true)
        setPwStatus(null)
        try {
            await api.put('/api/user/profile', {
                name, email,
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            })
            setPwStatus({ type: 'success', msg: 'Password updated successfully' })
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
        } catch (err) {
            setPwStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Failed to update password') })
        } finally {
            setPwSaving(false)
        }
    }

    const togglePw = (key) => setShowPw(s => ({ ...s, [key]: !s[key] }))

    if (loading) return (
        <div>
            <TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
            </div>
        </div>
    )

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-2xl mx-auto">

                {/* Page header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>
                            Platform Admin Profile
                        </h2>
                        <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                            Manage your Super Admin account
                        </p>
                    </div>
                    <button
                        onClick={() => { dispatch(signOut()); navigate('/login') }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{ color: T.error, border: `1px solid ${T.errorDim}` }}
                        onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Sign out
                    </button>
                </div>

                {/* Avatar card */}
                <div className="rounded-2xl p-6 mb-6 flex items-center gap-5"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shrink-0"
                        style={{ background: T.primary, color: '#fff' }}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xl font-black" style={{ color: T.textPrimary }}>{profile?.name}</h3>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{profile?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                                style={{ background: T.primaryDim, color: T.primaryText }}>
                                <span className="material-symbols-outlined text-[12px]">shield_person</span>
                                SUPER_ADMIN
                            </span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Platform Administrator
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile form */}
                <div className="rounded-2xl p-6 mb-4"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <h4 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Personal Information</h4>

                    {profileStatus && (
                        <div className="px-4 py-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2"
                            style={{
                                background: profileStatus.type === 'success' ? T.successDim : T.errorDim,
                                color: profileStatus.type === 'success' ? T.success : T.error,
                            }}>
                            <span className="material-symbols-outlined text-[16px]">
                                {profileStatus.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            {profileStatus.msg}
                        </div>
                    )}

                    <form onSubmit={saveProfile} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your name' },
                                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'admin@platform.com' },
                            ].map(({ label, value, setter, type, placeholder }) => (
                                <div key={label} className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest"
                                        style={{ color: T.textMuted }}>{label}</label>
                                    <input className="crm-input" type={type} placeholder={placeholder}
                                        value={value} onChange={e => setter(e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={profileSaving} className="crm-btn-primary flex items-center gap-2">
                                {profileSaving
                                    ? <><div className="w-4 h-4 rounded-full border-2 animate-spin"
                                        style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />Saving...</>
                                    : <><span className="material-symbols-outlined text-[16px]">save</span>Save Changes</>
                                }
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password form */}
                <div className="rounded-2xl p-6"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <h4 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Change Password</h4>

                    {pwStatus && (
                        <div className="px-4 py-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2"
                            style={{
                                background: pwStatus.type === 'success' ? T.successDim : T.errorDim,
                                color: pwStatus.type === 'success' ? T.success : T.error,
                            }}>
                            <span className="material-symbols-outlined text-[16px]">
                                {pwStatus.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            {pwStatus.msg}
                        </div>
                    )}

                    <form onSubmit={savePw} className="flex flex-col gap-4">
                        {[
                            { key: 'current', field: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                            { key: 'new', field: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
                            { key: 'confirm', field: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                        ].map(({ key, field, label, placeholder }) => (
                            <div key={key} className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest"
                                    style={{ color: T.textMuted }}>{label}</label>
                                <div className="relative">
                                    <input
                                        className="crm-input w-full"
                                        type={showPw[key] ? 'text' : 'password'}
                                        placeholder={placeholder}
                                        style={{ paddingRight: 40 }}
                                        value={pwForm[field]}
                                        onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                                        required
                                    />
                                    <button type="button" onClick={() => togglePw(key)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px]"
                                        style={{ color: showPw[key] ? T.primary : T.textMuted }}>
                                        {showPw[key] ? 'visibility' : 'visibility_off'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button type="submit" disabled={pwSaving} className="crm-btn-primary flex items-center gap-2">
                                {pwSaving
                                    ? <><div className="w-4 h-4 rounded-full border-2 animate-spin"
                                        style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />Updating...</>
                                    : <><span className="material-symbols-outlined text-[16px]">lock</span>Update Password</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}