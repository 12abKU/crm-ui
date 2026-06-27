import { useState, useEffect } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'

// ── Status banner ────────────────────────────────────────────────────────────
function StatusBanner({ status }) {
    if (!status) return null
    const ok = status.type === 'success'
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12, marginBottom: 22,
            background: ok ? T.successDim : T.errorDim,
            border: `1px solid ${ok ? T.success + '35' : T.error + '35'}`,
            color: ok ? T.success : T.error, fontSize: 13, fontWeight: 600,
        }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                {ok ? 'check_circle' : 'error'}
            </span>
            {status.msg}
        </div>
    )
}

export default function AppIntegrationsSettings() {
    const [loading, setLoading] = useState(true)
    const [savingUltraMsg, setSavingUltraMsg] = useState(false)
    const [savingEmail, setSavingEmail] = useState(false)
    const [statusUltraMsg, setStatusUltraMsg] = useState(null)
    const [statusEmail, setStatusEmail] = useState(null)
    const [showToken, setShowToken] = useState(false)
    const [showSmtpPw, setShowSmtpPw] = useState(false)
    const [config, setConfig] = useState({
        ULTRAMSG_INSTANCE_ID: '',
        ULTRAMSG_TOKEN: '',
        SMTP_HOST: '',
        SMTP_PORT: '587',
        SMTP_USERNAME: '',
        SMTP_PASSWORD: ''
    })

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/settings/map')
                setConfig(prev => ({
                    ...prev,
                    ...res.data
                }))
            } catch (error) {
                console.error("Failed to load app settings", error)
            } finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [])

    const handleChange = (key) => (e) => {
        setConfig(prev => ({ ...prev, [key]: e.target.value }))
    }

    const handleSaveUltraMsg = async () => {
        setSavingUltraMsg(true)
        setStatusUltraMsg(null)
        try {
            const sectionKeys = ['ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN']
            for (const key of sectionKeys) {
                await api.patch(`/api/settings/${key}`, { value: config[key] })
            }
            setStatusUltraMsg({ type: 'success', msg: 'WhatsApp Configuration saved successfully!' })
            setTimeout(() => setStatusUltraMsg(null), 3000)
        } catch (error) {
            setStatusUltraMsg({ type: 'error', msg: 'Failed to save WhatsApp configuration' })
        } finally {
            setSavingUltraMsg(false)
        }
    }

    const handleSaveEmail = async () => {
        setSavingEmail(true)
        setStatusEmail(null)
        try {
            const sectionKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD']
            for (const key of sectionKeys) {
                await api.patch(`/api/settings/${key}`, { value: config[key] })
            }
            setStatusEmail({ type: 'success', msg: 'Email Configuration saved successfully!' })
            setTimeout(() => setStatusEmail(null), 3000)
        } catch (error) {
            setStatusEmail({ type: 'error', msg: 'Failed to save Email configuration' })
        } finally {
            setSavingEmail(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: T.primary }}></div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-4xl">
            
            {/* UltraMsg Integration */}
            <div className="rounded-2xl p-6 border" style={{ background: T.surface, borderColor: T.border }}>
                <StatusBanner status={statusUltraMsg} />
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-green-500" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                            <span className="material-symbols-outlined">chat</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">WhatsApp Integration (UltraMsg)</h3>
                            <p className="text-xs" style={{ color: T.textSecondary }}>Configure UltraMsg to send automatic welcome messages to new companies.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSecondary }}>Instance ID</label>
                        <input
                            type="text"
                            value={config.ULTRAMSG_INSTANCE_ID}
                            onChange={handleChange('ULTRAMSG_INSTANCE_ID')}
                            className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                            placeholder="e.g. instance12345"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSecondary }}>Token</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={config.ULTRAMSG_TOKEN}
                                onChange={handleChange('ULTRAMSG_TOKEN')}
                                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                                style={{ background: T.surface, borderColor: T.border, color: T.textPrimary, paddingRight: 44 }}
                                placeholder="Enter UltraMsg Token"
                            />
                            <button type="button" onClick={() => setShowToken(!showToken)}
                                className="material-symbols-outlined"
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    fontSize: 17, background: 'none', border: 'none', cursor: 'pointer',
                                    color: showToken ? T.primary : T.textMuted, transition: 'color 0.15s',
                                }}>
                                {showToken ? 'visibility' : 'visibility_off'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSaveUltraMsg}
                        disabled={savingUltraMsg}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        style={{ background: T.primary }}
                    >
                        {savingUltraMsg ? 'Saving...' : 'Save WhatsApp Config'}
                    </button>
                </div>
            </div>

            {/* SMTP Integration */}
            <div className="rounded-2xl p-6 border" style={{ background: T.surface, borderColor: T.border }}>
                <StatusBanner status={statusEmail} />
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-500" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Email Integration (SMTP)</h3>
                            <p className="text-xs" style={{ color: T.textSecondary }}>Configure your SMTP server to send automatic welcome emails.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSecondary }}>SMTP Host</label>
                        <input
                            type="text"
                            value={config.SMTP_HOST}
                            onChange={handleChange('SMTP_HOST')}
                            className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                            placeholder="e.g. smtp.gmail.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSecondary }}>SMTP Port</label>
                        <input
                            type="text"
                            value={config.SMTP_PORT}
                            onChange={handleChange('SMTP_PORT')}
                            className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                            placeholder="e.g. 587"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSecondary }}>SMTP Username</label>
                        <input
                            type="text"
                            value={config.SMTP_USERNAME}
                            onChange={handleChange('SMTP_USERNAME')}
                            className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSecondary }}>SMTP Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showSmtpPw ? 'text' : 'password'}
                                value={config.SMTP_PASSWORD}
                                onChange={handleChange('SMTP_PASSWORD')}
                                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                                style={{ background: T.surface, borderColor: T.border, color: T.textPrimary, paddingRight: 44 }}
                                placeholder="App password or standard password"
                            />
                            <button type="button" onClick={() => setShowSmtpPw(!showSmtpPw)}
                                className="material-symbols-outlined"
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    fontSize: 17, background: 'none', border: 'none', cursor: 'pointer',
                                    color: showSmtpPw ? T.primary : T.textMuted, transition: 'color 0.15s',
                                }}>
                                {showSmtpPw ? 'visibility' : 'visibility_off'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSaveEmail}
                        disabled={savingEmail}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        style={{ background: T.primary }}
                    >
                        {savingEmail ? 'Saving...' : 'Save Email Config'}
                    </button>
                </div>
            </div>

        </div>
    )
}
