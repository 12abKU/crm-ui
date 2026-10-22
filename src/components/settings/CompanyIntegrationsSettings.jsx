import { useState, useEffect } from 'react'
import {
    IconPlug,
    IconCopy,
    IconCheck,
    IconEye,
    IconEyeOff,
    IconRefresh,
    IconBuildingStore,
    IconBriefcase,
    IconDeviceFloppy,
    IconTrash,
    IconAlertTriangle,
    IconCode,
    IconTerminal2,
    IconBrandPhp,
    IconInfoCircle,
} from '@tabler/icons-react'
import { toast } from 'react-hot-toast'
import { T } from '../../constants/theme'
import { companyIntegrationsAPI } from '../../api/integrations'
import { extractApiErrorMessage } from '../../api'
import ConfirmModal from '../ui/ConfirmModal'

// Safe copy-to-clipboard helper with fallback
async function copyToClipboard(text) {
    if (!text) return false
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch {
        // Fallback below
    }
    try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        textArea.remove()
        return Boolean(successful)
    } catch {
        return false
    }
}

export default function CompanyIntegrationsSettings() {
    const [loading, setLoading] = useState(true)
    const [integrations, setIntegrations] = useState({
        webhookApiKey: '',
        webhookUrl: '',
        indiamartCrmKey: '',
        indiamartEnabled: false,
        sulekhaWebhookSecret: '',
        sulekhaEnabled: false,
    })

    // Local form states
    const [indiamartKeyInput, setIndiamartKeyInput] = useState('')
    const [sulekhaSecretInput, setSulekhaSecretInput] = useState('')

    // Reveal/Hide toggles
    const [showApiKey, setShowApiKey] = useState(false)
    const [showIndiamartKey, setShowIndiamartKey] = useState(false)
    const [showSulekhaSecret, setShowSulekhaSecret] = useState(false)

    // Code snippet tab ('curl' | 'php')
    const [snippetTab, setSnippetTab] = useState('curl')

    // Copy visual feedback states
    const [copiedUrl, setCopiedUrl] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)
    const [copiedSnippet, setCopiedSnippet] = useState(false)

    // Saving and confirmation modals
    const [regeneratingKey, setRegeneratingKey] = useState(false)
    const [savingIndiamart, setSavingIndiamart] = useState(false)
    const [savingSulekha, setSavingSulekha] = useState(false)
    const [confirmModal, setConfirmModal] = useState(null) // { title, message, action, confirmText, confirmColor }
    const [errorMsg, setErrorMsg] = useState('')

    const loadIntegrations = async () => {
        setLoading(true)
        setErrorMsg('')
        try {
            const res = await companyIntegrationsAPI.getIntegrations()
            const data = res.data || {}
            setIntegrations(data)
            setIndiamartKeyInput(data.indiamartCrmKey || '')
            setSulekhaSecretInput(data.sulekhaWebhookSecret || '')
        } catch (err) {
            setErrorMsg(extractApiErrorMessage(err, 'Failed to load company integrations'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadIntegrations()
    }, [])

    // ── Copy Handlers ────────────────────────────────────────────────────────
    const handleCopyUrl = async () => {
        const url = integrations.webhookUrl || `${window.location.origin}/api/webhooks/inbound/${integrations.webhookApiKey}`
        const ok = await copyToClipboard(url)
        if (ok) {
            setCopiedUrl(true)
            toast.success('Inbound Webhook URL copied to clipboard')
            setTimeout(() => setCopiedUrl(false), 2000)
        }
    }

    const handleCopyKey = async () => {
        const ok = await copyToClipboard(integrations.webhookApiKey)
        if (ok) {
            setCopiedKey(true)
            toast.success('Webhook API Key copied to clipboard')
            setTimeout(() => setCopiedKey(false), 2000)
        }
    }

    const handleCopySnippet = async (code) => {
        const ok = await copyToClipboard(code)
        if (ok) {
            setCopiedSnippet(true)
            toast.success('Sample code copied to clipboard')
            setTimeout(() => setCopiedSnippet(false), 2000)
        }
    }

    // ── Regenerate Key ───────────────────────────────────────────────────────
    const triggerRegenerateConfirm = () => {
        setConfirmModal({
            title: 'Regenerate Inbound Webhook Key',
            message:
                'Warning: Regenerating your webhook API key will immediately invalidate the current URL. Any website forms, WordPress plugins, or external integrations currently submitting leads using the old key will fail until updated. Do you want to proceed?',
            confirmText: 'Regenerate Key',
            confirmColor: '#DC2626',
            action: executeRegenerateKey,
        })
    }

    const executeRegenerateKey = async () => {
        setRegeneratingKey(true)
        try {
            const res = await companyIntegrationsAPI.regenerateWebhookKey()
            setIntegrations(res.data)
            toast.success('New webhook key generated successfully')
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Failed to regenerate webhook key'))
        } finally {
            setRegeneratingKey(false)
            setConfirmModal(null)
        }
    }

    // ── IndiaMart Handlers ───────────────────────────────────────────────────
    const handleSaveIndiamart = async () => {
        if (!indiamartKeyInput.trim()) {
            toast.error('Please enter an IndiaMart CRM Key')
            return
        }
        setSavingIndiamart(true)
        try {
            const res = await companyIntegrationsAPI.updateIndiamart({
                crmKey: indiamartKeyInput.trim(),
                enabled: true,
            })
            setIntegrations(res.data)
            setIndiamartKeyInput(res.data.indiamartCrmKey || '')
            toast.success('IndiaMart configuration saved')
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Failed to save IndiaMart configuration'))
        } finally {
            setSavingIndiamart(false)
        }
    }

    const triggerClearIndiamart = () => {
        setConfirmModal({
            title: 'Clear IndiaMart Integration',
            message: 'Are you sure you want to remove the IndiaMart CRM Key? IndiaMart push leads will no longer be authenticated.',
            confirmText: 'Clear Key',
            confirmColor: '#DC2626',
            action: async () => {
                setSavingIndiamart(true)
                try {
                    const res = await companyIntegrationsAPI.clearIndiamart()
                    setIntegrations(res.data)
                    setIndiamartKeyInput('')
                    toast.success('IndiaMart integration cleared')
                } catch (err) {
                    toast.error(extractApiErrorMessage(err, 'Failed to clear IndiaMart integration'))
                } finally {
                    setSavingIndiamart(false)
                    setConfirmModal(null)
                }
            },
        })
    }

    // ── Sulekha Handlers ─────────────────────────────────────────────────────
    const handleSaveSulekha = async () => {
        if (!sulekhaSecretInput.trim()) {
            toast.error('Please enter a Sulekha Webhook Secret')
            return
        }
        setSavingSulekha(true)
        try {
            const res = await companyIntegrationsAPI.updateSulekha({
                webhookSecret: sulekhaSecretInput.trim(),
                enabled: true,
            })
            setIntegrations(res.data)
            setSulekhaSecretInput(res.data.sulekhaWebhookSecret || '')
            toast.success('Sulekha configuration saved')
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Failed to save Sulekha configuration'))
        } finally {
            setSavingSulekha(false)
        }
    }

    const triggerClearSulekha = () => {
        setConfirmModal({
            title: 'Clear Sulekha Integration',
            message: 'Are you sure you want to remove the Sulekha Webhook Secret? Inbound Sulekha leads will no longer be validated.',
            confirmText: 'Clear Secret',
            confirmColor: '#DC2626',
            action: async () => {
                setSavingSulekha(true)
                try {
                    const res = await companyIntegrationsAPI.clearSulekha()
                    setIntegrations(res.data)
                    setSulekhaSecretInput('')
                    toast.success('Sulekha integration cleared')
                } catch (err) {
                    toast.error(extractApiErrorMessage(err, 'Failed to clear Sulekha integration'))
                } finally {
                    setSavingSulekha(false)
                    setConfirmModal(null)
                }
            },
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
                <div className="animate-spin rounded-full h-9 w-9 border-b-2" style={{ borderColor: T.primary }}></div>
                <p className="text-xs font-semibold" style={{ color: T.textSecondary }}>Loading integrations configuration...</p>
            </div>
        )
    }

    const activeWebhookUrl = integrations.webhookUrl || `${window.location.origin}/api/webhooks/inbound/${integrations.webhookApiKey}`

    const curlSnippet = `curl -X POST "${activeWebhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Alex Johnson",
    "email": "alex@enterprise.com",
    "phone": "9876543210",
    "company": "Enterprise Global",
    "message": "Interested in CRM demo"
  }'`

    const phpSnippet = `<?php
// Hostinger / WordPress PHP Inbound Lead Forwarder
$webhookUrl = '${activeWebhookUrl}';

$payload = json_encode([
    'name'    => $_POST['name'] ?? '',
    'email'   => $_POST['email'] ?? '',
    'phone'   => $_POST['phone'] ?? '',
    'company' => $_POST['company'] ?? '',
    'message' => $_POST['message'] ?? 'Website Inquiry'
]);

$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ],
    CURLOPT_TIMEOUT        => 3, // Non-blocking 3s timeout
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
?>`

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {errorMsg && (
                <div className="flex items-center gap-2 p-4 rounded-xl text-xs font-semibold"
                    style={{ background: T.errorDim, color: T.error, border: `1px solid ${T.error}30` }}>
                    <IconAlertTriangle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Header intro */}
            <div className="rounded-2xl p-6 border flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: T.surface, borderColor: T.border }}>
                <div>
                    <h3 className="text-lg font-bold" style={{ color: T.textPrimary }}>Webhooks & External Integrations</h3>
                    <p className="text-xs mt-1" style={{ color: T.textSecondary }}>
                        Connect inbound website demo requests, IndiaMart Push API, and Sulekha leads directly into your CRM with automated deduplication.
                    </p>
                </div>
                <button
                    onClick={loadIntegrations}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all self-start md:self-auto cursor-pointer"
                    style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textSecondary }}
                >
                    <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* CARD 1: Website Inbound Webhook */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.surface, borderColor: T.border }}>
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b"
                    style={{ borderColor: T.border, background: T.surfaceRaised }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                            <IconPlug size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>Website & Form Webhook</h4>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                    style={{ background: 'rgba(22,163,74,0.12)', color: '#16A34A' }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Active & Ready
                                </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: T.textSecondary }}>
                                Ingest leads from HTML forms, WordPress, Webflow, and custom backend applications.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    {/* Webhook Endpoint URL */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            Target Webhook Endpoint URL
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-none"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}>
                                {activeWebhookUrl}
                            </div>
                            <button
                                onClick={handleCopyUrl}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm cursor-pointer"
                                style={{
                                    background: copiedUrl ? '#16A34A' : T.primary,
                                    color: '#fff',
                                }}
                            >
                                {copiedUrl ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                            </button>
                        </div>
                        <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: T.textSecondary }}>
                            <IconInfoCircle size={13} />
                            Send an HTTP POST request with JSON payload (<code className="px-1 rounded bg-black/5 dark:bg-white/5">name</code>, <code className="px-1 rounded bg-black/5 dark:bg-white/5">email</code>, <code className="px-1 rounded bg-black/5 dark:bg-white/5">phone</code>, <code className="px-1 rounded bg-black/5 dark:bg-white/5">company</code>, <code className="px-1 rounded bg-black/5 dark:bg-white/5">message</code>).
                        </p>
                    </div>

                    {/* Webhook API Key */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                Inbound Webhook API Key
                            </label>
                            <button
                                onClick={triggerRegenerateConfirm}
                                disabled={regeneratingKey}
                                className="flex items-center gap-1 text-[11px] font-bold hover:underline transition-all cursor-pointer"
                                style={{ color: T.error }}
                            >
                                <IconRefresh size={12} className={regeneratingKey ? 'animate-spin' : ''} />
                                Regenerate Key
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    readOnly
                                    value={integrations.webhookApiKey || ''}
                                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-mono outline-none select-all"
                                    style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                                    style={{ color: T.textMuted }}
                                    title={showApiKey ? 'Hide Key' : 'Reveal Key'}
                                >
                                    {showApiKey ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                </button>
                            </div>
                            <button
                                onClick={handleCopyKey}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            >
                                {copiedKey ? <IconCheck size={14} className="text-green-500" /> : <IconCopy size={14} />}
                                <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Sample Code Snippet Selector */}
                    <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: T.textMuted }}>
                                <IconCode size={14} />
                                Sample Inbound Code
                            </label>
                            <div className="flex items-center gap-1 p-0.5 rounded-lg border text-xs font-bold"
                                style={{ background: T.surfaceRaised, borderColor: T.border }}>
                                <button
                                    onClick={() => setSnippetTab('curl')}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] cursor-pointer"
                                    style={{
                                        background: snippetTab === 'curl' ? T.primary : 'transparent',
                                        color: snippetTab === 'curl' ? '#fff' : T.textSecondary,
                                    }}
                                >
                                    <IconTerminal2 size={12} /> cURL
                                </button>
                                <button
                                    onClick={() => setSnippetTab('php')}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] cursor-pointer"
                                    style={{
                                        background: snippetTab === 'php' ? T.primary : 'transparent',
                                        color: snippetTab === 'php' ? '#fff' : T.textSecondary,
                                    }}
                                >
                                    <IconBrandPhp size={12} /> PHP (cURL)
                                </button>
                            </div>
                        </div>

                        <div className="relative rounded-xl border overflow-hidden"
                            style={{ background: '#0F172A', borderColor: T.border }}>
                            <div className="absolute right-3 top-3 z-10">
                                <button
                                    onClick={() => handleCopySnippet(snippetTab === 'curl' ? curlSnippet : phpSnippet)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm cursor-pointer"
                                >
                                    {copiedSnippet ? <IconCheck size={12} className="text-green-400" /> : <IconCopy size={12} />}
                                    <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
                                </button>
                            </div>
                            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed scrollbar-none">
                                {snippetTab === 'curl' ? curlSnippet : phpSnippet}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 2: IndiaMart Push API */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.surface, borderColor: T.border }}>
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b"
                    style={{ borderColor: T.border, background: T.surfaceRaised }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(14,91,142,0.12)', color: '#0E5B8E' }}>
                            <IconBuildingStore size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>IndiaMart (Push API)</h4>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                    style={{
                                        background: integrations.indiamartEnabled ? 'rgba(22,163,74,0.12)' : 'rgba(100,116,139,0.12)',
                                        color: integrations.indiamartEnabled ? '#16A34A' : T.textMuted,
                                    }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: integrations.indiamartEnabled ? '#16A34A' : T.border }} />
                                    {integrations.indiamartEnabled ? 'Configured & Active' : 'Not Configured'}
                                </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: T.textSecondary }}>
                                Receive IndiaMart supplier inquiries directly into your CRM queue with automated account resolution.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        {integrations.indiamartEnabled && (
                            <button
                                onClick={triggerClearIndiamart}
                                disabled={savingIndiamart}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                                style={{ background: T.errorDim, borderColor: `${T.error}30`, color: T.error }}
                            >
                                <IconTrash size={13} /> Clear
                            </button>
                        )}
                        <button
                            onClick={handleSaveIndiamart}
                            disabled={savingIndiamart}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                            style={{ background: T.primary }}
                        >
                            <IconDeviceFloppy size={13} />
                            {savingIndiamart ? 'Saving...' : 'Save IndiaMart Key'}
                        </button>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            IndiaMart CRM Key (GLUSR_CRM_KEY)
                        </label>
                        <div className="relative">
                            <input
                                type={showIndiamartKey ? 'text' : 'password'}
                                value={indiamartKeyInput}
                                onChange={(e) => setIndiamartKeyInput(e.target.value)}
                                placeholder="Enter IndiaMart GLUSR_CRM_KEY (e.g. mRxxxxxxx==)"
                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-mono outline-none"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowIndiamartKey(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                                style={{ color: T.textMuted }}
                            >
                                {showIndiamartKey ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </button>
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: T.textSecondary }}>
                            Obtain your CRM Key from IndiaMart Lead Manager Settings under Push API configuration. IndiaMart push webhook can point directly to: <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono">{activeWebhookUrl}</code>
                        </p>
                    </div>
                </div>
            </div>

            {/* CARD 3: Sulekha Leads */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.surface, borderColor: T.border }}>
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b"
                    style={{ borderColor: T.border, background: T.surfaceRaised }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(231,76,60,0.12)', color: '#E74C3C' }}>
                            <IconBriefcase size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>Sulekha Leads</h4>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                    style={{
                                        background: integrations.sulekhaEnabled ? 'rgba(22,163,74,0.12)' : 'rgba(100,116,139,0.12)',
                                        color: integrations.sulekhaEnabled ? '#16A34A' : T.textMuted,
                                    }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: integrations.sulekhaEnabled ? '#16A34A' : T.border }} />
                                    {integrations.sulekhaEnabled ? 'Configured & Active' : 'Not Configured'}
                                </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: T.textSecondary }}>
                                Ingest verified local service inquiries and leads from Sulekha Campaign Manager.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        {integrations.sulekhaEnabled && (
                            <button
                                onClick={triggerClearSulekha}
                                disabled={savingSulekha}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                                style={{ background: T.errorDim, borderColor: `${T.error}30`, color: T.error }}
                            >
                                <IconTrash size={13} /> Clear
                            </button>
                        )}
                        <button
                            onClick={handleSaveSulekha}
                            disabled={savingSulekha}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                            style={{ background: T.primary }}
                        >
                            <IconDeviceFloppy size={13} />
                            {savingSulekha ? 'Saving...' : 'Save Sulekha Secret'}
                        </button>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            Webhook Secret Token
                        </label>
                        <div className="relative">
                            <input
                                type={showSulekhaSecret ? 'text' : 'password'}
                                value={sulekhaSecretInput}
                                onChange={(e) => setSulekhaSecretInput(e.target.value)}
                                placeholder="Enter Sulekha verification secret token..."
                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-mono outline-none"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowSulekhaSecret(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                                style={{ color: T.textMuted }}
                            >
                                {showSulekhaSecret ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </button>
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: T.textSecondary }}>
                            Configure this secret token inside the Sulekha partner portal. Point the webhook callback to your tenant inbound endpoint: <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono">{activeWebhookUrl}</code>
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <ConfirmModal
                    isOpen={Boolean(confirmModal)}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText={confirmModal.confirmText}
                    confirmColor={confirmModal.confirmColor}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    )
}
