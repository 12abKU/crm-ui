import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

// ─── CSV ─────────────────────────────────────────────────────────────────────
function downloadCSV(stats, name) {
    const date = new Date().toLocaleDateString('en-IN')

    const rows = [
        ['CRM Dashboard Report'],
        [`Generated for: ${name}`],
        [`Date: ${date}`],
        [],
        ['Metric', 'Value'],
        ['Active Deals', stats?.activeDeals ?? 0],
        ['Total Revenue (₹)', stats?.totalRevenue ?? 0],
        ['Total Accounts', stats?.totalAccounts ?? 0],
        ['Total Contacts', stats?.totalContacts ?? 0],
        ['New Contacts This Month', stats?.newContactsThisMonth ?? 0],
        ['New Deals This Month', stats?.newDealsThisMonth ?? 0],
        [],
        ['Recent Activities'],
        ['Subject', 'Type', 'Account', 'Contact', 'Deal', 'Time'],
        ...(stats?.recentActivities ?? []).map(a => [
            a.subject ?? '',
            a.type ?? '',
            a.accountName ?? '',
            a.contactName ?? '',
            a.dealTitle ?? '',
            a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN') : '',
        ]),
    ]

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-report-${date.replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
function downloadPDF(stats, name) {
    const date = new Date().toLocaleDateString('en-IN')
    const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

    const activities = (stats?.recentActivities ?? []).map(a => `
        <tr>
            <td>${a.subject ?? '—'}</td>
            <td>${a.type ?? '—'}</td>
            <td>${a.accountName ?? '—'}</td>
            <td>${a.contactName ?? '—'}</td>
            <td>${a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN') : '—'}</td>
        </tr>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>CRM Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #0b1c30; padding: 40px; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #004ac6; }
  .header h1 { font-size: 26px; font-weight: 900; color: #004ac6; }
  .header p { font-size: 13px; color: #737686; margin-top: 4px; }
  .meta { text-align: right; font-size: 12px; color: #737686; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: #f8f9ff; border: 1px solid #e0e4f0; border-radius: 12px; padding: 20px; }
  .stat-card .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737686; margin-bottom: 8px; }
  .stat-card .value { font-size: 28px; font-weight: 900; color: #0b1c30; }
  .section-title { font-size: 15px; font-weight: 800; color: #0b1c30; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead tr { background: #004ac6; color: #fff; }
  thead th { padding: 10px 14px; text-align: left; font-weight: 700; font-size: 11px; }
  tbody tr:nth-child(even) { background: #f8f9ff; }
  tbody td { padding: 10px 14px; border-bottom: 1px solid #eff4ff; color: #434655; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #c3c6d7; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CRM Dashboard Report</h1>
      <p>Prepared for ${name}</p>
    </div>
    <div class="meta">
      <p>Generated on</p>
      <p><strong>${date}</strong></p>
    </div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="label">Active Deals</div><div class="value">${fmt(stats?.activeDeals)}</div></div>
    <div class="stat-card"><div class="label">Total Revenue</div><div class="value">₹${fmt(stats?.totalRevenue)}</div></div>
    <div class="stat-card"><div class="label">Total Accounts</div><div class="value">${fmt(stats?.totalAccounts)}</div></div>
    <div class="stat-card"><div class="label">Total Contacts</div><div class="value">${fmt(stats?.totalContacts)}</div></div>
    <div class="stat-card"><div class="label">New Contacts This Month</div><div class="value">${fmt(stats?.newContactsThisMonth)}</div></div>
    <div class="stat-card"><div class="label">New Deals This Month</div><div class="value">${fmt(stats?.newDealsThisMonth)}</div></div>
  </div>
  <div class="section-title">Recent Activities</div>
  <table>
    <thead>
      <tr><th>Subject</th><th>Type</th><th>Account</th><th>Contact</th><th>Time</th></tr>
    </thead>
    <tbody>
      ${activities || '<tr><td colspan="5" style="text-align:center;color:#737686;padding:20px">No recent activities</td></tr>'}
    </tbody>
  </table>
  <div class="footer">Generated by CRM · ${date}</div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (win) {
        win.onload = () => { win.focus(); win.print() }
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// ─── Component ────────────────────────────────────────────────────────────────
// Usage: <DownloadReport stats={stats} />
export default function DownloadReport({ stats }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const name = useSelector(state => state.auth.name)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="crm-btn-ghost flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download Report
                <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    expand_more
                </span>
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
                    style={{
                        background: '#fff',
                        border: '1px solid rgba(195,198,215,0.5)',
                        boxShadow: '0 8px 24px rgba(11,28,48,0.12)',
                        minWidth: '190px',
                        top: '100%',
                    }}
                >
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#737686' }}>
                        Export as
                    </p>

                    <button
                        onClick={() => { downloadPDF(stats, name); setOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-[#f8f9ff]"
                        style={{ color: '#0b1c30', cursor: 'pointer' }}
                    >
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#ba1a1a' }}>picture_as_pdf</span>
                        PDF
                        <span className="ml-auto text-[10px] font-normal" style={{ color: '#737686' }}>Print to save</span>
                    </button>

                    <div style={{ height: '1px', background: '#eff4ff', margin: '0 12px' }} />

                    <button
                        onClick={() => { downloadCSV(stats, name); setOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-[#f8f9ff]"
                        style={{ color: '#0b1c30', cursor: 'pointer' }}
                    >
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#15803d' }}>table_chart</span>
                        Excel / CSV
                        <span className="ml-auto text-[10px] font-normal" style={{ color: '#737686' }}>.csv file</span>
                    </button>

                    <div className="pb-1" />
                </div>
            )}
        </div>
    )
}
