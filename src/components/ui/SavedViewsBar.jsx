import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../api'
import { T } from '../../constants/theme'

export default function SavedViewsBar({
    entityType,
    currentFilters = {},
    currentSort = [],
    onApplyView,
    onResetView,
}) {
    const [views, setViews] = useState([])
    const [activeViewId, setActiveViewId] = useState(null)
    const [savingOpen, setSavingOpen] = useState(false)
    const [viewName, setViewName] = useState('')
    const [shared, setShared] = useState(false)
    const [saving, setSaving] = useState(false)
    const role = useSelector(state => state.auth.role)
    const userId = useSelector(state => state.auth.user?.id || state.auth.userId)
    const isAdmin = role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN' || role === 'SUPER_ADMIN'

    useEffect(() => {
        let mounted = true
        api.get(`/api/saved-views?entityType=${entityType}`)
            .then(res => {
                if (mounted) setViews(res.data ?? [])
            })
            .catch(() => {})
        return () => { mounted = false }
    }, [entityType])

    const handleSave = async (e) => {
        e.preventDefault()
        if (!viewName.trim()) return
        setSaving(true)
        try {
            const res = await api.post('/api/saved-views', {
                entityType,
                name: viewName.trim(),
                filtersJson: currentFilters,
                sortJson: currentSort,
                shared: isAdmin && shared,
            })
            setViews(prev => [res.data, ...prev])
            setActiveViewId(res.data.id)
            setViewName('')
            setShared(false)
            setSavingOpen(false)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        await api.delete(`/api/saved-views/${id}`)
        setViews(prev => prev.filter(v => v.id !== id))
        if (activeViewId === id) {
            setActiveViewId(null)
            onResetView?.()
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 mr-1" style={{ color: T.textMuted }}>
                <span className="material-symbols-outlined text-[14px]">bookmarks</span>
                Views:
            </span>

            <button
                type="button"
                onClick={() => {
                    setActiveViewId(null)
                    onResetView?.()
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer"
                style={{
                    background: activeViewId === null ? T.primary : T.surface,
                    color: activeViewId === null ? '#FFFFFF' : T.textSecondary,
                    borderColor: activeViewId === null ? T.primary : T.border,
                }}
            >
                All
            </button>

            {views.map(v => {
                const active = activeViewId === v.id
                const canDelete = isAdmin || String(v.createdByUserId) === String(userId)
                return (
                    <div
                        key={v.id}
                        onClick={() => {
                            setActiveViewId(v.id)
                            onApplyView?.(v)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all"
                        style={{
                            background: active ? T.primaryFaint : T.surface,
                            color: active ? T.primaryText : T.textSecondary,
                            borderColor: active ? T.primary : T.border,
                        }}
                    >
                        {v.shared && (
                            <span className="material-symbols-outlined text-[13px]" title="Shared team view">group</span>
                        )}
                        <span>{v.name}</span>
                        {canDelete && (
                            <button
                                type="button"
                                onClick={(e) => handleDelete(e, v.id)}
                                className="hover:text-red-500 inline-flex items-center cursor-pointer"
                                title="Delete view"
                            >
                                <span className="material-symbols-outlined text-[13px]">close</span>
                            </button>
                        )}
                    </div>
                )
            })}

            {!savingOpen ? (
                <button
                    type="button"
                    onClick={() => setSavingOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-dashed cursor-pointer hover:opacity-80"
                    style={{ borderColor: T.primary, color: T.primaryText, background: 'transparent' }}
                >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Save View
                </button>
            ) : (
                <form onSubmit={handleSave} className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
                    <input
                        type="text"
                        value={viewName}
                        onChange={e => setViewName(e.target.value)}
                        placeholder="View name..."
                        autoFocus
                        className="text-xs px-2 py-1 rounded-lg border outline-none"
                        style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                    />
                    {isAdmin && (
                        <label className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer" style={{ color: T.textSecondary }}>
                            <input type="checkbox" checked={shared} onChange={e => setShared(e.target.checked)} className="accent-indigo-600" />
                            Share with team
                        </label>
                    )}
                    <button
                        type="submit"
                        disabled={!viewName.trim() || saving}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                        style={{ background: T.primary, color: '#FFFFFF' }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSavingOpen(false); setViewName('') }}
                        className="text-xs px-1.5 py-1 cursor-pointer"
                        style={{ color: T.textMuted }}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    )
}
