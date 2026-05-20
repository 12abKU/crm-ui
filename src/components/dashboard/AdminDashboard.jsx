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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>
                            Analytics Dashboard
                        </h2>
                        <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                            Welcome back, {name} · Company-wide overview
                        </p>
                    </div>
                </div>

                <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: T.surfaceHigh }}>
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => handleTab(tab.key)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: activeTab === tab.key ? T.surface : 'transparent',
                                color: activeTab === tab.key ? T.textPrimary : T.textMuted,
                                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            }}>
                            <span className="material-symbols-outlined text-[16px]"
                                style={{ color: activeTab === tab.key ? T.primary : T.textMuted }}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {tabLoading && activeTab !== 'summary' ? <TabSkeleton /> : (
                    <>
                        {activeTab === 'summary' && <SummaryTab data={summary} loading={loading} />}
                        {activeTab === 'deals' && <DealsTab data={tabData.deals} />}
                        {activeTab === 'contacts' && <ContactsTab data={tabData.contacts} />}
                        {activeTab === 'activities' && <ActivitiesTab data={tabData.activities} />}
                        {activeTab === 'revenue' && <RevenueTab data={tabData.revenue} />}
                        {activeTab === 'team' && <TeamTab data={tabData.team} onAgentClick={(id) => navigate(`/team/${id}`)} />}
                    </>
                )}
            </main>
        </div>
    )
}