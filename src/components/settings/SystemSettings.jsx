import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'
import { IconSettings, IconCheck, IconX, IconPlus, IconTrash, IconEdit, IconRefresh } from '@tabler/icons-react'

const TYPE_LABELS = {
    json_array: 'List',
    json_object: 'Key-Value Map',
    string: 'Text',
    number: 'Number',
    boolean: 'Yes/No',
}

function ArrayEditor({ value, onChange }) {
    const items = (() => { try { return JSON.parse(value) } catch { return [] } })()
    const [draft, setDraft] = useState('')

    const add = () => {
        if (!draft.trim()) return
        onChange(JSON.stringify([...items, draft.trim()]))
        setDraft('')
    }
    const remove = (i) => onChange(JSON.stringify(items.filter((_, idx) => idx !== i)))
    const move = (i, dir) => {
        const arr = [...items]
        const j = i + dir
        if (j < 0 || j >= arr.length) return
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        onChange(JSON.stringify(arr))
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                        <span className="flex-1 text-sm" style={{ color: T.textPrimary }}>{item}</span>
                        <button onClick={() => move(i, -1)} disabled={i === 0}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ color: T.textMuted, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                        <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ color: T.textMuted, opacity: i === items.length - 1 ? 0.3 : 1 }}>↓</button>
                        <button onClick={() => remove(i)}
                            className="p-1 rounded hover:opacity-80"
                            style={{ color: T.error }}>
                            <IconTrash size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                    placeholder="Add new item..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrimary }}
                />
                <button onClick={add}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: T.primaryDim, color: T.primary }}>
                    <IconPlus size={14} /> Add
                </button>
            </div>
        </div>
    )
}

function StringEditor({ value, onChange }) {
    return (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrimary }}
        />
    )
}

function SettingRow({ setting, onSaved }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(setting.value)
    const [saving, setSaving] = useState(false)

    const save = async () => {
        setSaving(true)
        try {
            await api.patch(`/api/settings/${setting.key}`, { value: draft })
            onSaved(setting.key, draft)
            setEditing(false)
        } finally { setSaving(false) }
    }

    const cancel = () => { setDraft(setting.value); setEditing(false) }

    const displayValue = () => {
        if (setting.type === 'json_array') {
            try {
                const arr = JSON.parse(setting.value)
                return arr.join(', ')
            } catch { return setting.value }
        }
        return setting.value
    }

    return (
        <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-1">
                <div>
                    <h4 className="text-sm font-bold" style={{ color: T.textPrimary }}>{setting.label}</h4>
                    <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{setting.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {TYPE_LABELS[setting.type] || setting.type}
                    </span>
                    {!editing && (
                        <button onClick={() => { setDraft(setting.value); setEditing(true) }}
                            className="p-1.5 rounded-lg hover:opacity-80"
                            style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                            <IconEdit size={14} />
                        </button>
                    )}
                </div>
            </div>

            {!editing ? (
                <p className="text-sm mt-3 px-3 py-2 rounded-lg truncate"
                    style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                    {displayValue()}
                </p>
            ) : (
                <div className="mt-3 flex flex-col gap-3">
                    {setting.type === 'json_array'
                        ? <ArrayEditor value={draft} onChange={setDraft} />
                        : <StringEditor value={draft} onChange={setDraft} />
                    }
                    <div className="flex gap-2">
                        <button onClick={save} disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold"
                            style={{ background: T.success, color: '#fff', opacity: saving ? 0.7 : 1 }}>
                            <IconCheck size={14} />{saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={cancel}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold"
                            style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                            <IconX size={14} /> Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const GROUPS = [
    { key: 'account', label: 'Account Settings', keys: ['account.tags', 'account.employee_ranges', 'account.industries'] },
    { key: 'deal', label: 'Deal Settings', keys: ['deal.stage_labels', 'deal.currency_symbol', 'deal.currency_code'] },
    { key: 'activity', label: 'Activity Settings', keys: ['activity.outcome_options'] },
    { key: 'app', label: 'App Settings', keys: ['app.name', 'app.support_email'] },
]

export default function SystemSettings() {
    const [settings, setSettings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/settings')
            .then(r => setSettings(r.data))
            .finally(() => setLoading(false))
    }, [])

    const handleSaved = (key, value) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
    }

    const byKey = Object.fromEntries(settings.map(s => [s.key, s]))

    if (loading) return (
        <div className="py-12 text-center text-sm" style={{ color: T.textMuted }}>Loading settings...</div>
    )

    return (
        <div className="flex flex-col gap-8">
            {GROUPS.map(group => {
                const groupSettings = group.keys.map(k => byKey[k]).filter(Boolean)
                if (!groupSettings.length) return null
                return (
                    <section key={group.key}>
                        <div className="flex items-center gap-2 mb-4">
                            <IconSettings size={16} style={{ color: T.primary }} />
                            <h3 className="text-sm font-bold uppercase tracking-widest"
                                style={{ color: T.textSecondary }}>{group.label}</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {groupSettings.map(s => (
                                <SettingRow key={s.key} setting={s} onSaved={handleSaved} />
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}