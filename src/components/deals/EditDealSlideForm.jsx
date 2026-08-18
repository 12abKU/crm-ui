import { useEffect, useState, useCallback } from 'react'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import SlideForm from '../SlideForm'
import { Input, Select } from '../FormField'
import SearchableSelect from '../SearchableSelect'
import api from '../../api'
import { useDialog } from '../../contexts/DialogContext'
import DynamicFields from '../DynamicFields'

export default function EditDealSlideForm({ open, onClose, deal, onSuccess }) {
    const { confirm } = useDialog()
    const { stages } = usePipelineStages()
    const [form, setForm] = useState({
        title: '',
        amount: '',
        stage: 'NEW',
        expectedCloseDate: '',
        accountId: '',
        contactId: '',
        lostReason: '',
        lostReasonNote: '',
        customValues: {}
    })
    const [accounts, setAccounts] = useState([])
    const [contacts, setContacts] = useState([])
    const [errors, setErrors] = useState({})

    const loadAccountOptions = useCallback(async (query = '') => {
        const params = new URLSearchParams({ page: '0', size: '10' })
        if (query.trim()) params.set('search', query.trim())
        const r = await api.get(`/api/accounts?${params}`)
        const nextAccounts = r.data.content ?? []
        setAccounts(nextAccounts)
        return nextAccounts.map(a => ({ id: String(a.id), label: a.name }))
    }, [])

    const loadContactOptions = useCallback(async (query = '') => {
        const params = new URLSearchParams({ page: '0', size: '10' })
        if (query.trim()) params.set('search', query.trim())
        const r = await api.get(`/api/contacts?${params}`)
        const nextContacts = r.data.content ?? []
        setContacts(nextContacts)
        return nextContacts.map(c => ({ id: String(c.id), label: `${c.firstName} ${c.lastName || ''}`.trim() }))
    }, [])

    useEffect(() => {
        if (!open || !deal) return
        setErrors({})
        const accId = deal.account?.id ? String(deal.account.id) : (deal.accountId ? String(deal.accountId) : '')
        const conId = deal.contact?.id ? String(deal.contact.id) : (deal.contactId ? String(deal.contactId) : '')

        if (deal.account?.name && accId) {
            setAccounts([{ id: accId, name: deal.account.name }])
        }
        if (deal.contact && conId) {
            const name = deal.contact.firstName ? `${deal.contact.firstName} ${deal.contact.lastName || ''}`.trim() : (deal.contactName || '')
            setContacts([{ id: conId, firstName: name, lastName: '' }])
        }

        setForm({
            title: deal.title || '',
            amount: deal.amount != null ? String(deal.amount) : '',
            stage: deal.stage || (stages.length > 0 ? stages[0].stageKey : 'NEW'),
            expectedCloseDate: deal.expectedCloseDate ? String(deal.expectedCloseDate).split('T')[0] : '',
            accountId: accId,
            contactId: conId,
            lostReason: deal.lostReason || '',
            lostReasonNote: deal.lostReasonNote || '',
            customValues: deal.customValues || {}
        })
    }, [open, deal])

    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const setEvent = k => e => setField(k, e.target.value)

    const submit = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        setErrors({})

        const newErrors = {}
        if (!form.title) newErrors.title = 'Required'
        if (!form.amount) newErrors.amount = 'Required'
        if (!form.stage) newErrors.stage = 'Required'
        if (!form.expectedCloseDate) newErrors.expectedCloseDate = 'Required'
        if (form.stage === 'LOST' && !form.lostReason) newErrors.lostReason = 'Lost reason required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            throw new Error('Please fix form errors')
        }

        const isConfirmed = await confirm({
            title: 'Update Deal',
            message: 'Are you sure you want to update this deal details?',
            confirmText: 'Save Changes',
            confirmColor: '#3b82f6'
        })
        if (!isConfirmed) return

        try {
            const payload = {
                title: form.title,
                amount: form.amount ? parseFloat(form.amount) : null,
                stage: form.stage,
                expectedCloseDate: form.expectedCloseDate || null,
                accountId: form.accountId ? Number(form.accountId) : null,
                contactId: form.contactId ? Number(form.contactId) : null,
                lostReason: form.stage === 'LOST' ? form.lostReason : null,
                lostReasonNote: form.stage === 'LOST' ? form.lostReasonNote : null,
                customValues: form.customValues,
            }
            const res = await api.put(`/api/deals/${deal.id}`, payload)
            onSuccess?.(res.data)
            onClose()
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            }
            throw err
        }
    }

    if (!open || !deal) return null

    return (
        <SlideForm
            open={open}
            onClose={onClose}
            title={`Edit Deal #${deal.id}`}
            onSubmit={submit}
        >
            {errors.general && (
                <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
            )}
            <Input label="Deal Title *" value={form.title} onChange={setEvent('title')} required error={errors.title} />
            <Input label="Amount (₹) *" type="number" value={form.amount} onChange={setEvent('amount')} required error={errors.amount} />
            <Select label="Stage *" value={form.stage} onChange={setEvent('stage')} required error={errors.stage}>
                {stages.map(s => <option key={s.stageKey} value={s.stageKey}>{s.label}</option>)}
            </Select>
            <Input label="Expected Close Date *" type="date" value={form.expectedCloseDate} onChange={setEvent('expectedCloseDate')} required error={errors.expectedCloseDate} />

            <SearchableSelect
                label="Account"
                value={form.accountId}
                onChange={v => setField('accountId', v)}
                options={accounts.map(a => ({ id: String(a.id), label: a.name }))}
                onSearch={loadAccountOptions}
                placeholder="Select account..."
                error={errors.accountId || errors.account}
            />

            <SearchableSelect
                label="Contact"
                value={form.contactId}
                onChange={v => setField('contactId', v)}
                options={contacts.map(c => ({ id: String(c.id), label: `${c.firstName} ${c.lastName || ''}`.trim() }))}
                onSearch={loadContactOptions}
                placeholder="Select contact..."
                error={errors.contactId || errors.contact}
            />

            {form.stage === 'LOST' && (
                <>
                    <Input label="Lost Reason *" value={form.lostReason} onChange={setEvent('lostReason')} required error={errors.lostReason} />
                    <Input label="Lost Reason Note" value={form.lostReasonNote} onChange={setEvent('lostReasonNote')} error={errors.lostReasonNote} />
                </>
            )}

            <div className="mt-6">
                <DynamicFields 
                    entityType="DEAL" 
                    values={form.customValues || {}} 
                    onChange={(key, val) => setForm(f => ({ ...f, customValues: { ...(f.customValues || {}), [key]: val } }))} 
                />
            </div>
        </SlideForm>
    )
}
