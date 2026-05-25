import { useEffect, useState, useRef } from 'react'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import api, { extractApiErrorMessage } from '../../api'
import ConfirmModal from '../ui/ConfirmModal'

const HELP_VARS = [
    { tag: '{{contact.firstName}}', label: 'Contact First Name' },
    { tag: '{{contact.lastName}}', label: 'Contact Last Name' },
    { tag: '{{contact.email}}', label: 'Contact Email' },
    { tag: '{{deal.title}}', label: 'Deal Title' },
    { tag: '{{deal.amount}}', label: 'Deal Amount' },
    { tag: '{{user.name}}', label: 'Owner Name' },
]

export default function EmailTemplatesSettings() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    // Form fields
    const [name, setName] = useState('')
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [formError, setFormError] = useState(null)
    const [saving, setSaving] = useState(false)

    const bodyRef = useRef(null)

    const loadTemplates = () => {
        setLoading(true)
        api.get('/api/email-templates')
            .then(r => setTemplates(r.data))
            .catch(err => setError(extractApiErrorMessage(err, 'Failed to load templates')))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadTemplates()
    }, [])

    const openCreate = () => {
        setEditId(null)
        setName('')
        setSubject('')
        setBody('')
        setFormError(null)
        setEditorOpen(true)
    }

    const openEdit = (t) => {
        setEditId(t.id)
        setName(t.name || '')
        setSubject(t.subject || '')
        setBody(t.body || '')
        setFormError(null)
        setEditorOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!name.trim()) return setFormError('Name is required')
        if (!subject.trim()) return setFormError('Subject is required')
        if (!body.trim()) return setFormError('Body content is required')

        setSaving(true)
        setFormError(null)
        try {
            const payload = { name, subject, body }
            if (editId) {
                await api.put(`/api/email-templates/${editId}`, payload)
            } else {
                await api.post('/api/email-templates', payload)
            }
            loadTemplates()
            setEditorOpen(false)
        } catch (err) {
            setFormError(extractApiErrorMessage(err, 'Failed to save template'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        setDeleteConfirmId(id)
    }

    const confirmDelete = async () => {
        if (!deleteConfirmId) return
        try {
            await api.delete(`/api/email-templates/${deleteConfirmId}`)
            loadTemplates()
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteConfirmId(null)
        }
    }

    const injectVariable = (variable) => {
        const textarea = bodyRef.current
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const newText = text.substring(0, start) + variable + text.substring(end)
        setBody(newText)
        setTimeout(() => {
            textarea.focus()
            textarea.selectionStart = textarea.selectionEnd = start + variable.length
        }, 50)
    }

    const renderPreview = (text) => {
        if (!text) return ''
        let result = text
        result = result.replace(/\{\{contact\.firstName\}\}/g, 'John')
        result = result.replace(/\{\{contact\.lastName\}\}/g, 'Doe')
        result = result.replace(/\{\{contact\.email\}\}/g, 'john.doe@example.com')
        result = result.replace(/\{\{deal\.title\}\}/g, 'Acme Corp Software License')
        result = result.replace(/\{\{deal\.amount\}\}/g, '$12,500.00')
        result = result.replace(/\{\{user\.name\}\}/g, 'Sarah Agent')
        return result
    }

    return (
        <div className="flex flex-col gap-6">
            <SettingsSection 
                title="Email Templates" 
                description="Create customized HTML templates with dynamic interpolation for email automations or custom sends."
                noPad
            >
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                        {templates.length} template{templates.length !== 1 ? 's' : ''} available
                    </p>
                    <button onClick={openCreate} className="crm-btn-primary flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Create Template
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-16">
                        <div className="w-6 h-6 rounded-full border-2 animate-spin"
                            style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                        <span className="text-sm" style={{ color: T.textMuted }}>Loading templates...</span>
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color: T.error }}>error</span>
                        <p className="text-sm" style={{ color: T.textMuted }}>{error}</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="py-16 text-center">
                        <span className="material-symbols-outlined text-[48px] block mb-2" style={{ color: T.textMuted }}>mail_outline</span>
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No templates created yet</p>
                        <p className="text-[12px] mt-1" style={{ color: T.textMuted }}>Templates allow you to automate sequences or quickly reply to leads.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Name</th>
                                    <th className="px-6 py-3 text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Email Subject</th>
                                    <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(t => (
                                    <tr key={t.id} className="hover:bg-orange-50/30 transition-colors" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                        <td className="px-6 py-4 font-bold text-sm" style={{ color: T.textPrimary }}>{t.name}</td>
                                        <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>{t.subject}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.primary }}>
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors" style={{ color: T.error }}>
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SettingsSection>

            {/* Template Editor Modal */}
            {editorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceRaised }}>
                            <div>
                                <h3 className="font-black text-lg" style={{ color: T.textPrimary }}>
                                    {editId ? 'Edit Email Template' : 'Create Email Template'}
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Define custom HTML message bodies and subject lines.</p>
                            </div>
                            <button onClick={() => setEditorOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors" style={{ color: T.textSecondary }}>
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Body Form */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col gap-4">
                                {formError && (
                                    <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: T.errorDim, color: T.error }}>
                                        {formError}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Template Name</label>
                                    <input 
                                        type="text" 
                                        className="crm-input w-full"
                                        placeholder="e.g. Welcome & Onboarding Sequence"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Email Subject</label>
                                    <input 
                                        type="text" 
                                        className="crm-input w-full"
                                        placeholder="e.g. Hi {{contact.firstName}}, welcome aboard!"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 flex-1 min-h-[300px]">
                                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Email Body (HTML Supported)</label>
                                    <textarea 
                                        ref={bodyRef}
                                        className="crm-input w-full flex-1 font-mono text-sm leading-relaxed p-4"
                                        placeholder="<p>Dear {{contact.firstName}},</p><p>We are excited to share details about <strong>{{deal.title}}</strong>...</p>"
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        required
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {HELP_VARS.map(v => (
                                            <button 
                                                key={v.tag} 
                                                type="button" 
                                                onClick={() => injectVariable(v.tag)}
                                                className="px-2 py-1 rounded-md text-[10px] font-mono font-bold hover:bg-orange-100 transition-colors"
                                                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.primary }}
                                                title={v.label}
                                            >
                                                {v.tag}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-1 text-[10px] leading-relaxed" style={{ color: T.textMuted }}>
                                        <span className="material-symbols-outlined text-[12px] align-middle mr-1" style={{ color: T.primary }}>info</span>
                                        <span>Click a variable to insert it. HTML tags are supported.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview Panel */}
                            <div className="flex-1 flex flex-col gap-4 p-5 rounded-xl shrink-0 border shadow-inner overflow-hidden" style={{ background: T.bg, borderColor: T.borderSubtle }}>
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: T.textSecondary }}>
                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                        Live Preview
                                    </h4>
                                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>This is how the email will look to your recipient with mock data.</p>
                                </div>

                                <div className="flex flex-col gap-1.5 p-3 rounded-lg border" style={{ background: T.surface, borderColor: T.border }}>
                                    <div className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Subject</div>
                                    <div className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                        {renderPreview(subject) || '(No subject)'}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col min-h-0 border rounded-lg overflow-hidden" style={{ background: T.surface, borderColor: T.border }}>
                                    <div className="px-3 py-2 border-b" style={{ background: T.surfaceHigh, borderColor: T.borderSubtle }}>
                                        <div className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Message Body</div>
                                    </div>
                                    <div 
                                        className="p-4 overflow-y-auto text-sm leading-relaxed" 
                                        style={{ color: T.textPrimary }}
                                        dangerouslySetInnerHTML={{ __html: renderPreview(body) || '<span style="color: #9CA3AF; font-style: italic;">(No body content)</span>' }}
                                    />
                                </div>
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
                                {saving ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirmId}
                title="Delete Email Template"
                message="Are you sure you want to delete this template? Any sequence using it might fail to send."
                confirmText="Delete Template"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmId(null)}
            />
        </div>
    )
}
