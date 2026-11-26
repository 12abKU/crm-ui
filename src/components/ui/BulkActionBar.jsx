import { useState } from 'react'
import { T, SHADOW } from '../../constants/theme'

export default function BulkActionBar({
    selectedCount,
    onClear,
    onDelete,
    canDelete = false,
    users = [],
    assignLabel = 'Assign Owner',
    onAssign,
    statusOptions = [],
    statusLabel = 'Update Status',
    onStatusChange,
    busy = false,
}) {
    const [selectedUserId, setSelectedUserId] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    if (!selectedCount) return null

    return (
        <div
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] px-4 py-3 rounded-2xl border flex flex-wrap items-center gap-3 backdrop-blur-md"
            style={{
                background: T.surface,
                borderColor: T.primary,
                boxShadow: SHADOW.xl,
            }}
        >
            <div className="flex items-center gap-2 pr-2 border-r" style={{ borderColor: T.border }}>
                <span
                    className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-black"
                    style={{ background: T.primary, color: '#FFFFFF' }}
                >
                    {selectedCount}
                </span>
                <span className="text-xs font-bold whitespace-nowrap" style={{ color: T.textPrimary }}>
                    selected
                </span>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={busy}
                    className="text-xs font-semibold px-2 py-1 rounded-lg hover:opacity-80 cursor-pointer"
                    style={{ color: T.textMuted }}
                >
                    Clear
                </button>
            </div>

            {onAssign && users.length > 0 && (
                <div className="flex items-center gap-1.5">
                    <select
                        value={selectedUserId}
                        onChange={e => setSelectedUserId(e.target.value)}
                        disabled={busy}
                        className="text-xs font-semibold rounded-xl px-2.5 py-1.5 border outline-none"
                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                    >
                        <option value="">{assignLabel}...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        disabled={!selectedUserId || busy}
                        onClick={async () => {
                            if (!selectedUserId) return
                            await onAssign(Number(selectedUserId))
                            setSelectedUserId('')
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                        style={{ background: T.primaryFaint, color: T.primaryText, border: `1px solid ${T.primary}30` }}
                    >
                        Apply
                    </button>
                </div>
            )}

            {onStatusChange && statusOptions.length > 0 && (
                <div className="flex items-center gap-1.5">
                    <select
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                        disabled={busy}
                        className="text-xs font-semibold rounded-xl px-2.5 py-1.5 border outline-none"
                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                    >
                        <option value="">{statusLabel}...</option>
                        {statusOptions.map(opt => {
                            const val = typeof opt === 'string' ? opt : opt.value
                            const lbl = typeof opt === 'string' ? opt : opt.label
                            return <option key={val} value={val}>{lbl}</option>
                        })}
                    </select>
                    <button
                        type="button"
                        disabled={!selectedStatus || busy}
                        onClick={async () => {
                            if (!selectedStatus) return
                            await onStatusChange(selectedStatus)
                            setSelectedStatus('')
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                        style={{ background: T.primaryFaint, color: T.primaryText, border: `1px solid ${T.primary}30` }}
                    >
                        Apply
                    </button>
                </div>
            )}

            {canDelete && onDelete && (
                <button
                    type="button"
                    disabled={busy}
                    onClick={onDelete}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/25 text-red-500 hover:bg-red-500/20 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    Delete
                </button>
            )}
        </div>
    )
}
