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

        if (isAgent) {
            const isOwner = String(deal.owner?.id) === String(userId)
            const isAssignee = (deal.assignees ?? []).some(u => String(u.id) === String(userId))
            if (!isOwner && !isAssignee) {
                setDraggingId(null); setOverStage(null); dragDeal.current = null; return
            }
        }

        setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage } : d))
        setDraggingId(null); setOverStage(null); dragDeal.current = null
        try {
            await api.put(`/api/deals/${deal.id}`, { ...deal, stage, accountId: deal.account?.id, contactId: deal.contact?.id })
        } catch { load() }
    }

    const q = search.toLowerCase()
    const filtered = deals.filter(d =>
        !q || d.title?.toLowerCase().includes(q) || d.account?.name?.toLowerCase().includes(q)
    )

    const subtitleText = isAgent
        ? `${deals.length} deal${deals.length !== 1 ? 's' : ''} assigned to you`
        : `${deals.length} deal${deals.length !== 1 ? 's' : ''} · Kanban board`

    return (
        <div>
            <TopBar />
            <main className="p-8">
                <PageHeader
                    icon="handshake"
                    title="Deals"
                    subtitle={subtitleText}
                    actions={
                        <div className="flex gap-2 items-center">
                            <SearchInput value={search} onChange={setSearch} placeholder="Search deals..." />
                            {can.DEALS_CREATE && (
                                <button className="crm-btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
                                    <span className="material-symbols-outlined text-[16px]">add</span>New Deal
                                </button>
                            )}
                        </div>
                    }
                />

                {/* Kanban board */}
                <div className="flex gap-5 overflow-x-auto pb-4 kanban-scroll mt-6">
                    {STAGES.map(stage => {
                        const stageDeals = filtered.filter(d => d.stage === stage)
                        const style = STAGE_STYLES[stage]
                        const totalValue = stageDeals.reduce((s, d) => s + (d.amount ?? 0), 0)
                        const isOver = overStage === stage

                        return (
                            <div key={stage}
                                className="flex-shrink-0 w-72 flex flex-col rounded-2xl"
                                style={{ background: T.surfaceRaised, border: `1px solid ${isOver ? style.accent : T.border}`, minHeight: 200, transition: 'border-color 0.15s' }}
                                onDragOver={e => { e.preventDefault(); setOverStage(stage) }}
                                onDragLeave={() => setOverStage(null)}
                                onDrop={() => handleDrop(stage)}>

                                {/* Column header */}
                                <div className="px-4 pt-4 pb-3 flex items-center justify-between"
                                    style={{ borderBottom: `2px solid ${style.accent}` }}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: style.accent }}>
                                            {STAGE_LABELS[stage]}
                                        </span>
                                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: style.badgeBg, color: style.badgeColor }}>
                                            {stageDeals.length}
                                        </span>
                                    </div>
                                    {totalValue > 0 && (
                                        <span className="text-[11px] font-semibold" style={{ color: T.textMuted }}>
                                            ₹{Number(totalValue).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>

                                {/* Cards */}
                                <div className="flex flex-col gap-3 p-3 flex-1">
                                    {stageDeals.map(deal => {
                                        const isHighlighted = String(deal.id) === String(highlightId)

                                        // Drag: admins always, agents only on their own/assigned deals
                                        const canDrag = isAdminOrAbove || can.DEALS_EDIT ||
                                            deal._isOwner ||
                                            deal._assignedToMe

                                        // Delete: admin needs DEALS_DELETE perm;
                                        // agent needs DEALS_DELETE perm AND must be the owner (creator)
                                        const canDelete = can.DEALS_DELETE && (isAdminOrAbove || deal._isOwner)

                                        return (
                                            <div key={deal.id} ref={isHighlighted ? highlightRef : null}>
                                                <DealCard
                                                    deal={deal}
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
                                        <div className="flex-1 flex items-center justify-center py-8">
                                            <p className="text-[12px]" style={{ color: T.textMuted }}>No deals</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* Create Deal slide form */}
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

            {/* Deal panel */}
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