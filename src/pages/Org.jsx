import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import PageHeader from '../components/ui/PageHeader'
import TeamTab from '../components/dashboard/tabs/TeamTab'
import api from '../api'
import { listCache, listCacheSet, isFresh, LIST_TTL, getCachePrefix } from '../utils/cacheUtils'

export default function Org() {
    const navigate = useNavigate()
    const role = useSelector(state => state.auth.role)

    // Access control: only COMPANY_SUPER_ADMIN and ADMIN (or platform SUPER_ADMIN) are allowed. AGENT is blocked.
    useEffect(() => {
        if (role === 'AGENT') {
            navigate('/', { replace: true })
        }
    }, [role, navigate])

    const [teamData, setTeamData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchTeamData = useCallback(async (force = false) => {
        setLoading(true)
        const prefix = getCachePrefix()
        const fullKey = `${prefix}:dashboard:team`

        if (!force) {
            const cached = listCache.get(fullKey)
            if (cached && isFresh(cached, LIST_TTL)) {
                setTeamData(cached.value)
                setLoading(false)
                return
            }
        }

        try {
            const res = await api.get('/api/dashboard/team')
            setTeamData(res.data)
            listCacheSet(fullKey, res.data)
        } catch (err) {
            console.error('Failed to load team data:', err)
            setTeamData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (role !== 'AGENT') {
            fetchTeamData()
        }
    }, [role, fetchTeamData])

    if (role === 'AGENT') return null

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">
                <PageHeader
                    title="Organization"
                    subtitle="Organizational hierarchy, reporting lines & team performance"
                    icon="corporate_fare"
                    actions={
                        <button
                            type="button"
                            onClick={() => fetchTeamData(true)}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            style={{
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                color: T.textPrimary,
                            }}
                            title="Refresh team metrics"
                        >
                            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                                refresh
                            </span>
                            <span>Refresh</span>
                        </button>
                    }
                />

                <TeamTab
                    data={teamData}
                    onAgentClick={(id) => navigate(`/team/${id}`)}
                />
            </main>
        </div>
    )
}
