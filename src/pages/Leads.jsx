import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setLeadStages } from '../store/pipelineSlice'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import SlideForm from '../components/SlideForm'
import SearchableSelect from '../components/SearchableSelect'
import { Input, Select, Textarea } from '../components/FormField'
import SearchInput from '../components/ui/SearchInput'
import PageHeroBanner from '../components/ui/PageHeroBanner'
import api, { extractApiErrorMessage } from '../api'
import { usePermissions } from '../hooks/usePermission'
import LeadPanel from '../components/leadPanel/LeadPanel'
import AssignLeadModal from '../components/leadPanel/AssignLeadModal'
import { useDialog } from '../contexts/DialogContext'
import ConvertLeadModal from '../components/leadPanel/ConvertLeadModal'
import EditLeadSlideForm from '../components/leadPanel/EditLeadSlideForm'
import { IconUserPlus } from '@tabler/icons-react'
import DynamicFields from '../components/DynamicFields'
import { usePipelineStages } from '../hooks/usePipelineStages'

// ── Constants ──────────────────────────────────────────────────
const MAX_KANBAN_CARDS_PER_STAGE = 120
const LEADS_PER_PAGE = 30

const STAGE_STYLES = {
    NEW: { accent: '#78716C', badgeBg: 'rgba(120,113,108,0.12)', badgeColor: '#78716C' },
    CONTACTED: { accent: '#2563EB', badgeBg: 'rgba(37,99,235,0.10)', badgeColor: '#2563EB' },
    QUALIFIED: { accent: '#538D8D', badgeBg: 'rgba(83,141,141,0.12)', badgeColor: '#538D8D' },
    CONVERTED: { accent: '#16A34A', badgeBg: 'rgba(22,163,74,0.10)', badgeColor: '#16A34A' },
    LOST: { accent: '#DC2626', badgeBg: 'rgba(220,38,38,0.10)', badgeColor: '#DC2626' },
}

const STAGE_COLUMN_BG = {
    NEW: 'rgba(120,113,108,0.05)',
    CONTACTED: 'rgba(37,99,235,0.05)',
    QUALIFIED: 'rgba(83,141,141,0.05)',
    CONVERTED: 'rgba(22,163,74,0.05)',
    LOST: 'rgba(220,38,38,0.04)',
}

const STAGE_HEADER_BG = {
    NEW: 'rgba(120,113,108,0.10)',
    CONTACTED: 'rgba(37,99,235,0.08)',
    QUALIFIED: 'rgba(83,141,141,0.08)',
    CONVERTED: 'rgba(22,163,74,0.08)',
    LOST: 'rgba(220,38,38,0.07)',
}

const STAGE_COLUMN_BORDER = {
    NEW: 'rgba(120,113,108,0.22)',
    CONTACTED: 'rgba(37,99,235,0.22)',
    QUALIFIED: 'rgba(83,141,141,0.22)',
    CONVERTED: 'rgba(22,163,74,0.22)',
    LOST: 'rgba(220,38,38,0.18)',
}

const getStageStyle = (stageKey) => STAGE_STYLES[stageKey] || STAGE_STYLES.NEW
const getStageColBg = (stageKey) => STAGE_COLUMN_BG[stageKey] || 'rgba(234,88,12,0.02)'
const getStageHeaderBg = (stageKey) => STAGE_HEADER_BG[stageKey] || 'rgba(234,88,12,0.05)'
const getStageColBorder = (stageKey) => STAGE_COLUMN_BORDER[stageKey] || 'rgba(234,88,12,0.15)'

const EMPTY_FORM = { title: '', status: 'NEW', source: '', senderName: '', senderEmail: '', senderPhone: '', companyName: '', message: '' }

export default function Leads() {
    const { confirm, alert } = useDialog()
    const dispatch = useDispatch()
    const { stages: leadStages, getStageStyle } = usePipelineStages('LEAD')
    const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'list' 
    const navigate = useNavigate()
    const location = useLocation()
    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.user?.id)
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN'
    const isAgent = role === 'AGENT'
    const can = usePermissions(['LEADS_CREATE', 'LEADS_EDIT', 'LEADS_DELETE', 'LEADS_ASSIGN'])
    const canCreateLead = isAdminOrAbove || can.LEADS_CREATE

    const [leadsByStage, setLeadsByStage] = useState({})
    const [pagesByStage, setPagesByStage] = useState({})
    const [totalPagesByStage, setTotalPagesByStage] = useState({})
    const [loadingByStage, setLoadingByStage] = useState({})
    const [stageTotalsByStage, setStageTotalsByStage] = useState({})
    const [assignModalLead, setAssignModalLead] = useState(null)

    const [selectedLead, setSelectedLead] = useState(null)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [sources, setSources] = useState([])

    const [draggingId, setDraggingId] = useState(null)
    const [overStage, setOverStage] = useState(null)
    const [leadToConvert, setLeadToConvert] = useState(null)
    const [editModalLead, setEditModalLead] = useState(null)
    const dragLead = useRef(null)

    const abortControllersRef = useRef({})

    const loadStageLeads = async (stageKey, page, isAppend = false, currentSearch = '') => {
        if (abortControllersRef.current[stageKey]) {
            abortControllersRef.current[stageKey].abort()
        }
        const controller = new AbortController()
        abortControllersRef.current[stageKey] = controller

        setLoadingByStage(prev => ({ ...prev, [stageKey]: true }))
        try {
            const params = new URLSearchParams({
                status: stageKey,
                page: String(page),
                size: String(LEADS_PER_PAGE)
            })
            if (currentSearch.trim()) params.set('search', currentSearch.trim())

            const res = await api.get(`/api/leads?${params}`, {
                signal: controller.signal
            })

            const content = (res.data?.content ?? []).map(d => ({
                ...d,
                _assignedToMe: (d.assignees ?? []).some(u => String(u.id) === String(userId)),
                _isOwner: String(d.owner?.id) === String(userId),
            }))
            const totalPages = res.data?.totalPages ?? 0
            const totalElements = res.data?.totalElements ?? 0

            setLeadsByStage(prev => {
                const merged = isAppend ? [...(prev[stageKey] || []), ...content] : content
                return {
                    ...prev,
                    [stageKey]: merged.slice(0, MAX_KANBAN_CARDS_PER_STAGE),
                }
            })
            setPagesByStage(prev => ({ ...prev, [stageKey]: page }))
            setTotalPagesByStage(prev => ({ ...prev, [stageKey]: totalPages }))
            setStageTotalsByStage(prev => ({ ...prev, [stageKey]: { count: totalElements } }))
        } catch (err) {
            if (err.name === 'CanceledError' || err.message === 'canceled') return
        } finally {
            if (abortControllersRef.current[stageKey] === controller) {
                setLoadingByStage(prev => ({ ...prev, [stageKey]: false }))
            }
        }
    }

    useEffect(() => {
        return () => {
            Object.values(abortControllersRef.current).forEach(c => c.abort())
        }
    }, [])

    useEffect(() => {
        api.get('/api/pipelines?entityType=LEAD').then(r => {
            if (r.data && r.data.length > 0 && r.data[0].stages?.length > 0) {
                dispatch(setLeadStages(r.data[0].stages))
            }
        }).catch(() => {})
    }, [dispatch])

    const stagesKey = (leadStages || []).map(s => s.stageKey).join(',')

    const loadAllStages = useCallback(async (currentSearch = '', page = 0) => {
        if (!leadStages || leadStages.length === 0) return
        leadStages.forEach(stageObj => {
            loadStageLeads(stageObj.stageKey, page, false, currentSearch)
        })
    }, [leadStages])

    useEffect(() => {
        if (!leadStages || leadStages.length === 0) return
        const timer = setTimeout(() => loadAllStages(search, 0), 200)
        return () => clearTimeout(timer)
    }, [search, stagesKey, loadAllStages])




    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const leadIdParam = queryParams.get('leadId')
        if (leadIdParam) {
            let found = null
            Object.values(leadsByStage).forEach(list => {
                const f = list.find(d => String(d.id) === String(leadIdParam))
                if (f) found = f
            })

            if (found) {
                setSelectedLead(found)
            } else {
                api.get(`/api/leads/${leadIdParam}`)
                    .then(r => {
                        if (r.data) setSelectedLead(r.data)
                    })
                    .catch(() => {
                        setSelectedLead({ id: parseInt(leadIdParam), status: 'NEW', title: 'Loading Lead...' })
                    })
            }
        } else {
            setSelectedLead(null)
        }
    }, [location.search, leadsByStage])

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }))
    const setEvent = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const resetForm = () => {
        setForm({ ...EMPTY_FORM })
        setErrors({})
    }

    const openCreateForm = () => {
        setForm({ ...EMPTY_FORM })
        setErrors({})
        api.get('/api/leads/sources').then(res => setSources(res.data)).catch(() => { })
        setOpen(true)
    }

    const submit = async (e) => {
        e.preventDefault()

        const newErrors = {}
        if (!form.title) newErrors.title = 'Required'
        if (!form.source) newErrors.source = 'Required'
        if (!form.companyName) newErrors.companyName = 'Required'
        if (!form.senderName) newErrors.senderName = 'Required'
        if (!form.senderEmail) newErrors.senderEmail = 'Required'
        const phoneDigits = form.senderPhone ? form.senderPhone.replace(/\D/g, '') : ''
        if (!form.senderPhone) newErrors.senderPhone = 'Required'
        else if (phoneDigits.length < 10 || phoneDigits.length > 12) newErrors.senderPhone = 'Phone number must be digits only, between 10 and 12 digits'
        if (!form.status) newErrors.status = 'Required'
        if (!form.message) newErrors.message = 'Required'


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            await api.post('/api/leads', form)
            setOpen(false)
            resetForm()
            loadStageLeads(form.status, 0, false, search)
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            } else {
                setErrors({ general: extractApiErrorMessage(err) })
            }
        }
    }

    const persistStageChange = async (lead, targetStage) => {
        const sourceStage = lead.status
        if (sourceStage === targetStage) return

        const prevLeadsByStage = { ...leadsByStage }
        const prevStageTotals = { ...stageTotalsByStage }

        const sourceList = leadsByStage[sourceStage] || []
        const leadToMove = sourceList.find(d => d.id === lead.id)
        if (!leadToMove) return

        const updatedLead = { ...leadToMove, status: targetStage }

        const newSourceList = sourceList.filter(d => d.id !== lead.id)
        const targetList = leadsByStage[targetStage] || []
        const newTargetList = [updatedLead, ...targetList]

        const newStageTotals = { ...prevStageTotals }

        if (newStageTotals[sourceStage]) {
            newStageTotals[sourceStage] = {
                count: Math.max(0, newStageTotals[sourceStage].count - 1),
            }
        }
        if (newStageTotals[targetStage]) {
            newStageTotals[targetStage] = {
                count: newStageTotals[targetStage].count + 1,
            }
        } else {
            newStageTotals[targetStage] = {
                count: 1,
            }
        }

        setLeadsByStage(prev => ({
            ...prev,
            [sourceStage]: newSourceList,
            [targetStage]: newTargetList
        }))
        setStageTotalsByStage(newStageTotals)

        try {
            const r = await api.patch(`/api/leads/${lead.id}/status`, { status: targetStage })
            const savedLead = r.data

            setLeadsByStage(prev => ({
                ...prev,
                [targetStage]: (prev[targetStage] || []).map(d => d.id === lead.id ? savedLead : d)
            }))
        } catch {
            setLeadsByStage(prevLeadsByStage)
            setStageTotalsByStage(prevStageTotals)
        }
    }

    const handleDrop = async (stage) => {
        if (!dragLead.current || dragLead.current.status === stage) {
            setDraggingId(null); setOverStage(null); dragLead.current = null; return
        }
        const lead = dragLead.current
        setDraggingId(null); setOverStage(null); dragLead.current = null

        const canDrag = isAdminOrAbove || (can.LEADS_EDIT && (lead._isOwner || lead._assignedToMe))
        if (!canDrag) {
            alert({ title: 'Permission Denied', message: "You do not have permission to move this lead." })
            return
        }

        if (stage === 'CONVERTED') {
            setLeadToConvert(lead)
            return
        }

        await persistStageChange(lead, stage)
    }

    const removeLead = async (id, stage) => {
        const isConfirmed = await confirm({
            title: 'Delete Lead?',
            message: 'Are you sure you want to delete this lead? This action cannot be undone.',
            confirmText: 'Delete'
        })
        if (!isConfirmed) return

        try {
            await api.delete(`/api/leads/${id}`)
            loadStageLeads(stage, 0, false, search)
            if (selectedLead && selectedLead.id === id) {
                navigate(location.pathname)
                setSelectedLead(null)
            }
        } catch (err) {
            alert({ title: 'Delete Failed', message: "Failed to delete lead: " + extractApiErrorMessage(err) })
        }
    }

    const totalPipelineLeadsCount = Object.values(stageTotalsByStage).reduce((sum, stats) => sum + (stats?.count || 0), 0)

    const pipelineTotals = leadStages.map(stageObj => {
        const stage = stageObj.stageKey
        const count = stageTotalsByStage[stage]?.count || 0
        return { stage, label: stageObj.label, count, style: getStageStyle(stage) }
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <TopBar />
            <main className="p-4 sm:p-8 flex-1 overflow-hidden flex flex-col">

                {/* ── Ultra-Premium Hero Banner ──────────────────── */}
                <PageHeroBanner
                    icon="person_search"
                    title="Leads"
                    subtitle={`Total Leads — ${totalPipelineLeadsCount} active prospects in funnel`}
                    actions={
                        <>
                            <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
                            {canCreateLead && (
                                <button onClick={openCreateForm}
                                    className="crm-btn-primary whitespace-nowrap shrink-0 w-full sm:w-auto">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    New Lead
                                </button>
                            )}
                        </>
                    }
                />

                {/* ── Pipeline summary strip ───────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {pipelineTotals.map(({ stage, label, count, style }) => (
                        <div key={stage}
                            className="rounded-2xl p-4 flex flex-col justify-between gap-2 transition-all duration-200 border relative overflow-hidden group hover:scale-[1.01]"
                            style={{
                                background: T.surface,
                                borderColor: T.border,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            }}>
                            <div className="absolute inset-x-0 top-0 h-[2.5px]" style={{ background: style.accent }} />
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-black uppercase tracking-wider truncate"
                                    style={{ color: style.accent }}>{label}</span>
                                <span className="text-[10.5px] font-black px-2 py-0.5 rounded-full shrink-0"
                                    style={{ background: style.badgeBg, color: style.badgeColor, border: `1px solid ${style.accent}25` }}>
                                    {count}
                                </span>
                            </div>
                            <p className="text-base sm:text-lg font-black tracking-tight" style={{ color: T.textPrimary }}>
                                {count} {count === 1 ? 'Lead' : 'Leads'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Kanban board — scrollable columns ───── */}
                <div className="flex-1 flex gap-4 pb-4 overflow-x-auto min-h-0 kanban-scroll">
                    {leadStages.map(stageObj => {
                        const stage = stageObj.stageKey
                        const stageLeads = leadsByStage[stage] || []
                        const style = getStageStyle(stage)
                        const stats = stageTotalsByStage[stage] || { count: 0 }
                        const isOver = overStage === stage
                        const colBg = getStageColBg(stage)
                        const colBorder = isOver ? style.accent : getStageColBorder(stage)

                        return (
                            <div key={stage}
                                className="flex flex-col shrink-0 flex-1"
                                style={{
                                    minWidth: 300,
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
                                </div>

                                {/* Cards area — scrolls vertically */}
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 12, minHeight: 0 }}>
                                    {stageLeads.map(lead => {
                                        const canDrag = isAdminOrAbove || (can.LEADS_EDIT && (lead._isOwner || lead._assignedToMe))
                                        return (
                                            <div key={lead.id}
                                                draggable={canDrag}
                                                onDragStart={(e) => {
                                                    if (!canDrag) { e.preventDefault(); return; }
                                                    setDraggingId(lead.id);
                                                    dragLead.current = lead
                                                }}
                                                onDragEnd={() => { setDraggingId(null); setOverStage(null) }}
                                                className="p-4 rounded-2xl cursor-pointer group relative border transition-all duration-200"
                                                style={{
                                                    background: T.surface,
                                                    borderColor: draggingId === lead.id ? T.primary : T.border,
                                                    boxShadow: draggingId === lead.id
                                                        ? '0 14px 32px rgba(0,0,0,0.20)'
                                                        : '0 2px 8px rgba(0,0,0,0.03)',
                                                    opacity: draggingId === lead.id ? 0.45 : 1,
                                                    transform: 'none',
                                                    cursor: canDrag ? 'grab' : 'pointer'
                                                }}
                                                onMouseEnter={e => {
                                                    if (draggingId !== lead.id) {
                                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                                        e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.10)'
                                                        e.currentTarget.style.borderColor = `${style.accent}70`
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (draggingId !== lead.id) {
                                                        e.currentTarget.style.transform = 'none'
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'
                                                        e.currentTarget.style.borderColor = T.border
                                                    }
                                                }}
                                                onClick={() => {
                                                    navigate(`?leadId=${lead.id}`)
                                                    setSelectedLead(lead)
                                                }}>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h4 className="font-bold text-xs sm:text-[13.5px] max-w-[80%] truncate leading-snug" style={{ color: T.textPrimary }}>
                                                        {lead.title || lead.senderName || 'Unknown Lead'}
                                                    </h4>
                                                    <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0"
                                                        style={{
                                                            background: (lead.title?.toLowerCase().includes('demo request') || lead.customValues?.form_type === 'REQUEST_DEMO')
                                                                ? 'rgba(37,99,235,0.12)'
                                                                : (lead.title?.toLowerCase().includes('contact us') || lead.customValues?.form_type === 'CONTACT_US')
                                                                ? 'rgba(147,51,234,0.12)'
                                                                : T.primaryFaint,
                                                            color: (lead.title?.toLowerCase().includes('demo request') || lead.customValues?.form_type === 'REQUEST_DEMO')
                                                                ? '#2563EB'
                                                                : (lead.title?.toLowerCase().includes('contact us') || lead.customValues?.form_type === 'CONTACT_US')
                                                                ? '#9333EA'
                                                                : T.primaryText,
                                                            border: `1px solid ${
                                                                (lead.title?.toLowerCase().includes('demo request') || lead.customValues?.form_type === 'REQUEST_DEMO')
                                                                    ? 'rgba(37,99,235,0.25)'
                                                                    : (lead.title?.toLowerCase().includes('contact us') || lead.customValues?.form_type === 'CONTACT_US')
                                                                    ? 'rgba(147,51,234,0.25)'
                                                                    : T.primary + '25'
                                                            }`
                                                        }}>
                                                        {(lead.title?.toLowerCase().includes('demo request') || lead.customValues?.form_type === 'REQUEST_DEMO')
                                                            ? 'Demo Request'
                                                            : (lead.title?.toLowerCase().includes('contact us') || lead.customValues?.form_type === 'CONTACT_US')
                                                            ? 'Contact Us'
                                                            : lead.source}
                                                    </span>
                                                </div>
                                                {lead.senderEmail && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted mb-1 truncate" style={{ color: T.textSecondary }}>
                                                        <span className="material-symbols-outlined text-[13px] opacity-70 shrink-0">mail</span>
                                                        <span className="truncate">{lead.senderEmail}</span>
                                                    </div>
                                                )}
                                                {lead.senderPhone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted truncate" style={{ color: T.textSecondary }}>
                                                        <span className="material-symbols-outlined text-[13px] opacity-70 shrink-0">call</span>
                                                        <span className="truncate">{lead.senderPhone}</span>
                                                    </div>
                                                )}
                                                {lead._assignedToMe && (
                                                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full"
                                                        style={{ background: T.primary, boxShadow: `0 0 8px ${T.primary}` }}
                                                        title="Assigned to you" />
                                                )}

                                                <div className="flex items-center justify-between pt-2.5 mt-2 border-t"
                                                    style={{ borderColor: T.borderSubtle }}>

                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {(lead.assignees ?? []).length > 0 && (
                                                            <div className="flex -space-x-1.5 shrink-0">
                                                                {(lead.assignees ?? []).slice(0, 3).map((u, i) => (
                                                                    <div key={u.id}
                                                                        title={`Assignee: ${u.name}`}
                                                                        onClick={e => { e.stopPropagation(); navigate(`/team/${u.id}`) }}
                                                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-black shrink-0 ring-1 ring-white cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                                                                        style={{
                                                                            background: T.primaryDim,
                                                                            color: T.primary,
                                                                            zIndex: 3 - i,
                                                                        }}>
                                                                        {u.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                ))}
                                                                {(lead.assignees ?? []).length > 3 && (
                                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ring-1 ring-white"
                                                                        style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                                                        +{(lead.assignees ?? []).length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {isAdminOrAbove && (
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setAssignModalLead(lead) }}
                                                                className="flex items-center justify-center p-1 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors shrink-0 cursor-pointer"
                                                                title="Manage Assignees">
                                                                <IconUserPlus size={14} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {(isAdminOrAbove || can.LEADS_EDIT) && (
                                                            <button
                                                                className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditModalLead(lead);
                                                                }}
                                                                title="Edit Lead">
                                                                <span className="material-symbols-outlined text-[15px]">edit</span>
                                                            </button>
                                                        )}

                                                        {can.LEADS_DELETE && (isAdminOrAbove || lead._isOwner) && (
                                                            <button
                                                                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeLead(lead.id, stage);
                                                                }}
                                                                title="Delete Lead">
                                                                <span className="material-symbols-outlined text-[15px]">delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Load More Button */}
                                    {pagesByStage[stage] < totalPagesByStage[stage] - 1
                                        && (stageLeads.length < MAX_KANBAN_CARDS_PER_STAGE) && (
                                            <button
                                                type="button"
                                                onClick={() => loadStageLeads(stage, (pagesByStage[stage] || 0) + 1, true, search)}
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

                                    {stageLeads.length === 0 && !loadingByStage[stage] && (
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
                                                {isOver ? 'Drop here' : 'No leads'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* Create Lead slide form */}
            <SlideForm open={open} onClose={() => { setOpen(false); resetForm() }} title="New Lead" onSubmit={submit}>
                {errors.general && (
                    <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
                )}
                <Input label="Lead Title *" value={form.title} onChange={setEvent('title')} required error={errors.title} />

                <SearchableSelect
                    label="Source *"
                    value={form.source}
                    onChange={v => setField('source', v)}
                    placeholder="e.g. IndiaMart, Website, etc."
                    required
                    error={errors.source}
                    options={sources.map(s => ({ id: s, label: s }))}
                    creatable
                />

                <Input label="Company *" value={form.companyName} onChange={setEvent('companyName')} required error={errors.companyName} />
                <Input label="Contact Person *" value={form.senderName} onChange={setEvent('senderName')} required error={errors.senderName} />
                <Input label="Email *" type="email" value={form.senderEmail} onChange={setEvent('senderEmail')} required error={errors.senderEmail} />
                <Input label="Phone *" value={form.senderPhone} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setField('senderPhone', val);
                }} required error={errors.senderPhone} />

                <Select label="Status *" value={form.status} onChange={setEvent('status')} required>
                    {leadStages.map(s => <option key={s.stageKey} value={s.stageKey}>{s.label}</option>)}
                </Select>

                <Textarea label="Message/Notes *" value={form.message} onChange={setEvent('message')} required error={errors.message} />



                <div className="mt-6">
                    <DynamicFields 
                        entityType="LEAD" 
                        values={form.customValues || {}} 
                        onChange={(key, val) => setForm(f => ({ ...f, customValues: { ...(f.customValues || {}), [key]: val } }))} 
                    />
                </div>
            </SlideForm>

            {selectedLead && (
                <LeadPanel
                    lead={selectedLead}
                    canEdit={can.LEADS_EDIT || (isAgent && (selectedLead._isOwner || selectedLead._assignedToMe))}
                    onEdit={() => setEditModalLead(selectedLead)}
                    onClose={() => {
                        navigate(location.pathname)
                        setSelectedLead(null)
                    }}
                    onDelete={can.LEADS_DELETE && (isAdminOrAbove || selectedLead._isOwner) ? async (id) => {
                        const isConfirmed = await confirm({
                            title: 'Delete Lead?',
                            message: 'Are you sure you want to delete this lead? This action cannot be undone.',
                            confirmText: 'Delete'
                        })
                        if (!isConfirmed) return

                        await api.delete(`/api/leads/${id}`)
                        const deletedStage = selectedLead.status
                        setSelectedLead(null)
                        loadStageLeads(deletedStage, 0, false, search)
                    } : undefined}
                />
            )}

            {editModalLead && (
                <EditLeadSlideForm
                    open={!!editModalLead}
                    lead={editModalLead}
                    onClose={() => setEditModalLead(null)}
                    onSuccess={(updated) => {
                        loadStageLeads(updated.status || 'NEW', 0, false, search)
                        if (selectedLead && selectedLead.id === updated.id) {
                            setSelectedLead(updated)
                        }
                    }}
                />
            )}

            {assignModalLead && (
                <AssignLeadModal
                    profile={assignModalLead}
                    onClose={() => setAssignModalLead(null)}
                    onAssigned={() => {
                        setAssignModalLead(null)
                        // Reload the specific stage to reflect new assignees
                        loadStageLeads(assignModalLead.status, 0, false, search)
                    }}
                />
            )}



            {leadToConvert && (
                <ConvertLeadModal
                    lead={leadToConvert}
                    onClose={() => setLeadToConvert(null)}
                    onConverted={(newDeal) => {
                        setLeadToConvert(null)
                        if (newDeal && newDeal.id) {
                            navigate(`/deals?dealId=${newDeal.id}`)
                        } else {
                            loadStageLeads('CONVERTED', 0, false, search)
                        }
                    }}
                />
            )}
        </div>
    )
}
