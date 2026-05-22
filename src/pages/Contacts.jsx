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
import { usePermissions } from '../hooks/usePermission'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

const PAGE_SIZE = 20

export default function Contacts() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', designation: '', accountId: '' })

    const can = usePermissions(['CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE'])

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
        if (!can.CONTACTS_EDIT) return
        const c = contacts.find(x => x.id === id)
        await api.put(`/api/contacts/${id}`, {
            firstName: c.firstName, lastName: c.lastName, email: c.email,
            phone: c.phone, designation: c.designation, accountId: c.account?.id || null, [field]: value
        })
        setContacts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))
    }

    const headers = ['Name', 'Email', 'Phone', 'Designation', 'Account']
    if (can.CONTACTS_DELETE) headers.push('')

    return (
        <div>
            <TopBar />
            <main className="p-8">

                {/* -- Hero Banner ------------------------------- */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 120,
                    }}>
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '35%', width: 140, height: 140,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div className="relative px-9 py-7 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: T.sidebarActiveText }}>groups</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    Contacts
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                    {loading ? 'Loading�' : `${totalElements} people in your network`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
                            {can.CONTACTS_CREATE && (
                                <button onClick={() => setOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
                                    style={{
                                        background: T.heroBadgeBg,
                                        border: '1px solid rgba(255,255,255,0.22)',
                                        color: '#fff',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                                    onMouseLeave={e => e.currentTarget.style.background = T.heroBadgeBg}>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Contact
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* -- Table --------------------------------------- */}
                <TableShell
                    headers={headers}
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
                                <tr key={c.id} className="group transition-all duration-150"
                                    style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: rowBg }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = T.surfaceHigh
                                        e.currentTarget.style.transform = 'translateX(2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = rowBg
                                        e.currentTarget.style.transform = 'none'
                                    }}>

                                    {/* Name + Avatar */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <EntityAvatar label={c.firstName} index={i} />
                                            <div>
                                                <p className="text-sm font-bold cursor-pointer hover:underline"
                                                    style={{ color: T.primaryText }}
                                                    onClick={() => navigate(`/contacts/${c.id}`)}>
                                                    {c.firstName} {c.lastName}
                                                </p>
                                                {c.designation && (
                                                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                                                        {c.designation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                        <InlineEdit value={c.email} placeholder="Add" readonly={!can.CONTACTS_EDIT} onSave={v => updateField(c.id, 'email', v)} />
                                    </td>

                                    {/* Phone */}
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                        <InlineEdit value={c.phone} placeholder="Add" readonly={!can.CONTACTS_EDIT} onSave={v => updateField(c.id, 'phone', v)} />
                                    </td>

                                    {/* Designation */}
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                        <InlineEdit value={c.designation} placeholder="Add" readonly={!can.CONTACTS_EDIT} onSave={v => updateField(c.id, 'designation', v)} />
                                    </td>

                                    {/* Account badge */}
                                    <td className="px-6 py-4">
                                        {c.account && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                                                style={{ background: T.primaryFaint, color: T.primaryText, border: `1px solid ${T.primary}20` }}>
                                                <span className="material-symbols-outlined text-[11px]">business</span>
                                                {c.account.name}
                                            </span>
                                        )}
                                    </td>

                                    {/* Delete */}
                                    {can.CONTACTS_DELETE && (
                                        <td className="px-6 py-4">
                                            <DeleteIconButton onClick={e => remove(c.id, e)} />
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                        {!loading && contacts.length === 0 && (
                            <EmptyTableRow colSpan={headers.length} icon="groups" title="No contacts yet" />
                        )}
                    </tbody>
                </TableShell>
            </main>

            {/* -- Slide Form ----------------------------------- */}
            {can.CONTACTS_CREATE && (
                <SlideForm title="Add Contact" open={open} onClose={() => setOpen(false)} onSubmit={submit}>
                    <Input label="First Name *" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Ravi" required />
                    <Input label="Last Name" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Sharma" />
                    <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ravi@company.com" />
                    <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9999999999" />
                    <Input label="Designation" value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Manager" />
                    <SearchableSelect label="Account" value={form.accountId} onChange={v => set('accountId', v)}
                        options={accounts.map(a => ({ id: a.id, label: a.name }))} placeholder="Select account" />
                </SlideForm>
            )}
        </div>
    )
}
