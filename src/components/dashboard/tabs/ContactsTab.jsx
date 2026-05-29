import { Card, CardTitle, StatBox, TabSkeleton, fmt } from '../DashboardWidgets'
import { BarChart } from '../DashboardCharts'

export default function ContactsTab({ data }) {
    if (!data) return <TabSkeleton />
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <StatBox label="Total Contacts" value={fmt(data.total)} icon="groups" />
                <StatBox label="Added This Month" value={fmt(data.addedThisMonth)} icon="person_add" />
            </div>
            <Card>
                <CardTitle icon="bar_chart">Contacts by Owner</CardTitle>
                <BarChart
                    data={(data.byOwner || []).map(r => ({ label: r.ownerName, count: r.count }))}
                    valueKey="count"
                    labelKey="label"
                />
            </Card>
        </>
    )
}