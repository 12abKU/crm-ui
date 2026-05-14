import { useEffect, useState, useRef } from 'react'
import { T, STAGES, STAGE_LABELS, STAGE_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import SearchableSelect from '../components/SearchableSelect'
import { Input, Select } from '../components/FormField'
import api from '../api'
import { useLocation } from 'react-router-dom'
import DealPanel from '../components/dealPanel/DealPanel'

// ── Deal Card ────────────────────────────────────────────────
function DealCard({ deal, isDragging, onDragStart, onDragEnd, onRemove, highlighted, onClick }) {
    const [blink, setBlink] = useState(false)
    const wasDragging = useRef(false)

    useEffect(() => {
        if (!highlighted) return
        const t = setTimeout(() => {
            setBlink(true)
            setTimeout(() => {
                setBlink(false)
                setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 500) }, 500)
            }, 500)
        }, 300)
        return () => clearTimeout(t)
    }, [highlighted])

    return (
        <div
            draggable
            onDragStart={() => { wasDragging.current = true; onDragStart() }}
            onDragEnd={() => { onDragEnd(); setTimeout(() => { wasDragging.current = false }, 50) }}
            onClick={() => { if (!wasDragging.current) onClick() }}
            className="rounded-xl p-4 cursor-pointer active:cursor-grabbing group select-none"
            style={{
                background: blink ? 'rgba(37,99,235,0.28)' : T.surface,
                border: isDragging ? `1px solid ${T.primary}` : `1px solid ${T.border}`,
                boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                opacity: isDragging ? 0.5 : 1,
                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            }}>
            <div className="flex items-start justify-between gap-2">
                {/* FIX 1: title — larger + bolder */}
                <p className="text-[15px] font-bold leading-snug" style={{ color: T.textPrimary }}>{deal.title}</p>
                <button
                    onClick={e => { e.stopPropagation(); onRemove() }}
                    className="material-symbols-outlined text-[15px] opacity-0 group-hover:opacity-100 p-1 rounded flex-shrink-0"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                    delete
                </button>
            </div>
            {deal.amount > 0 && (
                /* FIX 1: amount — larger font */
                <p className="text-[17px] font-black mt-2" style={{ color: T.primaryText }}>
                    ₹{deal.amount.toLocaleString()}
                </p>
            )}
            {deal.account && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>business</span>
                    {/* FIX 1: meta text — larger + darker */}
                    <p className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{deal.account.name}</p>
                </div>
            )}
            {deal.contact && (
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>person</span>
                    <p className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{deal.contact.firstName} {deal.contact.lastName}</p>
                </div>
            )}
            {deal.expectedCloseDate && (
                <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>schedule</span>
                    <p className="text-[13px] font-medium" style={{ color: T.textSecondary }}>Closes {deal.expectedCloseDate}</p>
                </div>
            )}
            <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                <span className="material-symbols-outlined text-[13px]" style={{ color: T.primary }}>open_in_new</span>
                <p className="text-[12px] font-medium" style={{ color: T.primary }}>Click to view details</p>
            </div>
        </div>
    )
}

// ── Main Page ────────────────────────────────────────────────
export default function Deals() {
    const [deals, setDeals] = useState([])
    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [selectedDeal, setSelectedDeal] = useState(null)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState({ title: '', amount: '', stage: 'NEW', expectedCloseDate: '', accountId: '', contactId: '' })
    const [filteredContacts, setFilteredContacts] = useState([])
    const [loadingContacts, setLoadingContacts] = useState(false)
    const [draggingId, setDraggingId] = useState(null)
    const [overStage, setOverStage] = useState(null)
    const dragDeal = useRef(null)
    const highlightRef = useRef(null)

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')

    const load = () => api.get('/api/deals/all').then(r => setDeals(r.data))

    useEffect(() => {
        load()
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content ?? []))
    }, [])

    useEffect(() => {
        if (!highlightId || !highlightRef.current) return
        const t = setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
        return () => clearTimeout(t)
    }, [highlightId, deals])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
        await api.post('/api/deals', { ...form, amount: parseFloat(form.amount) || 0, accountId: form.accountId || null, contactId: form.contactId || null })
        setOpen(false)
        setForm({ title: '', amount: '', stage: 'NEW', expectedCloseDate: '', accountId: '', contactId: '' })
        setFilteredContacts([])
        load()
    }

    const remove = async (id) => {
        await api.delete(`/api/deals/${id}`)
        setSelectedDeal(null)
        load()
    }

    const onDragStart = (deal) => { dragDeal.current = deal; setDraggingId(deal.id) }

    const onDropStage = async (e, stage) => {
        e.preventDefault()
        const deal = dragDeal.current
        setDraggingId(null); setOverStage(null); dragDeal.current = null
        if (!deal || deal.stage === stage) return
        setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage } : d))
        try {
            await api.put(`/api/deals/${deal.id}`, {
                title: deal.title, amount: deal.amount, stage,
                expectedCloseDate: deal.expectedCloseDate,
                accountId: deal.account?.id || null,
                contactId: deal.contact?.id || null
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
    const grouped = STAGES.reduce((acc, s) => { acc[s] = filteredDeals.filter(d => d.stage === s); return acc }, {})

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <TopBar />
            {/* FIX 2: main fills remaining height so the kanban never overflows the page */}
            <main className="flex flex-col flex-1 min-h-0 px-8 pt-6 pb-0 max-w-[1440px] mx-auto w-full">
                <div className="flex items-center justify-between mb-5 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>Deals Pipeline</h2>
                        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                            {filteredDeals.length} deals{q ? ` matching "${search}"` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                            style={{ background: T.surface, border: `1px solid ${T.border}`, minWidth: 280 }}>
                            <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>search</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search deals..." className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: T.textPrimary }} />
                            {search && (
                                <span onClick={() => setSearch('')}
                                    className="material-symbols-outlined text-[16px] cursor-pointer"
                                    style={{ color: T.textMuted }}>close</span>
                            )}
                        </div>
                        <button onClick={() => setOpen(true)} className="crm-btn-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>Add Deal
                        </button>
                    </div>
                </div>

                {/* FIX 2: This wrapper fills remaining height, scrolls horizontally,
                    and each column scrolls vertically independently.
                    The horizontal scrollbar is always visible at the bottom of THIS div,
                    not at the bottom of the entire page. */}
                <div className="kanban-scroll flex gap-4 overflow-x-auto overflow-y-hidden flex-1 min-h-0 pb-3"
                    style={{
                        scrollbarWidth: 'auto',
                        scrollbarColor: '#475569 #C4B9AF',
                    }}>
                    {STAGES.map(stage => {
                        const s = STAGE_STYLES[stage]
                        const stageDeals = grouped[stage] || []
                        const total = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0)
                        const isOver = overStage === stage
                        return (
                            <div key={stage} className="flex-shrink-0 w-72 flex flex-col min-h-0"
                                onDragOver={e => e.preventDefault()}
                                onDragEnter={() => setOverStage(stage)}
                                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOverStage(null) }}
                                onDrop={e => onDropStage(e, stage)}>

                                {/* Column header — sticky, never scrolls away */}
                                <div className="rounded-t-2xl px-4 py-3 flex-shrink-0"
                                    style={{ background: T.surface, border: `1px solid ${T.border}`, borderBottom: `2px solid ${s.accent}` }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: s.accent }} />
                                            <span className="text-sm font-bold" style={{ color: T.textPrimary }}>{STAGE_LABELS[stage]}</span>
                                        </div>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: s.badgeBg, color: s.badgeColor }}>
                                            {stageDeals.length}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-semibold" style={{ color: T.textMuted }}>₹{total.toLocaleString()}</p>
                                </div>

                                {/* FIX 2: Each column body scrolls vertically on its own */}
                                <div className="flex-1 min-h-0 overflow-y-auto rounded-b-2xl border-x border-b p-3 space-y-3 transition-all"
                                    style={{
                                        borderColor: isOver ? s.accent : T.border,
                                        background: isOver ? T.primaryDim : T.bg,
                                        outline: isOver ? `2px dashed ${s.accent}` : 'none',
                                        outlineOffset: -2,
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: `${T.border} transparent`,
                                    }}>
                                    {stageDeals.map(deal => {
                                        const isHighlighted = String(deal.id) === highlightId
                                        return (
                                            <div key={deal.id} ref={isHighlighted ? highlightRef : null}>
                                                <DealCard
                                                    deal={deal}
                                                    isDragging={draggingId === deal.id}
                                                    highlighted={isHighlighted}
                                                    onDragStart={() => onDragStart(deal)}
                                                    onDragEnd={onDragEndCard}
                                                    onRemove={() => remove(deal.id)}
                                                    onClick={() => setSelectedDeal(deal)}
                                                />
                                            </div>
                                        )
                                    })}
                                    {stageDeals.length === 0 && !isOver && (
                                        <div className="flex flex-col items-center py-8 gap-2 pointer-events-none">
                                            <span className="material-symbols-outlined text-[24px]" style={{ color: T.border }}>drag_indicator</span>
                                            <p className="text-[11px]" style={{ color: T.textMuted }}>Drop deals here</p>
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
                    onDelete={(id) => remove(id)}
                />
            )}

            <SlideForm title="Add Deal" open={open}
                onClose={() => {
                    setOpen(false)
                    setFilteredContacts([])
                    setForm({ title: '', amount: '', stage: 'NEW', expectedCloseDate: '', accountId: '', contactId: '' })
                }}
                onSubmit={submit}>
                <Input label="Deal Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Logistics Software Deal" required />
                <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="500000" />
                <Select label="Stage" value={form.stage} onChange={e => set('stage', e.target.value)}>
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </Select>
                <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={e => set('expectedCloseDate', e.target.value)} />
                <SearchableSelect label="Account" value={form.accountId} onChange={onAccountChange}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))} placeholder="Select account" />
                <SearchableSelect label="Contact" value={form.contactId} onChange={v => set('contactId', v)}
                    options={filteredContacts}
                    placeholder={form.accountId ? 'Select contact' : 'Select account first'}
                    disabled={!form.accountId} loading={loadingContacts} />
            </SlideForm>
        </div>
    )
}