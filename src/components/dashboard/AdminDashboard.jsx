import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import TopBar from '../TopBar'
import { TabSkeleton } from './DashboardWidgets'
import { DASHBOARD_ACCENTS, luxeShadow } from './dashboardDesign'
import SummaryTab from './tabs/SummaryTab'
import DealsTab from './tabs/DealsTab'
import ContactsTab from './tabs/ContactsTab'
import ActivitiesTab from './tabs/ActivitiesTab'
import RevenueTab from './tabs/RevenueTab'
import TeamTab from './tabs/TeamTab'
import BottlenecksTab from './tabs/BottlenecksTab'
import api from '../../api'
import DownloadReport from '../Downloadreport'
import { listCache, listCacheSet, isFresh, LIST_TTL, getCachePrefix } from '../../utils/cacheUtils'
import CustomSelect from '../ui/CustomSelect'

// ── Tabs definition (unchanged) ──────────────────
const TABS = [
    { key: 'summary', label: 'Summary', icon: 'dashboard' },
    { key: 'deals', label: 'Deals', icon: 'handshake' },
    { key: 'bottlenecks', label: 'Bottlenecks', icon: 'hourglass_empty' },
    { key: 'contacts', label: 'Contacts', icon: 'groups' },
    { key: 'activities', label: 'Sales Activities', icon: 'event_note' },
    { key: 'revenue', label: 'Revenue', icon: 'payments' },
    { key: 'team', label: 'Team', icon: 'people' },
]

export default function AdminDashboard() {
    const name = useSelector(s => s.auth.name)
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

        api.get('/api/pipelines').then(r => {
            const list = r.data ?? []
            setPipelines(list)
            if (list.length > 0) {
                setSelectedPipelineId(list[0].id)
            }
        })
    }, [])

    useEffect(() => {
        if (activeTab !== 'summary') {
            loadTab(activeTab, selectedPipelineId)
        }
    }, [activeTab, selectedPipelineId, loadTab])

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

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* ── Hero Header ───────────────────────────────── */}
                <div className="relative overflow-hidden mb-7"
                    style={{
                        borderRadius: 26,
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 52%, ${T.heroBgTo} 100%)`,
                        minHeight: 118,
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 22px 54px rgba(15,23,42,0.18)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
                        style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.08) 100%)' }} />

                    <div className="relative px-5 py-5 sm:px-9 sm:py-7 flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center shrink-0"
                            style={{
                                borderRadius: 14,
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
                             }}>
                            <span className="material-symbols-outlined filled text-[24px]"
                                style={{ color: T.sidebarActiveText }}>analytics</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                Analytics Dashboard
                            </h2>
                            <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                Welcome back, {name} · Company-wide overview
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Tab Bar ───────────────────────────────────── */}
                <div className="flex items-center gap-2.5 mb-7 flex-wrap p-1 sm:p-2"
                    style={{
                        borderRadius: 22,
                        background: T.surface,
                        border: `1px solid ${T.border}80`,
                        boxShadow: luxeShadow(T.primary),
                    }}>
                    {TABS.map(tab => {
                        const active = activeTab === tab.key
                        return (
                            <button key={tab.key} onClick={() => handleTab(tab.key)}
                                className="flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm font-black transition-all duration-200"
                                style={{
                                    borderRadius: 16,
                                    background: active
                                        ? T.primary
                                        : 'transparent',
                                    color: active ? '#fff' : T.textMuted,
                                    border: active ? `1px solid ${T.primary}55` : '1px solid transparent',
                                    boxShadow: active ? `0 10px 22px ${T.primary}24` : 'none',
                                    transform: active ? 'translateY(-1px)' : 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = T.primaryFaint
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.transform = 'none'
                                    }
                                }}>
                                <span className="material-symbols-outlined text-[16px]"
                                    style={{ color: active ? '#fff' : T.textMuted }}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        )
                    })}

                    {/* Pipeline selector and Download button — right side of tab bar */}
                    <div className="sm:ml-auto flex items-center gap-3 flex-wrap">
                        {(activeTab === 'deals' || activeTab === 'revenue') && pipelines.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200"
                                style={{
                                    borderRadius: 16,
                                    background: T.primaryFaint,
                                    border: `1px solid ${T.border}80`,
                                }}>
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.textMuted }}>Pipeline:</span>
                                <CustomSelect
                                    value={selectedPipelineId || ''}
                                    onChange={e => handlePipelineChange(Number(e.target.value))}
                                    className="bg-transparent text-sm font-bold outline-none"
                                    style={{ color: T.textPrimary, minWidth: 120 }}>
                                    {pipelines.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </CustomSelect>
                            </div>
                        )}
                        {summary && (
                            <DownloadReport stats={summary} />
                        )}
                    </div>
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
                        {activeTab === 'team' && <TeamTab data={tabData.team} onAgentClick={(id) => navigate(`/team/${id}`)} />}
                    </>
                )}
            </main>
        </div>
    )
}
