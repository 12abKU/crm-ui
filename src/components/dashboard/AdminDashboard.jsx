import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import TopBar from '../TopBar'
import { TabSkeleton } from './DashboardWidgets'
import SummaryTab from './tabs/SummaryTab'
import DealsTab from './tabs/DealsTab'
import ContactsTab from './tabs/ContactsTab'
import ActivitiesTab from './tabs/ActivitiesTab'
import RevenueTab from './tabs/RevenueTab'
import TeamTab from './tabs/TeamTab'
import api from '../../api'
import DownloadReport from '../Downloadreport'

// ── Tabs definition (unchanged) ──────────────────
const TABS = [
    { key: 'summary', label: 'Summary', icon: 'dashboard' },
    { key: 'deals', label: 'Deals', icon: 'handshake' },
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
        
        setTabLoading(true)
        try {
            const url = isPipelineDependent && pipelineId
                ? `/api/dashboard/${tab}?pipelineId=${pipelineId}`
                : `/api/dashboard/${tab}`
            const r = await api.get(url)
            setTabData(p => ({ ...p, [cacheKey]: r.data }))
        } catch { }
        finally { setTabLoading(false) }
    }, [tabData])

    useEffect(() => {
        api.get('/api/dashboard')
            .then(r => setSummary(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))

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
            <main className="p-8">

                {/* ── Hero Header ───────────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        minHeight: 118,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '50%', width: 130, height: 130,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-9 py-7 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.18)',
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
                <div className="flex items-center gap-2 mb-7 flex-wrap">
                    {TABS.map(tab => {
                        const active = activeTab === tab.key
                        return (
                            <button key={tab.key} onClick={() => handleTab(tab.key)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200"
                                style={{
                                    background: active
                                        ? `linear-gradient(135deg, ${T.primary}, ${T.primaryHover})`
                                        : T.surface,
                                    color: active ? '#fff' : T.textMuted,
                                    border: active ? `1px solid ${T.primary}` : `1px solid ${T.border}`,
                                    boxShadow: active ? `0 4px 14px ${T.primary}40` : '0 1px 3px rgba(0,0,0,0.04)',
                                    transform: active ? 'translateY(-1px)' : 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = T.surfaceHigh
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = T.surface
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
                    <div className="ml-auto flex items-center gap-3">
                        {(activeTab === 'deals' || activeTab === 'revenue') && pipelines.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: T.surface,
                                    border: `1px solid ${T.border}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.textMuted }}>Pipeline:</span>
                                <select
                                    value={selectedPipelineId || ''}
                                    onChange={e => handlePipelineChange(Number(e.target.value))}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                                    style={{ color: T.textPrimary }}>
                                    {pipelines.map(p => (
                                        <option key={p.id} value={p.id} style={{ color: '#000' }}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
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