import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import SlideForm from '../SlideForm'
import { Input, Select } from '../FormField'
import api, { extractApiErrorMessage } from '../../api'

import { useDialog } from '../../contexts/DialogContext'

const LEAD_STAGES = [
    { key: 'NEW', label: 'New' },
    { key: 'CONTACTED', label: 'Contacted' },
    { key: 'QUALIFIED', label: 'Qualified' },
    { key: 'UNQUALIFIED', label: 'Unqualified' },
    { key: 'CONVERTED', label: 'Converted' },
]

export default function EditLeadSlideForm({ open, onClose, lead, onSuccess }) {
    const { confirm } = useDialog()
    const [form, setForm] = useState({
        title: '',
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        companyName: '',
        source: 'MANUAL',
        status: 'NEW',
        city: '',
        message: '',
    })
    const [sources, setSources] = useState([])
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (!open || !lead) return
        setErrors({})
        setForm({
            title: lead.title || '',
            senderName: lead.senderName || '',
            senderEmail: lead.senderEmail || '',
            senderPhone: lead.senderPhone || '',
            companyName: lead.indiamartCompany || lead.companyName || lead.accountName || '',
            source: lead.source || 'MANUAL',
            status: lead.status || 'NEW',
            city: lead.city || '',
            message: lead.message || '',
        })
        api.get('/api/leads/sources').then(res => setSources(res.data)).catch(() => {})
    }, [open, lead])

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }))
    const setEvent = (key) => (e) => setField(key, e.target.value)

    const submit = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        setErrors({})

        const newErrors = {}
        if (!form.title) newErrors.title = 'Required'
        if (!form.senderName) newErrors.senderName = 'Required'
        if (form.senderPhone && !/^\d{10}$/.test(form.senderPhone)) {
            newErrors.senderPhone = 'Must be exactly 10 digits'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            throw new Error('Please fix form errors')
        }

        const isConfirmed = await confirm({
            title: 'Update Lead',
            message: 'Are you sure you want to update this lead details?',
            confirmText: 'Save Changes',
            confirmColor: '#3b82f6'
        })
        if (!isConfirmed) return

        try {
            const res = await api.put(`/api/leads/${lead.id}`, form)
            onSuccess?.(res.data)
            onClose()
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            }
            throw err
        }
    }

    if (!open || !lead) return null

    return (
        <SlideForm
            open={open}
            onClose={onClose}
            title={`Edit Lead #${lead.id}`}
            onSubmit={submit}
        >
            {errors.general && (
                <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
            )}
            <Input label="Lead Title *" value={form.title} onChange={setEvent('title')} required error={errors.title} />
            <Input label="Sender Name *" value={form.senderName} onChange={setEvent('senderName')} required error={errors.senderName} />
            <Input label="Sender Email" type="email" value={form.senderEmail} onChange={setEvent('senderEmail')} error={errors.senderEmail} />
            <Input label="Sender Phone" value={form.senderPhone} onChange={setEvent('senderPhone')} error={errors.senderPhone} />
            <Input label="Company Name" value={form.companyName} onChange={setEvent('companyName')} error={errors.companyName} />
            
            <Select label="Source *" value={form.source} onChange={setEvent('source')} required error={errors.source}>
                {sources.length > 0 ? (
                    sources.map(s => <option key={s} value={s}>{s}</option>)
                ) : (
                    <>
                        <option value="MANUAL">MANUAL</option>
                        <option value="INDIAMART">INDIAMART</option>
                        <option value="SULEKHA">SULEKHA</option>
                        <option value="WHATSAPP">WHATSAPP</option>
                    </>
                )}
            </Select>

            <Select label="Status *" value={form.status} onChange={setEvent('status')} required error={errors.status}>
                {LEAD_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </Select>

            <Input label="City" value={form.city} onChange={setEvent('city')} error={errors.city} />

            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                    Message / Notes
                </label>
                <textarea
                    rows={3}
                    value={form.message}
                    onChange={setEvent('message')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all outline-none resize-none"
                    style={{
                        background: T.surfaceHigh,
                        border: `1px solid ${errors.message ? T.error : T.border}`,
                        color: T.textPrimary
                    }}
                />
            </div>
        </SlideForm>
    )
}
