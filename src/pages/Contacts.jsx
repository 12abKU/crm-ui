import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import InlineEdit from '../components/InlineEdit'
import Pagination from '../components/Pagination'
import { Input } from '../components/FormField'
import SearchableSelect from '../components/SearchableSelect'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

const PAGE_SIZE = 20
const AVATARS = [T.primaryDim, T.secondaryDim, T.tertiaryDim, 'rgba(76,175,125,0.15)']
const AVATAR_COLORS = [T.primaryText, T.secondaryText, T.tertiaryText, '#4CAF7D']

export default function Contacts() {
    const navigate = useNavigate()
    const [contacts, setContacts] = useState([])
    const [accounts, setAccounts] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', designation: '', accountId: '' })

    const loadPage = async (pageNum, q = '') => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: pageNum, size: PAGE_SIZE })
            if (q.trim()) params.set('search', q.trim())
            const r = await api.get(`/api/contacts?${params}`)
            setContacts(r.data.content ?? [])
            setTotalPages(r.data.totalPages)
            setTotalElements(r.data.totalElements)
        } finally { setLoading(false) }
    }

    useEffect(() => {
        loadPage(0)
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content || []))
    }, [])

    useEffect(() => {
        const t = setTimeout(() => { setPage(0); loadPage(0, search) }, 350)
        return () => clearTimeout(t)
    }, [search])

    const goToPage = (p) => { setPage(p); loadPage(p, search) }
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/api/contacts', { ...form, accountId: form.accountId || null })
        setOpen(false)
        setForm({ firstName: '', lastName: '', email: '', phone: '', designation: '', accountId: '' })
        setPage(0); loadPage(0, search)
    }

    const remove = async (id, e) => {
        e.stopPropagation()
        await api.delete(`/api/contacts/${id}`)
        const newTotal = totalElements - 1
        const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1)
        const targetPage = Math.min(page, maxPage)
        setPage(targetPage); loadPage(targetPage, search)
    }

    const updateField = async (id, field, value) => {
        const c = contacts.find(x => x.id === id)
        await api.put(`/api/contacts/${id}`, {
            firstName: c.firstName, lastName: c.lastName, email: c.email,
            phone: c.phone, designation: c.designation, accountId: c.account?.id || null, [field]: value
        })
        setContacts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))
    }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-[1440px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>Contacts</h2>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{totalElements} people</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                            style={{ background: T.surface, border: `1px solid ${T.border}`, minWidth: 280 }}>
                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>search</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search contacts..." className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: T.textPrimary }} />
                            {search && <span onClick={() => setSearch('')} className="material-symbols-outlined text-[16px] cursor-pointer" style={{ color: T.textMuted }}>close</span>}
                        </div>
                        <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>Add Contact
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                {['Name', 'Email', 'Phone', 'Designation', 'Account', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton circle width={40} height={40} />
                                                <Skeleton height={14} width={130} borderRadius={6} />
                                            </div>
                                        </td>
                                        {[140, 100, 110, 90, 20].map((w, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <Skeleton height={14} width={w} borderRadius={6} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : contacts.map((c, i) => {
                                const rowBg = ROW_COLORS[i % ROW_COLORS.length]
                                return (
                                    <tr key={c.id} className="group transition-colors"
                                        style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: rowBg }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                        onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                                    style={{ background: AVATARS[i % 4], color: AVATAR_COLORS[i % 4] }}>
                                                    {c.firstName.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-semibold cursor-pointer hover:underline"
                                                    style={{ color: T.primaryText }}
                                                    onClick={() => navigate(`/contacts/${c.id}`)}>
                                                    {c.firstName} {c.lastName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={c.email} placeholder="Add" onSave={v => updateField(c.id, 'email', v)} />
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={c.phone} placeholder="Add" onSave={v => updateField(c.id, 'phone', v)} />
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={c.designation} placeholder="Add" onSave={v => updateField(c.id, 'designation', v)} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.account && (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                                    style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                                                    {c.account.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={e => remove(c.id, e)}
                                                className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                                                style={{ color: T.textMuted }}
                                                onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                                                onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                                                delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {!loading && contacts.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>groups</span>
                                        </div>
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No contacts yet</p>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />
                </div>
            </main>

            <SlideForm title="Add Contact" open={open} onClose={() => setOpen(false)} onSubmit={submit}>
                <Input label="First Name *" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Ravi" required />
                <Input label="Last Name" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Sharma" />
                <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ravi@company.com" />
                <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9999999999" />
                <Input label="Designation" value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Manager" />
                <SearchableSelect label="Account" value={form.accountId} onChange={v => set('accountId', v)}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))} placeholder="Select account" />
            </SlideForm>
        </div>
    )
}