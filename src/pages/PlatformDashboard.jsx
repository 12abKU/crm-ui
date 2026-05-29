import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import { IconPlus, IconBuilding, IconUsers, IconCircleCheck, IconClock, IconBan, IconAddressBook, IconCurrencyRupee } from '@tabler/icons-react'
import CompanyDetail from '../components/platform/CompanyDetail'
import CompaniesTable from '../components/platform/CompaniesTable'
import ExpiringTrialsBanner from '../components/platform/ExpiringTrialsBanner'
import { AddCompanyModal } from '../components/platform/CompanyModals'

const DOT_GRID = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E")`

function HeroStat({ icon, value, label, accent, delay = 0 }) {
    return (
        <div style={{
            flex: 1, padding: '20px 18px',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 18,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
            transition: 'transform 0.2s, background 0.2s',
            cursor: 'default',
            animation: `fadeSlideUp 0.5s ease ${delay}s both`,
        }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none' }}
        >
            <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: accent + '28', border: `1px solid ${accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
            }}>{icon}</div>
            <div>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>{value ?? '—'}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.50)', margin: '5px 0 0', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</p>
            </div>
        </div>
    )
}

export default function PlatformDashboard() {
    const navigate = useNavigate()
    const { name } = useSelector(state => state.auth)

    const [stats, setStats] = useState(null)
    const [companies, setCompanies] = useState([])
    const [expiringTrials, setExpiringTrials] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [companyUsers, setCompanyUsers] = useState([])
    const [companyStats, setCompanyStats] = useState(null)
    const [usersLoading, setUsersLoading] = useState(false)
    const [notes, setNotes] = useState('')
    const [notesSaving, setNotesSaving] = useState(false)
    const [notesSaved, setNotesSaved] = useState(false)
    const notesTimer = useRef(null)
    const [impersonating, setImpersonating] = useState(null)
    const [searchQ, setSearchQ] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterPlan, setFilterPlan] = useState('ALL')
    const [showAddUser, setShowAddUser] = useState(false)
    const [showResetPw, setShowResetPw] = useState(null)
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [showTrialModal, setShowTrialModal] = useState(false)
    const [showDeleteCompany, setShowDeleteCompany] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'AGENT' })
    const [newPw, setNewPw] = useState('')
    const [newCompany, setNewCompany] = useState({ companyName: '', adminName: '', adminEmail: '', adminPassword: '' })
    const [trialDays, setTrialDays] = useState('14')
    const [trialMode, setTrialMode] = useState('days')
    const [trialDate, setTrialDate] = useState('')
    const [formSaving, setFormSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsRes, companiesRes, expiringRes] = await Promise.all([
                api.get('/api/platform/stats'),
                api.get('/api/platform/companies?page=0&size=100'),
                api.get('/api/platform/companies/expiring-trials?days=7'),
            ])
            setStats(statsRes.data)
            setCompanies(companiesRes.data.content ?? [])
            setExpiringTrials(expiringRes.data ?? [])
        } finally { setLoading(false) }
    }

    useEffect(() => { loadData() }, [])

    const loadCompanyDetail = async (company) => {
        setSelectedCompany(company)
        setNotes(company.notes || '')
        setNotesSaved(false)
        setCompanyStats(null)
        setUsersLoading(true)
        try {
            const [usersRes, statsRes] = await Promise.all([
                api.get(`/api/platform/companies/${company.id}/users`),
                api.get(`/api/platform/companies/${company.id}/stats`),
            ])
            setCompanyUsers(usersRes.data)
            setCompanyStats(statsRes.data)
        } finally { setUsersLoading(false) }
    }

    const filteredCompanies = useMemo(() => companies.filter(c => {
        const matchQ = !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.slug.toLowerCase().includes(searchQ.toLowerCase())
        const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
        const matchPlan = filterPlan === 'ALL' || c.plan === filterPlan
        return matchQ && matchStatus && matchPlan
    }), [companies, searchQ, filterStatus, filterPlan])

    const handleNotesChange = (val) => {
        setNotes(val); setNotesSaved(false); clearTimeout(notesTimer.current)
        notesTimer.current = setTimeout(async () => {
            setNotesSaving(true)
            try {
                const r = await api.patch(`/api/platform/companies/${selectedCompany.id}/notes`, { notes: val })
                setSelectedCompany(r.data)
                setCompanies(prev => prev.map(c => c.id === r.data.id ? r.data : c))
                setNotesSaved(true)
            } finally { setNotesSaving(false) }
        }, 1500)
    }

    const impersonate = async (user) => {
        setImpersonating(user.id)
        try {
            const r = await api.post(`/api/platform/companies/${selectedCompany.id}/impersonate/${user.id}`)
            const data = r.data
            const payload = JSON.stringify({ token: data.token, name: data.name, role: data.role, userId: String(data.userId), email: data.email, companyId: String(data.companyId), companyName: data.companyName, permissions: data.permissions ? JSON.parse(data.permissions) : [] })
            sessionStorage.setItem('crm_impersonate', payload)
            window.open('/', '_blank')
        } catch (e) { console.error(e) }
        finally { setImpersonating(null) }
    }

    const updateStatus = async (id, status) => {
        setUpdating(id + 'status')
        try {
            const r = await api.patch(`/api/platform/companies/${id}/status`, { status })
            const updated = r.data
            setCompanies(prev => prev.map(c => c.id === id ? updated : c))
            if (selectedCompany?.id === id) setSelectedCompany(updated)
            api.get('/api/platform/stats').then(r => setStats(r.data))
            api.get('/api/platform/companies/expiring-trials?days=7').then(r => setExpiringTrials(r.data ?? []))
        } finally { setUpdating(null) }
    }

    const updatePlan = async (id, plan) => {
        setUpdating(id + 'plan')
        try {
            const r = await api.patch(`/api/platform/companies/${id}/plan`, { plan })
            const updated = r.data
            setCompanies(prev => prev.map(c => c.id === id ? updated : c))
            if (selectedCompany?.id === id) setSelectedCompany(updated)
        } finally { setUpdating(null) }
    }

    const submitTrial = async () => {
        setFormSaving(true); setFormError('')
        try {
            let body = {}
            if (trialMode === 'days') {
                const d = parseInt(trialDays)
                if (isNaN(d) || d < 0) { setFormError('Enter valid days'); setFormSaving(false); return }
                body = { days: d }
            } else {
                if (!trialDate) { setFormError('Pick a date'); setFormSaving(false); return }
                body = { trialEndsAt: trialDate + 'T23:59:59' }
            }
            const r = await api.patch(`/api/platform/companies/${selectedCompany.id}/trial`, body)
            const updated = r.data
            setSelectedCompany(updated)
            setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
            api.get('/api/platform/stats').then(r => setStats(r.data))
            api.get('/api/platform/companies/expiring-trials?days=7').then(r => setExpiringTrials(r.data ?? []))
            setShowTrialModal(false)
        } catch (e) { setFormError(e?.response?.data?.message || 'Failed') }
        finally { setFormSaving(false) }
    }

    const changeUserRole = async (userId, role) => {
        setUpdating('role' + userId)
        try {
            await api.patch(`/api/platform/users/${userId}/role`, { role })
            setCompanyUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
        } finally { setUpdating(null) }
    }

    const deleteUser = async (userId) => {
        if (!confirm('Delete this user? Cannot be undone.')) return
        setUpdating('del' + userId)
        try {
            await api.delete(`/api/platform/users/${userId}`)
            setCompanyUsers(prev => prev.filter(u => u.id !== userId))
            setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev)
            if (companyStats) setCompanyStats(prev => ({ ...prev, users: prev.users - 1 }))
        } finally { setUpdating(null) }
    }

    const submitAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) { setFormError('All fields required'); return }
        setFormSaving(true); setFormError('')
        try {
            const r = await api.post(`/api/platform/companies/${selectedCompany.id}/users`, newUser)
            setCompanyUsers(prev => [...prev, r.data])
            setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers + 1 } : prev)
            if (companyStats) setCompanyStats(prev => ({ ...prev, users: prev.users + 1 }))
            setShowAddUser(false)
            setNewUser({ name: '', email: '', password: '', role: 'AGENT' })
        } catch (e) { setFormError(e?.response?.data?.message || 'Failed to create user') }
        finally { setFormSaving(false) }
    }

    const submitResetPw = async () => {
        if (!newPw || newPw.length < 6) { setFormError('Min 6 characters'); return }
        setFormSaving(true); setFormError('')
        try {
            await api.patch(`/api/platform/users/${showResetPw.id}/reset-password`, { password: newPw })
            setShowResetPw(null); setNewPw('')
        } catch (e) { setFormError(e?.response?.data?.message || 'Failed') }
        finally { setFormSaving(false) }
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
        } catch (e) { setFormError(e?.response?.data?.message || 'Failed') }
        finally { setFormSaving(false) }
    }

    const submitDeleteCompany = async () => {
        setFormSaving(true); setFormError('')
        try {
            await api.delete(`/api/platform/companies/${selectedCompany.id}`)
            setSelectedCompany(null)
            await loadData()
            setShowDeleteCompany(false)
        } catch (e) { setFormError(e?.response?.data?.message || 'Failed to delete') }
        finally { setFormSaving(false) }
    }

    // ── Company detail view ──────────────────────────────────────────────────
    if (selectedCompany) {
        return (
            <CompanyDetail
                company={selectedCompany} companyStats={companyStats}
                companyUsers={companyUsers} usersLoading={usersLoading}
                updating={updating} impersonating={impersonating}
                notes={notes} notesSaving={notesSaving} notesSaved={notesSaved}
                onNotesChange={handleNotesChange}
                showTrialModal={showTrialModal} showDeleteCompany={showDeleteCompany}
                showAddUser={showAddUser} showResetPw={showResetPw}
                setShowTrialModal={setShowTrialModal} setShowDeleteCompany={setShowDeleteCompany}
                setShowAddUser={setShowAddUser} setShowResetPw={setShowResetPw}
                trialMode={trialMode} setTrialMode={setTrialMode}
                trialDays={trialDays} setTrialDays={setTrialDays}
                trialDate={trialDate} setTrialDate={setTrialDate}
                newUser={newUser} setNewUser={setNewUser}
                newPw={newPw} setNewPw={setNewPw}
                formSaving={formSaving} formError={formError} setFormError={setFormError}
                onBack={() => setSelectedCompany(null)}
                onUpdatePlan={updatePlan} onUpdateStatus={updateStatus}
                onSubmitTrial={submitTrial}
                onSubmitDeleteCompany={submitDeleteCompany}
                onSubmitAddUser={submitAddUser}
                onSubmitResetPw={submitResetPw}
                onImpersonate={impersonate}
                onResetPassword={(u) => { setFormError(''); setNewPw(''); setShowResetPw(u) }}
                onDeleteUser={deleteUser}
                onChangeRole={changeUserRole}
                onRefreshUsers={() => loadCompanyDetail(selectedCompany)}
            />
        )
    }

    const initial = (name || 'P').charAt(0).toUpperCase()

    return (
        <div style={{ background: T.bg, minHeight: '100vh' }}>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseRing {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50%      { opacity: 1;   transform: scale(1.06); }
                }
            `}</style>
            <TopBar />

            {/* HERO */}
            <div style={{
                background: `linear-gradient(140deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                backgroundImage: `${DOT_GRID}, linear-gradient(140deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 60%, ${T.heroBgTo} 100%)`,
                position: 'relative', overflow: 'hidden', paddingBottom: 40,
            }}>
                <div style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: T.heroAccentGlow, filter: 'blur(80px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -60, left: '25%', width: 240, height: 240, borderRadius: '50%', background: T.heroOrb2, filter: 'blur(60px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(40px)', pointerEvents: 'none' }} />

                <div className="px-4 pt-8 md:px-9 md:pt-10" style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${T.avatarGlow}`, animation: 'pulseRing 3s ease-in-out infinite' }} />
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${T.avatarGradFrom}, ${T.avatarGradTo})`, boxShadow: `0 0 32px ${T.avatarGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff' }}>
                                    {initial}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.heroBadgeBg, border: `1px solid ${T.heroBadgeBorder}`, borderRadius: 999, padding: '4px 12px', marginBottom: 10 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: T.heroBadgeText }}>shield_person</span>
                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.09em', color: T.heroBadgeText, textTransform: 'uppercase' }}>Super Admin · Platform Control</span>
                                </div>
                                <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Platform Dashboard</h1>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: '8px 0 0', fontWeight: 500 }}>Manage all companies, subscriptions & platform health</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFormError(''); setShowAddCompany(true) }}
                            className="w-full md:w-auto justify-center"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: T.primary, color: '#fff', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 6px 24px ${T.avatarGlow}`, transition: 'transform 0.18s, box-shadow 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${T.avatarGlow}` }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 6px 24px ${T.avatarGlow}` }}>
                            <IconPlus size={16} strokeWidth={2.5} /> New Company
                        </button>
                    </div>

                    {stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                            <HeroStat icon={<IconBuilding size={16} />} value={stats.totalCompanies} label="Companies" accent="#60A5FA" delay={0} />
                            <HeroStat icon={<IconCircleCheck size={16} />} value={stats.activeCompanies} label="Active" accent="#4ADE80" delay={0.06} />
                            <HeroStat icon={<IconClock size={16} />} value={stats.trialCompanies ?? 0} label="On Trial" accent="#FBBF24" delay={0.12} />
                            <HeroStat icon={<IconBan size={16} />} value={stats.suspendedCompanies} label="Suspended" accent="#F87171" delay={0.18} />
                            <HeroStat icon={<IconUsers size={16} />} value={stats.totalUsers} label="Users" accent={T.superAdminLight ?? '#A78BFA'} delay={0.24} />
                            <HeroStat icon={<IconAddressBook size={16} />} value={stats.totalContacts ?? 0} label="Contacts" accent="#34D399" delay={0.30} />
                            <HeroStat icon={<IconCurrencyRupee size={16} />} value={stats.totalDeals ?? 0} label="Deals" accent="#F472B6" delay={0.36} />
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="px-4 py-8 md:px-9 md:py-10" style={{ maxWidth: 1120, margin: '0 auto' }}>

                <ExpiringTrialsBanner trials={expiringTrials} onManage={loadCompanyDetail} />

                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 4, height: 22, borderRadius: 4, background: T.primary }} />
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, margin: 0 }}>All Companies</h2>
                        {!loading && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: T.primaryDim, color: T.primary }}>
                                {filteredCompanies.length}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <CompaniesTable
                        companies={companies} filteredCompanies={filteredCompanies}
                        loading={loading}
                        searchQ={searchQ} setSearchQ={setSearchQ}
                        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                        filterPlan={filterPlan} setFilterPlan={setFilterPlan}
                        onManage={loadCompanyDetail}
                    />
                </div>
            </main>

            {showAddCompany && (
                <AddCompanyModal
                    newCompany={newCompany} setNewCompany={setNewCompany}
                    onClose={() => setShowAddCompany(false)}
                    formSaving={formSaving} formError={formError}
                    onSubmit={submitAddCompany}
                />
            )}
        </div>
    )
}