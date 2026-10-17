/**
 * Modern Excel (.xlsx) generator using ExcelJS
 * Features:
 * - Real OpenXML .xlsx binary format (no warning dialogs in Excel)
 * - Multiple worksheets: Executive Summary, Activities Log, Pipeline Breakdown
 * - Polished enterprise styling (Dark Navy header, KPI cards, zebra-striped tables)
 * - Auto column widths and native currency/percentage number formatting
 */

export async function downloadExcelReport(stats, name) {
    const ExcelJSModule = await import('exceljs')
    const ExcelJS = ExcelJSModule.default || ExcelJSModule

    const wb = new ExcelJS.Workbook()
    wb.creator = 'IInventive CRM'
    wb.created = new Date()

    const dateStr = new Date().toLocaleDateString('en-IN')
    const safeDate = dateStr.replace(/\//g, '-')

    const FONT_FAMILY = 'Calibri'
    const COLORS = {
        NAVY_DARK: 'FF0B1C30',
        SLATE_DARK: 'FF1E293B',
        SLATE_HEADER: 'FF334155',
        BRAND_BLUE: 'FF2563EB',
        CARD_LABEL_BG: 'FFF1F5F9',
        ROW_ZEBRA: 'FFF8FAFC',
        WHITE: 'FFFFFFFF',
        BORDER_LIGHT: 'FFE2E8F0',
        BORDER_MEDIUM: 'FFCBD5E1',
        TEXT_MAIN: 'FF0F172A',
        TEXT_MUTED: 'FF64748B',
        SUCCESS_GREEN: 'FF16A34A',
        DANGER_RED: 'FFDC2626',
        PURPLE: 'FF7C3AED'
    }

    const thinBorder = {
        top: { style: 'thin', color: { argb: COLORS.BORDER_LIGHT } },
        bottom: { style: 'thin', color: { argb: COLORS.BORDER_LIGHT } },
        left: { style: 'thin', color: { argb: COLORS.BORDER_LIGHT } },
        right: { style: 'thin', color: { argb: COLORS.BORDER_LIGHT } }
    }

    const cardBorder = {
        top: { style: 'thin', color: { argb: COLORS.BORDER_MEDIUM } },
        bottom: { style: 'thin', color: { argb: COLORS.BORDER_MEDIUM } },
        left: { style: 'thin', color: { argb: COLORS.BORDER_MEDIUM } },
        right: { style: 'thin', color: { argb: COLORS.BORDER_MEDIUM } }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SHEET 1: Executive Summary
    // ─────────────────────────────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Executive Summary', {
        views: [{ showGridLines: true }]
    })

    // 1. Header Banner
    wsSummary.mergeCells('A1:F2')
    const titleCell = wsSummary.getCell('A1')
    titleCell.value = 'IINVENTIVE CRM — EXECUTIVE PERFORMANCE REPORT'
    titleCell.font = { name: FONT_FAMILY, size: 15, bold: true, color: { argb: COLORS.WHITE } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY_DARK } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    wsSummary.mergeCells('A3:F3')
    const subCell = wsSummary.getCell('A3')
    subCell.value = `Generated for: ${name || 'All Users'}   |   Report Date: ${dateStr}   |   Consolidated Company Overview`
    subCell.font = { name: FONT_FAMILY, size: 9, italic: true, color: { argb: 'FF94A3B8' } }
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_DARK } }
    subCell.alignment = { vertical: 'middle', horizontal: 'center' }

    // Spacer
    wsSummary.addRow([])

    // 2. KPI Section Header
    const kpiSectionRow = wsSummary.addRow(['KEY PERFORMANCE METRICS (KPIs)'])
    const kpiSecNum = kpiSectionRow.number
    wsSummary.mergeCells(`A${kpiSecNum}:F${kpiSecNum}`)
    kpiSectionRow.height = 24
    const kpiHeaderCell = kpiSectionRow.getCell(1)
    kpiHeaderCell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
    kpiHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.BRAND_BLUE } }
    kpiHeaderCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

    // Row 1 of KPI Cards (Core Metrics)
    const kpiLabels1 = wsSummary.addRow([
        'ACTIVE DEALS',
        'TOTAL REVENUE WON',
        'TOTAL ACCOUNTS',
        'TOTAL CONTACTS',
        'WIN RATE',
        'WON / LOST DEALS'
    ])
    kpiLabels1.height = 20
    kpiLabels1.eachCell(cell => {
        cell.font = { name: FONT_FAMILY, size: 9, bold: true, color: { argb: 'FF475569' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.CARD_LABEL_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = cardBorder
    })

    const kpiValues1 = wsSummary.addRow([
        stats?.activeDeals ?? 0,
        stats?.totalRevenue ?? 0,
        stats?.totalAccounts ?? 0,
        stats?.totalContacts ?? 0,
        `${stats?.winRate ?? 0}%`,
        `${stats?.wonCount ?? 0} Won / ${stats?.lostCount ?? 0} Lost`
    ])
    kpiValues1.height = 30
    kpiValues1.eachCell((cell, colIndex) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = cardBorder
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.WHITE } }

        if (colIndex === 1) {
            cell.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: COLORS.BRAND_BLUE } }
        } else if (colIndex === 2) {
            cell.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: COLORS.SUCCESS_GREEN } }
            cell.numFmt = '[$₹-en-IN] #,##,##0;([$₹-en-IN] #,##,##0);"-"'
        } else if (colIndex === 5) {
            cell.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: COLORS.PURPLE } }
        } else {
            cell.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: COLORS.TEXT_MAIN } }
        }
    })

    // Row 2 of KPI Cards (Monthly Trends & Scope)
    const kpiLabels2 = wsSummary.addRow([
        'NEW CONTACTS (THIS MONTH)',
        'NEW DEALS (THIS MONTH)',
        'TOTAL ACTIVE USERS',
        'COMPANY PLAN',
        'ORGANIZATION SCOPE',
        'REPORT STATUS'
    ])
    kpiLabels2.height = 20
    kpiLabels2.eachCell(cell => {
        cell.font = { name: FONT_FAMILY, size: 9, bold: true, color: { argb: 'FF475569' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.CARD_LABEL_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = cardBorder
    })

    const kpiValues2 = wsSummary.addRow([
        stats?.newContactsThisMonth ?? 0,
        stats?.newDealsThisMonth ?? 0,
        stats?.totalUsers ?? '—',
        stats?.companyPlan || 'Enterprise',
        'Company-wide',
        'Verified'
    ])
    kpiValues2.height = 24
    kpiValues2.eachCell(cell => {
        cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: COLORS.TEXT_MAIN } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = cardBorder
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.WHITE } }
    })

    // Spacer
    wsSummary.addRow([])

    // 3. Pipeline Breakdown Table (if present)
    const openDealsByStage = stats?.openDealsByStage || []
    if (openDealsByStage.length > 0) {
        const pipeSecRow = wsSummary.addRow(['DEAL PIPELINE BREAKDOWN BY STAGE'])
        const pipeSecNum = pipeSecRow.number
        wsSummary.mergeCells(`A${pipeSecNum}:C${pipeSecNum}`)
        pipeSecRow.height = 24
        const pipeHeaderCell = pipeSecRow.getCell(1)
        pipeHeaderCell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
        pipeHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_DARK } }
        pipeHeaderCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

        const pipeTableHeaders = wsSummary.addRow(['Stage Name', 'Active Deals Count', 'Pipeline Value (INR)'])
        pipeTableHeaders.height = 22
        pipeTableHeaders.eachCell(cell => {
            cell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_HEADER } }
            cell.border = thinBorder
            cell.alignment = { vertical: 'middle' }
        })

        let totalDealsInPipe = 0
        let totalValInPipe = 0

        openDealsByStage.forEach((stage, idx) => {
            const count = stage.count ?? 0
            const amount = stage.amount ?? 0
            totalDealsInPipe += count
            totalValInPipe += amount

            const dataRow = wsSummary.addRow([
                stage.stage ?? '',
                count,
                amount
            ])
            dataRow.height = 20
            const bg = idx % 2 === 1 ? COLORS.ROW_ZEBRA : COLORS.WHITE
            dataRow.eachCell((cell, cIdx) => {
                cell.font = { name: FONT_FAMILY, size: 10, color: { argb: COLORS.TEXT_MAIN } }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
                cell.border = thinBorder
                cell.alignment = { vertical: 'middle' }
                if (cIdx === 3) {
                    cell.numFmt = '[$₹-en-IN] #,##,##0;([$₹-en-IN] #,##,##0);"-"'
                }
            })
        })

        // Total row
        const totalRow = wsSummary.addRow(['Total Active Pipeline', totalDealsInPipe, totalValInPipe])
        totalRow.height = 22
        totalRow.eachCell((cell, cIdx) => {
            cell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.NAVY_DARK } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
            cell.border = {
                top: { style: 'thin', color: { argb: COLORS.BORDER_MEDIUM } },
                bottom: { style: 'double', color: { argb: COLORS.SLATE_DARK } }
            }
            cell.alignment = { vertical: 'middle' }
            if (cIdx === 3) {
                cell.numFmt = '[$₹-en-IN] #,##,##0;([$₹-en-IN] #,##,##0);"-"'
            }
        })

        // Spacer
        wsSummary.addRow([])
    }

    // 4. Recent Activities Log
    const recentActivities = stats?.recentActivities || []
    const actSecRow = wsSummary.addRow(['RECENT ACTIVITIES LOG'])
    const actSecNum = actSecRow.number
    wsSummary.mergeCells(`A${actSecNum}:F${actSecNum}`)
    actSecRow.height = 24
    const actHeaderCell = actSecRow.getCell(1)
    actHeaderCell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
    actHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_DARK } }
    actHeaderCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

    const actTableHeaders = wsSummary.addRow([
        'Subject',
        'Activity Type',
        'Account Name',
        'Contact Person',
        'Associated Deal',
        'Activity Date & Time'
    ])
    actTableHeaders.height = 22
    actTableHeaders.eachCell(cell => {
        cell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_HEADER } }
        cell.border = thinBorder
        cell.alignment = { vertical: 'middle' }
    })

    if (recentActivities.length > 0) {
        recentActivities.forEach((act, idx) => {
            const timeStr = act.createdAt ? new Date(act.createdAt).toLocaleString('en-IN') : '—'
            const dataRow = wsSummary.addRow([
                act.subject || '—',
                act.type || '—',
                act.accountName || '—',
                act.contactName || '—',
                act.dealTitle || '—',
                timeStr
            ])
            dataRow.height = 20
            const bg = idx % 2 === 1 ? COLORS.ROW_ZEBRA : COLORS.WHITE
            dataRow.eachCell(cell => {
                cell.font = { name: FONT_FAMILY, size: 10, color: { argb: COLORS.TEXT_MAIN } }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
                cell.border = thinBorder
                cell.alignment = { vertical: 'middle' }
            })
        })
    } else {
        const emptyRow = wsSummary.addRow(['No recent activities recorded', '', '', '', '', ''])
        emptyRow.height = 20
        wsSummary.mergeCells(`A${emptyRow.number}:F${emptyRow.number}`)
        const cell = emptyRow.getCell(1)
        cell.font = { name: FONT_FAMILY, size: 10, italic: true, color: { argb: COLORS.TEXT_MUTED } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
    }

    // Set auto column widths for Sheet 1
    const summaryColWidths = [28, 24, 24, 24, 26, 26]
    summaryColWidths.forEach((w, i) => {
        wsSummary.getColumn(i + 1).width = w
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // SHEET 2: Dedicated Activities Log (With Auto-Filter)
    // ─────────────────────────────────────────────────────────────────────────────
    if (recentActivities.length > 0) {
        const wsActivities = wb.addWorksheet('Activities Log', {
            views: [{ showGridLines: true }]
        })

        const aHeaders = wsActivities.addRow([
            'Subject',
            'Activity Type',
            'Account Name',
            'Contact Person',
            'Associated Deal',
            'Date & Time'
        ])
        aHeaders.height = 24
        aHeaders.eachCell(cell => {
            cell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY_DARK } }
            cell.border = thinBorder
            cell.alignment = { vertical: 'middle' }
        })

        recentActivities.forEach((act, idx) => {
            const timeStr = act.createdAt ? new Date(act.createdAt).toLocaleString('en-IN') : '—'
            const r = wsActivities.addRow([
                act.subject || '—',
                act.type || '—',
                act.accountName || '—',
                act.contactName || '—',
                act.dealTitle || '—',
                timeStr
            ])
            r.height = 20
            const bg = idx % 2 === 1 ? COLORS.ROW_ZEBRA : COLORS.WHITE
            r.eachCell(cell => {
                cell.font = { name: FONT_FAMILY, size: 10, color: { argb: COLORS.TEXT_MAIN } }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
                cell.border = thinBorder
                cell.alignment = { vertical: 'middle' }
            })
        })

        wsActivities.autoFilter = {
            from: 'A1',
            to: `F${recentActivities.length + 1}`
        }

        const actColWidths = [30, 18, 26, 24, 28, 24]
        actColWidths.forEach((w, i) => {
            wsActivities.getColumn(i + 1).width = w
        })
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SHEET 3: Pipeline Breakdown (Dedicated tab)
    // ─────────────────────────────────────────────────────────────────────────────
    if (openDealsByStage.length > 0) {
        const wsPipeline = wb.addWorksheet('Pipeline Breakdown', {
            views: [{ showGridLines: true }]
        })

        const pHeaders = wsPipeline.addRow([
            'Stage Name',
            'Active Deals Count',
            'Pipeline Value (INR)'
        ])
        pHeaders.height = 24
        pHeaders.eachCell(cell => {
            cell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.WHITE } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY_DARK } }
            cell.border = thinBorder
            cell.alignment = { vertical: 'middle' }
        })

        openDealsByStage.forEach((stage, idx) => {
            const r = wsPipeline.addRow([
                stage.stage || '—',
                stage.count ?? 0,
                stage.amount ?? 0
            ])
            r.height = 20
            const bg = idx % 2 === 1 ? COLORS.ROW_ZEBRA : COLORS.WHITE
            r.eachCell((cell, cIdx) => {
                cell.font = { name: FONT_FAMILY, size: 10, color: { argb: COLORS.TEXT_MAIN } }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
                cell.border = thinBorder
                cell.alignment = { vertical: 'middle' }
                if (cIdx === 3) {
                    cell.numFmt = '[$₹-en-IN] #,##,##0;([$₹-en-IN] #,##,##0);"-"'
                }
            })
        })

        wsPipeline.autoFilter = {
            from: 'A1',
            to: `C${openDealsByStage.length + 1}`
        }

        const pipeColWidths = [28, 22, 28]
        pipeColWidths.forEach((w, i) => {
            wsPipeline.getColumn(i + 1).width = w
        })
    }

    // Write buffer and trigger browser download
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-report-${safeDate}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
}
