import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { T } from '../constants/theme'
import api, { extractApiErrorMessage } from '../api'
import { setCredentials } from '../store/authSlice'

export default function Register() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [form, setForm] = useState({
        companyName: '', adminName: '', adminEmail: '', adminPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault(); setLoading(true); setError('')
        try {
            const { data } = await api.post('/api/auth/company/register', form)
            dispatch(setCredentials(data))
            navigate('/')
        } catch (err) { setError(extractApiErrorMessage(err, 'Registration failed')) }
        finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: T.bg }}>
            <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${T.primaryDim} 0%, transparent 70%)`, transform: 'translate(-30%,-30%)' }} />
            <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${T.secondaryDim} 0%, transparent 70%)`, transform: 'translate(30%,30%)' }} />

            <div className="w-full max-w-sm relative z-10">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.primary }}>
                        <span className="material-symbols-outlined filled text-white text-[20px]">dataset</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black" style={{ color: T.textPrimary }}>Iinventive CRM</h1>
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Enterprise Suite</p>
                    </div>
                </div>

                <div className="rounded-2xl p-8" style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
                    <h2 className="text-2xl font-black mb-1" style={{ color: T.textPrimary }}>Create your workspace</h2>
                    <p className="text-sm mb-6" style={{ color: T.textMuted }}>Set up your company and admin account</p>

                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"
                            style={{ background: T.errorDim, color: T.error }}>
                            <span className="material-symbols-outlined text-[16px]">error</span>{error}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        {/* Company section */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                Company Name
                            </label>
                            <input type="text" value={form.companyName} onChange={set('companyName')}
                                className="crm-input" placeholder="Acme Corp" required />
                        </div>

                        <div className="h-px my-1" style={{ background: T.borderSubtle }} />
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Admin Account</p>

                        {[
                            { label: 'Full Name', key: 'adminName', type: 'text', placeholder: 'Your name' },
                            { label: 'Email', key: 'adminEmail', type: 'email', placeholder: 'admin@acmecorp.com' },
                            { label: 'Password', key: 'adminPassword', type: 'password', placeholder: '••••••••' },
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key} className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</label>
                                <input type={type} value={form[key]} onChange={set(key)}
                                    className="crm-input" placeholder={placeholder} required />
                            </div>
                        ))}

                        <button type="submit" disabled={loading} className="crm-btn-primary w-full mt-2 py-3">
                            {loading ? 'Creating workspace...' : 'Create workspace'}
                        </button>
                    </form>

                    <p className="text-sm text-center mt-6" style={{ color: T.textMuted }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold hover:underline" style={{ color: T.primary }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}