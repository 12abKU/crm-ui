import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { T } from '../constants/theme'
import api, { extractApiErrorMessage } from '../api'
import { setCredentials } from '../store/authSlice'

export default function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [rateLimited, setRateLimited] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const reason = sessionStorage.getItem('logoutReason')
        if (reason) {
            setError(reason)
            sessionStorage.removeItem('logoutReason')
        }
        
        const params = new URLSearchParams(window.location.search)
        const prefillEmail = params.get('email')
        const prefillPass = params.get('pass')
        if (prefillEmail || prefillPass) {
            setForm(f => ({ 
                ...f, 
                email: prefillEmail || f.email, 
                password: prefillPass || f.password 
            }))
        }
    }, [])

    const submit = async (e) => {
        e.preventDefault()
        if (rateLimited) return
        setLoading(true)
        setError('')
        try {
            const { data } = await api.post('/api/auth/login', form)
            dispatch(setCredentials(data))
            navigate('/')
        } catch (err) {
            const status = err?.response?.status
            if (status === 429) {
                setRateLimited(true)
                setError('Too many login attempts. Please wait a minute and try again.')
                setTimeout(() => setRateLimited(false), 60000)
            } else {
                setError(extractApiErrorMessage(err, 'Login failed'))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex overflow-hidden font-sans" style={{ background: T.bg }}>
            {/* Left Column (Showcase Workspace) - Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden select-none"
                 style={{ background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 50%, ${T.heroBgTo} 100%)` }}>
                
                {/* Background animations / orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30 animate-pulse duration-[8000ms]"
                     style={{ background: T.heroAccentGlow }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-15"
                     style={{ background: T.heroOrb2 }} />

                {/* Cyber Grid pattern */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                     style={{
                         backgroundImage: `radial-gradient(${T.primary} 1px, transparent 1px), linear-gradient(to right, rgba(234,88,12,0.1) 1px, transparent 1px)`,
                         backgroundSize: '32px 32px'
                     }} />

                {/* Left Top Brand Logo */}
                <div className="flex items-center gap-3 relative z-10 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-950/20" 
                         style={{ background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)` }}>
                        <span className="material-symbols-outlined filled text-white text-[24px]">dataset</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight" style={{ color: '#FFFFFF' }}>Iinventive CRM</h1>
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-75" style={{ color: T.heroSubText }}>Enterprise CRM Suite</p>
                    </div>
                </div>

                {/* Left Center Content with interactive Dashboard mock */}
                <div className="my-auto relative z-10 max-w-xl pr-6 space-y-12">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold border"
                              style={{ background: T.heroBadgeBg, color: T.heroBadgeText, borderColor: T.heroBadgeBorder }}>
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                            Live Workspace Active
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
                            Manage relationships <br />
                            with <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${T.primary}, #FDBA74)` }}>precision.</span>
                        </h2>
                        <p className="text-sm leading-relaxed text-gray-300 max-w-md">
                            Unify call logs, emails, pipelines, and activities in a premium, lightning-fast workspace tailored for high-growth teams.
                        </p>
                    </div>

                    {/* Dashboard Preview Box */}
                    <div className="relative p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden bg-white/[0.02] transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Glass Overlay Light Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Team Pipeline Performance</span>
                            </div>
                            <span className="text-[10px] text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-900/30">Real-time sync</span>
                        </div>

                        {/* Interactive Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Active Value</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h4 className="text-xl sm:text-2xl font-black text-white">$142,850</h4>
                                    <span className="text-xs text-emerald-400 font-bold flex items-center">↑12%</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Win Rate</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h4 className="text-xl sm:text-2xl font-black text-white">24.8%</h4>
                                    <span className="text-xs text-orange-400 font-bold flex items-center">↑3.2%</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Activity Feeds */}
                        <div className="space-y-3">
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1 mb-2">Live Agent Streams</p>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative shadow-sm" style={{ background: '#7C3AED' }}>
                                        JD
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Jane Doe (Admin)</p>
                                        <p className="text-[10px] text-gray-400">Closed Deal: TechCorp Enterprise</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400">+$25,000</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative shadow-sm" style={{ background: '#EA580C' }}>
                                        AS
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Agent Smith</p>
                                        <p className="text-[10px] text-gray-400">Logged a call with Acme Corp</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-500">2m ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer copyrights */}
                <div className="relative z-10 flex justify-between text-xs text-gray-500">
                    <span>© 2026 Iinventive CRM.</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Platform Operational</span>
                </div>
            </div>

            {/* Right Column (Login Form Section) */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-16 relative overflow-hidden">
                {/* Background warm aesthetic soft glow */}
                <div className="absolute top-1/2 left-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-20 -translate-x-1/2 -translate-y-1/2"
                     style={{ background: `radial-gradient(circle, ${T.primary} 0%, transparent 60%)` }} />

                <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                    {/* Header Logo for Mobile views */}
                    <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: T.primary }}>
                            <span className="material-symbols-outlined filled text-white text-[22px]">dataset</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight" style={{ color: T.textPrimary }}>Iinventive CRM</h1>
                            <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Enterprise Suite</p>
                        </div>
                    </div>

                    {/* Glassmorphic card design */}
                    <div className="rounded-[32px] p-8 md:p-12 transition-all duration-300 shadow-[0_32px_64px_-16px_rgba(234,88,12,0.06)]"
                         style={{
                             background: T.surface,
                             border: `1px solid ${T.border}`,
                         }}>
                        
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: T.textPrimary }}>Welcome back</h2>
                            <p className="text-sm" style={{ color: T.textSecondary }}>Enter your credentials to access your sales workspace</p>
                        </div>

                        {error && (
                            <div className="px-4 py-3.5 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-3 border transition-all duration-300"
                                 style={{
                                     background: rateLimited ? T.warningDim : T.errorDim,
                                     color: rateLimited ? T.warning : T.error,
                                     borderColor: rateLimited ? 'rgba(217,119,6,0.2)' : 'rgba(220,38,38,0.2)'
                                 }}>
                                <span className="material-symbols-outlined text-[20px] shrink-0">
                                    {rateLimited ? 'timer' : 'error'}
                                </span>
                                <span className="leading-tight">{error}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-6">
                            {/* Input: Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textMuted }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] transition-colors"
                                          style={{ color: focusedField === 'email' ? T.primary : T.textSecondary }}>
                                        mail
                                    </span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full border rounded-2xl px-5 py-4 pl-11 text-sm outline-none transition-all duration-200"
                                        style={{
                                            backgroundColor: T.surface,
                                            borderColor: focusedField === 'email' ? T.primary : T.border,
                                            boxShadow: focusedField === 'email' ? `0 0 0 4px ${T.primaryDim}` : 'none',
                                            color: T.textPrimary,
                                        }}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input: Password */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center pl-1">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                        Password
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] transition-colors"
                                          style={{ color: focusedField === 'password' ? T.primary : T.textSecondary }}>
                                        lock
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full border rounded-2xl px-5 py-4 pl-11 pr-12 text-sm outline-none transition-all duration-200"
                                        style={{
                                            backgroundColor: T.surface,
                                            borderColor: focusedField === 'password' ? T.primary : T.border,
                                            boxShadow: focusedField === 'password' ? `0 0 0 4px ${T.primaryDim}` : 'none',
                                            color: T.textPrimary,
                                        }}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                         type="button"
                                         onClick={() => setShowPassword(!showPassword)}
                                         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                         <span className="material-symbols-outlined text-[20px]">
                                             {showPassword ? "visibility_off" : "visibility"}
                                         </span>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || rateLimited}
                                className="w-full mt-3 py-4 rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)`,
                                    color: '#FFFFFF',
                                    opacity: (loading || rateLimited) ? 0.6 : 1,
                                    boxShadow: `0 8px 20px -4px ${T.primaryDim}`
                                }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : rateLimited ? 'Too many attempts...' : 'Sign in'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm" style={{ color: T.textSecondary }}>
                                Don't have an account?{' '}
                                <a 
                                    href="/landing/register"
                                    className="font-bold hover:underline transition-all"
                                    style={{ color: T.primary }}
                                >
                                    Create a new account
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}