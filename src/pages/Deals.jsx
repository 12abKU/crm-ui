import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LOST_DEAL_REASONS, T } from '../constants/theme'
import { usePipelineStages } from '../hooks/usePipelineStages'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import SearchableSelect from '../components/SearchableSelect'
import { Input, Select, Textarea } from '../components/FormField'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import CustomSelect from '../components/ui/CustomSelect'
import DealPanel from '../components/dealPanel/DealPanel'
import DealCard from '../components/deals/DealCard'
import LostDealReasonModal from '../components/deals/LostDealReasonModal'
import { usePermissions } from '../hooks/usePermission'
import api from '../api'

// ── Constants (unchanged) ──────────────────────────────────────
const EMPTY_FORM = { title: '', amount: '', stage: '', expectedCloseDate: '', accountId: '', contactId: '', pipelineId: '', lostReason: LOST_DEAL_REASONS[0], lostReasonNote: '' }

const STAGE_COLUMN_BG = {
    NEW:      'rgba(120,113,108,0.05)',
    QUALIFIED:T.primaryFaint,
    PROPOSAL: 'rgba(83,141,141,0.05)',
    WON:      'rgba(22,163,74,0.05)',
    LOST:     'rgba(220,38,38,0.04)',
}

const STAGE_HEADER_BG = {
    NEW:      'rgba(120,113,108,0.10)',
    QUALIFIED:T.primaryFaint,
    PROPOSAL: 'rgba(83,141,141,0.08)',
    WON:      'rgba(22,163,74,0.08)',
    LOST:     'rgba(220,38,38,0.07)',
}

const STAGE_COLUMN_BORDER = {
    NEW:      'rgba(120,113,108,0.22)',
    QUALIFIED:T.primaryDim,
    PROPOSAL: 'rgba(83,141,141,0.22)',
    WON:      'rgba(22,163,74,0.22)',
    LOST:     'rgba(220,38,38,0.18)',
}

export default function Deals() {
    const { getStageLabel, getStageStyle: getPipelineStageStyle } = usePipelineStages()
    const navigate = useNavigate()
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
    const [lostMove, setLostMove] = useState(null)
    const [savingLostMove, setSavingLostMove] = useState(false)
    const dragDeal = useRef(null)
    const highlightRef = useRef(null)

    // Pipeline states
    const [pipelines, setPipelines] = useState([])
    const [selectedPipelineId, setSelectedPipelineId] = useState(null)

    const userId = useSelector(state => state.auth.userId)
    const role = useSelector(state => state.auth.role)
    const can = usePermissions(['DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE', 'DEALS_ASSIGN'])
    const isAgent = role === 'AGENT'
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const location = useLocation()
    const highlightId = new URLSearchParams(location.search).get('highlight')

    const load = async (pipelineId) => {
        const url = pipelineId ? `/api/deals/all?pipelineId=${pipelineId}` : '/api/deals/all'
        const res = await api.get(url)
        const all = res.data ?? []
        setDeals(all.map(d => ({
            ...d,
            _assignedToMe: (d.assignees ?? []).some(u => String(u.id) === String(userId)),
            _isOwner: String(d.owner?.id) === String(userId),
        })))
    }

    useEffect(() => {
        api.get('/api/pipelines').then(r => {
            const data = r.data ?? []
            setPipelines(data)
            if (data.length > 0) {
                setSelectedPipelineId(data[0].id)
                load(data[0].id)
            } else {
                load()
            }
        })
        api.get('/api/accounts?page=0&size=100').then(r => setAccounts(r.data.content ?? []))
    }, [])

    useEffect(() => {
        if (!highlightId || !highlightRef.current) return
        const timer = setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
        return () => clearTimeout(timer)
    }, [highlightId, deals])

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const dealIdParam = queryParams.get('dealId')
        if (dealIdParam) {
            const found = deals.find(d => String(d.id) === String(dealIdParam))
            if (found) {
                setSelectedDeal(found)
            } else {
                setSelectedDeal({
                    id: parseInt(dealIdParam),
                    stage: 'NEW',
                    title: 'Loading Deal...'
                })
            }
        } else {
            setSelectedDeal(null)
        }
    }, [location.search, deals])

    const activePipeline = pipelines.find(p => p.id === selectedPipelineId)
    const activeStages = activePipeline ? activePipeline.stages : []

    const getStageStyle = (stageKey) => {
        return getPipelineStageStyle(stageKey)
    }
    const getStageColBg = (stageKey) => {
        const keyUpper = stageKey.toUpperCase()
        if (STAGE_COLUMN_BG[keyUpper]) return STAGE_COLUMN_BG[keyUpper]
        const style = getStageStyle(stageKey)
        return style.accent && style.accent.startsWith('#') ? `${style.accent}05` : 'rgba(234,88,12,0.02)'
    }
    const getStageHeaderBg = (stageKey) => {
        const keyUpper = stageKey.toUpperCase()
        if (STAGE_HEADER_BG[keyUpper]) return STAGE_HEADER_BG[keyUpper]
        const style = getStageStyle(stageKey)
        return style.accent && style.accent.startsWith('#') ? `${style.accent}0f` : 'rgba(234,88,12,0.05)'
    }
    const getStageColBorder = (stageKey) => {
        const keyUpper = stageKey.toUpperCase()
        if (STAGE_COLUMN_BORDER[keyUpper]) return STAGE_COLUMN_BORDER[keyUpper]
        const style = getStageStyle(stageKey)
        return style.accent && style.accent.startsWith('#') ? `${style.accent}33` : 'rgba(234,88,12,0.15)'
    }

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }))
    const setEvent = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
    
    const resetForm = () => { 
        setForm({
            title: '',
            amount: '',
            stage: activeStages[0]?.stageKey || 'NEW',
            expectedCloseDate: '',
            accountId: '',
            contactId: '',
            pipelineId: selectedPipelineId,
            lostReason: LOST_DEAL_REASONS[0],
            lostReasonNote: ''
        })
        setFilteredContacts([]) 
    }

    const openCreateForm = () => {
        setForm({
            title: '',
            amount: '',
            stage: activeStages[0]?.stageKey || 'NEW',
            expectedCloseDate: '',
            accountId: '',
            contactId: '',
            pipelineId: selectedPipelineId,
            lostReason: LOST_DEAL_REASONS[0],
            lostReasonNote: ''
        })
        setOpen(true)
    }

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
            pipelineId: form.pipelineId || selectedPipelineId,
            lostReason: form.stage === 'LOST' ? form.lostReason : null,
            lostReasonNote: form.stage === 'LOST' ? form.lostReasonNote || null : null,
        })
        setOpen(false)
        resetForm()
        load(selectedPipelineId)
    }

    const persistStageChange = async (deal, stage, lostData = {}) => {
        setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage, ...lostData } : d))
        try {
            const r = await api.put(`/api/deals/${deal.id}`, {
                title: deal.title,
                amount: deal.amount ?? null,
                stage,
                expectedCloseDate: deal.expectedCloseDate ?? null,
                accountId: deal.account?.id ?? null,
                contactId: deal.contact?.id ?? null,
                pipelineId: selectedPipelineId,
                lostReason: lostData.lostReason ?? deal.lostReason ?? null,
                lostReasonNote: lostData.lostReasonNote ?? deal.lostReasonNote ?? null,
            })
            setDeals(prev => prev.map(d => d.id === deal.id ? {
                ...r.data,
                _assignedToMe: (r.data.assignees ?? []).some(u => String(u.id) === String(userId)),
                _isOwner: String(r.data.owner?.id) === String(userId),
            } : d))
        } catch {
            load(selectedPipelineId)
        }
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

        setDraggingId(null); setOverStage(null); dragDeal.current = null

        if (stage?.toUpperCase() === 'LOST' && !deal.lostReason) {
            setLostMove({ deal, stage })
            return
        }

        await persistStageChange(deal, stage)
    }

    const q = search.toLowerCase()
    const filtered = deals.filter(d =>
        !q || d.title?.toLowerCase().includes(q) || d.account?.name?.toLowerCase().includes(q)
    )

    const subtitleText = isAgent
        ? `${deals.length} deal${deals.length !== 1 ? 's' : ''} assigned to you`
        : `${deals.length} deal${deals.length !== 1 ? 's' : ''} · ${activePipeline ? activePipeline.name : 'Kanban board'}`

    // ── Pipeline totals for summary strip
    const pipelineTotals = activeStages.map(stageObj => {
        const key = stageObj.stageKey;
        const style = getStageStyle(key);
        return {
            stage: key,
            label: stageObj.label,
            count: filtered.filter(d => d.stage === key).length,
            value: filtered.filter(d => d.stage === key).reduce((s, d) => s + (d.amount ?? 0), 0),
            style: style,
        }
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <TopBar />
            <main className="p-4 sm:p-8 flex-1 overflow-hidden flex flex-col">

                {/* ── Hero Banner ──────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 120,
                    }}>
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '40%', width: 140, height: 140,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-5 py-5 sm:px-9 sm:py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: T.sidebarActiveText }}>handshake</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    Deals
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                    {subtitleText}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
                            {pipelines.length > 0 && (
                                <div className="w-full sm:w-48 text-center shrink-0">
                                    <CustomSelect
                                        value={selectedPipelineId || ''}
                                        onChange={e => {
                                            const pid = Number(e.target.value)
                                            setSelectedPipelineId(pid)
                                            load(pid)
                                        }}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 outline-none cursor-pointer text-center"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            color: '#fff',
                                        }}>
                                        {pipelines.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </CustomSelect>
                                </div>
                            )}
                            <SearchInput value={search} onChange={setSearch} placeholder="Search deals..." />
                            {can.DEALS_CREATE && (
                                <button onClick={openCreateForm}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 w-full sm:w-auto shrink-0"
                                    style={{
                                        background: T.heroBadgeBg,
                                        border: '1px solid rgba(255,255,255,0.22)',
                                        color: '#fff',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                                    onMouseLeave={e => e.currentTarget.style.background = T.heroBadgeBg}>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    New Deal
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Pipeline summary strip ───────────────── */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {pipelineTotals.map(({ stage, label, count, value, style }) => (
                        <div key={stage}
                            className="flex-1 min-w-[140px] sm:min-w-[170px] rounded-2xl p-4 flex flex-col gap-1 transition-all duration-150"
                            style={{
                                background: T.surface,
                                border: `1.5px solid ${style.accent}30`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest truncate"
                                    style={{ color: style.accent }}>{label}</span>
                                <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                                    style={{ background: style.badgeBg, color: style.badgeColor }}>{count}</span>
                            </div>
                            <p className="text-base font-black" style={{ color: T.textPrimary }}>
                                {value > 0 ? `₹${Number(value).toLocaleString('en-IN')}` : '—'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Kanban board — scrollable columns ───── */}
                <div className="flex-1 flex gap-4 pb-4 overflow-x-auto min-h-0">
                    {activeStages.map(stageObj => {
                        const stage = stageObj.stageKey
                        const stageDeals = filtered.filter(d => d.stage === stage)
                        const style = getStageStyle(stage)
                        const totalValue = stageDeals.reduce((s, d) => s + (d.amount ?? 0), 0)
                        const isOver = overStage === stage
                        const colBg = getStageColBg(stage)
                        const colBorder = isOver ? style.accent : getStageColBorder(stage)

                        return (
                            <div key={stage}
                                className="flex flex-col shrink-0 w-[280px] md:w-auto md:flex-1"
                                style={{
                                    minWidth: 0,
                                    borderRadius: 16, overflow: 'hidden', height: '100%',
                                    background: colBg,
                                    border: `1.5px solid ${colBorder}`,
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
                                        background: getStageHeaderBg(stage),
                                        borderBottom: `2px solid ${style.accent}`,
                                    }}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ background: style.accent }} />
                                        <span className="text-[12px] font-black uppercase tracking-[0.12em] truncate"
                                            style={{ color: style.accent }}>
                                            {stageObj.label}
                                        </span>
                                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                                            style={{
                                                background: style.badgeBg,
                                                color: style.badgeColor,
                                                border: `1px solid ${style.accent}30`,
                                            }}>
                                            {stageDeals.length}
                                        </span>
                                    </div>
                                    {totalValue > 0 && (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ml-1"
                                            style={{ background: style.badgeBg, color: style.badgeColor }}>
                                            ₹{Number(totalValue).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>

                                {/* Cards area — scrolls vertically */}
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 12, minHeight: 0 }}>
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
                                                        load(selectedPipelineId)
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

            {/* Create Deal slide form */}
            <SlideForm open={open} onClose={() => { setOpen(false); resetForm() }} title="New Deal" onSubmit={submit}>
                <Input label="Deal Title *" value={form.title} onChange={setEvent('title')} required />
                <Input label="Amount (₹)" type="number" value={form.amount} onChange={setEvent('amount')} />
                
                {pipelines.length > 0 && (
                    <Select label="Pipeline *" value={form.pipelineId || ''} onChange={e => {
                        const pid = Number(e.target.value);
                        setField('pipelineId', pid);
                        // Reset stage to the first stage of the selected pipeline
                        const selectedPipe = pipelines.find(p => p.id === pid);
                        if (selectedPipe && selectedPipe.stages.length > 0) {
                            setField('stage', selectedPipe.stages[0].stageKey);
                        }
                    }} required>
                        {pipelines.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </Select>
                )}

                <Select label="Stage" value={form.stage} onChange={setEvent('stage')}>
                    {(pipelines.find(p => p.id === Number(form.pipelineId || selectedPipelineId))?.stages || []).map(s => (
                        <option key={s.stageKey} value={s.stageKey}>{s.label}</option>
                    ))}
                </Select>

                {form.stage === 'LOST' && (
                    <>
                        <Select label="Lost Reason *" value={form.lostReason} onChange={setEvent('lostReason')} required>
                            {LOST_DEAL_REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
                        </Select>
                        <Textarea label="Lost Reason Note" value={form.lostReasonNote}
                            onChange={setEvent('lostReasonNote')}
                            placeholder="Optional competitor, pricing issue, missing feature..." />
                    </>
                )}

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
                    initialTab={new URLSearchParams(location.search).get('tab')}
                    onClose={() => {
                        setSelectedDeal(null)
                        navigate(location.pathname, { replace: true })
                    }}
                    canEdit={can.DEALS_EDIT || (isAgent && (selectedDeal._isOwner || selectedDeal._assignedToMe))}
                    onDelete={can.DEALS_DELETE && (isAdminOrAbove || selectedDeal._isOwner) ? async (id) => {
                        await api.delete(`/api/deals/${id}`)
                        setSelectedDeal(null)
                        load(selectedPipelineId)
                        navigate(location.pathname, { replace: true })
                    } : undefined}
                />
            )}

            <LostDealReasonModal
                open={Boolean(lostMove)}
                deal={lostMove?.deal}
                saving={savingLostMove}
                onClose={() => setLostMove(null)}
                onConfirm={async (payload) => {
                    if (!lostMove) return
                    setSavingLostMove(true)
                    await persistStageChange(lostMove.deal, lostMove.stage, payload)
                    setSavingLostMove(false)
                    setLostMove(null)
                }}
            />
        </div>
    )
}
