import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T, STAGES, STAGE_LABELS, STAGE_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import SearchableSelect from '../components/SearchableSelect'
import { Input, Select } from '../components/FormField'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import DealPanel from '../components/dealPanel/DealPanel'
import DealCard from '../components/deals/DealCard'
import { usePermissions } from '../hooks/usePermission'
import api from '../api'

// ── Constants (unchanged) ──────────────────────────────────────
const EMPTY_FORM = { title: '', amount: '', stage: 'NEW', expectedCloseDate: '', accountId: '', contactId: '' }

const STAGE_COLUMN_BG = {
    NEW:      'rgba(120,113,108,0.05)',
    QUALIFIED:'rgba(37,99,235,0.05)',
    PROPOSAL: 'rgba(83,141,141,0.05)',
    WON:      'rgba(22,163,74,0.05)',
    LOST:     'rgba(220,38,38,0.04)',
}

const STAGE_HEADER_BG = {
    NEW:      'rgba(120,113,108,0.10)',
    QUALIFIED:'rgba(37,99,235,0.08)',
    PROPOSAL: 'rgba(83,141,141,0.08)',
    WON:      'rgba(22,163,74,0.08)',
    LOST:     'rgba(220,38,38,0.07)',
}

const STAGE_COLUMN_BORDER = {
    NEW:      'rgba(120,113,108,0.22)',
    QUALIFIED:'rgba(37,99,235,0.20)',
    PROPOSAL: 'rgba(83,141,141,0.22)',
    WON:      'rgba(22,163,74,0.22)',
    LOST:     'rgba(220,38,38,0.18)',
}

export default function Deals() {
    const [deals, setDeals] = useState([])
    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [selectedDeal, setSelectedDeal] = useState(null)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [filteredContacts, setFilteredContacts] = useState([])
    const [loadingContacts, setLoadingContacts] = useState(false)
    const [draggingId, setDraggingId] = useState(null)
    const [overStage, setOverStage] = useState(null)
    const dragDeal = useRef(null)
    const highlightRef = useRef(null)

    const userId = useSelector(state => state.auth.userId)
    const role = useSelector(state => state.auth.role)
    const can = usePermissions(['DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE', 'DEALS_ASSIGN'])
    const isAgent = role === 'AGENT'
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')

    const load = async () => {
        const res = await api.get('/api/deals/all')
        const all = res.data ?? []
        setDeals(all.map(d => ({
            ...d,
            _assignedToMe: (d.assignees ?? []).some(u => String(u.id) === String(userId)),
            _isOwner: String(d.owner?.id) === String(userId),
        })))
    }

    useEffect(() => {
        load()
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content ?? []))
    }, [])

    useEffect(() => {
        if (!highlightId || !highlightRef.current) return
        const timer = setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
        return () => clearTimeout(timer)
    }, [highlightId, deals])

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }))
    const setEvent = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
    const resetForm = () => { setForm(EMPTY_FORM); setFilteredContacts([]) }

    const onAccountChange = async (accountId) => {
        setField('accountId', accountId)
        setField('contactId', '')
        setFilteredContacts([])
        if (!accountId) return
        setLoadingContacts(true)
        try {
            const r = await api.get(`/api/accounts/${accountId}/profile`)
            setFilteredContacts((r.data.contacts ?? []).map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` })))
        } finally { setLoadingContacts(false) }
    }

    const submit = async (e) => {
        e.preventDefault()
        await api.post('/api/deals', {
            title: form.title,
            amount: form.amount ? parseFloat(form.amount) : null,
            stage: form.stage,
            expectedCloseDate: form.expectedCloseDate || null,
            accountId: form.accountId || null,
            contactId: form.contactId || null,
        })
        setOpen(false)
        resetForm()
        load()
    }

    const handleDrop = async (stage) => {
        if (!dragDeal.current || dragDeal.current.stage === stage) {
            setDraggingId(null); setOverStage(null); dragDeal.current = null; return
        }
        const deal = dragDeal.current

        if (isAgent && !can.DEALS_EDIT) {
            const isOwner = String(deal.owner?.id) === String(userId)
            const isAssignee = (deal.assignees ?? []).some(u => String(u.id) === String(userId))
            if (!isOwner && !isAssignee) {
                setDraggingId(null); setOverStage(null); dragDeal.current = null; return
            }
        }

        setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage } : d))
        setDraggingId(null); setOverStage(null); dragDeal.current = null

        try {
            await api.put(`/api/deals/${deal.id}`, {
                title: deal.title,
                amount: deal.amount ?? null,
                stage,
                expectedCloseDate: deal.expectedCloseDate ?? null,
                accountId: deal.account?.id ?? null,
                contactId: deal.contact?.id ?? null,
            })
        } catch {
            load()
        }
    }

    const q = search.toLowerCase()
    const filtered = deals.filter(d =>
        !q || d.title?.toLowerCase().includes(q) || d.account?.name?.toLowerCase().includes(q)
    )

    const subtitleText = isAgent
        ? `${deals.length} deal${deals.length !== 1 ? 's' : ''} assigned to you`
        : `${deals.length} deal${deals.length !== 1 ? 's' : ''} · Kanban board`

    // ── Pipeline totals for summary strip
    const pipelineTotals = STAGES.map(stage => ({
        stage,
        count: filtered.filter(d => d.stage === stage).length,
        value: filtered.filter(d => d.stage === stage).reduce((s, d) => s + (d.amount ?? 0), 0),
        style: STAGE_STYLES[stage],
    }))

    return (
        <div>
            <TopBar />
            <main className="p-8">

                {/* ── Hero Banner ──────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.sidebar} 0%, #1a3a6b 55%, #0d2d5e 100%)`,
                        minHeight: 120,
                    }}>
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '40%', width: 140, height: 140,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
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
                                    style={{ color: '#93C5FD' }}>handshake</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    Deals
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: 'rgba(147,197,253,0.80)' }}>
                                    {subtitleText}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <SearchInput value={search} onChange={setSearch} placeholder="Search deals..." />
                            {can.DEALS_CREATE && (
                                <button onClick={() => setOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
                                    style={{
                                        background: 'rgba(255,255,255,0.12)',
                                        border: '1px solid rgba(255,255,255,0.22)',
                                        color: '#fff',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    New Deal
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Pipeline summary strip ───────────────── */}
                <div className="grid grid-cols-5 gap-3 mb-6">
                    {pipelineTotals.map(({ stage, count, value, style }) => (
                        <div key={stage}
                            className="rounded-2xl p-4 flex flex-col gap-1 transition-all duration-150"
                            style={{
                                background: T.surface,
                                border: `1.5px solid ${style.accent}30`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: style.accent }}>{STAGE_LABELS[stage]}</span>
                                <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                                    style={{ background: style.badgeBg, color: style.badgeColor }}>{count}</span>
                            </div>
                            <p className="text-base font-black" style={{ color: T.textPrimary }}>
                                {value > 0 ? `₹${Number(value).toLocaleString('en-IN')}` : '—'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Kanban board ─────────────────────────── */}
                <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll items-start">
                    {STAGES.map(stage => {
                        const stageDeals = filtered.filter(d => d.stage === stage)
                        const style = STAGE_STYLES[stage]
                        const totalValue = stageDeals.reduce((s, d) => s + (d.amount ?? 0), 0)
                        const isOver = overStage === stage
                        const colBg = STAGE_COLUMN_BG[stage]
                        const colBorder = isOver ? style.accent : STAGE_COLUMN_BORDER[stage]

                        return (
                            <div key={stage}
                                className="shrink-0 w-71 flex flex-col rounded-2xl overflow-hidden"
                                style={{
                                    background: colBg,
                                    border: `1.5px solid ${colBorder}`,
                                    minHeight: 240,
                                    boxShadow: isOver
                                        ? `0 0 0 3px ${style.accent}22, 0 4px 20px rgba(0,0,0,0.10)`
                                        : '0 2px 10px rgba(0,0,0,0.05)',
                                    transition: 'border-color 0.15s, box-shadow 0.15s',
                                }}
                                onDragOver={e => { e.preventDefault(); setOverStage(stage) }}
                                onDragLeave={() => setOverStage(null)}
                                onDrop={() => handleDrop(stage)}>

                                {/* Column header */}
                                <div className="px-4 py-3.5 flex items-center justify-between"
                                    style={{
                                        background: STAGE_HEADER_BG[stage],
                                        borderBottom: `2px solid ${style.accent}`,
                                    }}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ background: style.accent }} />
                                        <span className="text-[12px] font-black uppercase tracking-[0.12em]"
                                            style={{ color: style.accent }}>
                                            {STAGE_LABELS[stage]}
                                        </span>
                                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                                            style={{
                                                background: style.badgeBg,
                                                color: style.badgeColor,
                                                border: `1px solid ${style.accent}30`,
                                            }}>
                                            {stageDeals.length}
                                        </span>
                                    </div>
                                    {totalValue > 0 && (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                            style={{ background: style.badgeBg, color: style.badgeColor }}>
                                            ₹{Number(totalValue).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>

                                {/* Cards area */}
                                <div className="flex flex-col gap-2.5 p-3 flex-1">
                                    {stageDeals.map(deal => {
                                        const isHighlighted = String(deal.id) === String(highlightId)
                                        const canDrag = isAdminOrAbove || can.DEALS_EDIT || deal._isOwner || deal._assignedToMe
                                        const canDelete = can.DEALS_DELETE && (isAdminOrAbove || deal._isOwner)

                                        return (
                                            <div key={deal.id} ref={isHighlighted ? highlightRef : null}>
                                                <DealCard
                                                    deal={deal}
                                                    stage={stage}
                                                    isDragging={draggingId === deal.id}
                                                    draggable={canDrag}
                                                    onDragStart={() => { setDraggingId(deal.id); dragDeal.current = deal }}
                                                    onDragEnd={() => { setDraggingId(null); setOverStage(null) }}
                                                    highlighted={isHighlighted}
                                                    assignedToMe={deal._assignedToMe}
                                                    canAssign={can.DEALS_ASSIGN}
                                                    onClick={() => setSelectedDeal(deal)}
                                                    onAssigned={updated => setDeals(prev => prev.map(d => d.id === updated.id
                                                        ? {
                                                            ...updated,
                                                            _assignedToMe: (updated.assignees ?? []).some(u => String(u.id) === String(userId)),
                                                            _isOwner: String(updated.owner?.id) === String(userId),
                                                        }
                                                        : d
                                                    ))}
                                                    onRemove={canDelete ? async () => {
                                                        await api.delete(`/api/deals/${deal.id}`)
                                                        load()
                                                    } : undefined}
                                                />
                                            </div>
                                        )
                                    })}

                                    {stageDeals.length === 0 && (
                                        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2 rounded-xl mx-0.5"
                                            style={{
                                                border: `2px dashed ${isOver ? style.accent : style.accent + '30'}`,
                                                background: isOver ? style.badgeBg : 'transparent',
                                                transition: 'all 0.15s',
                                            }}>
                                            <span className="material-symbols-outlined text-[24px]"
                                                style={{ color: isOver ? style.accent : style.accent + '50' }}>
                                                inbox
                                            </span>
                                            <p className="text-[11px] font-semibold"
                                                style={{ color: isOver ? style.accent : style.accent + '60' }}>
                                                {isOver ? 'Drop here' : 'No deals'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* Create Deal slide form (unchanged) */}
            <SlideForm open={open} onClose={() => { setOpen(false); resetForm() }} title="New Deal" onSubmit={submit}>
                <Input label="Deal Title *" value={form.title} onChange={setEvent('title')} required />
                <Input label="Amount (₹)" type="number" value={form.amount} onChange={setEvent('amount')} />
                <Select label="Stage" value={form.stage} onChange={setEvent('stage')}>
                    {STAGES.map(s => (<option key={s} value={s}>{STAGE_LABELS[s]}</option>))}
                </Select>
                <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={setEvent('expectedCloseDate')} />
                <SearchableSelect
                    label="Account"
                    value={form.accountId}
                    onChange={onAccountChange}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))}
                    placeholder="Select account..."
                />
                <SearchableSelect
                    label="Contact"
                    value={form.contactId}
                    onChange={v => setField('contactId', v)}
                    options={filteredContacts}
                    placeholder={form.accountId ? (loadingContacts ? 'Loading...' : 'Select contact...') : 'Select account first'}
                    disabled={!form.accountId || loadingContacts}
                />
            </SlideForm>

            {/* Deal panel (unchanged) */}
            {selectedDeal && (
                <DealPanel
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    canEdit={can.DEALS_EDIT || (isAgent && (selectedDeal._isOwner || selectedDeal._assignedToMe))}
                    onDelete={can.DEALS_DELETE && (isAdminOrAbove || selectedDeal._isOwner) ? async (id) => {
                        await api.delete(`/api/deals/${id}`)
                        setSelectedDeal(null)
                        load()
                    } : undefined}
                />
            )}
        </div>
    )
}