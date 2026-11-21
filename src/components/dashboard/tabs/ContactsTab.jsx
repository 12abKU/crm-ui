import { useNavigate } from 'react-router-dom'
import { T } from '../../../constants/theme'
import DashboardStatCard from '../DashboardStatCard'
import { Card, CardTitle, Empty, TabSkeleton } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt } from '../dashboardDesign'
import { BarChart } from '../DashboardCharts'

export default function ContactsTab({ data }) {
    const navigate = useNavigate()
    if (!data) return <TabSkeleton />

    const total = data.total || 0
    const addedThisMonth = data.addedThisMonth || 0
    const activeOwners = (data.byOwner || []).length
    const avgPerOwner = activeOwners > 0 ? Math.round(total / activeOwners) : 0
    const chartData = (data.byOwner || []).map(r => ({ label: r.ownerName, count: r.count }))

    return (
        <>
            {/* ── 4-KPI Metric Command Strip ──────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <DashboardStatCard icon="groups" label="Total Contacts" value={fmt(total)} sub="Network" />
                <DashboardStatCard icon="person_add" label="Added This Month" value={fmt(addedThisMonth)} sub="Growth" />
                <DashboardStatCard icon="business" label="Active Owners" value={fmt(activeOwners)} sub="Reps" />
                <DashboardStatCard icon="trending_up" label="Avg per Rep" value={fmt(avgPerOwner)} sub="Portfolio" />
            </div>

            {/* ── Contacts Distribution Card ──────────────────── */}
            <Card accent={DASHBOARD_ACCENTS.teal}>
                <CardTitle icon="bar_chart" accent={DASHBOARD_ACCENTS.teal} meta={activeOwners ? `${activeOwners} Reps` : undefined}>
                    Contacts Portfolio by Owner
                </CardTitle>
                {chartData.length > 0 ? (
                    <BarChart
                        data={chartData}
                        valueKey="count"
                        labelKey="label"
                    />
                ) : (
                    <Empty
                        icon="groups"
                        title="No Contacts Distributed Yet"
                        subtitle="Contacts will appear in distribution graphs once client leads and stakeholder profiles are saved."
                        actionLabel="+ Add First Contact"
                        onAction={() => navigate('/contacts')}
                    />
                )}
            </Card>
        </>
    )
}
