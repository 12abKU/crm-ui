import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { IconSend, IconTrash, IconPlus, IconActivity } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { companyIntegrationsAPI } from '../../api/integrations'
import { extractApiErrorMessage } from '../../api'

const EVENT_OPTIONS = ['LEAD_CREATED', 'LEAD_UPDATED', 'CONTACT_CREATED', 'DEAL_CREATED', 'DEAL_WON']

export default function OutboundWebhooksSection() {
    const [hooks, setHooks] = useState([])
    const [name, setName] = useState('')
    const [targetUrl, setTargetUrl] = useState('')
    const [secret, setSecret] = useState('')
    const [selectedEvents, setSelectedEvents] = useState(['LEAD_CREATED', 'DEAL_WON'])
    const [busy, setBusy] = useState(false)
    const [logsModal, setLogsModal] = useState(null)

    const loadHooks = async () => {
        try {
            const res = await companyIntegrationsAPI.listOutboundWebhooks()
            setHooks(res.data ?? [])
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        let mounted = true
        companyIntegrationsAPI.listOutboundWebhooks()
            .then(res => { if (mounted) setHooks(res.data ?? []) })
            .catch(() => {})
        return () => { mounted = false }
    }, [])

    const toggleEvent = (ev) => {
        setSelectedEvents(prev => prev.includes(ev) ? prev.filter(x => x !== ev) : [...prev, ev])
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!name.trim() || !targetUrl.trim()) return
        setBusy(true)
        try {
            await companyIntegrationsAPI.createOutboundWebhook({
                name: name.trim(),
                targetUrl: targetUrl.trim(),
                secret: secret.trim() || null,
                events: selectedEvents.length ? selectedEvents : ['*'],
            })
            toast.success('Outbound webhook added!')
            setName('')
            setTargetUrl('')
            setSecret('')
            await loadHooks()
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Failed to create outbound webhook'))
        } finally {
            setBusy(false)
        }
    }

    const handleTest = async (id) => {
        try {
            const res = await companyIntegrationsAPI.testOutboundWebhook(id)
            if (res.data?.success) toast.success(`Delivered HTTP ${res.data.httpStatus}`)
            else toast.error(`Delivery failed: ${res.data?.errorMessage || `HTTP ${res.data?.httpStatus}`}`)
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Test ping failed'))
        }
    }

    const handleViewLogs = async (hook) => {
        try {
            const res = await companyIntegrationsAPI.getOutboundWebhookLogs(hook.id)
            setLogsModal({ hook, logs: res.data ?? [] })
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Could not load logs'))
        }
    }

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: T.surface, borderColor: T.border }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: T.borderSubtle }}>
                <div>
                    <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Outbound Webhooks (HMAC-SHA256)</h3>
                    <p className="text-xs" style={{ color: T.textSecondary }}>
                        Push signed JSON events to Zapier, Make, n8n, or your internal backend when CRM records change.
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                <form onSubmit={handleCreate} className="p-4 rounded-xl border space-y-3" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Endpoint Name (e.g. Zapier CRM)"
                            className="px-3 py-2 rounded-xl border text-xs outline-none"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                        />
                        <input
                            required
                            value={targetUrl}
                            onChange={e => setTargetUrl(e.target.value)}
                            placeholder="https://example.com/webhook"
                            className="px-3 py-2 rounded-xl border text-xs font-mono outline-none"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                        />
                        <input
                            type="password"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            placeholder="Signing Secret (optional)"
                            className="px-3 py-2 rounded-xl border text-xs font-mono outline-none"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {EVENT_OPTIONS.map(ev => {
                                const on = selectedEvents.includes(ev)
                                return (
                                    <button
                                        key={ev}
                                        type="button"
                                        onClick={() => toggleEvent(ev)}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer"
                                        style={{
                                            background: on ? T.primaryFaint : T.surface,
                                            color: on ? T.primaryText : T.textMuted,
                                            borderColor: on ? T.primary : T.border,
                                        }}
                                    >
                                        {ev}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                            style={{ background: T.primary }}
                        >
                            <IconPlus size={14} />
                            Add Webhook
                        </button>
                    </div>
                </form>

                {hooks.length === 0 ? (
                    <p className="text-xs italic" style={{ color: T.textMuted }}>No outbound webhooks configured yet.</p>
                ) : (
                    <div className="space-y-2.5">
                        {hooks.map(hook => (
                            <div
                                key={hook.id}
                                className="p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3"
                                style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black" style={{ color: T.textPrimary }}>{hook.name}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hook.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                            {hook.active ? 'Active' : 'Paused'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-mono truncate max-w-md" style={{ color: T.textSecondary }}>{hook.targetUrl}</p>
                                    <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
                                        Events: {(hook.events || []).join(', ')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await companyIntegrationsAPI.toggleOutboundWebhook(hook.id, !hook.active)
                                            await loadHooks()
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
                                        style={{ borderColor: T.border, color: T.textPrimary }}
                                    >
                                        {hook.active ? 'Pause' : 'Resume'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTest(hook.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
                                        style={{ borderColor: T.border, color: T.primaryText }}
                                    >
                                        <IconSend size={13} /> Test
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleViewLogs(hook)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
                                        style={{ borderColor: T.border, color: T.textSecondary }}
                                    >
                                        <IconActivity size={13} /> Logs
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await companyIntegrationsAPI.deleteOutboundWebhook(hook.id)
                                            toast.success('Webhook deleted')
                                            await loadHooks()
                                        }}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                                        title="Delete webhook"
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {logsModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setLogsModal(null)}>
                    <div className="w-full max-w-2xl rounded-2xl border p-5 max-h-[80vh] flex flex-col" style={{ background: T.surface, borderColor: T.border }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>Delivery Logs — {logsModal.hook.name}</h4>
                            <button type="button" onClick={() => setLogsModal(null)} className="text-xs font-bold cursor-pointer" style={{ color: T.textMuted }}>Close</button>
                        </div>
                        <div className="overflow-y-auto space-y-2 flex-1">
                            {logsModal.logs.length === 0 ? (
                                <p className="text-xs" style={{ color: T.textMuted }}>No deliveries logged yet.</p>
                            ) : logsModal.logs.map(log => (
                                <div key={log.id} className="p-3 rounded-xl border text-xs" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                                    <div className="flex justify-between font-bold mb-1">
                                        <span style={{ color: T.textPrimary }}>{log.eventName}</span>
                                        <span className={log.success ? 'text-emerald-500' : 'text-red-500'}>
                                            {log.httpStatus ? `HTTP ${log.httpStatus}` : 'Error'}
                                        </span>
                                    </div>
                                    {log.errorMessage && <p className="text-red-400 text-[11px]">{log.errorMessage}</p>}
                                    <p className="text-[10px] font-mono truncate" style={{ color: T.textMuted }}>{log.requestPayload}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
