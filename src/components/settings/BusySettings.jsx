import React, { useEffect, useState } from 'react'
import busyAPI from '../../api/busy'
import { validateBusyConfig } from '../../utils/busyGstUtils'
import { T } from '../../constants/theme'
import BusyConnectionBadge from '../deals/BusyConnectionBadge'

/**
 * BusySettings
 * Admin configuration panel for BUSY ERP accounting & inventory bridge:
 * - Section 1: Connection Mode & Company Master (Port 981, company code COMP0001, GSTIN)
 * - Section 2: Local Bridge Agent API Key widget & /BusyBridge.zip binary download
 * - Section 3: Dynamic Material Center Selector (defaulting to Main Store)
 * - Section 4: Accounting Accounts Mapping & Discovered Masters (Sales, CGST, SGST, IGST, Round Off)
 * - Section 5: Synced Master Catalog Table (search & filter inventory discovered from BUSY)
 * - Section 6: AWS SQS FIFO Queue & Dead-Letter Queue (DLQ) Monitor with Retry & Clear
 * 
 * Styled with CRM Central Theme (T) to adapt seamlessly to both Light and Dark modes.
 */
export default function BusySettings() {
    const [config, setConfig] = useState({
        busyCompanyName: '',
        busyCompanyCode: 'COMP0001',
        syncMode: 'LOCAL_AGENT',
        serverUrl: 'http://localhost:981',
        companyGstin: '',
        salesAccountName: 'Sales - GST',
        cgstAccountName: 'Output CGST',
        sgstAccountName: 'Output SGST',
        igstAccountName: 'Output IGST',
        roundOffAccountName: 'Round Off',
        defaultMaterialCenter: 'Main Store',
        agentApiKey: '',
        syncEnabled: true,
        autoCreateSalesOrder: true,
        autoCreateDeliveryNote: false,
        autoCreateSalesInvoice: false,
    })

    const [materialCenters, setMaterialCenters] = useState([])
    const [catalogItems, setCatalogItems] = useState([])
    const [catalogSearch, setCatalogSearch] = useState('')
    const [dlqMessages, setDlqMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [retryingId, setRetryingId] = useState(null)
    const [clearingDlq, setClearingDlq] = useState(false)
    const [downloadingBridge, setDownloadingBridge] = useState(false)
    const [errors, setErrors] = useState([])
    const [feedback, setFeedback] = useState(null)
    const [showApiKey, setShowApiKey] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)
    const [discoveredMasters, setDiscoveredMasters] = useState(null)
    const [refreshingMasters, setRefreshingMasters] = useState(false)
    const [customInputs, setCustomInputs] = useState({})

    const toggleCustomInput = (field) => {
        setCustomInputs(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const handleRefreshMasters = async () => {
        setRefreshingMasters(true)
        try {
            const [mastersRes, mcRes, itemsRes] = await Promise.allSettled([
                busyAPI.getMasters(),
                busyAPI.getMaterialCenters(),
                busyAPI.getItems({ size: 100 }),
            ])

            if (mastersRes.status === 'fulfilled' && mastersRes.value?.data) {
                setDiscoveredMasters(mastersRes.value.data)
            }
            if (mcRes.status === 'fulfilled' && mcRes.value?.data) {
                const list = mcRes.value.data
                setMaterialCenters(Array.isArray(list) ? list : [])
            }
            if (itemsRes.status === 'fulfilled' && itemsRes.value?.data) {
                const list = itemsRes.value.data
                setCatalogItems(Array.isArray(list) ? list : [])
            }

            setFeedback({ type: 'success', message: 'Successfully refreshed Chart of Accounts, Material Centers, and Inventory from BUSY ERP!' })
        } catch (e) {
            setFeedback({ type: 'error', message: 'Failed to fetch masters from BUSY ERP. Ensure BUSY Bridge is online on Port 981.' })
        } finally {
            setRefreshingMasters(false)
        }
    }

    useEffect(() => {
        let isMounted = true

        const fetchConfigAndMasters = async () => {
            setLoading(true)
            setErrors([])
            try {
                const [cfgRes, mcRes, dlqRes, mastersRes, itemsRes] = await Promise.allSettled([
                    busyAPI.getConfig(),
                    busyAPI.getMaterialCenters(),
                    busyAPI.getDlqMessages(),
                    busyAPI.getMasters(),
                    busyAPI.getItems({ size: 100 }),
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
                        serverUrl: data.serverUrl || 'http://localhost:981',
                        busyCompanyCode: data.busyCompanyCode || 'COMP0001',
                        salesAccountName: data.salesAccountName || 'Sales - GST',
                        cgstAccountName: data.cgstAccountName || 'Output CGST',
                        sgstAccountName: data.sgstAccountName || 'Output SGST',
                        igstAccountName: data.igstAccountName || 'Output IGST',
                        roundOffAccountName: data.roundOffAccountName || 'Round Off',
                        defaultMaterialCenter: data.defaultMaterialCenter || 'Main Store',
                    }))
                }

                if (mcRes.status === 'fulfilled') {
                    const list = mcRes.value?.data || mcRes.value || []
                    setMaterialCenters(Array.isArray(list) ? list : [])
                }

                if (dlqRes.status === 'fulfilled') {
                    const dlqList = dlqRes.value?.data || dlqRes.value || []
                    setDlqMessages(Array.isArray(dlqList) ? dlqList : [])
                }

                if (mastersRes.status === 'fulfilled' && mastersRes.value?.data) {
                    setDiscoveredMasters(mastersRes.value.data)
                }

                if (itemsRes.status === 'fulfilled') {
                    const list = itemsRes.value?.data || itemsRes.value || []
                    setCatalogItems(Array.isArray(list) ? list : [])
                }
            } catch (err) {
                console.error('Failed to load BUSY config:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchConfigAndMasters()

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
        const validationErrors = validateBusyConfig(config)
        if (validationErrors.length > 0) {
            setErrors(validationErrors)
            return
        }

        setSaving(true)
        setErrors([])

        try {
            const payload = {
                busyCompanyName: config.busyCompanyName.trim(),
                busyCompanyCode: config.busyCompanyCode ? config.busyCompanyCode.trim() : 'COMP0001',
                syncMode: config.syncMode,
                serverUrl: config.serverUrl ? config.serverUrl.trim() : 'http://localhost:981',
                companyGstin: config.companyGstin.trim().toUpperCase(),
                salesAccountName: config.salesAccountName.trim(),
                cgstAccountName: config.cgstAccountName.trim(),
                sgstAccountName: config.sgstAccountName.trim(),
                igstAccountName: config.igstAccountName.trim(),
                roundOffAccountName: config.roundOffAccountName ? config.roundOffAccountName.trim() : 'Round Off',
                defaultMaterialCenter: config.defaultMaterialCenter || 'Main Store',
                syncEnabled: Boolean(config.syncEnabled),
                autoCreateSalesOrder: Boolean(config.autoCreateSalesOrder),
                autoCreateDeliveryNote: Boolean(config.autoCreateDeliveryNote),
                autoCreateSalesInvoice: Boolean(config.autoCreateSalesInvoice),
            }

            const res = await busyAPI.updateConfig(payload)
            const updated = res?.data || res || {}

            setConfig(prev => ({
                ...prev,
                ...updated,
                agentApiKey: updated.agentApiKey || prev.agentApiKey,
            }))

            setFeedback({
                type: 'success',
                message: 'BUSY ERP configuration successfully saved!',
            })
        } catch (err) {
            console.error('Save BUSY configuration failed:', err)
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

    const handleDownloadBridge = () => {
        const link = document.createElement('a')
        link.href = '/BusyBridge.zip'
        link.setAttribute('download', 'BusyBridge.zip')
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        setFeedback({
            type: 'success',
            message: 'BusyBridge.zip download started! Extract and run on the host where BUSY ERP is installed.',
        })
    }

    const handleRetryDlq = async (dlqId) => {
        setRetryingId(dlqId)
        try {
            await busyAPI.retryDlqMessage(dlqId)
            setDlqMessages(prev => prev.filter(m => m.id !== dlqId))
            setFeedback({
                type: 'success',
                message: `Message #${dlqId} successfully re-enqueued to Cloud Sync Queue!`,
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

    const handleClearDlq = async () => {
        if (dlqMessages.length === 0) return
        setClearingDlq(true)
        try {
            await busyAPI.clearDlqMessages()
            setDlqMessages([])
            setFeedback({
                type: 'success',
                message: 'All failed messages in the BUSY DLQ have been cleared.',
            })
        } catch (err) {
            console.error('Failed to clear DLQ:', err)
            setFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || 'Failed to clear DLQ.',
            })
        } finally {
            setClearingDlq(false)
        }
    }

    const filteredCatalog = catalogItems.filter(item => {
        if (!catalogSearch.trim()) return true
        const q = catalogSearch.toLowerCase()
        const name = (item.itemName || item.name || '').toLowerCase()
        const code = (item.partNumber || item.itemCode || item.sku || '').toLowerCase()
        const hsn = (item.hsnCode || '').toLowerCase()
        return name.includes(q) || code.includes(q) || hsn.includes(q)
    })

    if (loading) {
        return (
            <div className="p-12 text-center text-sm" style={{ color: T.textMuted }}>
                <span className="material-symbols-outlined text-[28px] animate-spin block mb-2" style={{ color: T.primary }}>
                    sync
                </span>
                Loading BUSY ERP configuration, masters, and queue health...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Header banner */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-all duration-300"
                style={{
                    background: T.surface,
                    borderColor: T.border,
                    boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                }}
            >
                <div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent 0%, ${T.primary}50 50%, transparent 100%)` }}
                />
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                            background: T.primaryDim,
                            border: `1px solid ${T.primary}35`,
                            boxShadow: `0 4px 14px ${T.primary}20`,
                        }}
                    >
                        <span className="material-symbols-outlined filled text-[24px]" style={{ color: T.primary }}>
                            receipt_long
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black tracking-tight" style={{ color: T.textPrimary }}>
                                BUSY ERP Accounting &amp; Material Center Bridge
                            </h3>
                            <BusyConnectionBadge />
                        </div>
                        <p className="text-xs sm:text-sm mt-0.5 leading-relaxed" style={{ color: T.textMuted }}>
                            Connect your BUSY ERP instance, configure Material Centers, and manage Cloud Sync Queue fulfillment.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    data-testid="busy-save-config-btn"
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="crm-btn-primary shrink-0"
                >
                    <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'save'}</span>
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
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

            {/* Section 1 & 2: Connection Mode, Company Master, Agent API Key, and Bridge Download */}
            <div className="p-6 rounded-3xl border shadow-sm flex flex-col gap-5" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: T.primaryDim, color: T.primary }}>01</span>
                    <div>
                        <h4 className="text-sm font-extrabold tracking-tight" style={{ color: T.textPrimary }}>Connection Mode &amp; Company Profile</h4>
                        <p className="text-[11px]" style={{ color: T.textMuted }}>Port 981 bridge URL, BUSY company name, and GSTIN registration</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BUSY Company Name */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            BUSY Company Name <span style={{ color: T.error }}>*</span>
                        </label>
                        <input
                            type="text"
                            data-testid="busy-company-name-input"
                            name="busyCompanyName"
                            value={config.busyCompanyName || ''}
                            onChange={e => handleInputChange('busyCompanyName', e.target.value)}
                            placeholder="e.g. Steel Dynamics BUSY"
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Exact company name as registered in BUSY 21.
                        </p>
                    </div>

                    {/* BUSY Company Code */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            BUSY Company Code (e.g. COMP0001)
                        </label>
                        <input
                            type="text"
                            data-testid="busy-company-code-input"
                            name="busyCompanyCode"
                            value={config.busyCompanyCode || ''}
                            onChange={e => handleInputChange('busyCompanyCode', e.target.value.toUpperCase())}
                            placeholder="COMP0001"
                            className="w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Internal short code configured in BUSY desktop directory.
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
                            data-testid="busy-company-gstin-input"
                            name="companyGstin"
                            value={config.companyGstin || ''}
                            onChange={e => handleInputChange('companyGstin', e.target.value.toUpperCase())}
                            placeholder="e.g. 27AABCS1429B1Z1"
                            className="w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Used for Section 170 Indian GST Intrastate vs Interstate splitting.
                        </p>
                    </div>

                    {/* Operational Sync Mode */}
                    <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            Operational Sync Mode <span style={{ color: T.error }}>*</span>
                        </label>
                        <select
                            data-testid="busy-sync-mode-select"
                            name="syncMode"
                            value={config.syncMode || 'LOCAL_AGENT'}
                            onChange={e => handleInputChange('syncMode', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        >
                            <option value="LOCAL_AGENT" style={{ background: T.surface, color: T.textPrimary }}>Local Desktop Bridge (Port 981 Gateway)</option>
                            <option value="CLOUD_SERVER" style={{ background: T.surface, color: T.textPrimary }}>Cloud Server BUSY (Direct HTTP/HTTPS)</option>
                        </select>
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            Local mode uses BusyBridge.exe daemon running on http://127.0.0.1:981.
                        </p>
                    </div>

                    {/* Port 981 Server URL Input */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                            BUSY Bridge Gateway URL (Default Port 981) <span style={{ color: T.error }}>*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                data-testid="busy-server-url-input"
                                name="serverUrl"
                                value={config.serverUrl || ''}
                                onChange={e => handleInputChange('serverUrl', e.target.value)}
                                placeholder="http://localhost:981"
                                className="w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none transition focus:ring-2"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            />
                            <button
                                type="button"
                                onClick={() => handleInputChange('serverUrl', 'http://localhost:981')}
                                className="px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap cursor-pointer transition"
                                style={{ background: T.surface, borderColor: T.border, color: T.textSecondary }}
                                title="Reset to default Port 981"
                            >
                                Default Port 981
                            </button>
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                            BUSY local bridge agent communicates on Port 981. Must be accessible by BusyBridge background service.
                        </p>
                    </div>
                </div>

                {/* Section 2: Local Bridge Agent Key Card & Download Zip Button */}
                {config.agentApiKey && (
                    <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2" style={{ background: T.surfaceHigh, borderColor: T.borderSubtle }}>
                        <div>
                            <p className="text-xs font-bold" style={{ color: T.textPrimary }}>BUSY Bridge Agent Authentication Key</p>
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: T.textMuted }}>
                                {showApiKey ? config.agentApiKey : '••••••••••••••••••••••••••••••••'}
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
                                Paste into <code className="px-1 py-0.5 rounded bg-black/20 text-emerald-400 font-mono">config.json</code> of BusyBridge daemon.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <a
                                href="/BusyBridge.zip"
                                download="BusyBridge.zip"
                                data-testid="busy-download-bridge-btn"
                                className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
                                style={{ background: T.surface, borderColor: T.border, color: T.textPrimary, textDecoration: 'none' }}
                                title="Download Windows Desktop Bridge (BusyBridge.zip)"
                            >
                                <span className="material-symbols-outlined text-[14px]">download</span>
                                <span>Download Bridge (.zip)</span>
                            </a>
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
                                className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
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

            {/* Section 3: Dynamic Material Center Selector */}
            <div className="p-6 rounded-3xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-2" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: T.primaryDim, color: T.primary }}>02</span>
                        <div>
                            <h4 className="text-sm font-extrabold tracking-tight" style={{ color: T.textPrimary }}>Default Material Center / Store Location</h4>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>Warehouse inventory allocation for new deals and quotations</p>
                        </div>
                    </div>
                    {materialCenters.length > 0 && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {materialCenters.length} Material Centers Discovered
                        </span>
                    )}
                </div>

                <div className="max-w-md">
                    <label className="block text-xs font-bold mb-1" style={{ color: T.textSecondary }}>
                        Default Warehouse / Store Location <span style={{ color: T.error }}>*</span>
                    </label>
                    <select
                        data-testid="busy-material-center-select"
                        name="defaultMaterialCenter"
                        value={config.defaultMaterialCenter || 'Main Store'}
                        onChange={e => handleInputChange('defaultMaterialCenter', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition focus:ring-2 cursor-pointer"
                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                    >
                        {materialCenters.length > 0 ? (
                            materialCenters.map((mc, idx) => {
                                const name = typeof mc === 'string' ? mc : (mc?.centerName || mc?.materialCenterName || mc?.name || '')
                                if (!name) return null
                                return (
                                    <option key={mc.id || name || idx} value={name} style={{ background: T.surface, color: T.textPrimary }}>
                                        {name}
                                    </option>
                                )
                            })
                        ) : (
                            <>
                                <option value="Main Store">Main Store (Default)</option>
                                <option value="Plant 1 Warehouse">Plant 1 Warehouse</option>
                                <option value="Central Raw Material Depot">Central Raw Material Depot</option>
                            </>
                        )}
                    </select>
                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                        Default material center assigned when generating BUSY Sales Orders and Sale Challans. Defaults to "Main Store".
                    </p>
                </div>
            </div>

            {/* Section 4: Accounting Accounts Mapping & Discovered Masters */}
            <div className="p-6 rounded-3xl border shadow-sm flex flex-col gap-5" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-2" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: T.primaryDim, color: T.primary }}>03</span>
                        <div>
                            <h4 className="text-sm font-extrabold tracking-tight" style={{ color: T.textPrimary }}>Accounting Accounts &amp; GST Ledger Mapping</h4>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>Map Sales, CGST, SGST, IGST, and Round-Off accounts to BUSY Ledgers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {discoveredMasters?.totalCount > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                {discoveredMasters.totalCount} Masters Discovered from BUSY
                            </span>
                        ) : (
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Auto-discovered when BusyBridge daemon syncs
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleRefreshMasters}
                            disabled={refreshingMasters}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer disabled:opacity-50"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            title="Refresh Chart of Accounts live from BUSY ERP"
                        >
                            <span className={`material-symbols-outlined text-[14px] ${refreshingMasters ? 'animate-spin' : ''}`}>sync</span>
                            <span>{refreshingMasters ? 'Syncing...' : 'Sync from BUSY'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Sales Account */}
                    {(() => {
                        const hasOptions = discoveredMasters?.salesAccounts && discoveredMasters.salesAccounts.length > 0
                        const isCustom = customInputs['salesAccountName']
                        const val = config.salesAccountName || ''
                        return (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold" style={{ color: T.textSecondary }}>
                                        Sales Account <span style={{ color: T.error }}>*</span>
                                    </label>
                                    {hasOptions && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomInput('salesAccountName')}
                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-0.5"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">{isCustom ? "list" : "edit"}</span>
                                            <span>{isCustom ? "Select from BUSY" : "Custom"}</span>
                                        </button>
                                    )}
                                </div>
                                {!isCustom && hasOptions ? (
                                    <select
                                        data-testid="busy-sales-account-input"
                                        name="salesAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('salesAccountName', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2 font-medium cursor-pointer"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    >
                                        <option value="">-- Select Sales Account --</option>
                                        {discoveredMasters.salesAccounts.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                        {val && !discoveredMasters.salesAccounts.includes(val) && (
                                            <option value={val}>{val} (Current)</option>
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        data-testid="busy-sales-account-input"
                                        name="salesAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('salesAccountName', e.target.value)}
                                        placeholder="Sales - GST"
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    />
                                )}
                            </div>
                        )
                    })()}

                    {/* CGST Account */}
                    {(() => {
                        const hasOptions = discoveredMasters?.taxAccounts && discoveredMasters.taxAccounts.length > 0
                        const isCustom = customInputs['cgstAccountName']
                        const val = config.cgstAccountName || ''
                        return (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold" style={{ color: T.textSecondary }}>
                                        CGST Account <span style={{ color: T.error }}>*</span>
                                    </label>
                                    {hasOptions && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomInput('cgstAccountName')}
                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-0.5"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">{isCustom ? "list" : "edit"}</span>
                                            <span>{isCustom ? "Select from BUSY" : "Custom"}</span>
                                        </button>
                                    )}
                                </div>
                                {!isCustom && hasOptions ? (
                                    <select
                                        data-testid="busy-cgst-account-input"
                                        name="cgstAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('cgstAccountName', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2 font-medium cursor-pointer"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    >
                                        <option value="">-- Select CGST Account --</option>
                                        {discoveredMasters.taxAccounts.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                        {val && !discoveredMasters.taxAccounts.includes(val) && (
                                            <option value={val}>{val} (Current)</option>
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        data-testid="busy-cgst-account-input"
                                        name="cgstAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('cgstAccountName', e.target.value)}
                                        placeholder="Output CGST"
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    />
                                )}
                            </div>
                        )
                    })()}

                    {/* SGST Account */}
                    {(() => {
                        const hasOptions = discoveredMasters?.taxAccounts && discoveredMasters.taxAccounts.length > 0
                        const isCustom = customInputs['sgstAccountName']
                        const val = config.sgstAccountName || ''
                        return (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold" style={{ color: T.textSecondary }}>
                                        SGST Account <span style={{ color: T.error }}>*</span>
                                    </label>
                                    {hasOptions && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomInput('sgstAccountName')}
                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-0.5"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">{isCustom ? "list" : "edit"}</span>
                                            <span>{isCustom ? "Select from BUSY" : "Custom"}</span>
                                        </button>
                                    )}
                                </div>
                                {!isCustom && hasOptions ? (
                                    <select
                                        data-testid="busy-sgst-account-input"
                                        name="sgstAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('sgstAccountName', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2 font-medium cursor-pointer"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    >
                                        <option value="">-- Select SGST Account --</option>
                                        {discoveredMasters.taxAccounts.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                        {val && !discoveredMasters.taxAccounts.includes(val) && (
                                            <option value={val}>{val} (Current)</option>
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        data-testid="busy-sgst-account-input"
                                        name="sgstAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('sgstAccountName', e.target.value)}
                                        placeholder="Output SGST"
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    />
                                )}
                            </div>
                        )
                    })()}

                    {/* IGST Account */}
                    {(() => {
                        const hasOptions = discoveredMasters?.taxAccounts && discoveredMasters.taxAccounts.length > 0
                        const isCustom = customInputs['igstAccountName']
                        const val = config.igstAccountName || ''
                        return (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold" style={{ color: T.textSecondary }}>
                                        IGST Account <span style={{ color: T.error }}>*</span>
                                    </label>
                                    {hasOptions && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomInput('igstAccountName')}
                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-0.5"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">{isCustom ? "list" : "edit"}</span>
                                            <span>{isCustom ? "Select from BUSY" : "Custom"}</span>
                                        </button>
                                    )}
                                </div>
                                {!isCustom && hasOptions ? (
                                    <select
                                        data-testid="busy-igst-account-input"
                                        name="igstAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('igstAccountName', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2 font-medium cursor-pointer"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    >
                                        <option value="">-- Select IGST Account --</option>
                                        {discoveredMasters.taxAccounts.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                        {val && !discoveredMasters.taxAccounts.includes(val) && (
                                            <option value={val}>{val} (Current)</option>
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        data-testid="busy-igst-account-input"
                                        name="igstAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('igstAccountName', e.target.value)}
                                        placeholder="Output IGST"
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    />
                                )}
                            </div>
                        )
                    })()}

                    {/* Round-off Account */}
                    {(() => {
                        const hasOptions = discoveredMasters?.roundOffAccounts && discoveredMasters.roundOffAccounts.length > 0
                        const isCustom = customInputs['roundOffAccountName']
                        const val = config.roundOffAccountName || ''
                        return (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold" style={{ color: T.textSecondary }}>
                                        Round-off Account
                                    </label>
                                    {hasOptions && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomInput('roundOffAccountName')}
                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-0.5"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">{isCustom ? "list" : "edit"}</span>
                                            <span>{isCustom ? "Select from BUSY" : "Custom"}</span>
                                        </button>
                                    )}
                                </div>
                                {!isCustom && hasOptions ? (
                                    <select
                                        data-testid="busy-roundoff-account-input"
                                        name="roundOffAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('roundOffAccountName', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2 font-medium cursor-pointer"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    >
                                        <option value="">-- Select Round-Off Account --</option>
                                        {discoveredMasters.roundOffAccounts.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                        {val && !discoveredMasters.roundOffAccounts.includes(val) && (
                                            <option value={val}>{val} (Current)</option>
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        data-testid="busy-roundoff-account-input"
                                        name="roundOffAccountName"
                                        value={val}
                                        onChange={e => handleInputChange('roundOffAccountName', e.target.value)}
                                        placeholder="Round Off"
                                        className="w-full px-3 py-2 rounded-xl border text-xs outline-none transition focus:ring-2"
                                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                    />
                                )}
                            </div>
                        )
                    })()}
                </div>
            </div>

            {/* Automation Toggles */}
            <div className="p-6 rounded-2xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>bolt</span>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>Automation & Order-to-Cash Triggers</h4>
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
                                Enable outbound voucher publishing to the Cloud Sync Queue for BUSY ERP.
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
                                Automatically reserves inventory in BUSY upon marking deal WON.
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
                            <span className="text-xs font-bold block" style={{ color: T.textPrimary }}>Auto-Create Sale Challan on Dispatch</span>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                Deducts physical Material Center stock when goods are marked dispatched.
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
                                Finalizes billing and posts customer ledger debits into BUSY ERP.
                            </span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Section 5: Synced Masters Catalog Table */}
            <div className="p-6 rounded-3xl border shadow-sm flex flex-col gap-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: T.primaryDim, color: T.primary }}>04</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold tracking-tight" style={{ color: T.textPrimary }}>Synced Master Catalog &amp; Inventory Items</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-neutral-500/10 text-neutral-400">
                                    {filteredCatalog.length} of {catalogItems.length} items
                                </span>
                            </div>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>Items, stock units, and GST tax codes discovered from BUSY</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={catalogSearch}
                                onChange={e => setCatalogSearch(e.target.value)}
                                placeholder="Search catalog items..."
                                className="px-3 py-1.5 pl-8 rounded-xl border text-xs outline-none transition focus:ring-2 w-48 sm:w-64"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            />
                            <span className="material-symbols-outlined text-[16px] absolute left-2.5 top-2" style={{ color: T.textMuted }}>
                                search
                            </span>
                        </div>
                    </div>
                </div>

                {catalogItems.length === 0 ? (
                    <div className="p-8 text-center rounded-xl border text-xs" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle, color: T.textMuted }}>
                        No inventory items discovered yet. When BusyBridge connects on Port 981, items will automatically populate here.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: T.border }}>
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                    <th className="p-2.5">Item Name</th>
                                    <th className="p-2.5">Part No / Code</th>
                                    <th className="p-2.5">HSN Code</th>
                                    <th className="p-2.5">GST Rate</th>
                                    <th className="p-2.5">Default Center Stock</th>
                                    <th className="p-2.5 text-right">Total Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCatalog.slice(0, 20).map((item, idx) => {
                                    const name = item.itemName || item.name || `Item #${idx + 1}`
                                    const part = item.partNumber || item.itemCode || item.sku || '-'
                                    const hsn = item.hsnCode || '-'
                                    const rate = item.gstRate != null ? `${item.gstRate}%` : '18%'
                                    const totalBal = item.closingBalance ?? item.balance ?? 0

                                    // Material center balance preview
                                    const mcBalances = item.materialCenterBalances || item.materialCenters || item.centerBalances || []
                                    const matchedCenter = mcBalances.find(m => {
                                        const cName = typeof m === 'string' ? m : (m?.centerName || m?.materialCenterName || m?.name)
                                        return cName === config.defaultMaterialCenter
                                    })
                                    const mainBal = matchedCenter?.balance ?? matchedCenter?.quantity ?? '-'

                                    return (
                                        <tr key={idx} style={{ borderTop: '1px solid ' + T.borderSubtle, color: T.textPrimary }}>
                                            <td className="p-2.5 font-bold">{name}</td>
                                            <td className="p-2.5 font-mono text-[11px]" style={{ color: T.textMuted }}>{part}</td>
                                            <td className="p-2.5 font-mono text-[11px]" style={{ color: T.textMuted }}>{hsn}</td>
                                            <td className="p-2.5">{rate}</td>
                                            <td className="p-2.5">
                                                <span className="font-semibold text-emerald-400">
                                                    {mainBal !== '-' ? `${mainBal} Nos` : 'Global'}
                                                </span>
                                            </td>
                                            <td className="p-2.5 text-right font-black" style={{ color: T.primary }}>
                                                {totalBal} Nos
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Section 6: SQS FIFO Queue Health & DLQ Message Monitor */}
            <div
                data-testid="busy-queue-health-card"
                className="p-6 rounded-3xl border shadow-sm flex flex-col gap-4"
                style={{ background: T.surface, borderColor: T.border }}
            >
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: T.borderSubtle }}>
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: T.primaryDim, color: T.primary }}>05</span>
                        <div>
                            <h4 className="text-sm font-extrabold tracking-tight" style={{ color: T.textPrimary }}>Cloud Sync Queue &amp; Failed Jobs Monitor</h4>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>Guaranteed message ordering, deduplication, and failure diagnostics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: T.successDim, color: T.success }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }}></span>
                            Queue Operational
                        </span>
                        <span className="text-xs font-mono" style={{ color: T.textMuted }}>busy-sync-queue.fifo</span>
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
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-bold" style={{ color: T.textSecondary }}>Dead-Letter Queue (DLQ) Diagnostic Table</h5>
                        {dlqMessages.length > 0 && (
                            <button
                                type="button"
                                data-testid="busy-dlq-clear-btn"
                                onClick={handleClearDlq}
                                disabled={clearingDlq}
                                className="px-3 py-1 rounded-lg border text-xs font-bold text-red-400 border-red-500/30 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-50"
                            >
                                {clearingDlq ? 'Clearing...' : 'Clear All DLQ'}
                            </button>
                        )}
                    </div>

                    {dlqMessages.length === 0 ? (
                        <div className="p-6 text-center rounded-xl border text-xs" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle, color: T.textMuted }}>
                            Zero failed messages in BUSY DLQ. All vouchers processed cleanly.
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
                                            <td className="p-2.5 font-bold" style={{ color: T.textPrimary }}>{msg.stage || msg.voucherType || 'VOUCHER'}</td>
                                            <td className="p-2.5 max-w-xs truncate" style={{ color: T.error }} title={msg.errorMessage || msg.error}>
                                                {msg.errorMessage || msg.error || 'BUSY voucher sync execution failed'}
                                            </td>
                                            <td className="p-2.5" style={{ color: T.textMuted }}>
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Recent'}
                                            </td>
                                            <td className="p-2.5 text-center">
                                                <button
                                                    type="button"
                                                    data-testid="busy-dlq-retry-btn"
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
