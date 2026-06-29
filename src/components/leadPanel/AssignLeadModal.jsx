import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'
import {
    IconX, IconUserCheck, IconSearch, IconCheck, IconUsers
} from '@tabler/icons-react'

export default function AssignLeadModal({ profile, onClose, onAssigned }) {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    // selectedIds is a Set of user IDs currently checked
    const [selectedIds, setSelectedIds] = useState(new Set((profile.assignees ?? []).map(u => u.id)))

    useEffect(() => {
        api.get('/api/management/users')
            .then(r => setUsers(r.data))
            .finally(() => setLoading(false))
    }, [])

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const toggle = (uid) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(uid)) next.delete(uid)
            else next.add(uid)
            return next
        })
    }

    const save = async () => {
        setSaving(true)
        try {
            const updated = await api.post(`/api/leads/${profile.id}/assign`, {
                userIds: [...selectedIds]
            })
            onAssigned(updated.data)
            onClose()
        } finally { setSaving(false) }
    }

    const clearAll = async () => {
        setSaving(true)
        try {
            const updated = await api.post(`/api/leads/${profile.id}/assign`, { userIds: [] })
            onAssigned(updated.data)
            onClose()
        } finally { setSaving(false) }
    }

    const currentAssignees = (profile.assignees ?? [])
    const hasChanges = (() => {
        const orig = new Set(currentAssignees.map(u => u.id))
        if (orig.size !== selectedIds.size) return true
        for (const id of selectedIds) if (!orig.has(id)) return true
        return false
    })()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className="w-full max-w-md rounded-2xl flex flex-col"
                style={{ background: T.surface, border: `1px solid ${T.border}`, maxHeight: '80vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div>
                        <h2 className="text-base font-bold" style={{ color: T.textPrimary }}>Assign Lead</h2>
                        <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: T.textMuted }}>{profile.title || profile.senderName}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70"
                        style={{ color: T.textMuted }}>
                        <IconX size={18} />
                    </button>
                </div>

                {/* Current assignees summary */}
                {currentAssignees.length > 0 && (
                    <div className="px-6 py-3 flex items-center justify-between"
                        style={{ background: T.primaryFaint, borderBottom: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <IconUserCheck size={15} style={{ color: T.primary, flexShrink: 0 }} />
                            <span className="text-xs font-semibold truncate" style={{ color: T.primary }}>
                                Assigned: {currentAssignees.map(u => u.name).join(', ')}
                            </span>
                        </div>
                        <button onClick={clearAll} disabled={saving}
                            className="ml-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0"
                            style={{ background: T.errorDim, color: T.error }}>
                            Clear all
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
                            autoFocus
                        />
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: T.textMuted }}>
                        <IconUsers size={11} style={{ display: 'inline', marginRight: 4 }} />
                        {selectedIds.size} selected — select multiple agents/admins
                    </p>
                </div>

                {/* User list */}
                <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-1">
                    {loading ? (
                        <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>Loading users...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No users found</p>
                    ) : filtered.map(u => {
                        const isChecked = selectedIds.has(u.id)
                        return (
                            <button key={u.id}
                                onClick={() => toggle(u.id)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all"
                                style={{
                                    background: isChecked ? T.primaryDim : 'transparent',
                                    border: `1px solid ${isChecked ? T.primary : 'transparent'}`,
                                }}>
                                {/* Checkbox */}
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                    style={{
                                        background: isChecked ? T.primary : 'transparent',
                                        border: `2px solid ${isChecked ? T.primary : T.border}`,
                                    }}>
                                    {isChecked && <IconCheck size={12} color="#fff" />}
                                </div>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{ background: T.primaryDim, color: T.primary }}>
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>
                                        {u.name}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: T.textMuted }}>{u.email} · {u.role}</p>
                                </div>
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
                    <button onClick={save} disabled={saving || !hasChanges}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
                        style={{
                            background: T.primary, color: '#fff',
                            opacity: (saving || !hasChanges) ? 0.5 : 1
                        }}>
                        {saving ? 'Saving...' : `Assign (${selectedIds.size})`}
                    </button>
                </div>
            </div>
        </div>
    )
}
