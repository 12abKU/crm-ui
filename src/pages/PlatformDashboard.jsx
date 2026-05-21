import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import { IconPlus } from '@tabler/icons-react'
import CompanyDetail from '../components/platform/CompanyDetail'
import CompaniesTable from '../components/platform/CompaniesTable'
import ExpiringTrialsBanner from '../components/platform/ExpiringTrialsBanner'
import PlatformStatsGrid from '../components/platform/PlatformStatsGrid'
import { AddCompanyModal } from '../components/platform/CompanyModals'

export default function PlatformDashboard() {
    const navigate = useNavigate()

    // ── Global data ──────────────────────────────────────────────────────────
    const [stats, setStats] = useState(null)
    const [companies, setCompanies] = useState([])
    const [expiringTrials, setExpiringTrials] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)

    // ── Company detail ───────────────────────────────────────────────────────
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [companyUsers, setCompanyUsers] = useState([])
    const [companyStats, setCompanyStats] = useState(null)
    const [usersLoading, setUsersLoading] = useState(false)

    // ── Notes ────────────────────────────────────────────────────────────────
    const [notes, setNotes] = useState('')
    const [notesSaving, setNotesSaving] = useState(false)
    const [notesSaved, setNotesSaved] = useState(false)
    const notesTimer = useRef(null)

    // ── Impersonate ──────────────────────────────────────────────────────────
    const [impersonating, setImpersonating] = useState(null)

    // ── List filters ─────────────────────────────────────────────────────────
    const [searchQ, setSearchQ] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterPlan, setFilterPlan] = useState('ALL')

    // ── Modal state ──────────────────────────────────────────────────────────
    const [showAddUser, setShowAddUser] = useState(false)
    const [showResetPw, setShowResetPw] = useState(null)
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [showTrialModal, setShowTrialModal] = useState(false)
    const [showDeleteCompany, setShowDeleteCompany] = useState(false)

    // ── Form state ───────────────────────────────────────────────────────────
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'AGENT' })
    const [newPw, setNewPw] = useState('')
    const [newCompany, setNewCompany] = useState({ companyName: '', adminName: '', adminEmail: '', adminPassword: '' })
    const [trialDays, setTrialDays] = useState('14')
    const [trialMode, setTrialMode] = useState('days')
    const [trialDate, setTrialDate] = useState('')
    const [formSaving, setFormSaving] = useState(false)
    const [formError, setFormError] = useState('')

    // ── Data loaders ─────────────────────────────────────────────────────────
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

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleNotesChange = (val) => {
        setNotes(val)
        setNotesSaved(false)
        clearTimeout(notesTimer.current)
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
            const payload = JSON.stringify({
                token: data.token,
                name: data.name,
                role: data.role,
                userId: String(data.userId),
                email: data.email,
                companyId: String(data.companyId),
                companyName: data.companyName,
                permissions: data.permissions ? JSON.parse(data.permissions) : [],
            })
            sessionStorage.setItem('crm_impersonate', payload)
            window.open('/', '_blank')
        } catch (e) {
            alert(e?.response?.data?.message || 'Failed to impersonate user')
        } finally { setImpersonating(null) }
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

    const submitDeleteCompany = async () => {
        setFormSaving(true); setFormError('')
        try {
            await api.delete(`/api/platform/companies/${selectedCompany.id}`)
            setSelectedCompany(null)
            await loadData()
            setShowDeleteCompany(false)
        } catch (e) {
            setFormError(e?.response?.data?.message || 'Failed to delete')
        } finally { setFormSaving(false) }
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

    // ── Companies list view ──────────────────────────────────────────────────
    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-6xl mx-auto">
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

                <ExpiringTrialsBanner trials={expiringTrials} onManage={loadCompanyDetail} />

                <PlatformStatsGrid stats={stats} />

                <CompaniesTable
                    companies={companies} filteredCompanies={filteredCompanies}
                    loading={loading}
                    searchQ={searchQ} setSearchQ={setSearchQ}
                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                    filterPlan={filterPlan} setFilterPlan={setFilterPlan}
                    onManage={loadCompanyDetail}
                />
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