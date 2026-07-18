import { useEffect, useState } from 'react'
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
import VirtualTableBody, { virtualRowHandlers } from '../components/ui/VirtualTableBody'
import EmptyTableRow from '../components/ui/EmptyTableRow'
import DeleteIconButton from '../components/ui/DeleteIconButton'
import EntityAvatar from '../components/ui/EntityAvatar'
import DuplicateModal from '../components/ui/DuplicateModal'
import usePaginatedSearch from '../hooks/usePaginatedSearch'
import { usePermissions } from '../hooks/usePermission'
import api, { extractApiErrorMessage } from '../api'
import Skeleton from 'react-loading-skeleton'
import { useDialog } from '../contexts/DialogContext'

const PAGE_SIZE = 20

export default function Accounts() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({ name: '', website: '', phone: '', industry: '', employeeRange: '', tag: '' })
    const [customTag, setCustomTag] = useState(false)
    const [duplicates, setDuplicates] = useState([])
    const [checkingDuplicates, setCheckingDuplicates] = useState(false)
    const [showDuplicateModal, setShowDuplicateModal] = useState(false)
    const [errors, setErrors] = useState({})

    const handleOpenModal = () => {
        setEditingItem(null)
        setForm({ name: '', website: '', phone: '', industry: '', employeeRange: '', tag: '' })
        setErrors({})
        setCustomTag(false)
        setOpen(true)
    }

    const handleEdit = (account, e) => {
        e.stopPropagation()
        setEditingItem(account)
        setForm({
            name: account.name || '',
            website: account.website || '',
            phone: account.phone || '',
            industry: account.industry || '',
            employeeRange: account.employeeRange || '',
            tag: account.tag || ''
        })
        setErrors({})
        setCustomTag(false)
        setOpen(true)
    }

    const [tableHeight, setTableHeight] = useState(window.innerHeight - 380)

    useEffect(() => {
        const handleResize = () => {
            setTableHeight(Math.max(300, window.innerHeight - 380))
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const can = usePermissions(['ACCOUNTS_CREATE', 'ACCOUNTS_EDIT', 'ACCOUNTS_DELETE'])
    const { confirm } = useDialog()

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
        invalidateCacheForKey,
        updateItemInCache,
    } = usePaginatedSearch({ baseUrl: '/api/accounts', pageSize: PAGE_SIZE, cacheKey: 'accounts' })

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()

        const newErrors = {}
        if (!form.name) newErrors.name = 'Required'
        if (!form.website) newErrors.website = 'Required'
        if (!form.phone) newErrors.phone = 'Required'
        else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Must be exactly 10 digits'
        if (!form.industry) newErrors.industry = 'Required'
        if (!form.employeeRange) newErrors.employeeRange = 'Required'
        if (!form.tag) newErrors.tag = 'Required'
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setCheckingDuplicates(true)
        try {
            const r = await api.post('/api/accounts/duplicates', form, { suppressErrorToast: true })
            const matches = r.data ?? []
            if (matches.length > 0) {
                setDuplicates(matches)
                setShowDuplicateModal(true)
                return
            }
        } catch {
            // let it slide
        } finally {
            setCheckingDuplicates(false)
        }
        await executeSave()
    }

    const executeSave = async () => {
        try {
            if (editingItem) {
                await api.put(`/api/accounts/${editingItem.id}`, form)
                updateItemInCache(item => item.id === editingItem.id, item => ({ ...item, ...form }))
            } else {
                await api.post('/api/accounts', form)
                invalidateCacheForKey()
                setPage(0); loadPage(0, search)
            }
            setOpen(false)
            setShowDuplicateModal(false)
            setDuplicates([])
            setEditingItem(null)
            setForm({ name: '', website: '', phone: '', industry: '', employeeRange: '', tag: '' })
            setCustomTag(false)
            setErrors({})
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            } else {
                setErrors({ general: extractApiErrorMessage(err) })
            }
        }
    }

    const remove = async (id, e) => {
        e.stopPropagation()
        const isConfirmed = await confirm({
            title: 'Delete Account?',
            message: 'Are you sure you want to delete this account? This action cannot be undone.'
        });
        if (!isConfirmed) return;
        await api.delete(`/api/accounts/${id}`)
        const newTotal = totalElements - 1
        const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1)
        const targetPage = Math.min(page, maxPage)
        invalidateCacheForKey()
        setPage(targetPage); loadPage(targetPage, search)
    }

    const updateField = async (id, field, value) => {
        if (!can.ACCOUNTS_EDIT) return
        const a = accounts.find(x => x.id === id)
        await api.put(`/api/accounts/${id}`, {
            name: a.name, website: a.website, phone: a.phone,
            industry: a.industry, employeeRange: a.employeeRange, tag: a.tag, [field]: value
        })
        updateItemInCache(item => item.id === id, item => ({ ...item, [field]: value }))
    }

    const headers = ['Company', 'Phone', 'Industry', 'Tag', 'Open Deals', 'Actions']

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* -- Hero Banner ------------------------------- */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                    }}>
                    {/* Orbs */}
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
                    <div className="relative px-6 py-6 lg:px-9 lg:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: T.sidebarActiveText }}>business</span>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    Accounts
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                    {loading ? 'Loading...' : `Total Accounts - ${totalElements}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                            <SearchInput value={search} onChange={setSearch} placeholder="Search accounts..." />
                            {can.ACCOUNTS_CREATE && (
                                <button onClick={handleOpenModal}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 w-full sm:w-auto"
                                    style={{
                                        background: T.heroBadgeBg,
                                        border: '1px solid rgba(255,255,255,0.22)',
                                        color: '#fff',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                                    onMouseLeave={e => e.currentTarget.style.background = T.heroBadgeBg}>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* -- Table ------------------------------------- */}
                <TableShell
                    headers={headers}
                    colWidths={['25%', '13%', '18%', '14%', '15%', '15%']}
                    footer={<Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} onPage={goToPage} />}
                >
                    {loading ? (
                        <tbody>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton circle width={40} height={40} />
                                            <Skeleton height={14} width={120} borderRadius={6} />
                                        </div>
                                    </td>
                                    {[90, 80, 60, 80, 100].map((w, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <Skeleton height={14} width={w} borderRadius={6} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    ) : accounts.length === 0 ? (
                        <tbody>
                            <EmptyTableRow colSpan={headers.length} icon="business" title="No accounts yet" />
                        </tbody>
                    ) : (
                        <VirtualTableBody
                            items={accounts}
                            colSpan={headers.length}
                            rowHeight={80}
                            maxHeight={tableHeight}
                            renderRow={(a, i) => {
                            const tag = TAG_COLORS[a.tag] || { bg: T.surfaceRaised, color: T.textSecondary }
                            const rowBg = ROW_COLORS[i % ROW_COLORS.length]
                            const hover = virtualRowHandlers(rowBg)
                            const colWidths = ['25%', '13%', '18%', '14%', '15%', '15%']
                            return (
                                <tr key={a.id} className="group transition-all duration-150"
                                    style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: rowBg }}
                                    onMouseEnter={hover.onMouseEnter}
                                    onMouseLeave={hover.onMouseLeave}>

                                    {/* Company name + avatar */}
                                    <td className="px-6 py-4" style={{ width: colWidths[0] }}>
                                        <div className="flex items-center gap-3">
                                            <EntityAvatar label={a.name} rounded="xl" variant="primary" />
                                            <div>
                                                <span className="text-sm font-bold cursor-pointer hover:underline"
                                                    style={{ color: T.primaryText }}
                                                    onClick={() => navigate(`/accounts/${a.id}`)}>
                                                    {a.name}
                                                </span>
                                                {a.industry && (
                                                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{a.industry}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary, width: colWidths[1] }}>
                                        <InlineEdit value={a.phone} placeholder="Add" readonly={!can.ACCOUNTS_EDIT} onSave={v => updateField(a.id, 'phone', v)} />
                                    </td>

                                    {/* Industry */}
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary, width: colWidths[2] }}>
                                        <InlineEdit value={a.industry} placeholder="Add" readonly={!can.ACCOUNTS_EDIT} onSave={v => updateField(a.id, 'industry', v)} />
                                    </td>

                                    {/* Tag */}
                                    <td className="px-6 py-4" style={{ width: colWidths[3] }}>
                                        <InlineEdit value={a.tag} placeholder="Add" options={TAGS} readonly={!can.ACCOUNTS_EDIT} allowCustom={true} onSave={v => updateField(a.id, 'tag', v)}>
                                            {a.tag && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                                    style={{ background: tag.bg, color: tag.color }}>
                                                    {a.tag}
                                                </span>
                                            )}
                                        </InlineEdit>
                                    </td>

                                    {/* Open Deals */}
                                    <td className="px-6 py-4" style={{ width: colWidths[4] }}>
                                        <span className="text-sm font-bold block" style={{ color: T.primaryText }}>
                                            ₹{(a.openDealAmount ?? 0).toLocaleString()}
                                        </span>
                                        <p className="text-[11px]" style={{ color: T.textMuted }}>
                                            {a.openDealCount ?? 0} deals
                                        </p>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4" style={{ width: colWidths[5] }}>
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(`/accounts/${a.id}`)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                title="View">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                            {can.ACCOUNTS_EDIT && (
                                                <button onClick={(e) => handleEdit(a, e)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                                    title="Edit">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            )}
                                            {can.ACCOUNTS_DELETE && (
                                                <DeleteIconButton onClick={e => remove(a.id, e)} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        }}
                        />
                    )}
                </TableShell>
            </main>

            {/* -- Slide Form --------------------------------- */}
            {can.ACCOUNTS_CREATE && (
                <SlideForm title={editingItem ? "Edit Account" : "Add Account"} open={open} onClose={() => setOpen(false)} onSubmit={submit}>
                    {errors.general && (
                        <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
                    )}
                    <Input label="Company Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Tata Motors" required error={errors.name} />
                    <Input label="Website *" value={form.website} onChange={e => set('website', e.target.value)} placeholder="tatamotors.com" required error={errors.website} />
                    <Input label="Phone *" value={form.phone} onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        set('phone', val);
                    }} placeholder="9999999999" required error={errors.phone} />
                    <Input label="Industry *" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Technology" required error={errors.industry} />
                    <Select label="Employee Range *" value={form.employeeRange} onChange={e => set('employeeRange', e.target.value)} required error={errors.employeeRange}>
                        <option value="">Select range</option>
                        {EMPLOYEE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>

                    {customTag ? (
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Input label="Custom Tag *" value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="e.g. Partner" required error={errors.tag} />
                            </div>
                            <button type="button" onClick={() => { setCustomTag(false); set('tag', '') }} className="text-xs mb-3 font-semibold underline" style={{ color: T.primary }}>
                                Choose from list
                            </button>
                        </div>
                    ) : (
                        <Select label="Tag *" value={form.tag} onChange={e => {
                            if (e.target.value === '__custom__') {
                                setCustomTag(true)
                                set('tag', '')
                            } else {
                                set('tag', e.target.value)
                            }
                        }} error={errors.tag}>
                            <option value="">Select tag</option>
                            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                            <option value="__custom__">+ Add Custom Tag...</option>
                        </Select>
                    )}
                </SlideForm>
            )}
            {/* -- Duplicate Modal ----------------------------------- */}
            <DuplicateModal
                isOpen={showDuplicateModal}
                duplicates={duplicates}
                entityType="account"
                onCancel={() => setShowDuplicateModal(false)}
                onSaveAnyway={executeSave}
                onViewExisting={(match) => {
                    setShowDuplicateModal(false)
                    setOpen(false)
                    setDuplicates([])
                    navigate(`/accounts/${match.id}`)
                }}
            />
        </div>
    )
}
