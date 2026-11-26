import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { IconBrandWindows, IconBrandFacebook, IconExternalLink } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { companyIntegrationsAPI } from '../../api/integrations'
import { extractApiErrorMessage } from '../../api'

export default function OutlookMetaIntegrationsSection({ integrations, onUpdated }) {
    const [outlookClientId, setOutlookClientId] = useState(integrations?.outlookClientId || '')
    const [outlookSecret, setOutlookSecret] = useState('')
    const [outlookTenantId, setOutlookTenantId] = useState(integrations?.outlookTenantId || 'common')
    const [outlookStatus, setOutlookStatus] = useState({ configured: false, connected: false })

    const [metaAppId, setMetaAppId] = useState(integrations?.metaAppId || '')
    const [metaAppSecret, setMetaAppSecret] = useState('')
    const [metaPageToken, setMetaPageToken] = useState('')
    const [metaVerifyToken, setMetaVerifyToken] = useState(integrations?.metaVerifyToken || '')
    const [metaPageId, setMetaPageId] = useState(integrations?.metaPageId || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        companyIntegrationsAPI.getOutlookStatus().then(r => setOutlookStatus(r.data || {})).catch(() => {})
    }, [])

    const saveOutlook = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await companyIntegrationsAPI.updateOutlook({
                clientId: outlookClientId,
                clientSecret: outlookSecret || undefined,
                tenantId: outlookTenantId,
            })
            onUpdated?.(res.data)
            setOutlookSecret('')
            const st = await companyIntegrationsAPI.getOutlookStatus()
            setOutlookStatus(st.data || {})
            toast.success('Outlook Azure settings saved!')
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Failed to save Outlook settings'))
        } finally {
            setSaving(false)
        }
    }

    const connectOutlook = async () => {
        try {
            const res = await companyIntegrationsAPI.getOutlookAuthUrl()
            if (res.data?.url) window.open(res.data.url, '_blank', 'noopener,noreferrer')
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Save Outlook Client ID first'))
        }
    }

    const saveMeta = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await companyIntegrationsAPI.updateMeta({
                appId: metaAppId,
                appSecret: metaAppSecret || undefined,
                pageAccessToken: metaPageToken || undefined,
                verifyToken: metaVerifyToken,
                pageId: metaPageId,
            })
            onUpdated?.(res.data)
            setMetaAppSecret('')
            setMetaPageToken('')
            toast.success('Facebook / Meta Lead Ads settings saved!')
        } catch (err) {
            toast.error(extractApiErrorMessage(err, 'Failed to save Meta settings'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Microsoft 365 / Outlook */}
            <form onSubmit={saveOutlook} className="rounded-2xl border p-6 space-y-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-500/10 border border-sky-500/20 text-sky-500">
                            <IconBrandWindows size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Microsoft 365 / Outlook Mail & Calendar</h3>
                            <p className="text-xs" style={{ color: T.textSecondary }}>
                                Connect your Azure AD app credentials to sync Outlook emails and calendar events.
                            </p>
                        </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${outlookStatus.connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                        {outlookStatus.connected ? 'Connected' : outlookStatus.configured ? 'Ready to Connect' : 'Not Configured'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={outlookClientId} onChange={e => setOutlookClientId(e.target.value)} placeholder="Azure Client ID" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                    <input type="password" value={outlookSecret} onChange={e => setOutlookSecret(e.target.value)} placeholder="Azure Client Secret (encrypted)" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                    <input value={outlookTenantId} onChange={e => setOutlookTenantId(e.target.value)} placeholder="Tenant ID (or common)" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: '#0284C7' }}>
                        Save Azure Credentials
                    </button>
                    {outlookStatus.configured && (
                        <button type="button" onClick={connectOutlook} className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer" style={{ borderColor: T.border, color: T.primaryText }}>
                            Authorize Outlook Account
                        </button>
                    )}
                    {outlookStatus.connected && (
                        <>
                            <button type="button" onClick={() => companyIntegrationsAPI.syncOutlookMail().then(r => toast.success(`Fetched ${r.data?.count || 0} emails`))} className="px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer" style={{ borderColor: T.border, color: T.textPrimary }}>
                                Sync Mail
                            </button>
                            <button type="button" onClick={() => companyIntegrationsAPI.syncOutlookCalendar().then(r => toast.success(`Fetched ${r.data?.count || 0} calendar events`))} className="px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer" style={{ borderColor: T.border, color: T.textPrimary }}>
                                Sync Calendar
                            </button>
                        </>
                    )}
                </div>
            </form>

            {/* Facebook / Meta Lead Ads */}
            <form onSubmit={saveMeta} className="rounded-2xl border p-6 space-y-4" style={{ background: T.surface, borderColor: T.border }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600/10 border border-blue-600/20 text-blue-600">
                            <IconBrandFacebook size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Facebook / Meta Lead Ads</h3>
                            <p className="text-xs" style={{ color: T.textSecondary }}>
                                Receive Instant Form leads via Meta Graph webhooks with SHA-256 verification.
                            </p>
                        </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${integrations?.metaConfigured ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                        {integrations?.metaConfigured ? 'Configured' : 'Not Configured'}
                    </span>
                </div>

                {integrations?.metaWebhookUrl && (
                    <div className="px-3 py-2 rounded-xl border text-xs font-mono" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle, color: T.textSecondary }}>
                        Callback URL: {integrations.metaWebhookUrl}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={metaPageId} onChange={e => setMetaPageId(e.target.value)} placeholder="Facebook Page ID" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                    <input value={metaVerifyToken} onChange={e => setMetaVerifyToken(e.target.value)} placeholder="Webhook Verify Token" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                    <input value={metaAppId} onChange={e => setMetaAppId(e.target.value)} placeholder="Meta App ID" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                    <input type="password" value={metaAppSecret} onChange={e => setMetaAppSecret(e.target.value)} placeholder="Meta App Secret (HMAC)" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                    <input type="password" value={metaPageToken} onChange={e => setMetaPageToken(e.target.value)} placeholder="Page Access Token" className="px-3 py-2 rounded-xl border text-xs font-mono outline-none md:col-span-2" style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: '#2563EB' }}>
                        Save Meta Lead Ads Config
                    </button>
                    <a
                        href="/swagger-ui.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                        style={{ color: T.primaryText }}
                    >
                        <span>API Reference & Swagger Docs</span>
                        <IconExternalLink size={13} />
                    </a>
                </div>
            </form>
        </div>
    )
}
