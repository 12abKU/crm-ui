import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, ROW_COLORS, SHADOW } from '../constants/theme'
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
import DuplicateModal from '../components/ui/DuplicateModal'
import usePaginatedSearch from '../hooks/usePaginatedSearch'
import { usePermissions } from '../hooks/usePermission'
import api, { extractApiErrorMessage } from '../api'
import Skeleton from 'react-loading-skeleton'

const PAGE_SIZE = 20

export default function Contacts() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', designation: '', accountId: '' })
    const [duplicates, setDuplicates] = useState([])
    const [checkingDuplicates, setCheckingDuplicates] = useState(false)
    const [showDuplicateModal, setShowDuplicateModal] = useState(false)

    // Import Contacts states
    const [importOpen, setImportOpen] = useState(false)
    const [importFile, setImportFile] = useState(null)
    const [importing, setImporting] = useState(false)
    const [importError, setImportError] = useState('')
    const [importResult, setImportResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)

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
    } = usePaginatedSearch({ pageSize: PAGE_SIZE, fetchPage: fetchContacts, cacheKey: 'contacts' })

    useEffect(() => {
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content || []))
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setCheckingDuplicates(true)
        try {
            const r = await api.post('/api/contacts/duplicates', form, { suppressErrorToast: true })
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
        await api.post('/api/contacts', { ...form, accountId: form.accountId || null })
        setOpen(false)
        setShowDuplicateModal(false)
        setDuplicates([])
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

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setImportFile(e.dataTransfer.files[0])
        }
    }

    const handleImportSubmit = async (e) => {
        e.preventDefault()
        if (!importFile) return
        setImporting(true)
        setImportError('')
        try {
            const formData = new FormData()
            formData.append('file', importFile)
            const r = await api.post('/api/contacts/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setImportResult(r.data)
        } catch (err) {
            setImportError(extractApiErrorMessage(err, 'Failed to import contacts'))
        } finally {
            setImporting(false)
        }
    }

    const downloadSampleCSV = () => {
        const csvContent = "First Name,Last Name,Email,Phone,Designation,Account Name\nJohn,Doe,john.doe@example.com,1234567890,Sales Manager,Acme Corp\nJane,Smith,jane.smith@example.com,9876543210,CEO,Globex LLC"
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "nexus_contacts_import_sample.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const headers = ['Name', 'Email', 'Phone', 'Designation', 'Account']
    if (can.CONTACTS_DELETE) headers.push('')

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* -- Hero Banner ------------------------------- */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
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
                    <div className="relative px-6 py-6 lg:px-9 lg:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
                                    {loading ? 'Loading...' : `${totalElements} people in your network`}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                            <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
                            {can.CONTACTS_CREATE && (
                                <>
                                    <button onClick={() => setImportOpen(true)}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 w-full sm:w-auto"
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.25)',
                                            color: '#fff',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span className="material-symbols-outlined text-[18px]">upload</span>
                                        Import
                                    </button>
                                    <button onClick={() => setOpen(true)}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 w-full sm:w-auto"
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
                                </>
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

            {/* -- Import Contacts Slide Form ----------------------------------- */}
            {can.CONTACTS_CREATE && importOpen && (
                <>
                    <div className="fixed inset-0 z-40 backdrop-blur-sm transition-all duration-300"
                        style={{ background: 'rgba(15,23,42,0.4)' }}
                        onClick={() => {
                            if (!importing) {
                                setImportOpen(false);
                                setImportResult(null);
                                setImportFile(null);
                                setImportError('');
                            }
                        }} />
                    <div className="fixed right-0 top-0 h-full w-full sm:w-[460px] z-50 flex flex-col transition-all duration-300"
                        style={{ background: T.surface, borderLeft: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-5"
                            style={{ borderBottom: `1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>upload</span>
                                <h2 className="text-base font-black tracking-tight" style={{ color: T.textPrimary }}>Import Contacts</h2>
                            </div>
                            <button onClick={() => {
                                setImportOpen(false);
                                setImportResult(null);
                                setImportFile(null);
                                setImportError('');
                            }}
                                disabled={importing}
                                className="material-symbols-outlined text-[20px] p-1.5 rounded-lg transition-colors"
                                style={{ color: T.textMuted }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                close
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
                            {importError && (
                                <div className="px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2"
                                    style={{ background: T.errorDim, color: T.error }}>
                                    <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                                    <span className="break-words">{importError}</span>
                                </div>
                            )}

                            {importResult ? (
                                /* Success Result Screen */
                                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                        style={{ background: T.successFaint, border: `2px solid ${T.success}` }}>
                                        <span className="material-symbols-outlined text-[36px]" style={{ color: T.success }}>check</span>
                                    </div>
                                    <h3 className="text-lg font-black mb-2" style={{ color: T.textPrimary }}>Import Complete!</h3>
                                    <p className="text-sm mb-6" style={{ color: T.textSecondary }}>We processed your file successfully.</p>

                                    {/* Stats Grid */}
                                    <div className="w-full grid grid-cols-3 gap-3 mb-8">
                                        <div className="p-4 rounded-2xl flex flex-col items-center justify-center"
                                            style={{ background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                                            <span className="text-[20px] font-black" style={{ color: T.textPrimary }}>{importResult.totalProcessed}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: T.textSecondary }}>Processed</span>
                                        </div>
                                        <div className="p-4 rounded-2xl flex flex-col items-center justify-center"
                                            style={{ background: T.successFaint, border: `1px solid ${T.success}30` }}>
                                            <span className="text-[20px] font-black" style={{ color: T.success }}>{importResult.imported}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: T.success }}>Imported</span>
                                        </div>
                                        <div className="p-4 rounded-2xl flex flex-col items-center justify-center"
                                            style={{ background: 'rgba(217,119,6,0.06)', border: `1px solid rgba(217,119,6,0.2)` }}>
                                            <span className="text-[20px] font-black" style={{ color: '#D97706' }}>{importResult.skippedDuplicates}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: '#D97706' }}>Skipped</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setImportOpen(false);
                                            setImportResult(null);
                                            setImportFile(null);
                                            setPage(0);
                                            loadPage(0, search);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-150"
                                        style={{ background: T.primary, color: '#fff' }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                        onMouseLeave={e => e.currentTarget.style.background = T.primary}>
                                        Done & Refresh
                                    </button>
                                </div>
                            ) : (
                                /* Upload Form Screen */
                                <div className="flex flex-col gap-6 flex-1">
                                    {/* Guidelines */}
                                    <div className="p-5 rounded-2xl flex flex-col gap-3 text-sm leading-relaxed"
                                        style={{ background: T.primaryFaint, border: `1px solid ${T.border}` }}>
                                        <div className="flex items-center gap-2 font-bold" style={{ color: T.textSecondary }}>
                                            <span className="material-symbols-outlined text-[18px]">info</span>
                                            CSV File Requirements
                                        </div>
                                        <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[13px]" style={{ color: T.textSecondary }}>
                                            <li>Headers must contain: <strong>First Name, Last Name, Email, Phone, Designation, Account Name</strong></li>
                                            <li>Only <strong>First Name</strong> is strictly required for each contact.</li>
                                            <li>Contacts are skipped if their email already exists under your company.</li>
                                            <li>If an account does not exist, it will be automatically created.</li>
                                        </ul>
                                        <button
                                            type="button"
                                            onClick={downloadSampleCSV}
                                            className="flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                                            style={{
                                                background: T.surface,
                                                border: `1px solid ${T.border}`,
                                                color: T.primaryText,
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                            onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                            Download Sample Template
                                        </button>
                                    </div>

                                    {/* Dropzone */}
                                    <div
                                        className="flex-1 min-h-[160px] max-h-[220px] rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all duration-150"
                                        style={{
                                            borderColor: dragActive ? T.primary : T.border,
                                            background: dragActive ? T.primaryFaint : 'transparent'
                                        }}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}>
                                        
                                        <input
                                            id="csv-file-upload"
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setImportFile(e.target.files[0]);
                                                }
                                            }}
                                        />

                                        {importFile ? (
                                            <div className="flex flex-col items-center text-center">
                                                <span className="material-symbols-outlined text-[40px] mb-2" style={{ color: T.primary }}>description</span>
                                                <p className="text-sm font-bold truncate max-w-[280px]" style={{ color: T.textPrimary }}>{importFile.name}</p>
                                                <p className="text-xs mt-1" style={{ color: T.textSecondary }}>{(importFile.size / 1024).toFixed(1)} KB</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setImportFile(null)}
                                                    className="mt-4 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                    style={{ background: T.errorDim, color: T.error }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                                                    Remove File
                                                </button>
                                            </div>
                                        ) : (
                                            <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center text-center">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: T.surfaceHigh }}>
                                                    <span className="material-symbols-outlined text-[24px]" style={{ color: T.primary }}>cloud_upload</span>
                                                </div>
                                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                                                    Drag and drop your CSV here, or <span style={{ color: T.primary }}>browse</span>
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: T.textMuted }}>Supports only .csv files</p>
                                            </label>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-auto pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImportOpen(false);
                                                setImportFile(null);
                                                setImportError('');
                                            }}
                                            disabled={importing}
                                            className="flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-colors border"
                                            style={{ background: T.surface, borderColor: T.border, color: T.textSecondary }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                            onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleImportSubmit}
                                            disabled={!importFile || importing}
                                            className="flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                            style={{
                                                background: !importFile ? T.surfaceHigh : T.primary,
                                                color: !importFile ? T.textMuted : '#fff',
                                                cursor: !importFile || importing ? 'not-allowed' : 'pointer'
                                            }}
                                            onMouseEnter={e => { if (importFile && !importing) e.currentTarget.style.background = T.primaryHover }}
                                            onMouseLeave={e => { if (importFile && !importing) e.currentTarget.style.background = T.primary }}>
                                            {importing ? (
                                                <>
                                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px]">upload</span>
                                                    Upload & Import
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
            {/* -- Duplicate Modal ----------------------------------- */}
            <DuplicateModal
                isOpen={showDuplicateModal}
                duplicates={duplicates}
                entityType="contact"
                onCancel={() => setShowDuplicateModal(false)}
                onSaveAnyway={executeSave}
                onViewExisting={(match) => {
                    setShowDuplicateModal(false)
                    setOpen(false)
                    setDuplicates([])
                    navigate(`/contacts/${match.id}`)
                }}
            />
        </div>
    )
}
