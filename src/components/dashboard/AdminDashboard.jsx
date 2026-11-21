import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import TopBar from '../TopBar'
import PageHeroBanner from '../ui/PageHeroBanner'
import { TabSkeleton } from './DashboardWidgets'
import { DASHBOARD_ACCENTS, luxeShadow } from './dashboardDesign'
import SummaryTab from './tabs/SummaryTab'
import DealsTab from './tabs/DealsTab'
import ContactsTab from './tabs/ContactsTab'
import ActivitiesTab from './tabs/ActivitiesTab'
import RevenueTab from './tabs/RevenueTab'
import BottlenecksTab from './tabs/BottlenecksTab'
import api from '../../api'
import DownloadReport from '../Downloadreport'
import { listCache, listCacheSet, isFresh, LIST_TTL, getCachePrefix } from '../../utils/cacheUtils'
import CustomSelect from '../ui/CustomSelect'
import usePermission from '../../hooks/usePermission'

// ── Tabs definition ──────────────────
const TABS = [
    { key: 'summary', label: 'Summary', icon: 'dashboard' },
    { key: 'deals', label: 'Deals', icon: 'handshake' },
    { key: 'bottlenecks', label: 'Bottlenecks', icon: 'hourglass_empty' },
    { key: 'contacts', label: 'Contacts', icon: 'groups' },
    { key: 'activities', label: 'Sales Activities', icon: 'event_note' },
    { key: 'revenue', label: 'Revenue', icon: 'payments' },
]

export default function AdminDashboard() {
    const name = useSelector(s => s.auth.name)
    const canExport = usePermission('REPORTS_EXPORT')
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') || 'summary'
    const [summary, setSummary] = useState(null)
    const [tabData, setTabData] = useState({})
    const [loading, setLoading] = useState(true)
    const [tabLoading, setTabLoading] = useState(false)

    // Pipelines state
    const [pipelines, setPipelines] = useState([])
    const [selectedPipelineId, setSelectedPipelineId] = useState(null)

    const loadTab = useCallback(async (tab, pipelineId) => {
        if (tab === 'summary') return
        const isPipelineDependent = tab === 'deals' || tab === 'revenue';
        const cacheKey = isPipelineDependent ? `${tab}_${pipelineId || 'all'}` : tab;
        if (tabData[cacheKey]) return
        
        const prefix = getCachePrefix()
        const fullKey = `${prefix}:dashboard:${cacheKey}`
        const cached = listCache.get(fullKey)
        if (cached && isFresh(cached, LIST_TTL)) {
            setTabData(p => ({ ...p, [cacheKey]: cached.value }))
            return
        }
        
        setTabLoading(true)
        try {
            const url = isPipelineDependent && pipelineId
                ? `/api/dashboard/${tab}?pipelineId=${pipelineId}`
                : `/api/dashboard/${tab}`
            const r = await api.get(url)
            setTabData(p => ({ ...p, [cacheKey]: r.data }))
            listCacheSet(fullKey, r.data)
        } catch {
            setTabData(p => ({ ...p, [cacheKey]: null }))
        }
        finally { setTabLoading(false) }
    }, [tabData])

    useEffect(() => {
        if (activeTab === 'team') {
            navigate('/org', { replace: true })
            return
        }
        const prefix = getCachePrefix()
        const fullKey = `${prefix}:dashboard:summary`
        const cached = listCache.get(fullKey)
        if (cached && isFresh(cached, LIST_TTL)) {
            setSummary(cached.value)
            setLoading(false)
        } else {
            api.get('/api/dashboard')
                .then(r => {
                    setSummary(r.data)
                    listCacheSet(fullKey, r.data)
                })
                .catch(() => undefined)
                .finally(() => setLoading(false))
        }

        api.get('/api/pipelines?entityType=DEAL').then(r => {
            let list = r.data ?? []
            list = list.filter(p => p.name !== 'Partnership Pipeline')
            setPipelines(list)
            if (list.length > 0) {
                setSelectedPipelineId(list[0].id)
            }
        })
    }, [])

    useEffect(() => {
        if (activeTab === 'team') {
            navigate('/org', { replace: true })
            return
        }
        if (activeTab !== 'summary') {
            loadTab(activeTab, selectedPipelineId)
        }
    }, [activeTab, selectedPipelineId, loadTab, navigate])

    const handleTab = (key) => {
        setSearchParams({ tab: key })
    }

    const handlePipelineChange = (pipelineId) => {
        setSelectedPipelineId(pipelineId)
    }

    const currentTabCacheKey = `${activeTab}_${selectedPipelineId || 'all'}`
    const currentTabData = tabData[currentTabCacheKey]
    const activePipeline = pipelines.find(p => p.id === selectedPipelineId)
    const activeStages = activePipeline ? activePipeline.stages : []

    const fmt = (val) => Number(val || 0).toLocaleString('en-IN')

    return (
        <div className="min-h-screen" style={{ background: 'var(--crm-bg)' }}>
            <TopBar />
            <main className="p-4 md:p-8">
                {/* ── Ultra-Premium Executive Header ─────────────── */}
                <PageHeroBanner
                    icon="analytics"
                    title="Analytics Dashboard"
                    subtitle={`Welcome back, ${name || 'Executive'} · Real-time pipeline & company performance overview`}
                    stats={[
                        { label: 'Active Deals', value: loading ? '...' : fmt(summary?.activeDeals), icon: 'handshake', color: '#38BDF8' },
                        { label: 'Won Revenue', value: loading ? '...' : `₹${fmt(summary?.totalRevenue)}`, icon: 'payments', color: '#34D399' },
                    ]}
                    actions={canExport && <DownloadReport stats={summary} />}
                />

                {/* ── Sleek Floating Tab Navigation ─────────────── */}
                <div
                    className="flex items-center justify-between gap-3 mb-7 flex-wrap p-1.5 sm:p-2 rounded-2xl border"
                    style={{
                        background: T.surface,
                        borderColor: T.border,
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {TABS.map(tab => {
                            const active = activeTab === tab.key
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTab(tab.key)}
                                    className={`flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                                        active ? 'shadow-md scale-[1.01]' : 'hover:opacity-90'
                                    }`}
                                    style={{
                                        background: active
                                            ? T.primary
                                            : 'transparent',
                                        color: active ? '#FFFFFF' : T.textMuted,
                                        border: active ? `1px solid ${T.primary}70` : '1px solid transparent',
                                        boxShadow: active ? `0 8px 20px -4px ${T.primary}40` : 'none',
                                    }}
                                >
                                    <span
                                        className="material-symbols-outlined text-[17px]"
                                        style={{ color: active ? '#FFFFFF' : T.textMuted }}
                                    >
                                        {tab.icon}
                                    </span>
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Pipeline selector — right side of tab bar */}
                    {(activeTab === 'deals' || activeTab === 'revenue') && pipelines.length > 1 && (
                        <div className="sm:ml-auto flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted hidden sm:inline" style={{ color: T.textMuted }}>
                                Pipeline:
                            </span>
                            <div
                                className="px-3 py-1.5 rounded-xl border text-xs font-bold"
                                style={{
                                    background: T.surfaceRaised,
                                    borderColor: T.border,
                                }}
                            >
                                <CustomSelect
                                    value={selectedPipelineId || ''}
                                    onChange={e => handlePipelineChange(Number(e.target.value))}
                                    className="bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer"
                                    style={{ color: T.textPrimary, minWidth: 130 }}
                                >
                                    {pipelines.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </CustomSelect>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Tab Content ───────────────────────────────── */}
                {tabLoading && activeTab !== 'summary' ? <TabSkeleton /> : (
                    <>
                        {activeTab === 'summary' && <SummaryTab data={summary} loading={loading} />}
                        {activeTab === 'deals' && <DealsTab data={currentTabData} activeStages={activeStages} />}
                        {activeTab === 'bottlenecks' && <BottlenecksTab data={tabData.bottlenecks} activeStages={activeStages} />}
                        {activeTab === 'contacts' && <ContactsTab data={tabData.contacts} />}
                        {activeTab === 'activities' && <ActivitiesTab data={tabData.activities} />}
                        {activeTab === 'revenue' && <RevenueTab data={currentTabData} activeStages={activeStages} />}
                    </>
                )}
            </main>
        </div>
    )
}
