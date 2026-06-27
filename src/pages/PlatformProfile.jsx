import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api, { extractApiErrorMessage } from '../api'
import { signOut, updateProfileSession } from '../store/authSlice'
import AppIntegrationsSettings from '../components/settings/AppIntegrationsSettings'

// ── Dot grid SVG ────────────────────────────────────────────────────────────
const DOT_GRID = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`

// ── Styled input wrapper ─────────────────────────────────────────────────────
function FormField({ label, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.09em', color: T.textMuted,
            }}>{label}</label>
            {children}
        </div>
    )
}

// ── Status banner ────────────────────────────────────────────────────────────
function StatusBanner({ status }) {
    if (!status) return null
    const ok = status.type === 'success'
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12, marginBottom: 22,
            background: ok ? T.successDim : T.errorDim,
            border: `1px solid ${ok ? T.success + '35' : T.error + '35'}`,
            color: ok ? T.success : T.error, fontSize: 13, fontWeight: 600,
        }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                {ok ? 'check_circle' : 'error'}
            </span>
            {status.msg}
        </div>
    )
}

export default function PlatformProfile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileStatus, setProfileStatus] = useState(null)
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [pwSaving, setPwSaving] = useState(false)
    const [pwStatus, setPwStatus] = useState(null)
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

    useEffect(() => {
        api.get('/api/user/profile')
            .then(r => { setProfile(r.data); setName(r.data.name); setEmail(r.data.email) })
            .finally(() => setLoading(false))
    }, [])

    const saveProfile = async (e) => {
        e.preventDefault(); setProfileSaving(true); setProfileStatus(null)
        try {
            const r = await api.put('/api/user/profile/info', { name, email })
            dispatch(updateProfileSession({ name: r.data.name, email: r.data.email }))
            setProfile(r.data)
            setProfileStatus({ type: 'success', msg: 'Profile updated successfully' })
        } catch (err) {
            setProfileStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Update failed') })
        } finally { setProfileSaving(false) }
    }

    const savePw = async (e) => {
        e.preventDefault()
        if (pwForm.newPassword !== pwForm.confirm) { setPwStatus({ type: 'error', msg: 'New passwords do not match' }); return }
        if (pwForm.newPassword.length < 6) { setPwStatus({ type: 'error', msg: 'Password must be at least 6 characters' }); return }
        setPwSaving(true); setPwStatus(null)
        try {
            await api.put('/api/user/profile', { name, email, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
            setPwStatus({ type: 'success', msg: 'Password updated successfully' })
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
        } catch (err) {
            setPwStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Failed to update password') })
        } finally { setPwSaving(false) }
    }

    const togglePw = (key) => setShowPw(s => ({ ...s, [key]: !s[key] }))

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh' }}>
            <TopBar />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.primary}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            </div>
        </div>
    )

    const initial = (name || 'P').charAt(0).toUpperCase()

    return (
        <div style={{ background: T.bg, minHeight: '100vh' }}>
            <style>{`
                @keyframes pulseRing {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50%      { opacity: 1;   transform: scale(1.08); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <TopBar />

            {/* ══════════════════════════════════════════════════
                HERO — identity banner
            ══════════════════════════════════════════════════ */}
            <div style={{
                background: `linear-gradient(140deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                backgroundImage: `${DOT_GRID}, linear-gradient(140deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Glow orbs */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: T.heroAccentGlow, filter: 'blur(70px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, left: '35%', width: 220, height: 220, borderRadius: '50%', background: T.heroOrb2, filter: 'blur(55px)', pointerEvents: 'none' }} />

                <div className="px-4 py-8 md:px-9 md:py-10" style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                        {/* Left: avatar + identity */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    position: 'absolute', inset: -7, borderRadius: '50%',
                                    border: `2px solid ${T.avatarGlow}`,
                                    animation: 'pulseRing 3.5s ease-in-out infinite',
                                }} />
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${T.avatarGradFrom}, ${T.avatarGradTo})`,
                                    boxShadow: `0 0 40px ${T.avatarGlow}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 34, fontWeight: 900, color: '#fff',
                                }}>
                                    {initial}
                                </div>
                                {/* Online indicator */}
                                <div style={{
                                    position: 'absolute', bottom: 3, right: 3,
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: '#4ADE80',
                                    border: `2px solid ${T.heroBgFrom}`,
                                }} />
                            </div>

                            {/* Name + meta */}
                            <div>
                                {/* Badge */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: T.heroBadgeBg, border: `1px solid ${T.heroBadgeBorder}`,
                                    borderRadius: 999, padding: '4px 12px', marginBottom: 10,
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 11, color: T.heroBadgeText }}>shield_person</span>
                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.09em', color: T.heroBadgeText, textTransform: 'uppercase' }}>Super Admin</span>
                                </div>
                                <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                                    {profile?.name}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>mail</span>
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{profile?.email}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 12 }}>·</span>
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', fontWeight: 500 }}>Platform Administrator</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: sign out */}
                        <button
                            onClick={() => { dispatch(signOut()); navigate('/login') }}
                            className="w-full md:w-auto justify-center flex items-center gap-2"
                            style={{
                                flexShrink: 0,
                                background: 'rgba(220,38,38,0.18)',
                                border: '1px solid rgba(220,38,38,0.30)',
                                color: '#FCA5A5', borderRadius: 13,
                                padding: '10px 20px', fontSize: 13, fontWeight: 600,
                                cursor: 'pointer', transition: 'background 0.15s, transform 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.28)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)'; e.currentTarget.style.transform = 'none' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                FORMS — side by side layout
            ══════════════════════════════════════════════════ */}
            <main className="px-4 py-8 md:px-9 md:py-10" style={{ maxWidth: 900, margin: '0 auto' }}>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ── Personal Info Card ─────────────────────── */}
                    <div style={{
                        background: T.surface, borderRadius: 22,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        animation: 'fadeUp 0.45s ease both',
                    }}>
                        {/* Card header strip */}
                        <div style={{
                            padding: '18px 24px 16px',
                            borderBottom: `1px solid ${T.borderSubtle}`,
                            background: T.surfaceRaised,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 11,
                                    background: T.primaryDim, border: `1px solid ${T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary,
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, margin: 0 }}>Personal Info</p>
                                    <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Update name & email</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <StatusBanner status={profileStatus} />
                            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <FormField label="Full Name">
                                    <input className="crm-input" type="text" placeholder="Your name"
                                        value={name} onChange={e => setName(e.target.value)} />
                                </FormField>
                                <FormField label="Email Address">
                                    <input className="crm-input" type="email" placeholder="admin@platform.com"
                                        value={email} onChange={e => setEmail(e.target.value)} />
                                </FormField>
                                <div style={{ paddingTop: 4 }}>
                                    <button type="submit" disabled={profileSaving} className="crm-btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                        {profileSaving
                                            ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />Saving...</>
                                            : <><span className="material-symbols-outlined" style={{ fontSize: 15 }}>save</span>Save Changes</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ── Change Password Card ──────────────────── */}
                    <div style={{
                        background: T.surface, borderRadius: 22,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        animation: 'fadeUp 0.55s ease both',
                    }}>
                        {/* Card header strip */}
                        <div style={{
                            padding: '18px 24px 16px',
                            borderBottom: `1px solid ${T.borderSubtle}`,
                            background: T.surfaceRaised,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 11,
                                    background: T.primaryDim, border: `1px solid ${T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary,
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>lock</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, margin: 0 }}>Change Password</p>
                                    <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Set a new secure password</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <StatusBanner status={pwStatus} />
                            <form onSubmit={savePw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { key: 'current', field: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                                    { key: 'new', field: 'newPassword', label: 'New Password', placeholder: 'Minimum 6 characters' },
                                    { key: 'confirm', field: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                                ].map(({ key, field, label, placeholder }) => (
                                    <FormField key={key} label={label}>
                                        <div style={{ position: 'relative' }}>
                                            <input className="crm-input w-full"
                                                type={showPw[key] ? 'text' : 'password'}
                                                placeholder={placeholder}
                                                style={{ paddingRight: 44, width: '100%' }}
                                                value={pwForm[field]}
                                                onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                                                required
                                            />
                                            <button type="button" onClick={() => togglePw(key)}
                                                className="material-symbols-outlined"
                                                style={{
                                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                    fontSize: 17, background: 'none', border: 'none', cursor: 'pointer',
                                                    color: showPw[key] ? T.primary : T.textMuted, transition: 'color 0.15s',
                                                }}>
                                                {showPw[key] ? 'visibility' : 'visibility_off'}
                                            </button>
                                        </div>
                                    </FormField>
                                ))}
                                <div style={{ paddingTop: 4 }}>
                                    <button type="submit" disabled={pwSaving} className="crm-btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                        {pwSaving
                                            ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />Updating...</>
                                            : <><span className="material-symbols-outlined" style={{ fontSize: 15 }}>lock</span>Update Password</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                <div className="mt-6" style={{
                    background: T.surface, borderRadius: 22,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    animation: 'fadeUp 0.65s ease both',
                }}>
                    <div style={{
                        padding: '18px 24px 16px',
                        borderBottom: `1px solid ${T.borderSubtle}`,
                        background: T.surfaceRaised,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 11,
                                background: T.primaryDim, border: `1px solid ${T.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary,
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>extension</span>
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, margin: 0 }}>Platform Integrations</p>
                                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Configure UltraMsg and SMTP</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <AppIntegrationsSettings />
                    </div>
                </div>
            </main>
        </div>
    )
}