import React, { useState, useEffect } from 'react'
import api from '../../api'
import { T } from '../../constants/theme'
import { useDialog } from '../../contexts/DialogContext'

export default function CustomFieldsSettings() {
    const [fields, setFields] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formOpen, setFormOpen] = useState(false)
    const [filterEntity, setFilterEntity] = useState('ALL') // ALL, LEAD, DEAL, CONTACT, ACCOUNT

    const [form, setForm] = useState({
        entityType: 'LEAD',
        fieldKey: '',
        fieldLabel: '',
        fieldType: 'TEXT',
        required: false,
        options: { choices: [] }
    })
    const [choicesInput, setChoicesInput] = useState('')

    const loadFields = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filterEntity !== 'ALL') params.set('entityType', filterEntity)
            const r = await api.get(`/api/crm-fields?${params.toString()}`)
            setFields(r.data)
            setError(null)
        } catch (err) {
            setError(err.message || 'Failed to load custom fields')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFields()
    }, [filterEntity])

    const { confirm } = useDialog()

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Delete Custom Field',
            message: 'Are you sure you want to delete this custom field? Existing data will remain but will not be shown in forms.',
            confirmText: 'Delete',
            confirmColor: '#ef4444'
        })
        if (!isConfirmed) return
        try {
            await api.delete(`/api/crm-fields/${id}`)
            loadFields()
        } catch (err) {
            alert('Failed to delete: ' + err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let optionsObj = null
            if (form.fieldType === 'DROPDOWN') {
                const choices = choicesInput.split(',').map(s => s.trim()).filter(Boolean)
                if (choices.length === 0) return alert('Dropdown requires at least one choice.')
                optionsObj = { choices }
            }
            const payload = {
                entityType: form.entityType,
                fieldKey: form.fieldKey,
                fieldLabel: form.fieldLabel,
                fieldType: form.fieldType,
                required: form.required,
                options: optionsObj
            }
            await api.post('/api/crm-fields', payload)
            setFormOpen(false)
            setForm({ entityType: 'LEAD', fieldKey: '', fieldLabel: '', fieldType: 'TEXT', required: false, options: null })
            setChoicesInput('')
            loadFields()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create field')
        }
    }

    return (
        <div className="rounded-2xl border p-6" style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: T.textPrimary }}>Custom Fields</h2>
                    <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                        Manage dynamic fields for Leads, Deals, Contacts, and Accounts.
                    </p>
                </div>
                <button
                    onClick={() => setFormOpen(!formOpen)}
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                    style={{ background: T.primary, color: '#fff' }}
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Field
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b pb-px overflow-x-auto scrollbar-none" style={{ borderColor: T.border }}>
                {['ALL', 'LEAD', 'DEAL', 'CONTACT', 'ACCOUNT'].map(ent => (
                    <button
                        key={ent}
                        onClick={() => setFilterEntity(ent)}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-all`}
                        style={{
                            borderColor: filterEntity === ent ? T.primary : 'transparent',
                            color: filterEntity === ent ? T.primary : T.textMuted,
                        }}
                    >
                        {ent === 'ALL' ? 'All Entities' : ent + 'S'}
                    </button>
                ))}
            </div>

            {formOpen && (
                <div className="mb-8 p-5 rounded-2xl border" style={{ background: T.surfaceHigh, borderColor: T.border }}>
                    <h3 className="text-sm font-black mb-4 tracking-wider uppercase" style={{ color: T.textPrimary }}>Create New Field</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold" style={{ color: T.textMuted }}>Entity Type</label>
                            <select
                                className="px-3 py-2 rounded-xl border text-sm outline-none"
                                style={{ background: T.surface, color: T.textPrimary, borderColor: T.border }}
                                value={form.entityType}
                                onChange={e => setForm(f => ({ ...f, entityType: e.target.value }))}
                                required
                            >
                                <option value="LEAD">Lead</option>
                                <option value="DEAL">Deal</option>
                                <option value="CONTACT">Contact</option>
                                <option value="ACCOUNT">Account</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold" style={{ color: T.textMuted }}>Field Type</label>
                            <select
                                className="px-3 py-2 rounded-xl border text-sm outline-none"
                                style={{ background: T.surface, color: T.textPrimary, borderColor: T.border }}
                                value={form.fieldType}
                                onChange={e => setForm(f => ({ ...f, fieldType: e.target.value }))}
                                required
                            >
                                <option value="TEXT">Text</option>
                                <option value="NUMBER">Number</option>
                                <option value="DATE">Date</option>
                                <option value="DROPDOWN">Dropdown</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold" style={{ color: T.textMuted }}>Field Label (e.g. Property Budget)</label>
                            <input
                                type="text"
                                className="px-3 py-2 rounded-xl border text-sm outline-none"
                                style={{ background: T.surface, color: T.textPrimary, borderColor: T.border }}
                                value={form.fieldLabel}
                                onChange={e => {
                                    const val = e.target.value
                                    // auto generate key based on label
                                    const autoKey = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
                                    setForm(f => ({ ...f, fieldLabel: val, fieldKey: autoKey }))
                                }}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold" style={{ color: T.textMuted }}>Internal Key (e.g. property_budget)</label>
                            <input
                                type="text"
                                className="px-3 py-2 rounded-xl border text-sm outline-none"
                                style={{ background: T.surface, color: T.textPrimary, borderColor: T.border }}
                                value={form.fieldKey}
                                onChange={e => setForm(f => ({ ...f, fieldKey: e.target.value }))}
                                required
                            />
                        </div>
                        
                        {form.fieldType === 'DROPDOWN' && (
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold" style={{ color: T.textMuted }}>Dropdown Choices (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="Option A, Option B, Option C"
                                    className="px-3 py-2 rounded-xl border text-sm outline-none"
                                    style={{ background: T.surface, color: T.textPrimary, borderColor: T.border }}
                                    value={choicesInput}
                                    onChange={e => setChoicesInput(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 sm:col-span-2">
                            <input
                                type="checkbox"
                                id="requiredCheck"
                                checked={form.required}
                                onChange={e => setForm(f => ({ ...f, required: e.target.checked }))}
                            />
                            <label htmlFor="requiredCheck" className="text-sm font-semibold cursor-pointer" style={{ color: T.textPrimary }}>
                                Required Field
                            </label>
                        </div>

                        <div className="sm:col-span-2 mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="px-4 py-2 text-sm font-bold rounded-xl border"
                                style={{ color: T.textPrimary, borderColor: T.border }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-bold rounded-xl text-white"
                                style={{ background: T.primary }}
                            >
                                Save Field
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="p-8 text-center text-sm font-bold" style={{ color: T.textMuted }}>Loading fields...</div>
            ) : fields.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: T.borderSubtle, background: T.surfaceRaised }}>
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ color: T.border }}>extension</span>
                    <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>No Custom Fields</h3>
                    <p className="text-xs mt-1" style={{ color: T.textMuted }}>Click New Field to create dynamic attributes for your CRM entities.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr style={{ background: T.surfaceHigh, borderBottom: `1px solid ${T.border}` }}>
                                <th className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase rounded-tl-xl" style={{ color: T.textMuted }}>Entity</th>
                                <th className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Label</th>
                                <th className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Key</th>
                                <th className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Type</th>
                                <th className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Required</th>
                                <th className="px-4 py-3 rounded-tr-xl"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((f, i) => (
                                <tr key={f.id} 
                                    className="transition-colors"
                                    style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: i % 2 === 0 ? T.surface : T.surfaceRaised }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.surface : T.surfaceRaised}
                                >
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 text-[10px] font-black rounded-lg uppercase" style={{ background: T.primaryDim, color: T.primary }}>
                                            {f.entityType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold" style={{ color: T.textPrimary }}>{f.fieldLabel}</td>
                                    <td className="px-4 py-3 text-sm font-mono" style={{ color: T.textMuted }}>{f.fieldKey}</td>
                                    <td className="px-4 py-3 text-sm" style={{ color: T.textPrimary }}>
                                        {f.fieldType}
                                        {f.fieldType === 'DROPDOWN' && f.options?.choices && (
                                            <span className="ml-2 text-[10px]" style={{ color: T.textMuted }}>({f.options.choices.length} options)</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm" style={{ color: T.textPrimary }}>{f.required ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDelete(f.id)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                            style={{ color: '#ef4444' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            title="Delete Field"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
