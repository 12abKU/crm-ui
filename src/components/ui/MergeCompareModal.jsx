import { useState, useEffect } from 'react'
import { T, SHADOW } from '../../constants/theme'
import api from '../../api'

export default function MergeCompareModal({ isOpen, group, onClose, onSuccess, entityType }) {
    const [primaryIdx, setPrimaryIdx] = useState(0) // 0 for record 1, 1 for record 2
    const [selectedFields, setSelectedFields] = useState({})
    const [merging, setMerging] = useState(false)

    const records = group?.records || []
    const rec1 = records[0]
    const rec2 = records[1]

    // Fields to compare based on entityType
    const fieldsToCompare = entityType === 'ACCOUNT'
        ? [
            { key: 'name', label: 'Company Name' },
            { key: 'website', label: 'Website' },
            { key: 'phone', label: 'Phone' },
            { key: 'industry', label: 'Industry' },
            { key: 'employeeRange', label: 'Employee Range' },
            { key: 'tag', label: 'Tag' }
        ]
        : [
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'designation', label: 'Designation' }
        ]

    // Initialize selected values from the default primary record
    useEffect(() => {
        if (rec1 && rec2) {
            const initial = {}
            fieldsToCompare.forEach(f => {
                // Default to primary record's value, or fallback to the other if primary is empty
                const val1 = rec1[f.key] || ''
                const val2 = rec2[f.key] || ''
                initial[f.key] = primaryIdx === 0 ? (val1 || val2) : (val2 || val1)
            })
            setSelectedFields(initial)
        }
    }, [isOpen, group, primaryIdx])

    if (!isOpen || records.length < 2) return null

    const handleSelectField = (fieldKey, value) => {
        setSelectedFields(prev => ({ ...prev, [fieldKey]: value }))
    }

    const handleMerge = async () => {
        const primary = primaryIdx === 0 ? rec1 : rec2
        const duplicate = primaryIdx === 0 ? rec2 : rec1

        setMerging(true)
        try {
            await api.post('/api/de-duplication/merge', {
                entityType,
                primaryId: primary.id,
                duplicateId: duplicate.id,
                mergedFields: selectedFields
            })
            onSuccess()
            onClose()
        } catch (err) {
            // error is already globally handled
        } finally {
            setMerging(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>
                
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <span className="material-symbols-outlined text-[19px]" style={{ color: T.primary }}>
                                merge
                            </span>
                        </div>
                        <div>
                            <h3 className="font-black text-base" style={{ color: T.textPrimary }}>
                                Merge Duplicate {entityType === 'ACCOUNT' ? 'Accounts' : 'Contacts'}
                            </h3>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>
                                Select the target primary record and choose which field values to retain.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={merging}
                        className="material-symbols-outlined text-[20px] p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                        close
                    </button>
                </div>

                {/* Compare Grid */}
                <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[420px]" style={{ background: T.bg }}>
                    
                    {/* Primary Selector Grid */}
                    <div className="grid grid-cols-12 gap-4 items-center mb-2">
                        <div className="col-span-4 text-xs font-bold" style={{ color: T.textMuted }}>
                            RECORDS
                        </div>
                        <div className="col-span-4 p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer"
                            style={{
                                background: primaryIdx === 0 ? T.primaryDim : T.surface,
                                borderColor: primaryIdx === 0 ? T.primary : T.border,
                                boxShadow: primaryIdx === 0 ? `0 0 0 2px ${T.primary}20` : 'none'
                            }}
                            onClick={() => setPrimaryIdx(0)}
                        >
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded"
                                style={{ background: primaryIdx === 0 ? T.primary : T.borderSubtle, color: primaryIdx === 0 ? '#fff' : T.textMuted, width: 'max-content' }}>
                                {primaryIdx === 0 ? 'Primary' : 'Duplicate'}
                            </span>
                            <span className="text-xs font-black truncate mt-1" style={{ color: T.textPrimary }}>
                                {rec1.primaryText}
                            </span>
                            <span className="text-[10px]" style={{ color: T.textMuted }}>
                                ID: {rec1.id} • Owner: {rec1.ownerName}
                            </span>
                        </div>
                        <div className="col-span-4 p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer"
                            style={{
                                background: primaryIdx === 1 ? T.primaryDim : T.surface,
                                borderColor: primaryIdx === 1 ? T.primary : T.border,
                                boxShadow: primaryIdx === 1 ? `0 0 0 2px ${T.primary}20` : 'none'
                            }}
                            onClick={() => setPrimaryIdx(1)}
                        >
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded"
                                style={{ background: primaryIdx === 1 ? T.primary : T.borderSubtle, color: primaryIdx === 1 ? '#fff' : T.textMuted, width: 'max-content' }}>
                                {primaryIdx === 1 ? 'Primary' : 'Duplicate'}
                            </span>
                            <span className="text-xs font-black truncate mt-1" style={{ color: T.textPrimary }}>
                                {rec2.primaryText}
                            </span>
                            <span className="text-[10px]" style={{ color: T.textMuted }}>
                                ID: {rec2.id} • Owner: {rec2.ownerName}
                            </span>
                        </div>
                    </div>

                    <div className="text-[10px] uppercase font-black tracking-widest mb-1" style={{ color: T.textMuted }}>
                        Field Comparison (Select values to keep in primary record)
                    </div>

                    {/* Side-by-side Fields */}
                    <div className="flex flex-col gap-2.5">
                        {fieldsToCompare.map(f => {
                            const val1 = rec1[f.key] || ''
                            const val2 = rec2[f.key] || ''
                            return (
                                <div key={f.key} className="grid grid-cols-12 gap-4 items-center py-2 border-b"
                                    style={{ borderColor: T.borderSubtle }}>
                                    <div className="col-span-4 text-xs font-bold" style={{ color: T.textSecondary }}>
                                        {f.label}
                                    </div>
                                    
                                    {/* Record 1 Radio */}
                                    <label className="col-span-4 flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all hover:bg-black/5"
                                        onClick={() => handleSelectField(f.key, val1)}>
                                        <input type="radio" name={`field-${f.key}`} checked={selectedFields[f.key] === val1} readOnly
                                            style={{ marginTop: 2, accentColor: T.primary }} />
                                        <div className="min-w-0">
                                            <p className="text-xs truncate font-medium" style={{ color: val1 ? T.textPrimary : T.textMuted }}>
                                                {val1 || '—'}
                                            </p>
                                        </div>
                                    </label>

                                    {/* Record 2 Radio */}
                                    <label className="col-span-4 flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all hover:bg-black/5"
                                        onClick={() => handleSelectField(f.key, val2)}>
                                        <input type="radio" name={`field-${f.key}`} checked={selectedFields[f.key] === val2} readOnly
                                            style={{ marginTop: 2, accentColor: T.primary }} />
                                        <div className="min-w-0">
                                            <p className="text-xs truncate font-medium" style={{ color: val2 ? T.textPrimary : T.textMuted }}>
                                                {val2 || '—'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex items-center justify-between" 
                    style={{ background: T.surfaceRaised, borderTop: `1px solid ${T.border}` }}>
                    
                    <button type="button" onClick={onClose} disabled={merging}
                        className="px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        style={{ color: T.textSecondary, background: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.borderSubtle}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Cancel
                    </button>

                    <button type="button" onClick={handleMerge} disabled={merging}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-sm cursor-pointer"
                        style={{ background: T.primary, opacity: merging ? 0.6 : 1 }}>
                        {merging ? (
                            <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                Merging...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[15px]">merge</span>
                                Merge Records
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
