import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { downloadPdfAsync, openPdfAsync, savePdfBlob } from '../utils/downloadPdfAsync'

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

// ─── Component ────────────────────────────────────────────────────────────────
// Usage: <DownloadReport stats={stats} />
export default function DownloadReport({ stats }) {
    const [open, setOpen] = useState(false)
    const [pdfDownloading, setPdfDownloading] = useState(false)
    const ref = useRef(null)
    const name = useSelector(state => state.auth.name)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const pdfJobUrls = {
        startUrl: '/api/dashboard/report/pdf/async',
        statusUrl: (jobId) => `/api/dashboard/report/pdf/async/${jobId}`,
        downloadUrl: (jobId) => `/api/dashboard/report/pdf/async/${jobId}/download`,
    }

    const handlePdfDownload = async () => {
        setOpen(false)
        setPdfDownloading(true)
        try {
            const { blob, filename } = await downloadPdfAsync(pdfJobUrls)
            const dateStr = new Date().toLocaleDateString('en-IN').replace(/\//g, '-')
            savePdfBlob(blob, filename || `nexus-executive-report-${dateStr}.pdf`)
        } catch (err) {
            window.dispatchEvent(new CustomEvent('crm-api-error', {
                detail: { message: err?.message || 'Failed to download PDF report', status: 500 }
            }))
        } finally {
            setPdfDownloading(false)
        }
    }

    const handlePdfView = async () => {
        setOpen(false)
        setPdfDownloading(true)
        try {
            await openPdfAsync(pdfJobUrls)
        } catch (err) {
            window.dispatchEvent(new CustomEvent('crm-api-error', {
                detail: { message: err?.message || 'Failed to view PDF report', status: 500 }
            }))
        } finally {
            setPdfDownloading(false)
        }
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="crm-btn-ghost flex items-center gap-2"
                disabled={pdfDownloading}
            >
                <span className="material-symbols-outlined text-[16px]">
                    {pdfDownloading ? 'hourglass_empty' : 'download'}
                </span>
                {pdfDownloading ? 'Generating PDF...' : 'Download Report'}
                <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    expand_more
                </span>
            </button>

            {open && (
                <div
                    className="absolute left-0 mt-2 rounded-xl overflow-hidden z-50"
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
                        onClick={handlePdfView}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-[#f8f9ff]"
                        style={{ color: '#0b1c30', cursor: 'pointer' }}
                    >
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#0369a1' }}>visibility</span>
                        View PDF
                        <span className="ml-auto text-[10px] font-normal" style={{ color: '#737686' }}>Open in tab</span>
                    </button>

                    <div style={{ height: '1px', background: '#eff4ff', margin: '0 12px' }} />

                    <button
                        onClick={handlePdfDownload}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-[#f8f9ff]"
                        style={{ color: '#0b1c30', cursor: 'pointer' }}
                    >
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#ba1a1a' }}>picture_as_pdf</span>
                        PDF
                        <span className="ml-auto text-[10px] font-normal" style={{ color: '#737686' }}>Multi-page</span>
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
