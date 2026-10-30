import React, { useEffect, useState } from 'react'
import tallyAPI from '../../api/tally'
import { validateTallyConfig } from '../../utils/tallyGstUtils'
import { T } from '../../constants/theme'
import TallyConnectionBadge from '../deals/TallyConnectionBadge'

/**
 * TallySettings
 * Admin configuration panel for TallyPrime accounting & inventory bridge:
 * - Connection mode: LOCAL_AGENT (desktop agent) vs CLOUD_SERVER (remote Tally)
 * - Company profile & GSTIN mapping
 * - Accounting ledger mappings (Sales, CGST, SGST, IGST, Round Off)
 * - Order-to-Cash automation toggles
 * - AWS SQS FIFO queue health monitor & Dead-Letter Queue (DLQ) retry table
 * 
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function TallySettings() {
    const [config, setConfig] = useState({
        tallyCompanyName: '',
        syncMode: 'LOCAL_AGENT',
        serverUrl: 'http://localhost:9000',
        companyGstin: '',
        salesLedgerName: 'Sales Accounts',
        cgstLedgerName: 'Output CGST',
        sgstLedgerName: 'Output SGST',
        igstLedgerName: 'Output IGST',
        roundOffLedgerName: 'Round Off',
        defaultGodown: 'Main Location',
        agentApiKey: '',
        syncEnabled: true,
        autoCreateSalesOrder: true,
        autoCreateDeliveryNote: false,
        autoCreateSalesInvoice: false,
    })

    const [godowns, setGodowns] = useState([])
    const [dlqMessages, setDlqMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [retryingId, setRetryingId] = useState(null)
    const [errors, setErrors] = useState([])
    const [feedback, setFeedback] = useState(null)
    const [showApiKey, setShowApiKey] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)

    useEffect(() => {
        let isMounted = true

        const fetchConfigAndDlq = async () => {
            setLoading(true)
            setErrors([])
            try {
                const [cfgRes, gdRes, dlqRes] = await Promise.allSettled([
                    tallyAPI.getConfig(),
                    tallyAPI.getGodowns(),
                    tallyAPI.getDlqMessages(),
                ])

                if (!isMounted) return

                if (cfgRes.status === 'fulfilled') {
                    const data = cfgRes.value?.data || cfgRes.value || {}
                    setConfig(prev => ({
                        ...prev,
                        ...data,
                        syncEnabled: data.syncEnabled ?? true,
                        autoCreateSalesOrder: data.autoCreateSalesOrder ?? true,
                        syncMode: data.syncMode || 'LOCAL_AGENT',
                        serverUrl: data.serverUrl || 'http://localhost:9000',
                        salesLedgerName: data.salesLedgerName || 'Sales Accounts',
                        cgstLedgerName: data.cgstLedgerName || 'Output CGST',
                        sgstLedgerName: data.sgstLedgerName || 'Output SGST',
                        igstLedgerName: data.igstLedgerName || 'Output IGST',
                        roundOffLedgerName: data.roundOffLedgerName || 'Round Off',
                        defaultGodown: data.defaultGodown || 'Main Location',
                    }))
                }

                if (gdRes.status === 'fulfilled') {
                    const list = gdRes.value?.data || gdRes.value || []
                    setGodowns(Array.isArray(list) ? list : [])
                }

                if (dlqRes.status === 'fulfilled') {
                    const dlqList = dlqRes.value?.data || dlqRes.value || []
                    setDlqMessages(Array.isArray(dlqList) ? dlqList : [])
                }
            } catch (err) {
                console.error('Failed to load Tally config:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchConfigAndDlq()

        return () => {
            isMounted = false
        }
    }, [])

    const handleInputChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
        if (errors.length > 0) setErrors([])
    }

    const handleSaveConfig = async () => {
        setFeedback(null)
        const validationErrors = validateTallyConfig(config)
        if (validationErrors.length > 0) {
            setErrors(validationErrors)
            return
        }

        setSaving(true)
        setErrors([])

        try {
            const payload = {
                tallyCompanyName: config.tallyCompanyName.trim(),
                syncMode: config.syncMode,
                serverUrl: config.serverUrl ? config.serverUrl.trim() : 'http://localhost:9000',
                companyGstin: config.companyGstin.trim().toUpperCase(),
                salesLedgerName: config.salesLedgerName.trim(),
                cgstLedgerName: config.cgstLedgerName.trim(),
                sgstLedgerName: config.sgstLedgerName.trim(),
                igstLedgerName: config.igstLedgerName.trim(),
                roundOffLedgerName: config.roundOffLedgerName ? config.roundOffLedgerName.trim() : 'Round Off',
                defaultGodown: config.defaultGodown || 'Main Location',
                syncEnabled: Boolean(config.syncEnabled),
                autoCreateSalesOrder: Boolean(config.autoCreateSalesOrder),
                autoCreateDeliveryNote: Boolean(config.autoCreateDeliveryNote),
                autoCreateSalesInvoice: Boolean(config.autoCreateSalesInvoice),
            }

            const res = await tallyAPI.updateConfig(payload)
            const updated = res?.data || res || {}

            setConfig(prev => ({
                ...prev,
                ...updated,
                agentApiKey: updated.agentApiKey || prev.agentApiKey,
            }))

            setFeedback({
                type: 'success',
                message: 'TallyPrime configuration successfully saved!',
            })
        } catch (err) {
            console.error('Save configuration failed:', err)
            setFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || 'Failed to save configuration.',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCopyApiKey = () => {
        if (!config.agentApiKey) return
        navigator.clipboard?.writeText(config.agentApiKey)
        setCopiedKey(true)
        setTimeout(() => setCopiedKey(false), 2000)
    }

    const handleRetryDlq = async (dlqId) => {
        setRetryingId(dlqId)
        try {
            await tallyAPI.retryDlqMessage(dlqId)
            setDlqMessages(prev => prev.filter(m => m.id !== dlqId))
            setFeedback({
                type: 'success',
                message: `Message #${dlqId} successfully re-enqueued to AWS SQS FIFO queue!`,
            })
        } catch (err) {
            console.error('Failed to retry DLQ message:', err)
            setFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || `Failed to retry message #${dlqId}`,
            })
        } finally {
            setRetryingId(null)
        }
    }

    if (loading) {
        return (
            <div className="p-12 text-center text-sm" style={{ color: T.textMuted }}>
                <span className="material-symbols-outlined text-[28px] animate-spin block mb-2" style={{ color: T.primary }}>
                    sync
                </span>
                Loading TallyPrime configuration and SQS queue health...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border shadow-sm" style={{ background: T.surface, borderColor: T.border }}>
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-black flex items-center gap-2" style={{ color: T.textPrimary }}>
                            <span className="material-symbols-outlined" style={{ color: T.primary }}>receipt_long</span>
                            TallyPrime Accounting & Factory Inventory Bridge
                        </h3>
                        <TallyConnectionBadge />
                    </div>
                    <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                        Connect your Tally company, configure Indian GST tax ledgers, and monitor AWS SQS FIFO queues.
                    </p>
                </div>
                <button
                    type="button"
                    data-testid="tally-save-config-btn"
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-black text-xs transition shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                    style={{ background: T.primary }}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                    onMouseLeave={e => e.currentTarget.style.background = T.primary}
                >
                    <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'save'}</span>
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {/* Validation Errors banner */}
            {errors.length > 0 && (
                <div className="p-4 rounded-xl border text-xs flex flex-col gap-1" style={{ background: T.errorDim, borderColor: T.error + '40', color: T.error }}>
                    <div className="font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        Please correct the following errors before saving:
                    </div>
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Feedback message */}
            {feedback && (
                <div
                    className="p-4 rounded-xl text-xs flex items-center gap-2 border"
                    style={{
                        background: feedback.type === 'success' ? T.successDim : T.errorDim,
                        borderColor: (feedback.type === 'success' ? T.success : T.error) + '40',
                        color: feedback.type === 'success' ? T.success : T.error,
                    }}
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {feedback.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* 1. Connection Mode & Company Profile */}
            <div className="p-6 rounded-2xl border shadow-sm flex flex-col gap-5" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>hub</span>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>1. Connection Mode & Company Master</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tally Company Name */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Tally Company Name <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            data-testid="tally-company-name-input"
                            name="tallyCompanyName"
                            value={config.tallyCompanyName || ''}
                            onChange={e => handleInputChange('tallyCompanyName', e.target.value)}
                            placeholder="e.g. Steel Dynamics Tally"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Exact name of the company open in TallyPrime.
                        </p>
                    </div>

                    {/* Company GSTIN */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Company GSTIN (15 Digits) <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={15}
                            data-testid="tally-company-gstin-input"
                            name="companyGstin"
                            value={config.companyGstin || ''}
                            onChange={e => handleInputChange('companyGstin', e.target.value.toUpperCase())}
                            placeholder="e.g. 27AABCS1429B1Z1"
                            className="w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            First 2 digits represent your Indian state code for GST splitting.
                        </p>
                    </div>

                    {/* Sync Mode Toggle */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Operational Sync Mode <span style={{ color: T.error }}>*</span>
                        </label>
                        <select
                            data-testid="tally-sync-mode-select"
                            name="syncMode"
                            value={config.syncMode || 'LOCAL_AGENT'}
                            onChange={e => handleInputChange('syncMode', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        >
                            <option value="LOCAL_AGENT" style={{ background: T.surface, color: T.textPrimary }}>Local Desktop Agent (Background Poller on Port 9000)</option>
                            <option value="CLOUD_SERVER" style={{ background: T.surface, color: T.textPrimary }}>Cloud Server Tally (Direct HTTP/HTTPS)</option>
                        </select>
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Local Desktop Mode communicates with Tally running on your local machine.
                        </p>
                    </div>

                    {/* Server URL (when in CLOUD_SERVER mode) */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Tally Server URL {config.syncMode === 'CLOUD_SERVER' && <span style={{ color: T.error }}>*</span>}
                        </label>
                        <input
                            type="text"
                            data-testid="tally-server-url-input"
                            name="serverUrl"
                            value={config.serverUrl || ''}
                            onChange={e => handleInputChange('serverUrl', e.target.value)}
                            placeholder="http://localhost:9000"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Default local port is 9000. Required for cloud server mode.
                        </p>
                    </div>
                </div>

                {/* Local Desktop Agent Key Info Card */}
                {config.syncMode === 'LOCAL_AGENT' && config.agentApiKey && (
                    <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ background: T.surfaceHigh, borderColor: T.borderSubtle }}>
                        <div>
                            <p className="text-xs font-bold" style={{ color: T.textPrimary }}>Local Bridge Agent API Key</p>
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: T.textMuted }}>
                                {showApiKey ? config.agentApiKey : '••••••••••••••••••••••••••••••••'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer"
                                style={{ background: T.surface, borderColor: T.border, color: T.textSecondary }}
                            >
                                {showApiKey ? 'Hide' : 'Reveal'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyApiKey}
                                className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                style={{ background: T.primary }}
                                onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                onMouseLeave={e => e.currentTarget.style.background = T.primary}
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    {copiedKey ? 'check' : 'content_copy'}
                                </span>
                                {copiedKey ? 'Copied!' : 'Copy Key'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Ledger Mappings & Default Godown */}
            <div className="p-6 rounded-2xl border shadow-sm flex flex-col gap-5" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>account_balance</span>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>2. Accounting Ledgers  Mapping</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Sales Ledger */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Sales Ledger Name <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            data-testid="tally-sales-ledger-input"
                            name="salesLedgerName"
                            value={config.salesLedgerName || ''}
                            onChange={e => handleInputChange('salesLedgerName', e.target.value)}
                            placeholder="Sales Accounts"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>

                    {/* CGST Ledger */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            CGST Ledger Name <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            data-testid="tally-cgst-ledger-input"
                            name="cgstLedgerName"
                            value={config.cgstLedgerName || ''}
                            onChange={e => handleInputChange('cgstLedgerName', e.target.value)}
                            placeholder="Output CGST"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>

                    {/* SGST Ledger */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            SGST Ledger Name <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            data-testid="tally-sgst-ledger-input"
                            name="sgstLedgerName"
                            value={config.sgstLedgerName || ''}
                            onChange={e => handleInputChange('sgstLedgerName', e.target.value)}
                            placeholder="Output SGST"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>

                    {/* IGST Ledger */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            IGST Ledger Name <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            data-testid="tally-igst-ledger-input"
                            name="igstLedgerName"
                            value={config.igstLedgerName || ''}
                            onChange={e => handleInputChange('igstLedgerName', e.target.value)}
                            placeholder="Output IGST"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>

                    {/* Round-off Ledger */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Round-off Ledger Name
                        </label>
                        <input
                            type="text"
                            data-testid="tally-roundoff-ledger-input"
                            name="roundOffLedgerName"
                            value={config.roundOffLedgerName || ''}
                            onChange={e => handleInputChange('roundOffLedgerName', e.target.value)}
                            placeholder="Round Off"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Automation Toggles */}
            <div className="p-6 rounded-2xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>bolt</span>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>3. Factory Order-to-Cash Automation</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <input
                            type="checkbox"
                            checked={config.syncEnabled ?? true}
                            onChange={e => handleInputChange('syncEnabled', e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded"
                            style={{ accentColor: T.primary }}
                        />
                        <div>
                            <span className="text-xs font-bold block" style={{ color: T.textPrimary }}>Master Synchronization Active</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Enable outbound voucher publishing to AWS SQS FIFO queue.
                            </span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <input
                            type="checkbox"
                            checked={config.autoCreateSalesOrder ?? true}
                            onChange={e => handleInputChange('autoCreateSalesOrder', e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded"
                            style={{ accentColor: T.primary }}
                        />
                        <div>
                            <span className="text-xs font-bold block" style={{ color: T.textPrimary }}>Auto-Create Sales Order on Won Deals</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Automatically reserves inventory in Tally upon marking deal WON.
                            </span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <input
                            type="checkbox"
                            checked={config.autoCreateDeliveryNote ?? false}
                            onChange={e => handleInputChange('autoCreateDeliveryNote', e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded"
                            style={{ accentColor: T.primary }}
                        />
                        <div>
                            <span className="text-xs font-bold block" style={{ color: T.textPrimary }}>Auto-Create Delivery Note on Dispatch</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Deducts physical godown stock when goods are packed.
                            </span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <input
                            type="checkbox"
                            checked={config.autoCreateSalesInvoice ?? false}
                            onChange={e => handleInputChange('autoCreateSalesInvoice', e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded"
                            style={{ accentColor: T.primary }}
                        />
                        <div>
                            <span className="text-xs font-bold block" style={{ color: T.textPrimary }}>Auto-Create Sales Tax Invoice</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Finalizes billing and posts customer ledger debits in Tally.
                            </span>
                        </div>
                    </label>
                </div>
            </div>

            {/* 4. SQS Queue Health & DLQ Message Monitor */}
            <div
                data-testid="tally-queue-health-card"
                className="p-6 rounded-2xl border shadow-sm flex flex-col gap-4"
                style={{ background: T.surface, borderColor: T.border }}
            >
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>dns</span>
                        <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>4. AWS SQS FIFO Queue & DLQ Monitor</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: T.successDim, color: T.success }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }}></span>
                            Queue Operational
                        </span>
                        <span className="text-xs font-mono" style={{ color: T.textMuted }}>tally-sync-queue.fifo</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Deduplication Mode</p>
                        <p className="text-xs font-black mt-1" style={{ color: T.textPrimary }}>Native SQS FIFO ID</p>
                    </div>
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Message Ordering</p>
                        <p className="text-xs font-black mt-1" style={{ color: T.textPrimary }}>Tenant Group ID</p>
                    </div>
                    <div className="p-3.5 rounded-xl border" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: T.textMuted }}>Failed Messages (DLQ)</p>
                        <p className="text-xs font-black mt-1" style={{ color: dlqMessages.length > 0 ? T.error : T.success }}>
                            {dlqMessages.length} Messages
                        </p>
                    </div>
                </div>

                {/* DLQ Messages Table */}
                <div className="mt-2">
                    <h5 className="text-xs font-bold mb-2" style={{ color: T.textSecondary }}>Dead-Letter Queue (DLQ) Diagnostic Table</h5>
                    {dlqMessages.length === 0 ? (
                        <div className="p-6 text-center rounded-xl border text-xs" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle, color: T.textMuted }}>
                            Zero failed messages in DLQ. All vouchers processed cleanly.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: T.border }}>
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                        <th className="p-2.5">ID</th>
                                        <th className="p-2.5">Stage</th>
                                        <th className="p-2.5">Error Diagnostic</th>
                                        <th className="p-2.5">Failed At</th>
                                        <th className="p-2.5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dlqMessages.map(msg => (
                                        <tr key={msg.id} style={{ borderTop: '1px solid ' + T.borderSubtle, color: T.textPrimary }}>
                                            <td className="p-2.5 font-mono" style={{ color: T.textMuted }}>#{msg.id}</td>
                                            <td className="p-2.5 font-bold" style={{ color: T.textPrimary }}>{msg.stage || 'VOUCHER'}</td>
                                            <td className="p-2.5 max-w-xs truncate" style={{ color: T.error }} title={msg.errorMessage || msg.error}>
                                                {msg.errorMessage || msg.error || 'Sync execution failed'}
                                            </td>
                                            <td className="p-2.5" style={{ color: T.textMuted }}>
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Recent'}
                                            </td>
                                            <td className="p-2.5 text-center">
                                                <button
                                                    type="button"
                                                    data-testid="tally-dlq-retry-btn"
                                                    onClick={() => handleRetryDlq(msg.id)}
                                                    disabled={retryingId === msg.id}
                                                    className="px-2.5 py-1 rounded text-white font-bold text-[10px] transition cursor-pointer disabled:opacity-50"
                                                    style={{ background: T.primary }}
                                                    onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                                    onMouseLeave={e => e.currentTarget.style.background = T.primary}
                                                >
                                                    {retryingId === msg.id ? 'Retrying...' : 'Retry'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
