import { useEffect, useState } from 'react'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import {
    IconBuilding, IconCircleCheck, IconBan, IconUsers,
    IconChevronRight, IconX, IconPlus, IconTrash,
    IconKey, IconArrowLeft, IconRefresh, IconCrown,
    IconClock, IconCalendar
} from '@tabler/icons-react'

const STATUS_STYLES = {
    ACTIVE: { bg: 'rgba(22,163,74,0.10)', color: '#16a34a', label: 'Active' },
    SUSPENDED: { bg: 'rgba(220,38,38,0.10)', color: '#DC2626', label: 'Suspended' },
    TRIAL: { bg: 'rgba(217,119,6,0.10)', color: '#D97706', label: 'Trial' },
}
const PLAN_STYLES = {
    FREE: { bg: 'rgba(120,113,108,0.10)', color: '#78716c' },
    PRO: { bg: 'rgba(37,99,235,0.10)', color: '#2563eb' },
    ENTERPRISE: { bg: 'rgba(124,58,237,0.10)', color: '#7c3aed' },
}
const ROLE_STYLES = {
    ADMIN: { bg: 'rgba(37,99,235,0.10)', color: '#2563eb' },
    AGENT: { bg: 'rgba(22,163,74,0.10)', color: '#16a34a' },
}

function daysLeft(trialEndsAt) {
    if (!trialEndsAt) return null
    const diff = new Date(trialEndsAt) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function TrialBadge({ trialEndsAt, status }) {
    if (status !== 'TRIAL' || !trialEndsAt) return null
    const days = daysLeft(trialEndsAt)
    const expired = days <= 0
    const urgent = days <= 3 && !expired
    const color = expired ? '#DC2626' : urgent ? '#D97706' : '#16a34a'
    const bg = expired ? 'rgba(220,38,38,0.10)' : urgent ? 'rgba(217,119,6,0.10)' : 'rgba(22,163,74,0.10)'
    return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: bg, color }}>
            <IconClock size={10} />
            {expired ? 'Expired' : `${days}d left`}
        </span>
    )
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md rounded-2xl flex flex-col"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-lg"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <IconX size={16} />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    )
}

function InputField({ label, type = 'text', value, onChange, placeholder }) {
    return (
        <div className="mb-4">
            <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest"
                style={{ color: T.textMuted }}>{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary }} />
        </div>
    )
}

export default function PlatformDashboard() {
    const [stats, setStats] = useState(null)
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)

    const [selectedCompany, setSelectedCompany] = useState(null)
    const [companyUsers, setCompanyUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(false)

    const [showAddUser, setShowAddUser] = useState(false)
    const [showResetPw, setShowResetPw] = useState(null)
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [showTrialModal, setShowTrialModal] = useState(false)

    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'AGENT' })
    const [newPw, setNewPw] = useState('')
    const [newCompany, setNewCompany] = useState({ companyName: '', adminName: '', adminEmail: '', adminPassword: '' })
    const [trialDays, setTrialDays] = useState('14')
    const [trialMode, setTrialMode] = useState('days') // 'days' | 'date'
    const [trialDate, setTrialDate] = useState('')
    const [formSaving, setFormSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsRes, companiesRes] = await Promise.all([
                api.get('/api/platform/stats'),
                api.get('/api/platform/companies?page=0&size=100'),
            ])
            setStats(statsRes.data)
            setCompanies(companiesRes.data.content ?? [])
        } finally { setLoading(false) }
    }

    useEffect(() => { loadData() }, [])

    const loadCompanyUsers = async (company) => {
        setSelectedCompany(company)
        setUsersLoading(true)
        try {
            const r = await api.get(`/api/platform/companies/${company.id}/users`)
            setCompanyUsers(r.data)
        } finally { setUsersLoading(false) }
    }

    const updateStatus = async (id, status) => {
        setUpdating(id + 'status')
        try {
            await api.patch(`/api/platform/companies/${id}/status`, { status })
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c))
            if (selectedCompany?.id === id) setSelectedCompany(prev => ({ ...prev, status }))
        } finally { setUpdating(null) }
    }

    const updatePlan = async (id, plan) => {
        setUpdating(id + 'plan')
        try {
            await api.patch(`/api/platform/companies/${id}/plan`, { plan })
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, plan } : c))
            if (selectedCompany?.id === id) setSelectedCompany(prev => ({ ...prev, plan }))
        } finally { setUpdating(null) }
    }

    const submitTrial = async () => {
        setFormSaving(true); setFormError('')
        try {
            let body = {}
            if (trialMode === 'days') {
                const d = parseInt(trialDays)
                if (isNaN(d) || d < 0) { setFormError('Enter valid days (0 to clear)'); setFormSaving(false); return }
                body = { days: d }
            } else {
                if (!trialDate) { setFormError('Pick a date'); setFormSaving(false); return }
                body = { trialEndsAt: trialDate + 'T23:59:59' }
            }
            const r = await api.patch(`/api/platform/companies/${selectedCompany.id}/trial`, body)
            const updated = r.data
            setSelectedCompany(updated)
            setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
            setShowTrialModal(false)
        } catch (e) {
            setFormError(e?.response?.data?.message || 'Failed')
        } finally { setFormSaving(false) }
    }

    const changeUserRole = async (userId, role) => {
        setUpdating('role' + userId)
        try {
            await api.patch(`/api/platform/users/${userId}/role`, { role })
            setCompanyUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
        } finally { setUpdating(null) }
    }

    const deleteUser = async (userId) => {
        if (!confirm('Delete this user? This cannot be undone.')) return
        setUpdating('del' + userId)
        try {
            await api.delete(`/api/platform/users/${userId}`)
            setCompanyUsers(prev => prev.filter(u => u.id !== userId))
            setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev)
        } finally { setUpdating(null) }
    }

    const submitAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) { setFormError('All fields required'); return }
        setFormSaving(true); setFormError('')
        try {
            const r = await api.post(`/api/platform/companies/${selectedCompany.id}/users`, newUser)
            setCompanyUsers(prev => [...prev, r.data])
            setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers + 1 } : prev)
            setShowAddUser(false)
            setNewUser({ name: '', email: '', password: '', role: 'AGENT' })
        } catch (e) {
            setFormError(e?.response?.data?.message || 'Failed to create user')
        } finally { setFormSaving(false) }
    }

    const submitResetPw = async () => {
        if (!newPw || newPw.length < 6) { setFormError('Min 6 characters'); return }
        setFormSaving(true); setFormError('')
        try {
            await api.patch(`/api/platform/users/${showResetPw.id}/reset-password`, { password: newPw })
            setShowResetPw(null); setNewPw('')
        } catch (e) {
            setFormError(e?.response?.data?.message || 'Failed')
        } finally { setFormSaving(false) }
    }

    const submitAddCompany = async () => {
        const { companyName, adminName, adminEmail, adminPassword } = newCompany
        if (!companyName || !adminName || !adminEmail || !adminPassword) { setFormError('All fields required'); return }
        setFormSaving(true); setFormError('')
        try {
            await api.post('/api/auth/company/register', newCompany)
            await loadData()
            setShowAddCompany(false)
            setNewCompany({ companyName: '', adminName: '', adminEmail: '', adminPassword: '' })
        } catch (e) {
            setFormError(e?.response?.data?.message || 'Failed')
        } finally { setFormSaving(false) }
    }

    const statCards = stats ? [
        { icon: <IconBuilding size={18} />, label: 'Total Companies', value: stats.totalCompanies, accent: T.primary },
        { icon: <IconCircleCheck size={18} />, label: 'Active', value: stats.activeCompanies, accent: '#16a34a' },
        { icon: <IconClock size={18} />, label: 'On Trial', value: stats.trialCompanies ?? 0, accent: '#D97706' },
        { icon: <IconBan size={18} />, label: 'Suspended', value: stats.suspendedCompanies, accent: '#DC2626' },
        { icon: <IconUsers size={18} />, label: 'Total Users', value: stats.totalUsers, accent: '#7c3aed' },
    ] : []

    // ── Company detail view ──────────────────────────────────────────────────
    if (selectedCompany) {
        const ss = STATUS_STYLES[selectedCompany.status] || STATUS_STYLES.ACTIVE
        const ps = PLAN_STYLES[selectedCompany.plan] || PLAN_STYLES.FREE
        const days = daysLeft(selectedCompany.trialEndsAt)
        const trialExpired = selectedCompany.status === 'TRIAL' && selectedCompany.trialEndsAt && days <= 0

        return (
            <div>
                <TopBar />
                <main className="p-8 max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => setSelectedCompany(null)}
                            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl"
                            style={{ color: T.textMuted, background: T.surfaceRaised }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                            onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                            <IconArrowLeft size={15} /> Back
                        </button>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {selectedCompany.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black" style={{ color: T.textPrimary }}>{selectedCompany.name}</h1>
                                <TrialBadge trialEndsAt={selectedCompany.trialEndsAt} status={selectedCompany.status} />
                            </div>
                            <p className="text-xs font-mono" style={{ color: T.textMuted }}>{selectedCompany.slug}</p>
                        </div>
                    </div>

                    {/* Trial expired warning banner */}
                    {trialExpired && (
                        <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
                            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}>
                            <IconClock size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
                            <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                                Trial expired on {new Date(selectedCompany.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Users cannot log in. Extend trial or activate the account.
                            </p>
                        </div>
                    )}

                    {/* Company controls */}
                    <div className="rounded-2xl p-5 mb-6 grid grid-cols-4 gap-6"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Plan</p>
                            <select value={selectedCompany.plan}
                                disabled={updating === selectedCompany.id + 'plan'}
                                onChange={e => updatePlan(selectedCompany.id, e.target.value)}
                                className="w-full text-sm font-bold px-3 py-2.5 rounded-xl cursor-pointer outline-none border-0"
                                style={{ background: ps.bg, color: ps.color }}>
                                {['FREE', 'PRO', 'ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Status</p>
                            <select value={selectedCompany.status}
                                disabled={updating === selectedCompany.id + 'status'}
                                onChange={e => updateStatus(selectedCompany.id, e.target.value)}
                                className="w-full text-sm font-bold px-3 py-2.5 rounded-xl cursor-pointer outline-none border-0"
                                style={{ background: ss.bg, color: ss.color }}>
                                {['ACTIVE', 'SUSPENDED', 'TRIAL'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Trial Ends</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold" style={{ color: trialExpired ? '#DC2626' : T.textPrimary }}>
                                    {selectedCompany.trialEndsAt
                                        ? new Date(selectedCompany.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '—'}
                                </p>
                                {selectedCompany.trialEndsAt && days > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: days <= 3 ? 'rgba(217,119,6,0.12)' : 'rgba(22,163,74,0.10)', color: days <= 3 ? '#D97706' : '#16a34a' }}>
                                        {days}d left
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Trial Control</p>
                            <button onClick={() => { setFormError(''); setTrialDays('14'); setTrialDate(''); setTrialMode('days'); setShowTrialModal(true) }}
                                className="flex items-center gap-2 text-sm font-bold px-3 py-2.5 rounded-xl w-full"
                                style={{ background: 'rgba(217,119,6,0.10)', color: '#D97706' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,119,6,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,119,6,0.10)'}>
                                <IconClock size={14} /> Set Trial
                            </button>
                        </div>
                    </div>

                    {/* Users panel */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="px-6 py-4 flex items-center justify-between"
                            style={{ borderBottom: `1px solid ${T.border}` }}>
                            <div>
                                <h2 className="text-sm font-bold" style={{ color: T.textPrimary }}>Users</h2>
                                <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{companyUsers.length} member{companyUsers.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => loadCompanyUsers(selectedCompany)}
                                    className="p-2 rounded-xl" style={{ color: T.textMuted }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <IconRefresh size={15} />
                                </button>
                                <button onClick={() => { setFormError(''); setShowAddUser(true) }}
                                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl"
                                    style={{ background: T.primary, color: '#fff' }}>
                                    <IconPlus size={14} /> Add User
                                </button>
                            </div>
                        </div>
                        {usersLoading ? (
                            <div className="py-12 text-center text-sm" style={{ color: T.textMuted }}>Loading...</div>
                        ) : companyUsers.length === 0 ? (
                            <div className="py-12 text-center text-sm" style={{ color: T.textMuted }}>No users yet</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                        {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
                                                style={{ color: T.textMuted }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyUsers.map((u, i) => {
                                        const rs = ROLE_STYLES[u.role] || ROLE_STYLES.AGENT
                                        return (
                                            <tr key={u.id}
                                                style={{ background: i % 2 === 0 ? 'transparent' : T.surfaceRaised, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                                                            style={{ background: T.primaryDim, color: T.primary }}>
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>{u.email}</td>
                                                <td className="px-5 py-3.5">
                                                    {u.role === 'SUPER_ADMIN' ? (
                                                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full w-fit"
                                                            style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04' }}>
                                                            <IconCrown size={10} /> SUPER_ADMIN
                                                        </span>
                                                    ) : (
                                                        <select value={u.role}
                                                            disabled={updating === 'role' + u.id}
                                                            onChange={e => changeUserRole(u.id, e.target.value)}
                                                            className="text-[11px] font-bold px-2 py-1 rounded-full border-0 cursor-pointer outline-none"
                                                            style={{ background: rs.bg, color: rs.color }}>
                                                            <option value="AGENT">AGENT</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {u.role !== 'SUPER_ADMIN' && (
                                                        <div className="flex items-center gap-1">
                                                            <button title="Reset password"
                                                                onClick={() => { setFormError(''); setNewPw(''); setShowResetPw(u) }}
                                                                className="p-1.5 rounded-lg"
                                                                style={{ color: T.textMuted }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.color = T.primary }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                                                <IconKey size={14} />
                                                            </button>
                                                            <button title="Delete user"
                                                                disabled={updating === 'del' + u.id}
                                                                onClick={() => deleteUser(u.id)}
                                                                className="p-1.5 rounded-lg"
                                                                style={{ color: T.textMuted, opacity: updating === 'del' + u.id ? 0.4 : 1 }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = T.errorDim; e.currentTarget.style.color = T.error }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                                                <IconTrash size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>

                {/* Set Trial Modal */}
                {showTrialModal && (
                    <Modal title={`Trial Period — ${selectedCompany.name}`} onClose={() => setShowTrialModal(false)}>
                        <div className="flex gap-2 mb-4">
                            {[['days', 'By Days'], ['date', 'By Date']].map(([val, lbl]) => (
                                <button key={val} onClick={() => setTrialMode(val)}
                                    className="flex-1 py-2 rounded-xl text-sm font-semibold"
                                    style={{
                                        background: trialMode === val ? T.primaryDim : T.surfaceRaised,
                                        color: trialMode === val ? T.primary : T.textSecondary,
                                        border: `1.5px solid ${trialMode === val ? T.primary : T.border}`
                                    }}>
                                    {lbl}
                                </button>
                            ))}
                        </div>

                        {trialMode === 'days' ? (
                            <div>
                                <p className="text-xs mb-3" style={{ color: T.textMuted }}>
                                    Sets trial to end <strong>N days from now</strong>. Enter 0 to clear the trial end date.
                                </p>
                                <div className="flex gap-2 mb-4">
                                    {[7, 14, 30, 60, 90].map(d => (
                                        <button key={d} onClick={() => setTrialDays(String(d))}
                                            className="flex-1 py-2 rounded-xl text-xs font-bold"
                                            style={{
                                                background: trialDays === String(d) ? T.primaryDim : T.surfaceRaised,
                                                color: trialDays === String(d) ? T.primary : T.textMuted,
                                                border: `1px solid ${trialDays === String(d) ? T.primary : T.border}`
                                            }}>
                                            {d}d
                                        </button>
                                    ))}
                                </div>
                                <InputField label="Custom Days" type="number" value={trialDays}
                                    onChange={e => setTrialDays(e.target.value)} placeholder="e.g. 45" />
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs mb-3" style={{ color: T.textMuted }}>
                                    Pick a specific end date for the trial.
                                </p>
                                <InputField label="Trial End Date" type="date" value={trialDate}
                                    onChange={e => setTrialDate(e.target.value)} />
                            </div>
                        )}

                        {selectedCompany.trialEndsAt && (
                            <div className="mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
                                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                                <IconCalendar size={13} style={{ color: T.textMuted }} />
                                <span className="text-xs" style={{ color: T.textMuted }}>
                                    Current: {new Date(selectedCompany.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {' '}({daysLeft(selectedCompany.trialEndsAt)} days left)
                                </span>
                            </div>
                        )}

                        {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
                        <div className="flex gap-2">
                            <button onClick={() => setShowTrialModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                            <button onClick={submitTrial} disabled={formSaving}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: '#D97706', color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                                {formSaving ? 'Saving...' : 'Set Trial'}
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Add User Modal */}
                {showAddUser && (
                    <Modal title={`Add User to ${selectedCompany.name}`} onClose={() => setShowAddUser(false)}>
                        <InputField label="Full Name" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                        <InputField label="Email" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" />
                        <InputField label="Password" type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
                        <div className="mb-4">
                            <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: T.textMuted }}>Role</label>
                            <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary }}>
                                <option value="AGENT">Agent</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddUser(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                            <button onClick={submitAddUser} disabled={formSaving}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: T.primary, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                                {formSaving ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Reset Password Modal */}
                {showResetPw && (
                    <Modal title={`Reset Password — ${showResetPw.name}`} onClose={() => setShowResetPw(null)}>
                        <InputField label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
                        {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
                        <div className="flex gap-2">
                            <button onClick={() => setShowResetPw(null)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                            <button onClick={submitResetPw} disabled={formSaving}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: T.primary, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                                {formSaving ? 'Saving...' : 'Reset Password'}
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        )
    }

    // ── Companies list view ──────────────────────────────────────────────────
    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black" style={{ color: T.textPrimary }}>Platform Dashboard</h1>
                        <p className="text-sm mt-1" style={{ color: T.textMuted }}>Manage all companies and subscriptions</p>
                    </div>
                    <button onClick={() => { setFormError(''); setShowAddCompany(true) }}
                        className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl"
                        style={{ background: T.primary, color: '#fff' }}>
                        <IconPlus size={15} /> New Company
                    </button>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-8">
                    {statCards.map(({ icon, label, value, accent }) => (
                        <div key={label} className="rounded-2xl p-5"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: accent + '18', color: accent }}>{icon}</div>
                            <p className="text-2xl font-black" style={{ color: T.textPrimary }}>{value ?? '—'}</p>
                            <p className="text-[11px] font-semibold mt-0.5" style={{ color: T.textMuted }}>{label}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <h2 className="text-sm font-bold" style={{ color: T.textPrimary }}>All Companies</h2>
                        <span className="text-xs" style={{ color: T.textMuted }}>{companies.length} total</span>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                {['Company', 'Plan', 'Status', 'Trial', 'Created', ''].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: T.textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: T.textMuted }}>Loading...</td></tr>
                            ) : companies.map((company, i) => {
                                const ss = STATUS_STYLES[company.status] || STATUS_STYLES.ACTIVE
                                const ps = PLAN_STYLES[company.plan] || PLAN_STYLES.FREE
                                return (
                                    <tr key={company.id}
                                        style={{ background: i % 2 === 0 ? 'transparent' : T.surfaceRaised, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                                                    style={{ background: T.primaryDim, color: T.primary }}>
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{company.name}</p>
                                                    <p className="text-[10px] font-mono" style={{ color: T.textMuted }}>{company.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                                style={{ background: ps.bg, color: ps.color }}>{company.plan}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                                style={{ background: ss.bg, color: ss.color }}>{company.status}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <TrialBadge trialEndsAt={company.trialEndsAt} status={company.status} />
                                            {company.status !== 'TRIAL' && <span className="text-xs" style={{ color: T.textMuted }}>—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>
                                            {company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button onClick={() => loadCompanyUsers(company)}
                                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                                                style={{ background: T.surfaceHigh, color: T.textSecondary }}
                                                onMouseEnter={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.color = T.primary }}
                                                onMouseLeave={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textSecondary }}>
                                                Manage <IconChevronRight size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            {showAddCompany && (
                <Modal title="Create New Company" onClose={() => setShowAddCompany(false)}>
                    <InputField label="Company Name" value={newCompany.companyName} onChange={e => setNewCompany(p => ({ ...p, companyName: e.target.value }))} placeholder="Acme Corp" />
                    <InputField label="Admin Name" value={newCompany.adminName} onChange={e => setNewCompany(p => ({ ...p, adminName: e.target.value }))} placeholder="John Doe" />
                    <InputField label="Admin Email" type="email" value={newCompany.adminEmail} onChange={e => setNewCompany(p => ({ ...p, adminEmail: e.target.value }))} placeholder="admin@acme.com" />
                    <InputField label="Admin Password" type="password" value={newCompany.adminPassword} onChange={e => setNewCompany(p => ({ ...p, adminPassword: e.target.value }))} placeholder="Min 6 characters" />
                    <p className="text-[11px] mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(217,119,6,0.08)', color: '#D97706' }}>
                        New company starts on a 14-day free trial automatically.
                    </p>
                    {formError && <p className="text-xs mb-3 font-semibold" style={{ color: T.error }}>{formError}</p>}
                    <div className="flex gap-2">
                        <button onClick={() => setShowAddCompany(false)}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: T.surfaceRaised, color: T.textSecondary }}>Cancel</button>
                        <button onClick={submitAddCompany} disabled={formSaving}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: T.primary, color: '#fff', opacity: formSaving ? 0.6 : 1 }}>
                            {formSaving ? 'Creating...' : 'Create Company'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}