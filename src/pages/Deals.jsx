import { useCallback, useEffect, useRef, useState } from 'react'
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
import api, { extractApiErrorMessage } from '../api'
import { profileCache, getCachePrefix } from '../utils/cacheUtils'

// ── Constants ──────────────────────────────────────────────────
const EMPTY_FORM = { title: '', amount: '', stage: '', expectedCloseDate: '', accountId: '', contactId: '', pipelineId: '', lostReason: LOST_DEAL_REASONS[0], lostReasonNote: '' }
const MAX_KANBAN_CARDS_PER_STAGE = 120
const DEALS_PER_PAGE = 30

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

    // ── Pagination and Column Cache State Maps ─────────────────
    const [dealsByStage, setDealsByStage] = useState({})
    const [pagesByStage, setPagesByStage] = useState({})
    const [totalPagesByStage, setTotalPagesByStage] = useState({})
    const [loadingByStage, setLoadingByStage] = useState({})
    const [stageTotalsByStage, setStageTotalsByStage] = useState({})

    const [accounts, setAccounts] = useState([])
    const [open, setOpen] = useState(false)
    const [selectedDeal, setSelectedDeal] = useState(null)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
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

    // Ref for holding abort controllers per stage key to prevent race conditions
    const abortControllersRef = useRef({})

    // ── Load Stage Deals ───────────────────────────────────────
    const loadStageDeals = async (stageKey, page, isAppend = false, currentSearch = '') => {
        // Abort previous in-flight request for this stage
        if (abortControllersRef.current[stageKey]) {
            abortControllersRef.current[stageKey].abort()
        }
        const controller = new AbortController()
        abortControllersRef.current[stageKey] = controller

        setLoadingByStage(prev => ({ ...prev, [stageKey]: true }))
        try {
            const params = new URLSearchParams({
                stage: stageKey,
                page: String(page),
                size: '30'
            })
            if (selectedPipelineId) params.set('pipelineId', String(selectedPipelineId))
            if (currentSearch.trim()) params.set('search', currentSearch.trim())

            const res = await api.get(`/api/deals/all?${params}`, {
                signal: controller.signal
            })
            
            const data = res.data ?? { content: [], totalPages: 0, stageTotalAmount: 0, stageTotalCount: 0 }
            const content = data.content ?? []
            const totalPages = data.totalPages ?? 0
            const stageTotalAmount = data.stageTotalAmount ?? 0
            const stageTotalCount = data.stageTotalCount ?? 0

            const processed = content.map(d => ({
                ...d,
                _assignedToMe: (d.assignees ?? []).some(u => String(u.id) === String(userId)),
                _isOwner: String(d.owner?.id) === String(userId),
            }))

            setDealsByStage(prev => {
                const merged = isAppend ? [...(prev[stageKey] || []), ...processed] : processed
                return {
                    ...prev,
                    [stageKey]: merged.slice(0, MAX_KANBAN_CARDS_PER_STAGE),
                }
            })
            setPagesByStage(prev => ({
                ...prev,
                [stageKey]: page
            }))
            setTotalPagesByStage(prev => ({
                ...prev,
                [stageKey]: totalPages
            }))
            setStageTotalsByStage(prev => ({
                ...prev,
                [stageKey]: { count: stageTotalCount, amount: stageTotalAmount }
            }))
        } catch (err) {
            if (err.name === 'CanceledError' || err.message === 'canceled') return
        } finally {
            if (abortControllersRef.current[stageKey] === controller) {
                setLoadingByStage(prev => ({ ...prev, [stageKey]: false }))
            }
        }
    }

    // Clean up AbortControllers on unmount
    useEffect(() => {
        return () => {
            Object.values(abortControllersRef.current).forEach(c => c.abort())
        }
    }, [])

    // Load initial pipelines
    useEffect(() => {
        api.get('/api/pipelines').then(r => {
            const data = r.data ?? []
            setPipelines(data)
            if (data.length > 0) {
                setSelectedPipelineId(data[0].id)
            }
        })
    }, [])

    const loadAccountOptions = useCallback(async (query = '') => {
        const params = new URLSearchParams({ page: '0', size: '10' })
        if (query.trim()) params.set('search', query.trim())
        const r = await api.get(`/api/accounts?${params}`)
        const nextAccounts = r.data.content ?? []
        setAccounts(nextAccounts)
        return nextAccounts.map(a => ({ id: a.id, label: a.name }))
    }, [])

    const activePipeline = pipelines.find(p => p.id === selectedPipelineId)
    const activeStages = activePipeline ? activePipeline.stages : []

    const loadAllStages = async (currentSearch = '', page = 0) => {
        if (activeStages.length === 0) return
        const stageKeys = activeStages.map(s => s.stageKey)
        Object.keys(abortControllersRef.current).forEach(key => {
            abortControllersRef.current[key]?.abort()
        })
        setLoadingByStage(prev => {
            const next = { ...prev }
            stageKeys.forEach(k => { next[k] = true })
            return next
        })
        try {
            const params = new URLSearchParams({ page: String(page), size: String(DEALS_PER_PAGE) })
            stageKeys.forEach(k => params.append('stages', k))
            if (selectedPipelineId) params.set('pipelineId', String(selectedPipelineId))
            if (currentSearch.trim()) params.set('search', currentSearch.trim())

            const res = await api.get(`/api/deals/board?${params}`)
            const stagesData = res.data?.stages ?? {}
            const nextDeals = {}
            const nextPages = {}
            const nextTotalPages = {}
            const nextTotals = {}

            stageKeys.forEach(stageKey => {
                const data = stagesData[stageKey.toUpperCase()] ?? stagesData[stageKey] ?? {}
                const content = (data.content ?? []).map(d => ({
                    ...d,
                    _assignedToMe: (d.assignees ?? []).some(u => String(u.id) === String(userId)),
                    _isOwner: String(d.owner?.id) === String(userId),
                }))
                nextDeals[stageKey] = content
                nextPages[stageKey] = page
                nextTotalPages[stageKey] = data.totalPages ?? 0
                nextTotals[stageKey] = { count: data.stageTotalCount ?? 0, amount: data.stageTotalAmount ?? 0 }
            })

            setDealsByStage(nextDeals)
            setPagesByStage(nextPages)
            setTotalPagesByStage(nextTotalPages)
            setStageTotalsByStage(nextTotals)
        } catch (err) {
            if (err.name === 'CanceledError' || err.message === 'canceled') return
            stageKeys.forEach(stageKey => loadStageDeals(stageKey, page, false, currentSearch))
        } finally {
            setLoadingByStage(prev => {
                const next = { ...prev }
                stageKeys.forEach(k => { next[k] = false })
                return next
            })
        }
    }

    // Trigger loading of stage columns with 350ms search query debounce (single board request)
    useEffect(() => {
        if (activeStages.length === 0) return
        const timer = setTimeout(() => loadAllStages(search, 0), 350)
        return () => clearTimeout(timer)
    }, [selectedPipelineId, search, activeStages.length])

    // Highlight deal scrolling
    useEffect(() => {
        if (!highlightId || !highlightRef.current) return
        const timer = setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
        return () => clearTimeout(timer)
    }, [highlightId, dealsByStage])

    // Monitor URL parameters for selected deal profiles
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const dealIdParam = queryParams.get('dealId')
        if (dealIdParam) {
            let found = null
            Object.values(dealsByStage).forEach(list => {
                const f = list.find(d => String(d.id) === String(dealIdParam))
                if (f) found = f
            })

            if (found) {
                setSelectedDeal(found)
            } else {
                // If the deal is not on page 0 in memory, pull directly from backend profile api
                api.get(`/api/deals/${dealIdParam}/profile`)
                    .then(r => {
                        if (r.data?.deal) {
                            setSelectedDeal({
                                ...r.data.deal,
                                _assignedToMe: (r.data.deal.assignees ?? []).some(u => String(u.id) === String(userId)),
                                _isOwner: String(r.data.deal.owner?.id) === String(userId)
                            })
                        }
                    })
                    .catch(() => {
                        setSelectedDeal({
                            id: parseInt(dealIdParam),
                            stage: 'NEW',
                            title: 'Loading Deal...'
                        })
                    })
            }
        } else {
            setSelectedDeal(null)
        }
    }, [location.search, dealsByStage])

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
        setErrors({})
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
        setErrors({})
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
        try {
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
            setErrors({})
            // Reload stage page 0
            loadStageDeals(form.stage, 0, false, search)
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            } else {
                setErrors({ general: extractApiErrorMessage(err) })
            }
        }
    }

    // ── Helper to scan and update cards in place ────────────────
    const updateDealInStage = (dealId, updatedDeal) => {
        const processed = {
            ...updatedDeal,
            _assignedToMe: (updatedDeal.assignees ?? []).some(u => String(u.id) === String(userId)),
            _isOwner: String(updatedDeal.owner?.id) === String(userId),
        }
        setDealsByStage(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(stg => {
                if (next[stg] && next[stg].some(d => d.id === dealId)) {
                    next[stg] = next[stg].map(d => d.id === dealId ? processed : d)
                }
            })
            return next
        })
    }

    // ── Unified persistStageChange with snapshotted optimistic recovery ──
    const persistStageChange = async (deal, targetStage, lostData = {}) => {
        const sourceStage = deal.stage
        if (sourceStage === targetStage) return

        // 1. Take snapshots
        const prevDealsByStage = { ...dealsByStage }
        const prevStageTotals = { ...stageTotalsByStage }

        const sourceList = dealsByStage[sourceStage] || []
        const dealToMove = sourceList.find(d => d.id === deal.id)
        if (!dealToMove) return

        const updatedDeal = { ...dealToMove, stage: targetStage, ...lostData }

        // Remove from source and prepend to target
        const newSourceList = sourceList.filter(d => d.id !== deal.id)
        const targetList = dealsByStage[targetStage] || []
        const newTargetList = [updatedDeal, ...targetList]

        // Update stage totals (count and amount sum)
        const amountDiff = deal.amount ?? 0
        const newStageTotals = { ...prevStageTotals }

        if (newStageTotals[sourceStage]) {
            newStageTotals[sourceStage] = {
                count: Math.max(0, newStageTotals[sourceStage].count - 1),
                amount: Math.max(0, newStageTotals[sourceStage].amount - amountDiff)
            }
        }
        if (newStageTotals[targetStage]) {
            newStageTotals[targetStage] = {
                count: newStageTotals[targetStage].count + 1,
                amount: newStageTotals[targetStage].amount + amountDiff
            }
        } else {
            newStageTotals[targetStage] = {
                count: 1,
                amount: amountDiff
            }
        }

        // Apply Optimistic Update
        setDealsByStage(prev => ({
            ...prev,
            [sourceStage]: newSourceList,
            [targetStage]: newTargetList
        }))
        setStageTotalsByStage(newStageTotals)

        try {
            profileCache.delete(`${getCachePrefix()}:${deal.id}`)
            const r = await api.put(`/api/deals/${deal.id}`, {
                title: deal.title,
                amount: deal.amount ?? null,
                stage: targetStage,
                expectedCloseDate: deal.expectedCloseDate ?? null,
                accountId: deal.account?.id ?? null,
                contactId: deal.contact?.id ?? null,
                pipelineId: selectedPipelineId,
                lostReason: lostData.lostReason ?? deal.lostReason ?? null,
                lostReasonNote: lostData.lostReasonNote ?? deal.lostReasonNote ?? null,
            })

            const savedDeal = {
                ...r.data,
                _assignedToMe: (r.data.assignees ?? []).some(u => String(u.id) === String(userId)),
                _isOwner: String(r.data.owner?.id) === String(userId),
            }

            // Sync targets
            setDealsByStage(prev => ({
                ...prev,
                [targetStage]: (prev[targetStage] || []).map(d => d.id === deal.id ? savedDeal : d)
            }))
        } catch {
            // Restore snapshot state on API error/reject
            setDealsByStage(prevDealsByStage)
            setStageTotalsByStage(prevStageTotals)
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

    // Sum total deals across the entire pipeline
    const totalPipelineDealsCount = Object.values(stageTotalsByStage).reduce((sum, stats) => sum + (stats?.count || 0), 0)

    const subtitleText = isAgent
        ? `${totalPipelineDealsCount} deal${totalPipelineDealsCount !== 1 ? 's' : ''} assigned to you`
        : `${totalPipelineDealsCount} deal${totalPipelineDealsCount !== 1 ? 's' : ''} · ${activePipeline ? activePipeline.name : 'Kanban board'}`

    // ── Pipeline totals for summary strip (uses server aggregates)
    const pipelineTotals = activeStages.map(stageObj => {
        const key = stageObj.stageKey
        const style = getStageStyle(key)
        const stats = stageTotalsByStage[key] || { count: 0, amount: 0 }
        return {
            stage: key,
            label: stageObj.label,
            count: stats.count,
            value: stats.amount,
            style: style,
        }
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <TopBar />
            <main className="p-4 sm:p-8 flex-1 overflow-hidden flex flex-col">

                {/* ── Hero Banner ──────────────────────────── */}
                <div className="relative rounded-3xl mb-7"
                    style={{
                        minHeight: 120,
                    }}>
                    
                    {/* Background layer that clips absolute orbs without clipping dropdown menus */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                        style={{
                            background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        }}>
                        <div style={{
                            position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${T.primaryHover}30 0%, transparent 70%)`,
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: -20, left: '40%', width: 140, height: 140,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)`,
                            pointerEvents: 'none',
                        }} />
                    </div>

                    <div className="relative z-10 px-5 py-5 sm:px-9 sm:py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
                        const stageDeals = dealsByStage[stage] || []
                        const style = getStageStyle(stage)
                        const stats = stageTotalsByStage[stage] || { count: 0, amount: 0 }
                        const totalValue = stats.amount
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
                                            {stats.count}
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
                                                    onAssigned={updated => updateDealInStage(deal.id, updated)}
                                                    onRemove={canDelete ? async () => {
                                                        profileCache.delete(`${getCachePrefix()}:${deal.id}`)
                                                        await api.delete(`/api/deals/${deal.id}`)
                                                        loadStageDeals(stage, 0, false, search)
                                                    } : undefined}
                                                />
                                            </div>
                                        )
                                    })}

                                    {/* Load More Button */}
                                    {pagesByStage[stage] < totalPagesByStage[stage] - 1
                                        && (stageDeals.length < MAX_KANBAN_CARDS_PER_STAGE) && (
                                        <button
                                            type="button"
                                            onClick={() => loadStageDeals(stage, (pagesByStage[stage] || 0) + 1, true, search)}
                                            disabled={loadingByStage[stage]}
                                            className="w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-dashed hover:border-solid mt-2 outline-none"
                                            style={{
                                                background: T.surface,
                                                borderColor: style.accent + '40',
                                                color: style.accent
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = style.badgeBg}
                                            onMouseLeave={e => e.currentTarget.style.background = T.surface}
                                        >
                                            {loadingByStage[stage] ? (
                                                <>
                                                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[15px]">expand_more</span>
                                                    Load More
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {stageDeals.length === 0 && !loadingByStage[stage] && (
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
                {errors.general && (
                    <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
                )}
                <Input label="Deal Title *" value={form.title} onChange={setEvent('title')} required error={errors.title} />
                <Input label="Amount (₹)" type="number" value={form.amount} onChange={setEvent('amount')} error={errors.amount} />
                
                {pipelines.length > 0 && (
                    <Select label="Pipeline *" value={form.pipelineId || ''} onChange={e => {
                        const pid = Number(e.target.value);
                        setField('pipelineId', pid);
                        // Reset stage to the first stage of the selected pipeline
                        const selectedPipe = pipelines.find(p => p.id === pid);
                        if (selectedPipe && selectedPipe.stages.length > 0) {
                            setField('stage', selectedPipe.stages[0].stageKey);
                        }
                    }} required error={errors.pipelineId || errors.pipeline}>
                        {pipelines.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </Select>
                )}

                <Select label="Stage" value={form.stage} onChange={setEvent('stage')} error={errors.stage}>
                    {(pipelines.find(p => p.id === Number(form.pipelineId || selectedPipelineId))?.stages || []).map(s => (
                        <option key={s.stageKey} value={s.stageKey}>{s.label}</option>
                    ))}
                </Select>

                {form.stage === 'LOST' && (
                    <>
                        <Select label="Lost Reason *" value={form.lostReason} onChange={setEvent('lostReason')} required error={errors.lostReason}>
                            {LOST_DEAL_REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
                        </Select>
                        <Textarea label="Lost Reason Note" value={form.lostReasonNote}
                            onChange={setEvent('lostReasonNote')}
                            placeholder="Optional competitor, pricing issue, missing feature..."
                            error={errors.lostReasonNote} />
                    </>
                )}

                <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={setEvent('expectedCloseDate')} error={errors.expectedCloseDate} />
                <SearchableSelect
                    label="Account"
                    value={form.accountId}
                    onChange={onAccountChange}
                    options={accounts.map(a => ({ id: a.id, label: a.name }))}
                    onSearch={loadAccountOptions}
                    placeholder="Search account..."
                    error={errors.accountId || errors.account}
                />
                <SearchableSelect
                    label="Contact"
                    value={form.contactId}
                    onChange={v => setField('contactId', v)}
                    options={filteredContacts}
                    placeholder={form.accountId ? (loadingContacts ? 'Loading...' : 'Select contact...') : 'Select account first'}
                    disabled={!form.accountId || loadingContacts}
                    error={errors.contactId || errors.contact}
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
                        profileCache.delete(`${getCachePrefix()}:${id}`)
                        await api.delete(`/api/deals/${id}`)
                        const deletedStage = selectedDeal.stage
                        setSelectedDeal(null)
                        loadStageDeals(deletedStage, 0, false, search)
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
