// src/components/platform/IntegrationsPanel.jsx
import { useEffect, useState } from 'react'
import { IconDeviceFloppy, IconTrash, IconCheck, IconAlertTriangle, IconBrandGoogle, IconPhone, IconEye, IconEyeOff, IconBrandWhatsapp, IconBuildingStore, IconBriefcase } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import api from '../../api'
import ConfirmModal from '../ui/ConfirmModal'



const Field = ({ label, type = 'text', value, onChange, placeholder, monospace }) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</label>
            <div className="relative">
                <input
                    type={isPassword && !show ? 'password' : 'text'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="new-password"  // ← this tricks browser into not autofilling
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none pr-9"
                    style={{
                        background: T.surfaceRaised,
                        border: `1px solid ${T.border}`,
                        color: T.textPrimary,
                        fontFamily: monospace ? 'monospace' : undefined,
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(p => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        style={{ color: T.textMuted }}
                    >
                        {show ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                    </button>
                )}
            </div>
        </div>
    )
}


const Section = ({ icon: Icon, title, color, configured, children, onSave, onClear, saving, error, success }) => (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '20' }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <div>
                    <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>{title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: configured ? '#16a34a' : T.border }} />
                        <span className="text-[11px]" style={{ color: configured ? '#16a34a' : T.textMuted }}>
                            {configured ? 'Configured (company-specific)' : 'Using platform defaults'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {configured && (
                    <button onClick={onClear} disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: T.errorDim, color: T.error, opacity: saving ? 0.5 : 1 }}>
                        <IconTrash size={12} /> Clear
                    </button>
                )}
                <button onClick={onSave} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: T.primary, color: '#fff', opacity: saving ? 0.5 : 1 }}>
                    <IconDeviceFloppy size={12} />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
        <div className="p-6 flex flex-col gap-4">
            {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: T.errorDim, color: T.error }}>
                    <IconAlertTriangle size={14} /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(22,163,74,0.10)', color: '#16a34a' }}>
                    <IconCheck size={14} /> {success}
                </div>
            )}
            {children}
        </div>
    </div>
)

export default function IntegrationsPanel({ companyId }) {
    const [loading, setLoading] = useState(true)
    const [confirmClear, setConfirmClear] = useState(null) // 'twilio' | 'google' | 'whatsapp'

    // Twilio
    const [twilio, setTwilio] = useState({
        accountSid: '', authToken: '', apiKey: '',
        apiSecret: '', phoneNumber: '', twimlAppSid: '',
    })
    const [twilioConfigured, setTwilioConfigured] = useState(false)
    const [twilioSaving, setTwilioSaving] = useState(false)
    const [twilioError, setTwilioError] = useState('')
    const [twilioSuccess, setTwilioSuccess] = useState('')

    // Google
    const [google, setGoogle] = useState({ clientId: '', clientSecret: '', redirectUri: '' })
    const [googleConfigured, setGoogleConfigured] = useState(false)
    const [googleSaving, setGoogleSaving] = useState(false)
    const [googleError, setGoogleError] = useState('')
    const [googleSuccess, setGoogleSuccess] = useState('')

    // WhatsApp
    const [whatsapp, setWhatsapp] = useState({
        phoneNumberId: '', businessAccountId: '', accessToken: '', verifyToken: ''
    })
    const [whatsappConfigured, setWhatsappConfigured] = useState(false)
    const [whatsappSaving, setWhatsappSaving] = useState(false)
    const [whatsappError, setWhatsappError] = useState('')
    const [whatsappSuccess, setWhatsappSuccess] = useState('')

    // IndiaMart
    const [indiamart, setIndiamart] = useState({ crmKey: '' })
    const [indiamartConfigured, setIndiamartConfigured] = useState(false)
    const [indiamartSaving, setIndiamartSaving] = useState(false)
    const [indiamartError, setIndiamartError] = useState('')
    const [indiamartSuccess, setIndiamartSuccess] = useState('')

    // Sulekha
    const [sulekha, setSulekha] = useState({ webhookSecret: '' })
    const [sulekhaConfigured, setSulekhaConfigured] = useState(false)
    const [sulekhaSaving, setSulekhaSaving] = useState(false)
    const [sulekhaError, setSulekhaError] = useState('')
    const [sulekhaSuccess, setSulekhaSuccess] = useState('')

    useEffect(() => {
        if (!companyId) return
        setLoading(true)
        api.get(`/api/platform/companies/${companyId}/integrations`)
            .then(r => {
                const tw = r.data.twilio || {}
                const go = r.data.google || {}
                const wa = r.data.whatsapp || {}
                const im = r.data.indiamart || {}
                const su = r.data.sulekha || {}

                // Backend masks secrets — show placeholder if configured
                setTwilio({
                    accountSid: tw.accountSid || '',
                    authToken: tw.authToken || '',
                    apiKey: tw.apiKey || '',
                    apiSecret: tw.apiSecret || '',
                    phoneNumber: tw.phoneNumber || '',
                    twimlAppSid: tw.twimlAppSid || '',
                })
                setTwilioConfigured(tw.configured || false)
                setGoogle({
                    clientId: go.clientId || '',
                    clientSecret: go.clientSecret || '',
                    redirectUri: go.redirectUri || '',
                })
                setGoogleConfigured(go.configured || false)
                setWhatsapp({
                    phoneNumberId: wa.phoneNumberId || '',
                    businessAccountId: wa.businessAccountId || '',
                    accessToken: wa.accessToken || '',
                    verifyToken: wa.verifyToken || '',
                })
                setWhatsappConfigured(wa.configured || false)
                setIndiamart({ crmKey: im.crmKey || '' })
                setIndiamartConfigured(im.configured || false)
                setSulekha({ webhookSecret: su.webhookSecret || '' })
                setSulekhaConfigured(su.configured || false)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [companyId])

    const setT = (key) => (e) => setTwilio(p => ({ ...p, [key]: e.target.value }))
    const setG = (key) => (e) => setGoogle(p => ({ ...p, [key]: e.target.value }))
    const setW = (key) => (e) => setWhatsapp(p => ({ ...p, [key]: e.target.value }))
    const setI = (key) => (e) => setIndiamart(p => ({ ...p, [key]: e.target.value }))
    const setS = (key) => (e) => setSulekha(p => ({ ...p, [key]: e.target.value }))

    const saveTwilio = async () => {
        setTwilioSaving(true); setTwilioError(''); setTwilioSuccess('')
        try {
            await api.patch(`/api/platform/companies/${companyId}/integrations/twilio`, twilio)
            setTwilioConfigured(true)
            setTwilioSuccess('Twilio settings saved.')
            setTimeout(() => setTwilioSuccess(''), 3000)
        } catch (e) {
            setTwilioError(e?.response?.data?.message || 'Save failed')
        } finally { setTwilioSaving(false) }
    }


    const clearTwilio = () => setConfirmClear('twilio')

    const executeClearTwilio = async () => {
        setTwilioSaving(true); setTwilioError('')
        try {
            await api.delete(`/api/platform/companies/${companyId}/integrations/twilio`)
            setTwilio({ accountSid: '', authToken: '', apiKey: '', apiSecret: '', phoneNumber: '', twimlAppSid: '' })
            setTwilioConfigured(false)
            setTwilioSuccess('Twilio config cleared.')
            setTimeout(() => setTwilioSuccess(''), 3000)
        } catch (e) {
            setTwilioError('Failed to clear')
        } finally { setTwilioSaving(false) }
    }

    const saveGoogle = async () => {
        setGoogleSaving(true); setGoogleError(''); setGoogleSuccess('')
        try {
            await api.patch(`/api/platform/companies/${companyId}/integrations/google`, google)
            setGoogleConfigured(true)
            setGoogleSuccess('Google settings saved.')
            setTimeout(() => setGoogleSuccess(''), 3000)
        } catch (e) {
            setGoogleError(e?.response?.data?.message || 'Save failed')
        } finally { setGoogleSaving(false) }
    }


    const clearGoogle = () => setConfirmClear('google')

    const executeClearGoogle = async () => {
        setGoogleSaving(true); setGoogleError('')
        try {
            await api.delete(`/api/platform/companies/${companyId}/integrations/google`)
            setGoogle({ clientId: '', clientSecret: '', redirectUri: '' })
            setGoogleConfigured(false)
            setGoogleSuccess('Google config cleared.')
            setTimeout(() => setGoogleSuccess(''), 3000)
        } catch (e) {
            setGoogleError('Failed to clear')
        } finally { setGoogleSaving(false) }
    }

    const saveWhatsapp = async () => {
        setWhatsappSaving(true); setWhatsappError(''); setWhatsappSuccess('')
        try {
            await api.patch(`/api/platform/companies/${companyId}/integrations/whatsapp`, whatsapp)
            setWhatsappConfigured(true)
            setWhatsappSuccess('WhatsApp settings saved.')
            setTimeout(() => setWhatsappSuccess(''), 3000)
        } catch (e) {
            setWhatsappError(e?.response?.data?.message || 'Save failed')
        } finally { setWhatsappSaving(false) }
    }

    const clearWhatsapp = () => setConfirmClear('whatsapp')

    const executeClearWhatsapp = async () => {
        setWhatsappSaving(true); setWhatsappError('')
        try {
            await api.delete(`/api/platform/companies/${companyId}/integrations/whatsapp`)
            setWhatsapp({ phoneNumberId: '', businessAccountId: '', accessToken: '', verifyToken: '' })
            setWhatsappConfigured(false)
            setWhatsappSuccess('WhatsApp config cleared.')
            setTimeout(() => setWhatsappSuccess(''), 3000)
        } catch (e) {
            setWhatsappError('Failed to clear')
        } finally { setWhatsappSaving(false) }
    }

    const saveIndiamart = async () => {
        setIndiamartSaving(true); setIndiamartError(''); setIndiamartSuccess('')
        try {
            await api.patch(`/api/platform/companies/${companyId}/integrations/indiamart`, indiamart)
            setIndiamartConfigured(true)
            setIndiamartSuccess('IndiaMart settings saved.')
            setTimeout(() => setIndiamartSuccess(''), 3000)
        } catch (e) {
            setIndiamartError(e?.response?.data?.message || 'Save failed')
        } finally { setIndiamartSaving(false) }
    }

    const clearIndiamart = () => setConfirmClear('indiamart')

    const executeClearIndiamart = async () => {
        setIndiamartSaving(true); setIndiamartError('')
        try {
            await api.delete(`/api/platform/companies/${companyId}/integrations/indiamart`)
            setIndiamart({ crmKey: '' })
            setIndiamartConfigured(false)
            setIndiamartSuccess('IndiaMart config cleared.')
            setTimeout(() => setIndiamartSuccess(''), 3000)
        } catch (e) {
            setIndiamartError('Failed to clear')
        } finally { setIndiamartSaving(false) }
    }

    const saveSulekha = async () => {
        setSulekhaSaving(true); setSulekhaError(''); setSulekhaSuccess('')
        try {
            await api.patch(`/api/platform/companies/${companyId}/integrations/sulekha`, sulekha)
            setSulekhaConfigured(true)
            setSulekhaSuccess('Sulekha settings saved.')
            setTimeout(() => setSulekhaSuccess(''), 3000)
        } catch (e) {
            setSulekhaError(e?.response?.data?.message || 'Save failed')
        } finally { setSulekhaSaving(false) }
    }

    const clearSulekha = () => setConfirmClear('sulekha')

    const executeClearSulekha = async () => {
        setSulekhaSaving(true); setSulekhaError('')
        try {
            await api.delete(`/api/platform/companies/${companyId}/integrations/sulekha`)
            setSulekha({ webhookSecret: '' })
            setSulekhaConfigured(false)
            setSulekhaSuccess('Sulekha config cleared.')
            setTimeout(() => setSulekhaSuccess(''), 3000)
        } catch (e) {
            setSulekhaError('Failed to clear')
        } finally { setSulekhaSaving(false) }
    }

    if (loading) return (
        <div className="py-12 text-center text-sm" style={{ color: T.textMuted }}>Loading integrations...</div>
    )

    return (
        <div className="flex flex-col gap-5">
            <div className="px-1">
                <h2 className="text-sm font-bold" style={{ color: T.textPrimary }}>Integrations</h2>
                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                    Per-company credentials override platform defaults. Leave blank to use platform defaults.
                    Saved values are masked for security.
                </p>
            </div>

            {/* Twilio */}
            <Section
                icon={IconPhone} title="Twilio (Voice Calls)"
                color="#F22F46" configured={twilioConfigured}
                onSave={saveTwilio} onClear={clearTwilio}
                saving={twilioSaving} error={twilioError} success={twilioSuccess}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Account SID" value={twilio.accountSid} onChange={setT('accountSid')}
                        placeholder="ACxxxxxxxxxxxxxxx" monospace />
                    <Field label="Auth Token" type="password" value={twilio.authToken} onChange={setT('authToken')}
                        placeholder="••••••••" monospace />
                    <Field label="API Key" value={twilio.apiKey} onChange={setT('apiKey')}
                        placeholder="SKxxxxxxxxxxxxxxx" monospace />
                    <Field label="API Secret" type="password" value={twilio.apiSecret} onChange={setT('apiSecret')}
                        placeholder="••••••••" monospace />
                    <Field label="Phone Number" value={twilio.phoneNumber} onChange={setT('phoneNumber')}
                        placeholder="+1234567890" monospace />
                    <Field label="TwiML App SID" value={twilio.twimlAppSid} onChange={setT('twimlAppSid')}
                        placeholder="APxxxxxxxxxxxxxxx" monospace />
                </div>
            </Section>

            {/* Google */}
            <Section
                icon={IconBrandGoogle} title="Google OAuth (Gmail)"
                color="#4285F4" configured={googleConfigured}
                onSave={saveGoogle} onClear={clearGoogle}
                saving={googleSaving} error={googleError} success={googleSuccess}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Client ID" value={google.clientId} onChange={setG('clientId')}
                        placeholder="xxxxxxx.apps.googleusercontent.com" monospace />
                    <Field label="Client Secret" type="password" value={google.clientSecret} onChange={setG('clientSecret')}
                        placeholder="GOCSPX-••••••••" monospace />
                    <div className="col-span-1 sm:col-span-2">
                        <Field label="Redirect URI" value={google.redirectUri} onChange={setG('redirectUri')}
                            placeholder="https://yourdomain.com/api/gmail/callback" monospace />
                    </div>
                </div>
            </Section>

            {/* WhatsApp */}
            <Section
                icon={IconBrandWhatsapp} title="WhatsApp Business API (Meta)"
                color="#25D366" configured={whatsappConfigured}
                onSave={saveWhatsapp} onClear={clearWhatsapp}
                saving={whatsappSaving} error={whatsappError} success={whatsappSuccess}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone Number ID" value={whatsapp.phoneNumberId} onChange={setW('phoneNumberId')}
                        placeholder="1065xxxxxxxxxxx" monospace />
                    <Field label="WhatsApp Business Account ID" value={whatsapp.businessAccountId} onChange={setW('businessAccountId')}
                        placeholder="1009xxxxxxxxxxx" monospace />
                    <div className="col-span-1 sm:col-span-2">
                        <Field label="System User Access Token" type="password" value={whatsapp.accessToken} onChange={setW('accessToken')}
                            placeholder="EAAGxxxxxxxxxxxxxxx" monospace />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Field label="Webhook Verify Token" value={whatsapp.verifyToken} onChange={setW('verifyToken')}
                            placeholder="any_secret_string" monospace />
                    </div>
                </div>
            </Section>

            {/* IndiaMart */}
            <Section
                icon={IconBuildingStore} title="IndiaMart (Push API)"
                color="#0E5B8E" configured={indiamartConfigured}
                onSave={saveIndiamart} onClear={clearIndiamart}
                saving={indiamartSaving} error={indiamartError} success={indiamartSuccess}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <Field label="IndiaMart CRM Key" type="password" value={indiamart.crmKey} onChange={setI('crmKey')}
                            placeholder="mxxxxxx-xxxxx..." monospace />
                    </div>
                </div>
            </Section>

            {/* Sulekha */}
            <Section
                icon={IconBriefcase} title="Sulekha Leads"
                color="#E74C3C" configured={sulekhaConfigured}
                onSave={saveSulekha} onClear={clearSulekha}
                saving={sulekhaSaving} error={sulekhaError} success={sulekhaSuccess}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <Field label="Webhook Secret Token" type="password" value={sulekha.webhookSecret} onChange={setS('webhookSecret')}
                            placeholder="Create a custom secret token..." monospace />
                    </div>
                </div>
            </Section>

            {confirmClear && (
                <ConfirmModal
                    isOpen={!!confirmClear}
                    title={`Clear Configuration`}
                    message={`Are you sure you want to clear this company's custom configuration? The company will revert to using platform defaults if applicable.`}
                    confirmText="Clear Configuration"
                    onConfirm={() => {
                        if (confirmClear === 'twilio') executeClearTwilio()
                        else if (confirmClear === 'google') executeClearGoogle()
                        else if (confirmClear === 'whatsapp') executeClearWhatsapp()
                        else if (confirmClear === 'indiamart') executeClearIndiamart()
                        else if (confirmClear === 'sulekha') executeClearSulekha()
                        setConfirmClear(null)
                    }}
                    onCancel={() => setConfirmClear(null)}
                />
            )}
        </div>
    )
}