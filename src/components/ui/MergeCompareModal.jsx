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
            { key: 'designation', label: 'Designation' },
            { key: 'accountId', label: 'Associated Account', displayKey: 'accountName' }
        ]

    // Initialize selected values from the default primary record
    useEffect(() => {
        if (rec1 && rec2) {
            const initial = {}
            fieldsToCompare.forEach(f => {
                const val1 = rec1[f.key] !== null && rec1[f.key] !== undefined ? rec1[f.key] : ''
                const val2 = rec2[f.key] !== null && rec2[f.key] !== undefined ? rec2[f.key] : ''
                
                // If primary has a value, select it. If primary is empty, select duplicate's value.
                if (primaryIdx === 0) {
                    initial[f.key] = val1 !== '' ? val1 : val2
                } else {
                    initial[f.key] = val2 !== '' ? val2 : val1
                }
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
            // Stringify all merged field values to map type requirements of backend DTO
            const payloadFields = {}
            fieldsToCompare.forEach(f => {
                const val = selectedFields[f.key]
                if (val !== undefined && val !== null && val !== '') {
                    payloadFields[f.key] = String(val)
                }
            })

            await api.post('/api/de-duplication/merge', {
                entityType,
                primaryId: primary.id,
                duplicateId: duplicate.id,
                mergedFields: payloadFields
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
            <div className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
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
                                Compare & Resolve Duplicates
                            </h3>
                            <p className="text-[11px]" style={{ color: T.textMuted }}>
                                Select the primary record that will survive and configure which field values to retain.
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
                <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[500px]" style={{ background: T.bg }}>
                    
                    {/* Information Banner */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl text-xs leading-normal"
                        style={{ background: `${T.primary}0B`, border: `1px solid ${T.primary}20`, color: T.textSecondary }}>
                        <span className="material-symbols-outlined shrink-0 text-base mt-0.5" style={{ color: T.primary }}>info</span>
                        <div>
                            All associated <strong>deals</strong>, <strong>activities</strong>, and <strong>notes</strong> will be automatically linked to the surviving <strong>Primary</strong> record. The <strong>Duplicate</strong> record will be deleted.
                        </div>
                    </div>

                    {/* Primary Selector Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {/* Record 1 Card */}
                        <div className="p-4 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer relative"
                            style={{
                                background: primaryIdx === 0 ? `${T.primary}0D` : T.surface,
                                borderColor: primaryIdx === 0 ? T.primary : T.border,
                                boxShadow: primaryIdx === 0 ? `0 0 0 1px ${T.primary}` : 'none'
                            }}
                            onClick={() => setPrimaryIdx(0)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded"
                                    style={{
                                        background: primaryIdx === 0 ? T.primary : T.borderSubtle,
                                        color: primaryIdx === 0 ? '#fff' : T.textMuted
                                    }}>
                                    {primaryIdx === 0 ? 'Primary (Surviving)' : 'Duplicate'}
                                </span>
                                <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>
                                    ID: {rec1.id}
                                </span>
                            </div>
                            <h4 className="text-sm font-black truncate mt-1" style={{ color: T.textPrimary }}>
                                {rec1.primaryText}
                            </h4>
                            <p className="text-xs truncate" style={{ color: T.textSecondary }}>
                                {rec1.secondaryText || 'No value'}
                            </p>
                            <div className="text-[10px] mt-2 pt-2 border-t flex justify-between" style={{ borderColor: T.borderSubtle, color: T.textMuted }}>
                                <span>Owner: {rec1.ownerName || 'Unassigned'}</span>
                                <span>Created: {new Date(rec1.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Record 2 Card */}
                        <div className="p-4 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer relative"
                            style={{
                                background: primaryIdx === 1 ? `${T.primary}0D` : T.surface,
                                borderColor: primaryIdx === 1 ? T.primary : T.border,
                                boxShadow: primaryIdx === 1 ? `0 0 0 1px ${T.primary}` : 'none'
                            }}
                            onClick={() => setPrimaryIdx(1)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded"
                                    style={{
                                        background: primaryIdx === 1 ? T.primary : T.borderSubtle,
                                        color: primaryIdx === 1 ? '#fff' : T.textMuted
                                    }}>
                                    {primaryIdx === 1 ? 'Primary (Surviving)' : 'Duplicate'}
                                </span>
                                <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>
                                    ID: {rec2.id}
                                </span>
                            </div>
                            <h4 className="text-sm font-black truncate mt-1" style={{ color: T.textPrimary }}>
                                {rec2.primaryText}
                            </h4>
                            <p className="text-xs truncate" style={{ color: T.textSecondary }}>
                                {rec2.secondaryText || 'No value'}
                            </p>
                            <div className="text-[10px] mt-2 pt-2 border-t flex justify-between" style={{ borderColor: T.borderSubtle, color: T.textMuted }}>
                                <span>Owner: {rec2.ownerName || 'Unassigned'}</span>
                                <span>Created: {new Date(rec2.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Field Comparison Section */}
                    <div>
                        <div className="text-[10px] uppercase font-black tracking-wider mb-3 flex items-center gap-1.5" style={{ color: T.textMuted }}>
                            <span className="material-symbols-outlined text-[13px]">list</span>
                            Select values to keep in primary record
                        </div>

                        <div className="flex flex-col gap-2">
                            {fieldsToCompare.map(f => {
                                const rawVal1 = rec1[f.key] !== null && rec1[f.key] !== undefined ? rec1[f.key] : ''
                                const rawVal2 = rec2[f.key] !== null && rec2[f.key] !== undefined ? rec2[f.key] : ''

                                const displayVal1 = f.displayKey ? (rec1[f.displayKey] || '') : rawVal1
                                const displayVal2 = f.displayKey ? (rec2[f.displayKey] || '') : rawVal2

                                const isIdentical = String(rawVal1).trim() === String(rawVal2).trim()
                                const isConflict = !isIdentical && rawVal1 !== '' && rawVal2 !== ''

                                return (
                                    <div key={f.key} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 items-stretch p-3 rounded-xl border transition-all"
                                        style={{
                                            background: isConflict ? 'rgba(217,119,6,0.03)' : T.surface,
                                            borderColor: isConflict ? 'rgba(217,119,6,0.2)' : T.border
                                        }}
                                    >
                                        {/* Field Name & Status */}
                                        <div className="sm:col-span-4 flex flex-col justify-center min-w-0 pr-2">
                                            <span className="text-xs font-bold truncate" style={{ color: isConflict ? '#D97706' : T.textSecondary }}>
                                                {f.label}
                                            </span>
                                            {isConflict && (
                                                <span className="text-[9px] font-semibold text-amber-600 flex items-center gap-0.5 mt-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">warning</span>
                                                    Conflict
                                                </span>
                                            )}
                                            {isIdentical && rawVal1 !== '' && (
                                                <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                                    Matching
                                                </span>
                                            )}
                                        </div>

                                        {/* Record 1 Field Value */}
                                        <div className="sm:col-span-4 flex items-stretch">
                                            <button type="button"
                                                onClick={() => handleSelectField(f.key, rawVal1)}
                                                className="w-full flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-left transition-all border outline-none"
                                                style={{
                                                    background: selectedFields[f.key] === rawVal1 ? `${T.primary}0D` : 'transparent',
                                                    borderColor: selectedFields[f.key] === rawVal1 ? T.primary : 'transparent'
                                                }}
                                            >
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all"
                                                    style={{
                                                        borderColor: selectedFields[f.key] === rawVal1 ? T.primary : T.border,
                                                        background: selectedFields[f.key] === rawVal1 ? T.primary : 'transparent'
                                                    }}>
                                                    {selectedFields[f.key] === rawVal1 && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs truncate font-medium" style={{ color: rawVal1 ? T.textPrimary : T.textMuted }}>
                                                        {displayVal1 || 'No value'}
                                                    </p>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Record 2 Field Value */}
                                        <div className="sm:col-span-4 flex items-stretch">
                                            <button type="button"
                                                onClick={() => handleSelectField(f.key, rawVal2)}
                                                className="w-full flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-left transition-all border outline-none"
                                                style={{
                                                    background: selectedFields[f.key] === rawVal2 ? `${T.primary}0D` : 'transparent',
                                                    borderColor: selectedFields[f.key] === rawVal2 ? T.primary : 'transparent'
                                                }}
                                            >
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all"
                                                    style={{
                                                        borderColor: selectedFields[f.key] === rawVal2 ? T.primary : T.border,
                                                        background: selectedFields[f.key] === rawVal2 ? T.primary : 'transparent'
                                                    }}>
                                                    {selectedFields[f.key] === rawVal2 && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs truncate font-medium" style={{ color: rawVal2 ? T.textPrimary : T.textMuted }}>
                                                        {displayVal2 || 'No value'}
                                                    </p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
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
