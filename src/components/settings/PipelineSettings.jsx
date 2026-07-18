import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import api, { extractApiErrorMessage } from '../../api'
import { useDispatch } from 'react-redux'
import { setStages as setReduxStages } from '../../store/pipelineSlice'
import ConfirmModal from '../ui/ConfirmModal'

export default function PipelineSettings() {
    const dispatch = useDispatch()
    const [pipeline, setPipeline] = useState(null)
    const [stages, setStages] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null)

    const loadPipeline = async () => {
        setLoading(true)
        setError(null)
        try {
            const r = await api.get('/api/pipelines')
            if (r.data && r.data.length > 0) {
                const activePipe = r.data[0]
                setPipeline(activePipe)
                // Sort by display order
                const sorted = [...activePipe.stages].sort((a, b) => a.displayOrder - b.displayOrder)
                setStages(sorted)
            } else {
                setError('No active pipeline found.')
            }
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Failed to load pipeline configuration'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPipeline()
    }, [])

    const handleFieldChange = (index, field, val) => {
        setStages(prev => prev.map((s, idx) => {
            if (idx !== index) return s
            let updatedVal = val
            if (field === 'stageKey') {
                updatedVal = val.toUpperCase().replace(/[^A-Z0-9_]/g, '')
            } else if (field === 'probability') {
                updatedVal = val === '' ? '' : Math.min(100, Math.max(0, parseFloat(val) || 0))
            }
            return { ...s, [field]: updatedVal }
        }))
    };

    const handleAddStage = () => {
        const nextOrder = stages.length > 0 ? Math.max(...stages.map(s => s.displayOrder)) + 1 : 0
        setStages(prev => [
            ...prev,
            {
                id: null,
                stageKey: '',
                label: '',
                displayOrder: nextOrder,
                probability: 50.0
            }
        ])
    }

    const handleDeleteStage = (index) => {
        setDeleteConfirmIndex(index)
    }

    const confirmDelete = () => {
        if (deleteConfirmIndex === null) return
        setStages(prev => prev.filter((_, idx) => idx !== deleteConfirmIndex))
        setDeleteConfirmIndex(null)
    }

    const moveStage = (index, direction) => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === stages.length - 1) return

        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const newStages = [...stages]

        // Swap
        const temp = newStages[index]
        newStages[index] = newStages[targetIndex]
        newStages[targetIndex] = temp

        // Re-assign displayOrder based on index to persist sorting
        const ordered = newStages.map((s, idx) => ({ ...s, displayOrder: idx }))
        setStages(ordered)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (stages.length === 0) {
            setError('You must have at least one pipeline stage.')
            return
        }

        // Validation
        for (const s of stages) {
            if (!s.stageKey || s.stageKey.trim() === '') {
                setError('All stages must have a Stage Key.')
                return
            }
            if (!s.label || s.label.trim() === '') {
                setError('All stages must have a Label.')
                return
            }
        }

        setSaving(true)
        setError(null)
        setSuccessMsg(null)

        try {
            // Prepare payload
            const payload = {
                name: pipeline.name,
                stages: stages.map((s, idx) => ({
                    id: s.id,
                    stageKey: s.stageKey,
                    label: s.label,
                    displayOrder: idx,
                    probability: (s.probability || 0.0) / 100.0 // backend stores 0.0 to 1.0
                }))
            }

            const res = await api.put(`/api/pipelines/${pipeline.id}`, payload)
            // Reload local configuration
            const updatedStages = [...res.data.stages].sort((a, b) => a.displayOrder - b.displayOrder)
            setStages(updatedStages)
            setPipeline(res.data)
            
            // Sync to Redux
            dispatch(setReduxStages(updatedStages))
            setSuccessMsg('Pipeline stages saved successfully! Dynamic relations updated.')
            setTimeout(() => setSuccessMsg(null), 5000)
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Failed to save pipeline configurations'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 py-8 items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                <span className="text-xs font-extrabold" style={{ color: T.textMuted }}>Loading pipeline settings...</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
            <div>
                <h2 className="text-lg font-black" style={{ color: T.textPrimary }}>Deals Pipeline Configuration</h2>
                <p className="text-xs leading-relaxed mt-1" style={{ color: T.textMuted }}>
                    Customize your sales pipeline columns and probabilities. If you modify a stage key, all existing deals will automatically migrate. If you delete a stage, deals in it will move to your first stage.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="px-4 py-3 rounded-xl text-xs font-semibold" style={{ background: T.errorDim, color: T.error }}>
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="px-4 py-3 rounded-xl text-xs font-semibold" style={{ background: T.successDim, color: T.success }}>
                        {successMsg}
                    </div>
                )}

                {/* Pipeline Title Header */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: T.primaryFaint, borderColor: T.border }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>linear_scale</span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>Pipeline Name</span>
                        <input
                            type="text"
                            required
                            value={pipeline?.name || ''}
                            onChange={(e) => setPipeline(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-transparent text-sm font-bold border-none outline-none focus:ring-0 p-0"
                            style={{ color: T.textPrimary }}
                            placeholder="Pipeline name..."
                        />
                    </div>
                </div>

                {/* Stages List */}
                <div className="overflow-x-auto scrollbar-none">
                    <div className="flex flex-col gap-2 min-w-[450px]">
                    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                        <div className="col-span-2 sm:col-span-1 text-center">Order</div>
                        <div className="col-span-4">Stage Key</div>
                        <div className="col-span-4 sm:col-span-5">Label</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {stages.map((stage, idx) => {
                            const isTerminal = stage.stageKey === 'WON' || stage.stageKey === 'LOST'
                            return (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 rounded-2xl border shadow-sm transition-all hover:shadow-md"
                                    style={{ background: T.surface, borderColor: T.border }}>
                                    
                                    {/* Order / Re-order actions */}
                                    <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => moveStage(idx, 'up')}
                                            disabled={idx === 0}
                                            className="material-symbols-outlined text-[16px] hover:opacity-100 disabled:opacity-30 cursor-pointer"
                                            style={{ color: T.primary }}
                                        >
                                            keyboard_arrow_up
                                        </button>
                                        <span className="text-xs font-extrabold" style={{ color: T.textPrimary }}>{idx + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => moveStage(idx, 'down')}
                                            disabled={idx === stages.length - 1}
                                            className="material-symbols-outlined text-[16px] hover:opacity-100 disabled:opacity-30 cursor-pointer"
                                            style={{ color: T.primary }}
                                        >
                                            keyboard_arrow_down
                                        </button>
                                    </div>

                                    {/* Stage Key */}
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            required
                                            value={stage.stageKey}
                                            onChange={(e) => handleFieldChange(idx, 'stageKey', e.target.value)}
                                            className="crm-input w-full text-xs font-mono font-bold uppercase"
                                            placeholder="STAGE_KEY"
                                            disabled={isTerminal}
                                            title={isTerminal ? "Standard terminal stages cannot be renamed." : ""}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="col-span-4 sm:col-span-5">
                                        <input
                                            type="text"
                                            required
                                            value={stage.label}
                                            onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                                            className="crm-input w-full text-xs font-bold"
                                            placeholder="Stage Label"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            disabled={isTerminal}
                                            onClick={() => handleDeleteStage(idx)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 disabled:opacity-40"
                                            style={{ color: T.error }}
                                            title={isTerminal ? "Standard terminal stages cannot be deleted." : "Delete Stage"}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t pt-4 mt-2" style={{ borderColor: T.borderSubtle }}>
                    <button
                        type="button"
                        onClick={handleAddStage}
                        className="crm-btn-secondary text-xs py-2 flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        Add Custom Stage
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="crm-btn-primary text-xs py-2 flex items-center gap-1.5"
                    >
                        {saving ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                        ) : <span className="material-symbols-outlined text-[15px]">save</span>}
                        Save Pipeline Config
                    </button>
                </div>
            </form>

            <ConfirmModal
                isOpen={deleteConfirmIndex !== null}
                title="Delete Pipeline Stage"
                message={`Are you sure you want to delete the stage "${deleteConfirmIndex !== null ? stages[deleteConfirmIndex]?.label || stages[deleteConfirmIndex]?.stageKey || 'Unknown' : ''}"? Deals currently in this stage will be moved to the first stage.`}
                confirmText="Delete Stage"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmIndex(null)}
            />
        </div>
    )
}
