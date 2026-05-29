import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'

const LIMIT_FIELDS = [
    {
        key: 'maxUsers',
        label: 'Max Users',
        icon: 'group',
        desc: 'Maximum number of users (all roles) in the company',
        color: T.primary,
        bg: T.primaryDim,
    },
    {
        key: 'maxContacts',
        label: 'Max Contacts',
        icon: 'contacts',
        desc: 'Maximum number of contacts the company can create',
        color: T.success,
        bg: T.successDim,
    },
    {
        key: 'maxAccounts',
        label: 'Max Accounts',
        icon: 'business',
        desc: 'Maximum number of company accounts',
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
    },
    {
        key: 'maxDeals',
        label: 'Max Deals',
        icon: 'handshake',
        desc: 'Maximum number of deals (across all pipelines)',
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,0.12)',
    },
]

function Spinner() {
    return (
        <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: `2px solid ${T.primary}`, borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
    )
}

export default function PlanConfigPanel({ companyId }) {
    const [config, setConfig] = useState(null)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
    const [dirty, setDirty] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const r = await api.get(`/api/platform/companies/${companyId}/plan-config`)
            setConfig(r.data)
            setForm({
                maxUsers: r.data.maxUsers,
                maxContacts: r.data.maxContacts,
                maxAccounts: r.data.maxAccounts,
                maxDeals: r.data.maxDeals,
            })
            setDirty(false)
        } catch (e) {
            setStatus({ type: 'error', msg: 'Failed to load plan configuration' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [companyId])

    const handleChange = (key, val) => {
        const num = parseInt(val)
        setForm(f => ({ ...f, [key]: isNaN(num) ? val : num }))
        setDirty(true)
        setStatus(null)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        // Validate
        for (const { key, label } of LIMIT_FIELDS) {
            const v = parseInt(form[key])
            if (isNaN(v) || v < 1) {
                setStatus({ type: 'error', msg: `${label} must be a positive number.` })
                return
            }
        }
        setSaving(true)
        setStatus(null)
        try {
            const r = await api.put(`/api/platform/companies/${companyId}/plan-config`, form)
            setConfig(r.data)
            setDirty(false)
            setStatus({ type: 'success', msg: 'Plan limits saved successfully!' })
            setTimeout(() => setStatus(null), 3500)
        } catch (err) {
            setStatus({ type: 'error', msg: err?.response?.data?.message || 'Failed to save plan limits.' })
        } finally {
            setSaving(false)
        }
    }

    const handleReset = async () => {
        if (!window.confirm('Reset plan limits to system defaults? This cannot be undone.')) return
        setResetting(true)
        setStatus(null)
        try {
            await api.delete(`/api/platform/companies/${companyId}/plan-config`)
            await load()
            setStatus({ type: 'success', msg: 'Plan limits reset to defaults.' })
            setTimeout(() => setStatus(null), 3500)
        } catch (err) {
            setStatus({ type: 'error', msg: 'Failed to reset plan limits.' })
        } finally {
            setResetting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-base font-black" style={{ color: T.textPrimary }}>
                        SaaS Resource Limits
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                        Control how many resources this company can create.
                        Changes take effect immediately.
                    </p>
                </div>
                {config?.updatedAt && (
                    <div className="text-xs shrink-0 px-3 py-1.5 rounded-lg"
                        style={{ background: T.surfaceRaised, color: T.textMuted, border: `1px solid ${T.border}` }}>
                        <span className="material-symbols-outlined text-[11px] align-middle mr-1">update</span>
                        Last updated {new Date(config.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        {config.updatedBy && ` by ${config.updatedBy}`}
                    </div>
                )}
            </div>

            {/* Status Banner */}
            {status && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{
                        background: status.type === 'success' ? T.successDim : T.errorDim,
                        border: `1px solid ${status.type === 'success' ? T.success + '40' : T.error + '40'}`,
                        color: status.type === 'success' ? T.success : T.error,
                    }}>
                    <span className="material-symbols-outlined text-[16px]">
                        {status.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {status.msg}
                </div>
            )}

            {/* Limit cards */}
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {LIMIT_FIELDS.map(({ key, label, icon, desc, color, bg }) => (
                        <div key={key} className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
                            style={{
                                background: T.surface,
                                border: `1.5px solid ${dirty && form[key] !== config?.[key] ? color + '60' : T.border}`,
                                boxShadow: dirty && form[key] !== config?.[key] ? `0 0 0 3px ${color}14` : 'none',
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: bg }}>
                                    <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>{label}</p>
                                    <p className="text-[10px] leading-snug" style={{ color: T.textMuted }}>{desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="999999"
                                    className="crm-input flex-1 text-center text-lg font-black"
                                    style={{ color, borderColor: color + '40' }}
                                    value={form[key] ?? ''}
                                    onChange={e => handleChange(key, e.target.value)}
                                />
                                {/* Quick-set buttons */}
                                <div className="flex flex-col gap-1">
                                    {[5, 25, 100, 500, 1000].filter(v => {
                                        // Show relevant presets based on type
                                        if (key === 'maxUsers') return [5, 10, 25, 50, 100].includes(v)
                                        if (key === 'maxDeals') return [20, 100, 500, 1000].includes(v)
                                        return true
                                    }).slice(0, 3).map(preset => (
                                        <button key={preset} type="button"
                                            onClick={() => handleChange(key, preset)}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-md transition-all"
                                            style={{
                                                background: form[key] === preset ? color + '22' : T.surfaceRaised,
                                                color: form[key] === preset ? color : T.textMuted,
                                                border: `1px solid ${form[key] === preset ? color + '40' : T.border}`,
                                            }}>
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5 pt-5"
                    style={{ borderTop: `1px solid ${T.border}` }}>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={resetting || saving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: T.errorDim,
                            color: T.error,
                            border: `1px solid ${T.error}30`,
                            opacity: resetting || saving ? 0.6 : 1,
                        }}>
                        {resetting ? <Spinner /> : <span className="material-symbols-outlined text-[15px]">restart_alt</span>}
                        Reset to Defaults
                    </button>

                    <button
                        type="submit"
                        disabled={saving || !dirty}
                        className="crm-btn-primary flex items-center gap-2 text-sm px-6"
                        style={{ opacity: saving || !dirty ? 0.6 : 1 }}>
                        {saving ? <Spinner /> : <span className="material-symbols-outlined text-[15px]">save</span>}
                        {saving ? 'Saving…' : 'Save Limits'}
                    </button>
                </div>
            </form>
        </div>
    )
}
