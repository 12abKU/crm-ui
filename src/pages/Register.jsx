import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CustomSelect from '../components/ui/CustomSelect'
import { useDispatch } from 'react-redux'
import { T } from '../constants/theme'
import api, { extractApiErrorMessage } from '../api'
import { setCredentials } from '../store/authSlice'

export default function Register() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        companyName: '',
        phone: '',
        industry: '',
        companySize: '',
        country: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    })
    const [fieldErrors, setFieldErrors] = useState({})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [showPassword, setShowPassword] = useState(false)

    const set = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }))
        if (fieldErrors[key]) {
            setFieldErrors(errs => ({ ...errs, [key]: null }))
        }
    }

    const nextStep = (e) => {
        e.preventDefault()
        const newErrors = {}
        const step1Fields = ['companyName', 'phone', 'country', 'industry', 'companySize']
        
        step1Fields.forEach(key => {
            if (!form[key] || !form[key].trim()) {
                newErrors[key] = 'This field is required'
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors)
            setError('Please fill in all required company details')
            return
        }

        setFieldErrors({})
        setError('')
        setStep(2)
    }

    const prevStep = () => {
        setStep(1)
        setError('')
    }

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setFieldErrors({})

        // Client-side validation: ensure admin fields are not empty
        const newErrors = {}
        const step2Fields = ['adminName', 'adminEmail', 'adminPassword']
        
        step2Fields.forEach(key => {
            if (!form[key] || !form[key].trim()) {
                newErrors[key] = 'This field is required'
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors)
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        try {
            const { data } = await api.post('/api/auth/company/register', form)
            dispatch(setCredentials(data))
            navigate('/')
        } catch (err) {
            const fields = err?.response?.data?.fields
            if (fields && typeof fields === 'object') {
                setFieldErrors(fields)
                setError('Please fix the highlighted fields')
                
                // If any error exists in Step 1, auto-fallback to step 1
                const step1Keys = ['companyName', 'phone', 'industry', 'companySize', 'country']
                const hasStep1Error = Object.keys(fields).some(key => step1Keys.includes(key))
                if (hasStep1Error) {
                    setStep(1)
                }
            } else {
                setError(extractApiErrorMessage(err, 'Registration failed'))
            }
        } finally {
            setLoading(false)
        }
    }

    const getFieldStyle = (fieldName) => {
        const hasError = !!fieldErrors[fieldName]
        const isFocused = focusedField === fieldName

        return {
            backgroundColor: T.surface,
            borderColor: hasError ? T.error : (isFocused ? T.primary : T.border),
            boxShadow: isFocused ? `0 0 0 4px ${hasError ? T.errorDim : T.primaryDim}` : 'none',
            color: T.textPrimary,
            outline: 'none',
        }
    }

    return (
        <div className="min-h-screen w-full flex overflow-hidden font-sans" style={{ background: T.bg }}>
            {/* Left Column (Showcase Workspace) - Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-16 overflow-hidden select-none"
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
                <div className="my-auto relative z-10 max-w-xl pr-6 space-y-10">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold border animate-bounce"
                              style={{ background: T.heroBadgeBg, color: T.heroBadgeText, borderColor: T.heroBadgeBorder }}>
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                            14-Day Premium Trial Included
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
                            Build your pipeline <br />
                            engine <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${T.primary}, #FDBA74)` }}>today.</span>
                        </h2>
                        <p className="text-sm leading-relaxed text-gray-300 max-w-md">
                            Create your company profile in seconds. Unlock performance tracking, call recording, unified emails, and intelligent routing.
                        </p>
                    </div>

                    {/* Dashboard Preview Box */}
                    <div className="relative p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden bg-white/[0.02] transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Glass Overlay Light Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Team Pipeline Performance</span>
                            </div>
                            <span className="text-[10px] text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-900/30">Real-time sync</span>
                        </div>

                        {/* Interactive Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Active Value</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h4 className="text-2xl font-black text-white">$142,850</h4>
                                    <span className="text-xs text-emerald-400 font-bold flex items-center">↑12%</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Win Rate</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h4 className="text-2xl font-black text-white">24.8%</h4>
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

            {/* Right Column (Registration Form Wizard Section) */}
            <div className="w-full lg:w-[50%] flex items-center justify-center p-6 md:p-12 relative overflow-y-auto max-h-screen">
                {/* Background decorative blob */}
                <div className="absolute top-1/2 left-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-20 -translate-x-1/2 -translate-y-1/2"
                     style={{ background: `radial-gradient(circle, ${T.primary} 0%, transparent 60%)` }} />

                <div className="w-full max-w-xl relative z-10 py-6">
                    {/* Header Logo for Mobile views */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: T.primary }}>
                            <span className="material-symbols-outlined filled text-white text-[20px]">dataset</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight" style={{ color: T.textPrimary }}>Iinventive CRM</h1>
                            <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Enterprise Suite</p>
                        </div>
                    </div>

                    {/* Main Form Glassmorphic Card */}
                    <div className="rounded-[32px] p-6 md:p-10 transition-all duration-300 shadow-[0_32px_64px_-16px_rgba(234,88,12,0.06)]"
                         style={{
                             background: T.surface,
                             border: `1px solid ${T.border}`,
                         }}>
                        
                        {/* Stepper Status Component */}
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                                     style={{
                                         background: step === 1 ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)` : T.success,
                                         color: '#FFFFFF',
                                         boxShadow: step === 1 ? `0 4px 10px ${T.primaryDim}` : 'none'
                                     }}>
                                    {step === 1 ? '1' : <span className="material-symbols-outlined text-[16px] font-black">done</span>}
                                </div>
                                <span className="text-xs font-extrabold uppercase tracking-wider" 
                                      style={{ color: step === 1 ? T.textPrimary : T.success }}>
                                    Company Profile
                                </span>
                            </div>
                            
                            <div className="flex-1 h-px mx-4 bg-dashed border-t" style={{ borderColor: T.border }} />

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                                     style={{
                                         background: step === 2 ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)` : T.borderSubtle,
                                         color: step === 2 ? '#FFFFFF' : T.textSecondary,
                                         boxShadow: step === 2 ? `0 4px 10px ${T.primaryDim}` : 'none'
                                     }}>
                                    2
                                </div>
                                <span className="text-xs font-extrabold uppercase tracking-wider" 
                                      style={{ color: step === 2 ? T.textPrimary : T.textSecondary }}>
                                    Admin details
                                </span>
                            </div>
                        </div>

                        <div className="mb-8 pl-1">
                            <h2 className="text-3xl font-black tracking-tight mb-1" style={{ color: T.textPrimary }}>
                                {step === 1 ? 'Company Configuration' : 'Administrator profile'}
                            </h2>
                            <p className="text-sm" style={{ color: T.textSecondary }}>
                                {step === 1 ? 'Tell us about your organization to set up the billing workspace' : 'Provide your admin credentials to activate your workspace'}
                            </p>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-3 border transition-all duration-300"
                                 style={{
                                     background: T.errorDim,
                                     color: T.error,
                                     borderColor: 'rgba(220, 38, 38, 0.2)'
                                 }}>
                                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                                <span className="leading-tight">{error}</span>
                            </div>
                        )}

                        <form onSubmit={step === 1 ? nextStep : submit} className="flex flex-col gap-6">
                            {/* STEP 1: Company Configuration */}
                            {step === 1 && (
                                <div className="flex flex-col gap-5 animate-fade-in">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                            Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.companyName}
                                            onChange={set('companyName')}
                                            className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200"
                                            style={getFieldStyle('companyName')}
                                            onFocus={() => setFocusedField('companyName')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Acme Corp"
                                        />
                                        {fieldErrors.companyName && (
                                            <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.companyName}</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                                Company Phone <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={set('phone')}
                                                className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200"
                                                style={getFieldStyle('phone')}
                                                onFocus={() => setFocusedField('phone')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="+1 (555) 019-2834"
                                            />
                                            {fieldErrors.phone && (
                                                <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.phone}</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.country}
                                                onChange={set('country')}
                                                className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200"
                                                style={getFieldStyle('country')}
                                                onFocus={() => setFocusedField('country')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="United States"
                                            />
                                            {fieldErrors.country && (
                                                <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.country}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                                Industry <span className="text-red-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={form.industry}
                                                onChange={set('industry')}
                                                className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200 cursor-pointer crm-select"
                                                style={getFieldStyle('industry')}
                                                placeholder="Select Industry"
                                            >
                                                <option value="">Select Industry</option>
                                                <option value="Technology">Technology / Software</option>
                                                <option value="Healthcare">Healthcare / Medical</option>
                                                <option value="Finance">Finance / Banking</option>
                                                <option value="Retail">Retail / E-commerce</option>
                                                <option value="Education">Education / EdTech</option>
                                                <option value="Real Estate">Real Estate / Construction</option>
                                                <option value="Professional Services">Professional Services</option>
                                                <option value="Manufacturing">Manufacturing / Logistics</option>
                                                <option value="Other">Other</option>
                                            </CustomSelect>
                                            {fieldErrors.industry && (
                                                <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.industry}</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                                Company Size <span className="text-red-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={form.companySize}
                                                onChange={set('companySize')}
                                                className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200 cursor-pointer crm-select"
                                                style={getFieldStyle('companySize')}
                                                placeholder="Select Size"
                                            >
                                                <option value="">Select Size</option>
                                                <option value="1-10">1-10 employees</option>
                                                <option value="11-50">11-50 employees</option>
                                                <option value="51-200">51-200 employees</option>
                                                <option value="201-500">201-500 employees</option>
                                                <option value="500+">500+ employees</option>
                                            </CustomSelect>
                                            {fieldErrors.companySize && (
                                                <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.companySize}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full mt-4 py-4 rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center gap-2"
                                        style={{
                                            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)`,
                                            color: '#FFFFFF',
                                            boxShadow: `0 8px 20px -4px ${T.primaryDim}`
                                        }}
                                    >
                                        Continue to Profile Setup
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                </div>
                            )}

                            {/* STEP 2: Administrator Profile Details */}
                            {step === 2 && (
                                <div className="flex flex-col gap-5 animate-fade-in">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.adminName}
                                            onChange={set('adminName')}
                                            className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200"
                                            style={getFieldStyle('adminName')}
                                            onFocus={() => setFocusedField('adminName')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Jane Doe"
                                        />
                                        {fieldErrors.adminName && (
                                            <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.adminName}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={form.adminEmail}
                                            onChange={set('adminEmail')}
                                            className="w-full border rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-200"
                                            style={getFieldStyle('adminEmail')}
                                            onFocus={() => setFocusedField('adminEmail')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="admin@acmecorp.com"
                                        />
                                        {fieldErrors.adminEmail && (
                                            <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.adminEmail}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: T.textSecondary }}>
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={form.adminPassword}
                                                onChange={set('adminPassword')}
                                                className="w-full border rounded-2xl px-5 py-3.5 pr-12 text-sm outline-none transition-all duration-200"
                                                style={getFieldStyle('adminPassword')}
                                                onFocus={() => setFocusedField('adminPassword')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="••••••••"
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
                                        {fieldErrors.adminPassword && (
                                            <span className="text-[11px] font-semibold pl-1" style={{ color: T.error }}>{fieldErrors.adminPassword}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 mt-2">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            disabled={loading}
                                            className="px-6 py-4 rounded-2xl text-sm font-extrabold border transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                borderColor: T.border,
                                                color: T.textSecondary
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                            Back
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-4 rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)`,
                                                color: '#FFFFFF',
                                                opacity: loading ? 0.6 : 1,
                                                boxShadow: `0 8px 20px -4px ${T.primaryDim}`
                                            }}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Activating Workspace...
                                                </span>
                                            ) : 'Activate Workspace'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="mt-10 pt-6 border-t border-dashed" style={{ borderColor: T.border }}>
                            <p className="text-xs text-center" style={{ color: T.textSecondary }}>
                                Already have an account?{' '}
                                <Link to="/login" className="font-extrabold hover:underline" style={{ color: T.primary }}>Sign in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}