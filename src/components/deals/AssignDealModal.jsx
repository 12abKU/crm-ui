import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'
import {
    IconX, IconUserCheck, IconUserOff, IconSearch, IconCheck
} from '@tabler/icons-react'

export default function AssignDealModal({ deal, onClose, onAssigned }) {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedId, setSelectedId] = useState(deal.assignedTo?.id ?? null)

    useEffect(() => {
        api.get('/api/management/users')
            .then(r => setUsers(r.data))
            .finally(() => setLoading(false))
    }, [])

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const save = async () => {
        setSaving(true)
        try {
            const updated = await api.post(`/api/deals/${deal.id}/assign`, { userId: selectedId })
            onAssigned(updated.data)
            onClose()
        } finally { setSaving(false) }
    }

    const revoke = async () => {
        setSaving(true)
        try {
            const updated = await api.post(`/api/deals/${deal.id}/assign`, { userId: null })
            onAssigned(updated.data)
            onClose()
        } finally { setSaving(false) }
    }

    const currentAssignee = users.find(u => u.id === deal.assignedTo?.id)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="w-full max-w-md rounded-2xl flex flex-col"
                style={{ background: T.surface, border: `1px solid ${T.border}`, maxHeight: '80vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div>
                        <h2 className="text-base font-bold" style={{ color: T.textPrimary }}>Assign Deal</h2>
                        <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: T.textMuted }}>{deal.title}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70"
                        style={{ color: T.textMuted }}>
                        <IconX size={18} />
                    </button>
                </div>

                {/* Current assignee */}
                {currentAssignee && (
                    <div className="px-6 py-3 flex items-center justify-between"
                        style={{ background: T.primaryFaint, borderBottom: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2">
                            <IconUserCheck size={15} style={{ color: T.primary }} />
                            <span className="text-xs font-semibold" style={{ color: T.primary }}>
                                Currently assigned to {currentAssignee.name}
                            </span>
                        </div>
                        <button onClick={revoke} disabled={saving}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                            style={{ background: T.errorDim, color: T.error }}>
                            <IconUserOff size={13} /> Revoke
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="px-6 pt-4 pb-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                        <IconSearch size={14} style={{ color: T.textMuted }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: T.textPrimary }}
                        />
                    </div>
                </div>

                {/* User list */}
                <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-1">
                    {loading ? (
                        <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>Loading users...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No users found</p>
                    ) : filtered.map(u => {
                        const isSelected = selectedId === u.id
                        const isCurrent = deal.assignedTo?.id === u.id
                        return (
                            <button key={u.id}
                                onClick={() => setSelectedId(isSelected ? null : u.id)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all"
                                style={{
                                    background: isSelected ? T.primaryDim : 'transparent',
                                    border: `1px solid ${isSelected ? T.primary : 'transparent'}`,
                                }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                        {u.name}
                                        {isCurrent && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: T.primaryDim, color: T.primary }}>current</span>}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: T.textMuted }}>{u.email} · {u.role}</p>
                                </div>
                                {isSelected && <IconCheck size={16} style={{ color: T.primary, shrink: 0 }} />}
                            </button>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex gap-2" style={{ borderTop: `1px solid ${T.border}` }}>
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: T.surfaceRaised, color: T.textSecondary }}>
                        Cancel
                    </button>
                    <button onClick={save} disabled={saving || selectedId === (deal.assignedTo?.id ?? null)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
                        style={{
                            background: T.primary, color: '#fff',
                            opacity: (saving || selectedId === (deal.assignedTo?.id ?? null)) ? 0.5 : 1
                        }}>
                        {saving ? 'Assigning...' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    )
}