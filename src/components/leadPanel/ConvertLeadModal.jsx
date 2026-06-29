import { useState } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'
import { extractApiErrorMessage } from '../../api'
import { Input } from '../FormField'

export default function ConvertLeadModal({ lead, onClose, onConverted }) {
    const [title, setTitle] = useState(lead.title || `${lead.senderName || lead.companyName || 'Unknown'} Deal`)
    const [amount, setAmount] = useState('')
    const [expectedCloseDate, setExpectedCloseDate] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) {
            setError('Deal title is required.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            const req = {
                dealTitle: title,
                dealAmount: amount ? parseFloat(amount) : null,
                expectedCloseDate: expectedCloseDate || null
            }
            const res = await api.post(`/api/leads/${lead.id}/convert`, req)
            onConverted(res.data)
        } catch (err) {
            setError(extractApiErrorMessage(err))
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                
                <div className="px-6 py-4 flex items-center justify-between"
                    style={{ background: T.surface, borderBottom: `1px solid ${T.borderSubtle}` }}>
                    <h3 className="text-lg font-bold" style={{ color: T.textPrimary }}>Convert to Deal</h3>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: T.textMuted }}>close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="p-3 rounded-lg text-sm font-semibold" style={{ background: T.error + '15', color: T.error }}>
                            {error}
                        </div>
                    )}
                    
                    <p className="text-sm" style={{ color: T.textSecondary }}>
                        Converting this lead will change its status to <b style={{ color: T.green600 }}>CONVERTED</b> and create a new Deal in your pipeline.
                    </p>

                    <Input label="Deal Title *" value={title} onChange={e => setTitle(e.target.value)} required />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                        <Input label="Expected Close Date" type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} />
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} disabled={saving}
                            className="px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-black/5"
                            style={{ color: T.textSecondary }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{ 
                                background: T.primary, color: '#fff',
                                opacity: saving ? 0.7 : 1,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                boxShadow: `0 4px 12px ${T.primary}40`
                            }}>
                            {saving ? 'Converting...' : 'Convert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
