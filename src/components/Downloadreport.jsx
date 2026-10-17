import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { downloadPdfAsync, openPdfAsync, savePdfBlob } from '../utils/downloadPdfAsync'
import { downloadExcelReport } from '../utils/downloadExcelAsync'
import { T } from '../constants/theme'
import { useFloating, autoUpdate, offset, flip, shift, FloatingPortal } from '@floating-ui/react'

// ─── CSV ─────────────────────────────────────────────────────────────────────
function downloadCSV(stats, name) {
    const date = new Date().toLocaleDateString('en-IN')

    const rows = [
        ['CRM EXECUTIVE DASHBOARD REPORT'],
        ['Generated For:', name || 'User', 'Generated Date:', date, 'Report Type:', 'Consolidated CRM Overview'],
        [],
        ['EXECUTIVE METRICS (KPIs)'],
        [
            'Active Deals',
            'Total Revenue (INR)',
            'Total Accounts',
            'Total Contacts',
            'New Contacts (This Month)',
            'New Deals (This Month)',
            'Won Deals',
            'Lost Deals',
            'Win Rate (%)'
        ],
        [
            stats?.activeDeals ?? 0,
            stats?.totalRevenue ?? 0,
            stats?.totalAccounts ?? 0,
            stats?.totalContacts ?? 0,
            stats?.newContactsThisMonth ?? 0,
            stats?.newDealsThisMonth ?? 0,
            stats?.wonCount ?? 0,
            stats?.lostCount ?? 0,
            `${stats?.winRate ?? 0}%`
        ],
        [],
        ...(stats?.openDealsByStage && stats.openDealsByStage.length > 0 ? [
            ['DEAL PIPELINE BREAKDOWN BY STAGE'],
            ['Stage Name', 'Active Deals Count', 'Pipeline Value (INR)'],
            ...stats.openDealsByStage.map(s => [
                s.stage ?? '',
                s.count ?? 0,
                s.amount ?? 0
            ]),
            []
        ] : []),
        ['RECENT ACTIVITIES LOG'],
        [
            'Subject',
            'Activity Type',
            'Account Name',
            'Contact Person',
            'Associated Deal',
            'Activity Date & Time'
        ],
        ...((stats?.recentActivities && stats.recentActivities.length > 0)
            ? stats.recentActivities.map(a => [
                a.subject ?? '',
                a.type ?? '',
                a.accountName ?? '',
                a.contactName ?? '',
                a.dealTitle ?? '',
                a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN') : ''
            ])
            : [['No recent activities found', '', '', '', '', '']]
        )
    ]

    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
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
    const [excelDownloading, setExcelDownloading] = useState(false)
    const ref = useRef(null)
    const name = useSelector(state => state.auth.name)

    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'bottom-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(6),
            flip({ padding: 8 }),
            shift({ padding: 8 })
        ]
    })

    useEffect(() => {
        const handler = (e) => {
            const wrapper = ref.current;
            const floating = refs.floating.current;
            if (wrapper && !wrapper.contains(e.target) && (!floating || !floating.contains(e.target))) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [refs.floating])

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

    const handleExcelDownload = async () => {
        setOpen(false)
        setExcelDownloading(true)
        try {
            await downloadExcelReport(stats, name)
        } catch (err) {
            console.error('Failed to generate Excel report:', err)
            window.dispatchEvent(new CustomEvent('crm-api-error', {
                detail: { message: err?.message || 'Failed to generate Excel (.xlsx) report', status: 500 }
            }))
        } finally {
            setExcelDownloading(false)
        }
    }

    const isBusy = pdfDownloading || excelDownloading

    return (
        <div className="relative" ref={ref}>
            <button
                ref={refs.setReference}
                onClick={() => setOpen(o => !o)}
                className="crm-btn-ghost flex items-center gap-2"
                disabled={isBusy}
            >
                <span className="material-symbols-outlined text-[16px]">
                    {isBusy ? 'hourglass_empty' : 'download'}
                </span>
                {pdfDownloading ? 'Generating PDF...' : excelDownloading ? 'Generating Excel...' : 'Download Report'}
                <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    expand_more
                </span>
            </button>

            {open && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: T.surface || '#fff',
                            border: `1px solid ${T.border || 'rgba(195,198,215,0.5)'}`,
                            boxShadow: '0 12px 36px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)',
                            minWidth: '220px',
                            zIndex: 99999,
                            ...floatingStyles
                        }}
                    >
                        <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted || '#737686' }}>
                            Export as
                        </p>

                        <button
                            onClick={handlePdfView}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors"
                            style={{ color: T.textPrimary || '#0b1c30', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh || '#f8f9ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ color: '#0369a1' }}>visibility</span>
                            View PDF
                            <span className="ml-auto text-[10px] font-normal" style={{ color: T.textMuted || '#737686' }}>Open in tab</span>
                        </button>

                        <div style={{ height: '1px', background: T.borderSubtle || '#eff4ff', margin: '0 12px' }} />

                        <button
                            onClick={handlePdfDownload}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors"
                            style={{ color: T.textPrimary || '#0b1c30', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh || '#f8f9ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ color: '#ba1a1a' }}>picture_as_pdf</span>
                            PDF
                            <span className="ml-auto text-[10px] font-normal" style={{ color: T.textMuted || '#737686' }}>Multi-page</span>
                        </button>

                        <div style={{ height: '1px', background: T.borderSubtle || '#eff4ff', margin: '0 12px' }} />

                        <button
                            onClick={handleExcelDownload}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors"
                            style={{ color: T.textPrimary || '#0b1c30', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh || '#f8f9ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ color: '#15803d' }}>table_chart</span>
                            Excel (.xlsx)
                            <span className="ml-auto text-[10px] font-normal" style={{ color: T.textMuted || '#737686' }}>Styled Workbook</span>
                        </button>

                        <div style={{ height: '1px', background: T.borderSubtle || '#eff4ff', margin: '0 12px' }} />

                        <button
                            onClick={() => { downloadCSV(stats, name); setOpen(false) }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors"
                            style={{ color: T.textPrimary || '#0b1c30', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh || '#f8f9ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ color: '#64748B' }}>text_snippet</span>
                            CSV (.csv)
                            <span className="ml-auto text-[10px] font-normal" style={{ color: T.textMuted || '#737686' }}>Raw data</span>
                        </button>

                        <div className="pb-1" />
                    </div>
                </FloatingPortal>
            )}
        </div>
    )
}
