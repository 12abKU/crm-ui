import { useEffect, useState } from 'react'
import { T, STAGES, STAGE_LABELS } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import api, { extractApiErrorMessage } from '../../api'

const EVENTS = [
    { value: 'DEAL_CREATED', label: 'Deal Created' },
    { value: 'DEAL_STAGE_CHANGED', label: 'Deal Stage Changed' },
    { value: 'CONTACT_CREATED', label: 'Contact Created' },
]

const ACTIONS = [
    { value: 'CREATE_TASK', label: 'Create Activity Task' },
    { value: 'SEND_NOTIFICATION', label: 'Send In-App Notification' },
    { value: 'SEND_EMAIL_TEMPLATE', label: 'Auto-Send Email Template' },
]

export default function AutomatedSequencesSettings() {
    const [rules, setRules] = useState([])
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editId, setEditId] = useState(null)

    // Form fields
    const [name, setName] = useState('')
    const [triggerEvent, setTriggerEvent] = useState('DEAL_STAGE_CHANGED')
    const [triggerValue, setTriggerValue] = useState('PROPOSAL')
    const [actionType, setActionType] = useState('CREATE_TASK')
    const [actionSubject, setActionSubject] = useState('')
    const [actionBody, setActionBody] = useState('')
    const [delayDays, setDelayDays] = useState(0)
    const [emailTemplateId, setEmailTemplateId] = useState('')
    const [active, setActive] = useState(true)

    const [formError, setFormError] = useState(null)
    const [saving, setSaving] = useState(false)

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [rulesRes, templatesRes] = await Promise.all([
                api.get('/api/workflow-rules'),
                api.get('/api/email-templates'),
            ])
            setRules(rulesRes.data)
            setTemplates(templatesRes.data)
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Failed to load automation data'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const openCreate = () => {
        setEditId(null)
        setName('')
        setTriggerEvent('DEAL_STAGE_CHANGED')
        setTriggerValue('PROPOSAL')
        setActionType('CREATE_TASK')
        setActionSubject('')
        setActionBody('')
        setDelayDays(0)
        setEmailTemplateId(templates[0]?.id || '')
        setActive(true)
        setFormError(null)
        setEditorOpen(true)
    }

    const openEdit = (r) => {
        setEditId(r.id)
        setName(r.name || '')
        setTriggerEvent(r.triggerEvent || 'DEAL_STAGE_CHANGED')
        setTriggerValue(r.triggerValue || '')
        setActionType(r.actionType || 'CREATE_TASK')
        setActionSubject(r.actionSubject || '')
        setActionBody(r.actionBody || '')
        setDelayDays(r.delayDays || 0)
        setEmailTemplateId(r.emailTemplate?.id || '')
        setActive(r.active !== false)
        setFormError(null)
        setEditorOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!name.trim()) return setFormError('Rule name is required')
        
        setSaving(true)
        setFormError(null)
        try {
            const payload = {
                name,
                triggerEvent,
                triggerValue: triggerEvent === 'DEAL_STAGE_CHANGED' ? triggerValue : null,
                actionType,
                actionSubject: actionType !== 'SEND_EMAIL_TEMPLATE' ? actionSubject : null,
                actionBody: actionType !== 'SEND_EMAIL_TEMPLATE' ? actionBody : null,
                delayDays: Number(delayDays) || 0,
                active,
                emailTemplate: actionType === 'SEND_EMAIL_TEMPLATE' && emailTemplateId 
                    ? { id: Number(emailTemplateId) } 
                    : null
            }

            if (editId) {
                await api.put(`/api/workflow-rules/${editId}`, payload)
            } else {
                await api.post('/api/workflow-rules', payload)
            }
            loadData()
            setEditorOpen(false)
        } catch (err) {
            setFormError(extractApiErrorMessage(err, 'Failed to save rule'))
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (rule) => {
        try {
            await api.put(`/api/workflow-rules/${rule.id}`, {
                ...rule,
                active: !rule.active
            })
            loadData()
        } catch (err) {
            alert(extractApiErrorMessage(err, 'Could not toggle status'))
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this sequence rule? This cannot be undone.')) return
        try {
            await api.delete(`/api/workflow-rules/${id}`)
            loadData()
        } catch (err) {
            alert(extractApiErrorMessage(err, 'Could not delete rule'))
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <SettingsSection 
                title="Automated Sequences" 
                description="Configure rules to automatically trigger follow-ups, schedule task activities, or send notifications when deals are updated or contacts are created."
                noPad
            >
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                        {rules.length} active rule{rules.length !== 1 ? 's' : ''} configured
                    </p>
                    <button onClick={openCreate} className="crm-btn-primary flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Create Sequence Rule
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-16">
                        <div className="w-6 h-6 rounded-full border-2 animate-spin"
                            style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                        <span className="text-sm" style={{ color: T.textMuted }}>Loading sequences...</span>
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color: T.error }}>error</span>
                        <p className="text-sm" style={{ color: T.textMuted }}>{error}</p>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="py-16 text-center">
                        <span className="material-symbols-outlined text-[48px] block mb-2" style={{ color: T.textMuted }}>settings_suggest</span>
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No sequence rules configured</p>
                        <p className="text-[12px] mt-1" style={{ color: T.textMuted }}>Automate your workflow tasks, notifications, and emails by clicking Create Sequence Rule.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Rule Name</th>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Trigger Event</th>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Action</th>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Delay</th>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Status</th>
                                    <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map(r => {
                                    const triggerLabel = EVENTS.find(e => e.value === r.triggerEvent)?.label || r.triggerEvent
                                    const actionLabel = ACTIONS.find(a => a.value === r.actionType)?.label || r.actionType
                                    
                                    return (
                                        <tr key={r.id} className="hover:bg-orange-50/30 transition-colors" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                            <td className="px-6 py-4 font-bold text-sm" style={{ color: T.textPrimary }}>
                                                {r.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                                <div className="flex flex-col">
                                                    <span>{triggerLabel}</span>
                                                    {r.triggerValue && (
                                                        <span className="text-[11px] font-bold text-orange-600 mt-0.5">
                                                            → {STAGE_LABELS[r.triggerValue] || r.triggerValue} Stage
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>
                                                <div className="flex flex-col">
                                                    <span>{actionLabel}</span>
                                                    {r.actionType === 'SEND_EMAIL_TEMPLATE' && r.emailTemplate && (
                                                        <span className="text-[11px] font-medium text-emerald-600 mt-0.5">
                                                            📄 {r.emailTemplate.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold" style={{ color: T.textPrimary }}>
                                                {r.delayDays === 0 ? (
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.successDim, color: T.success }}>Instant</span>
                                                ) : (
                                                    <span>{r.delayDays} day{r.delayDays !== 1 ? 's' : ''} delay</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => toggleActive(r)} 
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all"
                                                    style={{ 
                                                        background: r.active ? T.successDim : T.surfaceHigh, 
                                                        color: r.active ? T.success : T.textMuted,
                                                        border: `1px solid ${r.active ? T.success + '33' : T.border}`
                                                    }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.active ? T.success : T.textMuted }} />
                                                    {r.active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.primary }}>
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors" style={{ color: T.error }}>
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SettingsSection>

            {/* Sequence Rule Modal */}
            {editorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <div>
                                <h3 className="font-black text-lg" style={{ color: T.textPrimary }}>
                                    {editId ? 'Edit Sequence Rule' : 'Create Sequence Rule'}
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Map trigger events to automated actions in the sales pipeline.</p>
                            </div>
                            <button onClick={() => setEditorOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.textSecondary }}>
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Body Form */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {formError && (
                                <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: T.errorDim, color: T.error }}>
                                    {formError}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Rule Name</label>
                                <input 
                                    type="text" 
                                    className="crm-input w-full"
                                    placeholder="e.g. Send Proposal Follow-up Email"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Trigger Event</label>
                                    <select 
                                        className="crm-input w-full"
                                        value={triggerEvent}
                                        onChange={e => setTriggerEvent(e.target.value)}
                                    >
                                        {EVENTS.map(ev => (
                                            <option key={ev.value} value={ev.value}>{ev.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {triggerEvent === 'DEAL_STAGE_CHANGED' && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Target Deal Stage</label>
                                        <select 
                                            className="crm-input w-full"
                                            value={triggerValue}
                                            onChange={e => setTriggerValue(e.target.value)}
                                        >
                                            {STAGES.map(st => (
                                                <option key={st} value={st}>{STAGE_LABELS[st]}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Action to Take</label>
                                    <select 
                                        className="crm-input w-full"
                                        value={actionType}
                                        onChange={e => setActionType(e.target.value)}
                                    >
                                        {ACTIONS.map(ac => (
                                            <option key={ac.value} value={ac.value}>{ac.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Delay Before Executing (Days)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="crm-input w-full"
                                        value={delayDays}
                                        onChange={e => setDelayDays(e.target.value)}
                                        required
                                    />
                                    <span className="text-[10px]" style={{ color: T.textMuted }}>0 means the workflow executes immediately when triggered.</span>
                                </div>
                            </div>

                            {/* Email Template Select option */}
                            {actionType === 'SEND_EMAIL_TEMPLATE' ? (
                                <div className="flex flex-col gap-1.5 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Select Email Template</label>
                                    {templates.length === 0 ? (
                                        <p className="text-xs" style={{ color: T.error }}>
                                            No email templates found. Please create an email template in settings first.
                                        </p>
                                    ) : (
                                        <select 
                                            className="crm-input w-full"
                                            value={emailTemplateId}
                                            onChange={e => setEmailTemplateId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose Template --</option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} (Subject: {t.subject})</option>
                                            ))}
                                        </select>
                                    )}
                                    <span className="text-[10px]" style={{ color: T.textMuted }}>
                                        The email will be sent automatically from the Gmail account connected by the assignee/owner.
                                    </span>
                                </div>
                            ) : (
                                /* Subject & Body inputs for Notification/Task */
                                <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                                            {actionType === 'CREATE_TASK' ? 'Task Title' : 'Notification Title'}
                                        </label>
                                        <input 
                                            type="text" 
                                            className="crm-input w-full"
                                            placeholder="e.g. Schedule follow-up call with {{contact.firstName}}"
                                            value={actionSubject}
                                            onChange={e => setActionSubject(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                                            {actionType === 'CREATE_TASK' ? 'Task Description / Notes' : 'Notification Body'}
                                        </label>
                                        <textarea 
                                            className="crm-input w-full h-24"
                                            placeholder="e.g. Lead moved to Proposal. Check-in within 24 hours."
                                            value={actionBody}
                                            onChange={e => setActionBody(e.target.value)}
                                        />
                                    </div>
                                    <span className="text-[10px]" style={{ color: T.textMuted }}>
                                        Supports dynamic interpolation tags like <code>{`{{contact.firstName}}`}</code>, <code>{`{{deal.title}}`}</code>.
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                                <input 
                                    id="rule-active"
                                    type="checkbox"
                                    checked={active}
                                    onChange={e => setActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-orange-300"
                                />
                                <label htmlFor="rule-active" className="text-sm font-bold cursor-pointer" style={{ color: T.textPrimary }}>
                                    Enable this automation rule immediately
                                </label>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <button type="button" onClick={() => setEditorOpen(false)} className="crm-btn-secondary" disabled={saving}>
                                Cancel
                            </button>
                            <button type="button" onClick={handleSave} className="crm-btn-primary flex items-center gap-2" disabled={saving}>
                                {saving ? (
                                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                                ) : <span className="material-symbols-outlined text-[16px]">save</span>}
                                {saving ? 'Saving...' : 'Save Sequence Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
