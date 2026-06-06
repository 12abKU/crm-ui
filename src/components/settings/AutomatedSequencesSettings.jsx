import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import SettingsSection from './SettingsSection'
import api, { extractApiErrorMessage } from '../../api'
import ConfirmModal from '../ui/ConfirmModal'
import CustomSelect from '../ui/CustomSelect'

// ─── Trigger Events ────────────────────────────────────────────────────────────
const EVENTS = [
    // Deal triggers
    { value: 'DEAL_CREATED',       label: 'Deal Created',                  group: 'Deals',    icon: 'add_shopping_cart' },
    { value: 'DEAL_STAGE_CHANGED', label: 'Deal Stage Changed',            group: 'Deals',    icon: 'published_with_changes' },
    { value: 'DEAL_WON',           label: 'Deal Won (Closed Won)',          group: 'Deals',    icon: 'emoji_events' },
    { value: 'DEAL_LOST',          label: 'Deal Lost (Closed Lost)',        group: 'Deals',    icon: 'cancel' },
    { value: 'DEAL_AMOUNT_ABOVE',  label: 'Deal Amount Exceeds Threshold',  group: 'Deals',    icon: 'paid' },
    // Contact & Account triggers
    { value: 'CONTACT_CREATED',    label: 'Contact Created',               group: 'People',   icon: 'person_add' },
    { value: 'ACCOUNT_CREATED',    label: 'Account Created',               group: 'People',   icon: 'business' },
    // Activity triggers
    { value: 'ACTIVITY_COMPLETED', label: 'Activity Completed',            group: 'Activity', icon: 'task_alt' },
]

// ─── Action Types ──────────────────────────────────────────────────────────────
const ACTIONS = [
    { value: 'CREATE_TASK',        label: 'Create Task Activity',          icon: 'assignment' },
    { value: 'SEND_NOTIFICATION',  label: 'Send In-App Notification',      icon: 'notifications_active' },
    { value: 'SEND_EMAIL_TEMPLATE',label: 'Auto-Send Email Template',      icon: 'mail' },
    { value: 'SEND_WHATSAPP',      label: 'Send WhatsApp Message',         icon: 'chat' },
    { value: 'UPDATE_DEAL_STAGE',  label: 'Update Deal Stage',             icon: 'swap_horiz' },
    { value: 'ASSIGN_OWNER',       label: 'Reassign Owner',                icon: 'manage_accounts' },
    { value: 'CREATE_ACTIVITY',    label: 'Create Activity (Custom Type)', icon: 'event_note' },
]

const ACTIVITY_TYPES = [
    { value: 'TASK',    label: '📋 Task' },
    { value: 'CALL',    label: '📞 Call' },
    { value: 'MEETING', label: '🤝 Meeting' },
    { value: 'EMAIL',   label: '✉️  Email' },
    { value: 'NOTE',    label: '📝 Note' },
]

// ─── Triggers that need a triggerValue input ───────────────────────────────────
const TRIGGER_VALUE_CONFIG = {
    DEAL_STAGE_CHANGED: { type: 'stage_picker',  label: 'Target Stage' },
    DEAL_AMOUNT_ABOVE:  { type: 'number_input',  label: 'Amount Threshold' },
    ACTIVITY_COMPLETED: { type: 'activity_type', label: 'Activity Type (optional — leave blank for any)' },
}

// ─── Actions that need special inputs beyond subject/body ──────────────────────
const ACTION_CONFIG = {
    SEND_EMAIL_TEMPLATE: 'template_picker',
    UPDATE_DEAL_STAGE:   'stage_picker',
    ASSIGN_OWNER:        'user_picker',
    CREATE_ACTIVITY:     'activity_type_picker',
    SEND_WHATSAPP:       'body_only',
}

const EMPTY_TRIGGER_VALUE = { DEAL_STAGE_CHANGED: '', DEAL_AMOUNT_ABOVE: '', ACTIVITY_COMPLETED: '' }

export default function AutomatedSequencesSettings() {
    const { stages, getStageLabel } = usePipelineStages()
    const [rules, setRules] = useState([])
    const [templates, setTemplates] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [viewMode, setViewMode] = useState('list')
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    // ── Form state ──────────────────────────────────────────────────────────────
    const [name, setName] = useState('')
    const [triggerEvent, setTriggerEvent] = useState('DEAL_STAGE_CHANGED')
    const [triggerValue, setTriggerValue] = useState('')
    const [actionType, setActionType] = useState('CREATE_TASK')
    const [actionSubject, setActionSubject] = useState('')
    const [actionBody, setActionBody] = useState('')
    const [delayDays, setDelayDays] = useState(0)
    const [emailTemplateId, setEmailTemplateId] = useState('')
    const [active, setActive] = useState(true)
    const [formError, setFormError] = useState(null)
    const [saving, setSaving] = useState(false)

    // ── Load data ───────────────────────────────────────────────────────────────
    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [rulesRes, templatesRes, usersRes] = await Promise.all([
                api.get('/api/workflow-rules'),
                api.get('/api/email-templates'),
                api.get('/api/management/users').catch(() => ({ data: [] })),
            ])
            setRules(rulesRes.data)
            setTemplates(templatesRes.data)
            setUsers(usersRes.data || [])
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Failed to load automation data'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const resetForm = () => {
        setName('')
        setTriggerEvent('DEAL_STAGE_CHANGED')
        setTriggerValue(stages[0]?.stageKey || '')
        setActionType('CREATE_TASK')
        setActionSubject('')
        setActionBody('')
        setDelayDays(0)
        setEmailTemplateId(templates[0]?.id || '')
        setActive(true)
        setFormError(null)
    }

    const openCreate = () => { setEditId(null); resetForm(); setEditorOpen(true) }

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

    /** Build triggerValue for payload based on event type */
    const buildTriggerValue = () => {
        const cfg = TRIGGER_VALUE_CONFIG[triggerEvent]
        if (!cfg) return null
        return triggerValue || null
    }

    /** Build actionSubject for payload based on action type */
    const buildActionSubject = () => {
        if (actionType === 'SEND_EMAIL_TEMPLATE') return null
        if (actionType === 'SEND_WHATSAPP') return null
        return actionSubject || null
    }

    /** Build actionBody for payload based on action type */
    const buildActionBody = () => {
        if (actionType === 'SEND_EMAIL_TEMPLATE') return null
        return actionBody || null
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!name.trim()) return setFormError('Rule name is required')
        if (actionType === 'SEND_EMAIL_TEMPLATE' && !emailTemplateId) return setFormError('Please select an email template')
        if (actionType === 'UPDATE_DEAL_STAGE' && !actionSubject) return setFormError('Please select a target stage')
        if (actionType === 'ASSIGN_OWNER' && !actionSubject) return setFormError('Please select a user to assign as owner')

        setSaving(true)
        setFormError(null)
        try {
            const payload = {
                name,
                triggerEvent,
                triggerValue: buildTriggerValue(),
                actionType,
                actionSubject: buildActionSubject(),
                actionBody: buildActionBody(),
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
            await api.put(`/api/workflow-rules/${rule.id}`, { ...rule, active: !rule.active })
            loadData()
        } catch (err) { console.error(err) }
    }

    const confirmDelete = async () => {
        if (!deleteConfirmId) return
        try {
            await api.delete(`/api/workflow-rules/${deleteConfirmId}`)
            loadData()
        } catch (err) { console.error(err) }
        finally { setDeleteConfirmId(null) }
    }

    // ─── Derived display helpers ─────────────────────────────────────────────────
    const getTriggerLabel  = (v) => EVENTS.find(e => e.value === v)?.label || v
    const getTriggerIcon   = (v) => EVENTS.find(e => e.value === v)?.icon  || 'bolt'
    const getActionLabel   = (v) => ACTIONS.find(a => a.value === v)?.label || v
    const getActionIcon    = (v) => ACTIONS.find(a => a.value === v)?.icon  || 'task_alt'
    const getActivityLabel = (v) => ACTIVITY_TYPES.find(t => t.value === v)?.label || v
    const getUserName      = (id) => users.find(u => String(u.id) === String(id))?.name || `User #${id}`

    const getTriggerValueDisplay = (r) => {
        if (!r.triggerValue) return null
        if (r.triggerEvent === 'DEAL_STAGE_CHANGED') return `→ Stage: ${getStageLabel(r.triggerValue)}`
        if (r.triggerEvent === 'DEAL_AMOUNT_ABOVE')  return `→ Above: ${Number(r.triggerValue).toLocaleString()}`
        if (r.triggerEvent === 'ACTIVITY_COMPLETED' && r.triggerValue) return `→ Type: ${getActivityLabel(r.triggerValue)}`
        return null
    }

    const getActionDetail = (r) => {
        if (r.actionType === 'SEND_EMAIL_TEMPLATE' && r.emailTemplate) return `📄 ${r.emailTemplate.name}`
        if (r.actionType === 'UPDATE_DEAL_STAGE'  && r.actionSubject)  return `→ Stage: ${r.actionSubject}`
        if (r.actionType === 'ASSIGN_OWNER'        && r.actionSubject)  return `→ ${getUserName(r.actionSubject)}`
        if (r.actionType === 'CREATE_ACTIVITY'     && r.actionSubject)  return `Type: ${getActivityLabel(r.actionSubject)}`
        return r.actionSubject || null
    }

    // ─── Form sub-components ─────────────────────────────────────────────────────
    const triggerValueConfig = TRIGGER_VALUE_CONFIG[triggerEvent]
    const actionMode = ACTION_CONFIG[actionType]

    const renderTriggerValueField = () => {
        if (!triggerValueConfig) return null

        if (triggerValueConfig.type === 'stage_picker') return (
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>{triggerValueConfig.label}</label>
                <CustomSelect className="crm-input w-full" value={triggerValue} onChange={e => setTriggerValue(e.target.value)}>
                    {stages.map(st => <option key={st.stageKey} value={st.stageKey}>{st.label}</option>)}
                </CustomSelect>
            </div>
        )

        if (triggerValueConfig.type === 'number_input') return (
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>{triggerValueConfig.label}</label>
                <input
                    type="number" min="0" className="crm-input w-full"
                    placeholder="e.g. 50000"
                    value={triggerValue}
                    onChange={e => setTriggerValue(e.target.value)}
                />
                <span className="text-[10px]" style={{ color: T.textMuted }}>Trigger fires when deal amount ≥ this value.</span>
            </div>
        )

        if (triggerValueConfig.type === 'activity_type') return (
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>{triggerValueConfig.label}</label>
                <CustomSelect className="crm-input w-full" value={triggerValue} onChange={e => setTriggerValue(e.target.value)}>
                    <option value="">Any Activity Type</option>
                    {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </CustomSelect>
            </div>
        )

        return null
    }

    const renderActionFields = () => {
        // Email template picker
        if (actionMode === 'template_picker') return (
            <div className="flex flex-col gap-1.5 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Select Email Template</label>
                {templates.length === 0 ? (
                    <p className="text-xs" style={{ color: T.error }}>No email templates found. Create one in Email Templates settings first.</p>
                ) : (
                    <CustomSelect className="crm-input w-full" value={emailTemplateId} onChange={e => setEmailTemplateId(e.target.value)} required>
                        <option value="">-- Choose Template --</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
                    </CustomSelect>
                )}
                <span className="text-[10px]" style={{ color: T.textMuted }}>Sent via the Gmail account connected by the deal/contact owner.</span>
            </div>
        )

        // Stage picker for UPDATE_DEAL_STAGE
        if (actionMode === 'stage_picker') return (
            <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Target Stage</label>
                <CustomSelect className="crm-input w-full" value={actionSubject} onChange={e => setActionSubject(e.target.value)} required>
                    <option value="">-- Select Stage --</option>
                    {stages.map(st => <option key={st.stageKey} value={st.stageKey}>{st.label}</option>)}
                </CustomSelect>
                <span className="text-[10px]" style={{ color: T.textMuted }}>The deal will be moved to this stage automatically.</span>
            </div>
        )

        // User picker for ASSIGN_OWNER
        if (actionMode === 'user_picker') return (
            <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Assign To User</label>
                <CustomSelect className="crm-input w-full" value={actionSubject} onChange={e => setActionSubject(e.target.value)} required>
                    <option value="">-- Select User --</option>
                    {users.map(u => <option key={u.id} value={String(u.id)}>{u.name} ({u.email})</option>)}
                </CustomSelect>
                <span className="text-[10px]" style={{ color: T.textMuted }}>Ownership of the deal and/or contact will be transferred to this user.</span>
            </div>
        )

        // Activity type + subject + body for CREATE_ACTIVITY
        if (actionMode === 'activity_type_picker') return (
            <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Activity Type</label>
                    <CustomSelect className="crm-input w-full" value={actionSubject} onChange={e => setActionSubject(e.target.value)}>
                        {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </CustomSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Activity Subject</label>
                    <input type="text" className="crm-input w-full" placeholder="e.g. Follow-up call with {{contact.firstName}}" value={actionBody} onChange={e => setActionBody(e.target.value)} />
                </div>
                <span className="text-[10px]" style={{ color: T.textMuted }}>
                    Supports: <code>{`{{contact.firstName}}`}</code>, <code>{`{{deal.title}}`}</code>, <code>{`{{account.name}}`}</code>
                </span>
            </div>
        )

        // Body only for SEND_WHATSAPP
        if (actionMode === 'body_only') return (
            <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>WhatsApp Message</label>
                    <textarea
                        className="crm-input w-full h-28"
                        placeholder={`Hi {{contact.firstName}}, following up on {{deal.title}}. Please reach out at your earliest convenience.`}
                        value={actionBody}
                        onChange={e => setActionBody(e.target.value)}
                        required
                    />
                </div>
                <span className="text-[10px]" style={{ color: T.textMuted }}>
                    Sent to the contact's phone via WhatsApp. Supports: <code>{`{{contact.firstName}}`}</code>, <code>{`{{deal.title}}`}</code>, <code>{`{{account.name}}`}</code>, <code>{`{{user.name}}`}</code>
                </span>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: T.warningDim || '#FEF3C7', color: '#92400E' }}>
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Requires WhatsApp integration configured in the Integrations panel.
                </div>
            </div>
        )

        // Default: subject + body for CREATE_TASK / SEND_NOTIFICATION
        return (
            <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                        {actionType === 'CREATE_TASK' ? 'Task Title' : 'Notification Title'}
                    </label>
                    <input
                        type="text" className="crm-input w-full"
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
                    Supports: <code>{`{{contact.firstName}}`}</code>, <code>{`{{deal.title}}`}</code>, <code>{`{{deal.amount}}`}</code>, <code>{`{{account.name}}`}</code>, <code>{`{{user.name}}`}</code>
                </span>
            </div>
        )
    }

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            <SettingsSection
                title="Automated Sequences"
                description="Configure rules to automatically trigger follow-ups, tasks, notifications, WhatsApp messages, and more when deals, contacts, accounts, or activities change."
                noPad
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
                        </p>
                        <div className="flex bg-neutral-100 rounded-lg p-0.5" style={{ border: `1px solid ${T.border}` }}>
                            {[['list', 'list', 'List View'], ['visual', 'account_tree', 'Visual Designer']].map(([mode, icon, label]) => (
                                <button
                                    key={mode} type="button"
                                    onClick={() => setViewMode(mode)}
                                    className="px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
                                    style={{
                                        background: viewMode === mode ? '#fff' : 'transparent',
                                        color: viewMode === mode ? T.primary : T.textMuted,
                                        boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[14px]">{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={openCreate} className="crm-btn-primary flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Create Automation Rule
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-16">
                        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                        <span className="text-sm" style={{ color: T.textMuted }}>Loading automations...</span>
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color: T.error }}>error</span>
                        <p className="text-sm" style={{ color: T.textMuted }}>{error}</p>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="py-16 text-center">
                        <span className="material-symbols-outlined text-[56px] block mb-3" style={{ color: T.textMuted }}>settings_suggest</span>
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No automation rules configured</p>
                        <p className="text-[12px] mt-1 max-w-xs mx-auto" style={{ color: T.textMuted }}>
                            Automate tasks, notifications, WhatsApp messages, stage updates, and more by clicking "Create Automation Rule".
                        </p>
                    </div>
                ) : viewMode === 'list' ? (

                    // ── LIST VIEW ──────────────────────────────────────────────────────────────
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                    {['Rule Name', 'Trigger', 'Action', 'Delay', 'Status', ''].map(h => (
                                        <th key={h} className="px-5 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary, textAlign: h === '' ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map(r => {
                                    const tvDisplay = getTriggerValueDisplay(r)
                                    const adDisplay = getActionDetail(r)
                                    return (
                                        <tr key={r.id} className="hover:bg-orange-50/30 transition-colors" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                            <td className="px-5 py-3 font-bold text-sm" style={{ color: T.textPrimary }}>{r.name}</td>
                                            <td className="px-5 py-3 text-sm" style={{ color: T.textSecondary }}>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>{getTriggerIcon(r.triggerEvent)}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold">{getTriggerLabel(r.triggerEvent)}</span>
                                                        {tvDisplay && <span className="text-[10px] font-bold" style={{ color: T.primary }}>{tvDisplay}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-sm" style={{ color: T.textSecondary }}>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]" style={{ color: '#059669' }}>{getActionIcon(r.actionType)}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold">{getActionLabel(r.actionType)}</span>
                                                        {adDisplay && <span className="text-[10px] font-medium text-emerald-600">{adDisplay}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-sm font-semibold" style={{ color: T.textPrimary }}>
                                                {r.delayDays === 0 ? (
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.successDim, color: T.success }}>Instant</span>
                                                ) : (
                                                    <span>{r.delayDays} day{r.delayDays !== 1 ? 's' : ''}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    type="button" onClick={() => toggleActive(r)}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
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
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.primary }}>
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button onClick={() => setDeleteConfirmId(r.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors" style={{ color: T.error }}>
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

                ) : (

                    // ── VISUAL DESIGNER VIEW ────────────────────────────────────────────────────
                    <div className="p-6 flex flex-col gap-5" style={{ background: T.bg }}>
                        {rules.map(r => {
                            const tvDisplay = getTriggerValueDisplay(r)
                            const adDisplay = getActionDetail(r)
                            return (
                                <div key={r.id} className="relative p-5 rounded-2xl border flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-all" style={{ borderColor: T.border }}>
                                    <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-black text-sm" style={{ color: T.textPrimary }}>{r.name}</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1"
                                                style={{ background: r.active ? T.successDim : T.surfaceHigh, color: r.active ? T.success : T.textMuted }}>
                                                <span className="w-1 h-1 rounded-full" style={{ background: r.active ? T.success : T.textMuted }} />
                                                {r.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => toggleActive(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 transition-colors" style={{ color: T.textMuted }} title="Toggle">
                                                <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
                                            </button>
                                            <button type="button" onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.primary }} title="Edit">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button type="button" onClick={() => setDeleteConfirmId(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors" style={{ color: T.error }} title="Delete">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto">
                                        {/* Trigger Node */}
                                        <div onClick={() => openEdit(r)} className="flex-shrink-0 w-full md:w-52 p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all" style={{ background: '#FFF8F5', borderColor: T.primary }}>
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primary, color: '#fff' }}>
                                                <span className="material-symbols-outlined text-[20px]">{getTriggerIcon(r.triggerEvent)}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.primary }}>Trigger</div>
                                                <div className="text-xs font-bold truncate" style={{ color: T.textPrimary }}>{getTriggerLabel(r.triggerEvent)}</div>
                                                {tvDisplay && <div className="text-[10px] font-medium truncate" style={{ color: T.primary }}>{tvDisplay}</div>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center rotate-90 md:rotate-0 text-neutral-300 shrink-0">
                                            <span className="material-symbols-outlined text-[22px]">arrow_right_alt</span>
                                        </div>

                                        {/* Delay Node */}
                                        <div onClick={() => openEdit(r)} className="flex-shrink-0 w-full md:w-40 p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all" style={{ background: '#F0F9FF', borderColor: '#0EA5E9' }}>
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0EA5E9', color: '#fff' }}>
                                                <span className="material-symbols-outlined text-[20px]">schedule</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-sky-600">Wait</div>
                                                <div className="text-xs font-bold" style={{ color: T.textPrimary }}>
                                                    {r.delayDays === 0 ? 'Immediately' : `${r.delayDays} Day${r.delayDays !== 1 ? 's' : ''}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center rotate-90 md:rotate-0 text-neutral-300 shrink-0">
                                            <span className="material-symbols-outlined text-[22px]">arrow_right_alt</span>
                                        </div>

                                        {/* Action Node */}
                                        <div onClick={() => openEdit(r)} className="flex-shrink-0 w-full md:w-64 p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all" style={{ background: '#ECFDF5', borderColor: T.success }}>
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.success, color: '#fff' }}>
                                                <span className="material-symbols-outlined text-[20px]">{getActionIcon(r.actionType)}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Action</div>
                                                <div className="text-xs font-bold truncate" style={{ color: T.textPrimary }}>{getActionLabel(r.actionType)}</div>
                                                {adDisplay && <div className="text-[10px] text-emerald-600 font-medium truncate">{adDisplay}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </SettingsSection>

            {/* ── Rule Editor Modal ─────────────────────────────────────────────────────── */}
            {editorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>

                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <div>
                                <h3 className="font-black text-lg" style={{ color: T.textPrimary }}>
                                    {editId ? 'Edit Automation Rule' : 'Create Automation Rule'}
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Map trigger events to automated actions in your pipeline.</p>
                            </div>
                            <button onClick={() => setEditorOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.textSecondary }}>
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                            {formError && (
                                <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: T.errorDim, color: T.error }}>
                                    {formError}
                                </div>
                            )}

                            {/* Rule Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Rule Name</label>
                                <input type="text" className="crm-input w-full" placeholder="e.g. Won Deal WhatsApp Celebration" value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            {/* Trigger Row */}
                            <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: T.primaryFaint, border: `1px solid ${T.primary}33` }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: T.primary }}>
                                        <span className="material-symbols-outlined text-[14px] text-white">bolt</span>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.primary }}>When this happens (Trigger)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Trigger Event</label>
                                        <CustomSelect className="crm-input w-full" value={triggerEvent} onChange={e => { setTriggerEvent(e.target.value); setTriggerValue('') }}>
                                            {['Deals', 'People', 'Activity'].map(group => (
                                                <optgroup key={group} label={group}>
                                                    {EVENTS.filter(ev => ev.group === group).map(ev => (
                                                        <option key={ev.value} value={ev.value}>{ev.label}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </CustomSelect>
                                    </div>
                                    {renderTriggerValueField()}
                                </div>
                            </div>

                            {/* Action Row */}
                            <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: T.successFaint, border: `1px solid ${T.success}33` }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: T.success }}>
                                        <span className="material-symbols-outlined text-[14px] text-white">play_arrow</span>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.success }}>Do this (Action)</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Action Type</label>
                                    <CustomSelect className="crm-input w-full" value={actionType} onChange={e => setActionType(e.target.value)}>
                                        {ACTIONS.map(ac => <option key={ac.value} value={ac.value}>{ac.label}</option>)}
                                    </CustomSelect>
                                </div>
                                {renderActionFields()}
                            </div>

                            {/* Delay */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Delay (Days Before Executing)</label>
                                <input type="number" min="0" className="crm-input w-full" value={delayDays} onChange={e => setDelayDays(e.target.value)} required />
                                <span className="text-[10px]" style={{ color: T.textMuted }}>Set to 0 to execute immediately when the trigger fires.</span>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-2">
                                <input id="rule-active" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-orange-300" />
                                <label htmlFor="rule-active" className="text-sm font-bold cursor-pointer" style={{ color: T.textPrimary }}>
                                    Enable this automation rule immediately
                                </label>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <button type="button" onClick={() => setEditorOpen(false)} className="crm-btn-secondary" disabled={saving}>Cancel</button>
                            <button type="button" onClick={handleSave} className="crm-btn-primary flex items-center gap-2" disabled={saving}>
                                {saving ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} /> : <span className="material-symbols-outlined text-[16px]">save</span>}
                                {saving ? 'Saving...' : 'Save Automation Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirmId}
                title="Delete Automation Rule"
                message="Are you sure you want to delete this automation rule? This action cannot be undone."
                confirmText="Delete Rule"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmId(null)}
            />
        </div>
    )
}
