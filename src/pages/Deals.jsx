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

const EMPTY_FORM = { title: '', amount: '', stage: 'NEW', expectedCloseDate: '', accountId: '', contactId: '' }

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

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')

    const load = async () => {
        // Centralized — all deals in one call
        const res = await api.get('/api/deals/all')
        const all = res.data ?? []
        // mark which deals are assigned to me (for agents)
        setDeals(all.map(d => ({
            ...d,
            _assignedToMe: d.assignedTo?.id === userId || d.assignedTo?.id === Number(userId)
                || d.owner?.id === userId || d.owner?.id === Number(userId),
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

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
    const resetForm = () => { setForm(EMPTY_FORM); setFilteredContacts([]) }

    const onAccountChange = async (accountId) => {
        setForm(f => ({ ...f, accountId, contactId: '' }))
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
            ...form,
            amount: parseFloat(form.amount) || 0,
            accountId: form.accountId || null,
            contactId: form.contactId || null,
        })
        setOpen(false)
        resetForm()
        load()
    }

    const remove = async (id) => {
        await api.delete(`/api/deals/${id}`)
        setSelectedDeal(null)
        load()
    }

    const onDragStart = (deal) => {
        // Agents can only drag deals assigned to them
        if (isAgent && !deal._assignedToMe) return
        dragDeal.current = deal
        setDraggingId(deal.id)
    }

    const onDropStage = async (e, stage) => {
        e.preventDefault()
        const deal = dragDeal.current
        setDraggingId(null)
        setOverStage(null)
        dragDeal.current = null
        if (!deal || deal.stage === stage) return
        // Double-check agent can only move assigned deals
        if (isAgent && !deal._assignedToMe) return

        setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage } : d))
        try {
            await api.put(`/api/deals/${deal.id}`, {
                title: deal.title,
                amount: deal.amount,
                stage,
                expectedCloseDate: deal.expectedCloseDate,
                accountId: deal.account?.id || null,
                contactId: deal.contact?.id || null,
            })
        } catch {
            setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: deal.stage } : d))
        }
    }

    const onDragEndCard = () => { setDraggingId(null); setOverStage(null); dragDeal.current = null }

    const q = search.trim().toLowerCase()
    const filteredDeals = q
        ? deals.filter(d => d.title.toLowerCase().includes(q) || (d.account?.name || '').toLowerCase().includes(q))
        : deals
    const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = filteredDeals.filter(deal => deal.stage === stage)
        return acc
    }, {})

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <TopBar />
            <main className="flex flex-col flex-1 min-h-0 px-8 pt-6 pb-0 max-w-360 mx-auto w-full">
                <PageHeader
                    title="Deals Pipeline"
                    subtitle={`${filteredDeals.length} deals${q ? ` matching "${search}"` : ''}`}
                    actions={
                        <>
                            <SearchInput value={search} onChange={setSearch} placeholder="Search deals..." />
                            {can.DEALS_CREATE && (
                                <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">add</span>Add Deal
                                </button>
                            )}
                        </>
                    }
                />

                <div className="kanban-scroll flex gap-4 overflow-x-auto overflow-y-hidden flex-1 min-h-0 pb-3"
                    style={{ scrollbarWidth: 'auto', scrollbarColor: '#475569 #C4B9AF' }}>
                    {STAGES.map(stage => {
                        const stageStyle = STAGE_STYLES[stage]
                        const stageDeals = grouped[stage] || []
                        const total = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
                        const isOver = overStage === stage

                        return (
                            <div key={stage} className="shrink-0 w-72 flex flex-col min-h-0"
                                onDragOver={e => e.preventDefault()}
                                onDragEnter={() => setOverStage(stage)}
                                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOverStage(null) }}
                                onDrop={e => onDropStage(e, stage)}>
                                <div className="rounded-t-2xl px-4 py-3 shrink-0"
                                    style={{ background: T.surface, border: `1px solid ${T.border}`, borderBottom: `2px solid ${stageStyle.accent}` }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: stageStyle.accent }} />
                                            <span className="text-sm font-bold" style={{ color: T.textPrimary }}>{STAGE_LABELS[stage]}</span>
                                        </div>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: stageStyle.badgeBg, color: stageStyle.badgeColor }}>
                                            {stageDeals.length}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-semibold" style={{ color: T.textMuted }}>₹{total.toLocaleString()}</p>
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto rounded-b-2xl border-x border-b p-3 space-y-3 transition-all"
                                    style={{
                                        borderColor: isOver ? stageStyle.accent : T.border,
                                        background: isOver ? T.primaryDim : T.bg,
                                        outline: isOver ? `2px dashed ${stageStyle.accent}` : 'none',
                                        outlineOffset: -2,
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: `${T.border} transparent`,
                                    }}>
                                    {stageDeals.map(deal => {
                                        const isHighlighted = String(deal.id) === highlightId
                                        // Agents can only drag deals assigned to them or owned by them
                                        const canDrag = !isAgent || deal._assignedToMe
                                        const canDelete = can.DEALS_DELETE && (!isAgent || deal._assignedToMe)
                                        return (
                                            <div key={deal.id} ref={isHighlighted ? highlightRef : null}>
                                                <DealCard
                                                    deal={deal}
                                                    isDragging={draggingId === deal.id}
                                                    highlighted={isHighlighted}
                                                    assignedToMe={deal._assignedToMe}
                                                    draggable={canDrag}
                                                    onDragStart={() => canDrag && onDragStart(deal)}
                                                    onDragEnd={onDragEndCard}
                                                    onRemove={canDelete ? () => remove(deal.id) : null}
                                                    onClick={() => setSelectedDeal(deal)}
                                                    onAssigned={(updated) => {
                                                        setDeals(prev => prev.map(d =>
                                                            d.id === updated.id
                                                                ? { ...d, assignedTo: updated.assignedTo }
                                                                : d
                                                        ))
                                                    }}
                                                    canAssign={can.DEALS_ASSIGN}
                                                />
                                            </div>
                                        )
                                    })}
                                    {stageDeals.length === 0 && !isOver && (
                                        <div className="flex flex-col items-center py-8 gap-2 pointer-events-none">
                                            <span className="material-symbols-outlined text-[24px]" style={{ color: T.border }}>drag_indicator</span>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>
                                                {isAgent ? 'No deals here' : 'Drop deals here'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {selectedDeal && (
                <DealPanel
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onDelete={can.DEALS_DELETE ? (id) => remove(id) : null}
                    canEdit={can.DEALS_EDIT}
                />
            )}

            {can.DEALS_CREATE && (
                <SlideForm title="Add Deal" open={open} onClose={() => { setOpen(false); resetForm() }} onSubmit={submit}>
                    <Input label="Deal Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Logistics Software Deal" required />
                    <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="500000" />
                    <Select label="Stage" value={form.stage} onChange={e => set('stage', e.target.value)}>
                        {STAGES.map(stage => <option key={stage} value={stage}>{STAGE_LABELS[stage]}</option>)}
                    </Select>
                    <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={e => set('expectedCloseDate', e.target.value)} />
                    <SearchableSelect label="Account" value={form.accountId} onChange={onAccountChange}
                        options={accounts.map(a => ({ id: a.id, label: a.name }))} placeholder="Select account" />
                    <SearchableSelect label="Contact" value={form.contactId} onChange={v => set('contactId', v)}
                        options={filteredContacts}
                        placeholder={form.accountId ? 'Select contact' : 'Select account first'}
                        disabled={!form.accountId} loading={loadingContacts} />
                </SlideForm>
            )}
        </div>
    )
}