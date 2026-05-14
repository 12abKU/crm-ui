import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { T } from '../constants/theme'
import api from '../api'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (e) => {
        e.preventDefault(); setLoading(true); setError('')
        try {
            const { data } = await api.post('/api/auth/register', form)
            localStorage.setItem('token', data.token)
            localStorage.setItem('name', data.name)
            localStorage.setItem('role', data.role)
            navigate('/')
        } catch (err) { setError(err.response?.data?.message || 'Registration failed') }
        finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: T.bg }}>
            <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${T.primaryDim} 0%, transparent 70%)`, transform: 'translate(-30%,-30%)' }} />

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
                    <h2 className="text-2xl font-black mb-1" style={{ color: T.textPrimary }}>Create account</h2>
                    <p className="text-sm mb-6" style={{ color: T.textMuted }}>Sign up to get started</p>

                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"
                            style={{ background: T.errorDim, color: T.error }}>
                            <span className="material-symbols-outlined text-[16px]">error</span>{error}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        {[
                            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@company.com' },
                            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key} className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</label>
                                <input type={type} value={form[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="crm-input" placeholder={placeholder} required />
                            </div>
                        ))}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Role</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="crm-select">
                                <option value="AGENT">Agent</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="crm-btn-primary w-full mt-2 py-3">
                            {loading ? 'Creating account...' : 'Create account'}
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