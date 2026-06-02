import { Card, CardTitle, StatBox, TabSkeleton } from '../DashboardWidgets'
import { DASHBOARD_ACCENTS, fmt } from '../dashboardDesign'
import { BarChart } from '../DashboardCharts'

export default function ContactsTab({ data }) {
    if (!data) return <TabSkeleton />
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <StatBox label="Total Contacts" value={fmt(data.total)} icon="groups" color={DASHBOARD_ACCENTS.teal} />
                <StatBox label="Added This Month" value={fmt(data.addedThisMonth)} icon="person_add" color={DASHBOARD_ACCENTS.rose} />
            </div>
            <Card accent={DASHBOARD_ACCENTS.teal}>
                <CardTitle icon="bar_chart" accent={DASHBOARD_ACCENTS.teal}>Contacts by Owner</CardTitle>
                <BarChart
                    data={(data.byOwner || []).map(r => ({ label: r.ownerName, count: r.count }))}
                    valueKey="count"
                    labelKey="label"
                />
            </Card>
        </>
    )
}
