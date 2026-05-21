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

// ── Tabs definition (unchanged from original) ──────────────────
const TABS = [
    { key: 'summary',    label: 'Summary',         icon: 'dashboard' },
    { key: 'deals',      label: 'Deals',            icon: 'handshake' },
    { key: 'contacts',   label: 'Contacts',         icon: 'groups' },
    { key: 'activities', label: 'Sales Activities', icon: 'event_note' },
    { key: 'revenue',    label: 'Revenue',           icon: 'payments' },
    { key: 'team',       label: 'Team',             icon: 'people' },
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

    useEffect(() => {
        api.get('/api/dashboard')
            .then(r => setSummary(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])
    useEffect(() => {
        if (activeTab !== 'summary') loadTab(activeTab)
    }, [])

    const loadTab = useCallback(async (tab) => {
        if (tab === 'summary' || tabData[tab]) return
        setTabLoading(true)
        try {
            const r = await api.get(`/api/dashboard/${tab}`)
            setTabData(p => ({ ...p, [tab]: r.data }))
        } catch { }
        finally { setTabLoading(false) }
    }, [tabData])

    const handleTab = (key) => {
        setSearchParams({ tab: key })
        loadTab(key)
    }

    return (
        <div>
            <TopBar />
            <main className="p-8">

                {/* ── Hero Header ───────────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-7"
                    style={{
                        background: `linear-gradient(135deg, ${T.sidebar} 0%, #1a3a6b 55%, #0d2d5e 100%)`,
                        minHeight: 118,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '50%', width: 130, height: 130,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-9 py-7 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.18)',
                            }}>
                            <span className="material-symbols-outlined filled text-[24px]"
                                style={{ color: '#93C5FD' }}>analytics</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                Analytics Dashboard
                            </h2>
                            <p className="text-sm mt-0.5" style={{ color: 'rgba(147,197,253,0.80)' }}>
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
                </div>

                {/* ── Tab Content ───────────────────────────────── */}
                {tabLoading && activeTab !== 'summary' ? <TabSkeleton /> : (
                    <>
                        {activeTab === 'summary'    && <SummaryTab    data={summary}           loading={loading} />}
                        {activeTab === 'deals'      && <DealsTab       data={tabData.deals} />}
                        {activeTab === 'contacts'   && <ContactsTab    data={tabData.contacts} />}
                        {activeTab === 'activities' && <ActivitiesTab  data={tabData.activities} />}
                        {activeTab === 'revenue'    && <RevenueTab     data={tabData.revenue} />}
                        {activeTab === 'team'       && <TeamTab        data={tabData.team} onAgentClick={(id) => navigate(`/team/${id}`)} />}
                    </>
                )}
            </main>
        </div>
    )
}