import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import { usePipelineStages } from '../../hooks/usePipelineStages'
import { usePermissions } from '../../hooks/usePermission'
import SlideForm from '../SlideForm'
import { Input, Select } from '../FormField'
import SearchableSelect from '../SearchableSelect'
import api, { extractApiErrorMessage } from '../../api'

const EMPTY = { title: '', amount: '', stage: 'NEW', expectedCloseDate: '', accountId: '', contactId: '' }

export default function AddDealSlideForm({ open, onClose, onSuccess, prefillAccount, prefillContact }) {
    const { stages } = usePipelineStages()
    const [form, setForm] = useState(EMPTY)
    const [accounts, setAccounts] = useState([])
    const [contacts, setContacts] = useState([])
    const [loadingContacts, setLoadingContacts] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState({})

    const role = useSelector(state => state.auth.role)
    const can = usePermissions(['DEALS_CREATE'])

    const isAgent = role === 'AGENT'
    const isAdminOrAbove = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const canCreate = isAdminOrAbove || can.DEALS_CREATE

    const loadAccountOptions = useCallback(async (query = '') => {
        const params = new URLSearchParams({ page: '0', size: '10' })
        if (query.trim()) params.set('search', query.trim())
        const r = await api.get(`/api/accounts?${params}`)
        const nextAccounts = r.data.content ?? []
        setAccounts(nextAccounts)
        return nextAccounts.map(a => ({ id: String(a.id), label: a.name }))
    }, [])

    // on open — reset and prefill
    useEffect(() => {
        if (!open) return
        setErrors({})
        const base = { ...EMPTY }
        if (stages.length > 0) {
            base.stage = stages[0].stageKey
        }
        if (prefillAccount) {
            base.accountId = String(prefillAccount.id)
        }
        if (prefillContact) {
            base.contactId = String(prefillContact.id)
        }
        setForm(base)

        // load contacts for prefilled account
        if (prefillAccount) {
            setLoadingContacts(true)
            api.get(`/api/accounts/${prefillAccount.id}/profile`)
                .then(r => setContacts((r.data.contacts ?? []).map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }))))
                .catch(() => setContacts([]))
                .finally(() => setLoadingContacts(false))
        }
    }, [open])

    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const setEvent = k => e => setField(k, e.target.value)

    const onAccountChange = async (accountId) => {
        setField('accountId', accountId)
        setField('contactId', '')
        setContacts([])
        if (!accountId) return
        setLoadingContacts(true)
        try {
            const r = await api.get(`/api/accounts/${accountId}/profile`)
            setContacts((r.data.contacts ?? []).map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` })))
        } finally { setLoadingContacts(false) }
    }

    const submit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await api.post('/api/deals', {
                title: form.title,
                amount: form.amount ? parseFloat(form.amount) : null,
                stage: form.stage,
                expectedCloseDate: form.expectedCloseDate || null,
                accountId: form.accountId ? Number(form.accountId) : null,
                contactId: form.contactId ? Number(form.contactId) : null,
            })
            setErrors({})
            onSuccess?.()
        } catch (err) {
            if (err?.response?.data?.fields) {
                setErrors(err.response.data.fields)
            } else {
                setErrors({ general: extractApiErrorMessage(err) })
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (!canCreate) return null

    return (
        <SlideForm
            open={open}
            onClose={onClose}
            title="New Deal"
            onSubmit={submit}
            submitLabel={submitting ? 'Saving...' : 'Create Deal'}
        >
            {errors.general && (
                <div className="mb-4 text-xs font-semibold" style={{ color: T.error }}>{errors.general}</div>
            )}
            <Input label="Deal Title *" value={form.title} onChange={setEvent('title')} required error={errors.title} />
            <Input label="Amount (₹)" type="number" value={form.amount} onChange={setEvent('amount')} error={errors.amount} />
            <Select label="Stage" value={form.stage} onChange={setEvent('stage')} error={errors.stage}>
                {stages.map(s => <option key={s.stageKey} value={s.stageKey}>{s.label}</option>)}
            </Select>
            <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={setEvent('expectedCloseDate')} error={errors.expectedCloseDate} />

            {/* Account — locked if prefilled */}
            {prefillAccount ? (
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Account</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                        style={{ background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                        <span className="material-symbols-outlined text-[14px]" style={{ color: T.textMuted }}>business</span>
                        <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{prefillAccount.name}</span>
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.primaryDim, color: T.primaryText }}>Auto-filled</span>
                    </div>
                </div>
            ) : (
                <SearchableSelect
                    label="Account"
                    value={form.accountId}
                    onChange={onAccountChange}
                    options={accounts.map(a => ({ id: String(a.id), label: a.name }))}
                    onSearch={loadAccountOptions}
                    placeholder="Select account..."
                    error={errors.accountId || errors.account}
                />
            )}

            {/* Contact — locked if prefilled */}
            {prefillContact ? (
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>Contact</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                        style={{ background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                        <span className="material-symbols-outlined text-[14px]" style={{ color: T.textMuted }}>person</span>
                        <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{prefillContact.name}</span>
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.primaryDim, color: T.primaryText }}>Auto-filled</span>
                    </div>
                </div>
            ) : (
                <SearchableSelect
                    label="Contact"
                    value={form.contactId}
                    onChange={v => setField('contactId', v)}
                    options={contacts}
                    placeholder={form.accountId ? (loadingContacts ? 'Loading...' : 'Select contact...') : 'Select account first'}
                    disabled={!form.accountId || loadingContacts}
                    error={errors.contactId || errors.contact}
                />
            )}
        </SlideForm>
    )
}