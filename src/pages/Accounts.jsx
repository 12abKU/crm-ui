import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, TAGS, EMPLOYEE_RANGES, TAG_COLORS, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import InlineEdit from '../components/InlineEdit'
import Pagination from '../components/Pagination'
import { Input, Select } from '../components/FormField'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

const PAGE_SIZE = 20

export default function Accounts() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState({ name: '', website: '', phone: '', industry: '', employeeRange: '', tag: '' })

    const loadPage = async (pageNum, q = '') => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: pageNum, size: PAGE_SIZE })
            if (q.trim()) params.set('search', q.trim())
            const r = await api.get(`/api/accounts?${params}`)
            setAccounts(r.data.content ?? [])
            setTotalPages(r.data.totalPages)
            setTotalElements(r.data.totalElements)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadPage(0) }, [])

    useEffect(() => {
        const t = setTimeout(() => { setPage(0); loadPage(0, search) }, 350)
        return () => clearTimeout(t)
    }, [search])

    const goToPage = (p) => { setPage(p); loadPage(p, search) }
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/api/accounts', form)
        setOpen(false)
        setForm({ name: '', website: '', phone: '', industry: '', employeeRange: '', tag: '' })
        setPage(0); loadPage(0, search)
    }

    const remove = async (id, e) => {
        e.stopPropagation()
        await api.delete(`/api/accounts/${id}`)
        const newTotal = totalElements - 1
        const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1)
        const targetPage = Math.min(page, maxPage)
        setPage(targetPage); loadPage(targetPage, search)
    }

    const updateField = async (id, field, value) => {
        const a = accounts.find(x => x.id === id)
        await api.put(`/api/accounts/${id}`, {
            name: a.name, website: a.website, phone: a.phone,
            industry: a.industry, employeeRange: a.employeeRange, tag: a.tag, [field]: value
        })
        setAccounts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))
    }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-[1440px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>Accounts</h2>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{totalElements} companies</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                            style={{ background: T.surface, border: `1px solid ${T.border}`, minWidth: 280 }}>
                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>search</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search accounts..." className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: T.textPrimary }} />
                            {search && <span onClick={() => setSearch('')} className="material-symbols-outlined text-[16px] cursor-pointer" style={{ color: T.textMuted }}>close</span>}
                        </div>
                        <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>Add Account
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                {['Company', 'Website', 'Phone', 'Industry', 'Employees', 'Tag', 'Contacts', 'Open Deals', ''].map(h => (
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
                                                <Skeleton height={14} width={120} borderRadius={6} />
                                            </div>
                                        </td>
                                        {[100, 90, 80, 70, 60, 40, 80, 20].map((w, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <Skeleton height={14} width={w} borderRadius={6} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : accounts.map((a, i) => {
                                const tag = TAG_COLORS[a.tag] || { bg: T.surfaceRaised, color: T.textSecondary }
                                const rowBg = ROW_COLORS[i % ROW_COLORS.length]
                                return (
                                    <tr key={a.id} className="group transition-colors"
                                        style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: rowBg }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                        onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                                    style={{ background: T.primaryDim, color: T.primary }}>
                                                    {a.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold cursor-pointer hover:underline"
                                                    style={{ color: T.primaryText }}
                                                    onClick={() => navigate(`/accounts/${a.id}`)}>
                                                    {a.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={a.website} placeholder="Add" onSave={v => updateField(a.id, 'website', v)} />
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={a.phone} placeholder="Add" onSave={v => updateField(a.id, 'phone', v)} />
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={a.industry} placeholder="Add" onSave={v => updateField(a.id, 'industry', v)} />
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                            <InlineEdit value={a.employeeRange} placeholder="Select" options={EMPLOYEE_RANGES} onSave={v => updateField(a.id, 'employeeRange', v)} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <InlineEdit value={a.tag} placeholder="Add" options={TAGS} onSave={v => updateField(a.id, 'tag', v)}>
                                                {a.tag && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: tag.bg, color: tag.color }}>{a.tag}</span>}
                                            </InlineEdit>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: T.secondaryDim }}>
                                                    <span className="material-symbols-outlined text-[13px]" style={{ color: T.secondaryText }}>groups</span>
                                                </div>
                                                <span className="text-sm font-bold" style={{ color: T.textPrimary }}>{a.contactCount ?? 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold" style={{ color: T.primaryText }}>₹{(a.openDealAmount ?? 0).toLocaleString()}</span>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>{a.openDealCount ?? 0} deals</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={e => remove(a.id, e)}
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
                            {!loading && accounts.length === 0 && (
                                <tr><td colSpan={9} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>business</span>
                                        </div>
                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>No accounts yet</p>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />
                </div>
            </main>

            <SlideForm title="Add Account" open={open} onClose={() => setOpen(false)} onSubmit={submit}>
                <Input label="Company Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Tata Motors" required />
                <Input label="Website" value={form.website} onChange={e => set('website', e.target.value)} placeholder="tatamotors.com" />
                <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9999999999" />
                <Input label="Industry" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Technology" />
                <Select label="Employee Range" value={form.employeeRange} onChange={e => set('employeeRange', e.target.value)}>
                    <option value="">Select range</option>
                    {EMPLOYEE_RANGES.map(r => <option key={r}>{r}</option>)}
                </Select>
                <Select label="Tag" value={form.tag} onChange={e => set('tag', e.target.value)}>
                    <option value="">Select tag</option>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                </Select>
            </SlideForm>
        </div>
    )
}