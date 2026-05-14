import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, TAGS, EMPLOYEE_RANGES, TAG_COLORS, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import InlineEdit from '../components/InlineEdit'
import Pagination from '../components/Pagination'
import { Input, Select } from '../components/FormField'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import TableShell from '../components/ui/TableShell'
import EmptyTableRow from '../components/ui/EmptyTableRow'
import DeleteIconButton from '../components/ui/DeleteIconButton'
import EntityAvatar from '../components/ui/EntityAvatar'
import usePaginatedSearch from '../hooks/usePaginatedSearch'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

const PAGE_SIZE = 20

export default function Accounts() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ name: '', website: '', phone: '', industry: '', employeeRange: '', tag: '' })

    const fetchAccounts = useCallback(async ({ page, size, search }) => {
        const params = new URLSearchParams({ page, size })
        if (search.trim()) params.set('search', search.trim())
        const r = await api.get(`/api/accounts?${params}`)
        return r.data
    }, [])

    const {
        items: accounts,
        setItems: setAccounts,
        page,
        setPage,
        totalPages,
        totalElements,
        loading,
        search,
        setSearch,
        loadPage,
        goToPage,
    } = usePaginatedSearch({ pageSize: PAGE_SIZE, fetchPage: fetchAccounts })

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
                <PageHeader
                    title="Accounts"
                    subtitle={`${totalElements} companies`}
                    actions={
                        <>
                            <SearchInput value={search} onChange={setSearch} placeholder="Search accounts..." />
                        <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>Add Account
                        </button>
                        </>
                    }
                />

                <TableShell
                    headers={['Company', 'Website', 'Phone', 'Industry', 'Employees', 'Tag', 'Contacts', 'Open Deals', '']}
                    footer={<Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />}
                >
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
                                                <EntityAvatar label={a.name} rounded="xl" variant="primary" />
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
                                            <DeleteIconButton onClick={e => remove(a.id, e)} />
                                        </td>
                                    </tr>
                                )
                            })}
                            {!loading && accounts.length === 0 && <EmptyTableRow colSpan={9} icon="business" title="No accounts yet" />}
                        </tbody>
                </TableShell>
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
