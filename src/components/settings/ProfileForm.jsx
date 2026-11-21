import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import RoleBadge from './RoleBadge'
import api, { extractApiErrorMessage } from '../../api'
import { updateProfileSession } from '../../store/authSlice'

export default function ProfileForm() {
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)

    const [name, setName] = useState(auth.name || '')
    const [email, setEmail] = useState(auth.email || '')
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const role = auth.role || 'AGENT'

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)
        try {
            const res = await api.put('/api/user/profile/info', { name, email })
            dispatch(updateProfileSession({ name: res.data.name, email: res.data.email }))
            setStatus({ type: 'success', msg: 'Profile updated successfully' })
        } catch (err) {
            setStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Update failed') })
        } finally {
            setLoading(false)
        }
    }

    return (
        <SettingsSection
            title="Profile Information"
            description="Manage your account identity, primary email, and system authorization credentials"
        >
            <form onSubmit={submit} className="flex flex-col gap-5 max-w-lg">
                {status && (
                    <div
                        className="px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border"
                        style={{
                            background: status.type === 'success' ? `${T.success}15` : `${T.error}15`,
                            color: status.type === 'success' ? T.success : T.error,
                            borderColor: status.type === 'success' ? `${T.success}30` : `${T.error}30`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {status.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span>{status.msg}</span>
                    </div>
                )}

                {/* Profile Identity Card */}
                <div
                    className="flex items-center gap-4 p-4 rounded-2xl border"
                    style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}
                >
                    <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md ring-1 ring-white/20 shrink-0"
                        style={{
                            background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                            boxShadow: `0 0 16px ${T.avatarGlow}`,
                        }}
                    >
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-extrabold text-base tracking-tight truncate" style={{ color: T.textPrimary }}>
                            {name || 'User Profile'}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
                        <div className="mt-1.5">
                            <RoleBadge role={role} />
                        </div>
                    </div>
                </div>

                {/* Name Field */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                        Full Name
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                            person
                        </span>
                        <input
                            className="crm-input pl-10"
                            type="text"
                            placeholder="Your full name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                        Email Address
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                            mail
                        </span>
                        <input
                            className="crm-input pl-10"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="crm-btn-primary w-fit flex items-center gap-2 px-5 py-2.5 mt-1"
                >
                    {loading ? (
                        <div
                            className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                        />
                    ) : (
                        <span className="material-symbols-outlined text-[17px]">save</span>
                    )}
                    <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
            </form>
        </SettingsSection>
    )
}