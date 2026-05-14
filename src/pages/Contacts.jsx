import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, ROW_COLORS } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import InlineEdit from '../components/InlineEdit'
import Pagination from '../components/Pagination'
import { Input } from '../components/FormField'
import SearchableSelect from '../components/SearchableSelect'
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

export default function Contacts() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', designation: '', accountId: '' })

    const fetchContacts = useCallback(async ({ page, size, search }) => {
        const params = new URLSearchParams({ page, size })
        if (search.trim()) params.set('search', search.trim())
        const r = await api.get(`/api/contacts?${params}`)
        return r.data
    }, [])

    const {
        items: contacts,
        setItems: setContacts,
        page,
        setPage,
        totalPages,
        totalElements,
        loading,
        search,
        setSearch,
        loadPage,
        goToPage,
    } = usePaginatedSearch({ pageSize: PAGE_SIZE, fetchPage: fetchContacts })

    useEffect(() => {
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content || []))
    }, [])

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
                <PageHeader
                    title="Contacts"
                    subtitle={`${totalElements} people`}
                    actions={
                        <>
                            <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
                        <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>Add Contact
                        </button>
                        </>
                    }
                />

                <TableShell
                    headers={['Name', 'Email', 'Phone', 'Designation', 'Account', '']}
                    footer={<Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />}
                >
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
                                                <EntityAvatar label={c.firstName} index={i} />
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
                                            <DeleteIconButton onClick={e => remove(c.id, e)} />
                                        </td>
                                    </tr>
                                )
                            })}
                            {!loading && contacts.length === 0 && <EmptyTableRow colSpan={6} icon="groups" title="No contacts yet" />}
                        </tbody>
                </TableShell>
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
