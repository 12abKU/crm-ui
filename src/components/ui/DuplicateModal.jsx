import { T, SHADOW } from '../../constants/theme'

function Avatar({ name, size = 32 }) {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#6366F1']
    const color = colors[(name || '').charCodeAt(0) % colors.length]
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color + '20', border: `1.5px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 700, color, flexShrink: 0,
        }}>
            {initials}
        </div>
    )
}

export default function DuplicateModal({ isOpen, duplicates = [], onCancel, onSaveAnyway, onViewExisting, entityType = 'record' }) {
    if (!isOpen || duplicates.length === 0) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
                style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>
                
                {/* Header */}
                <div className="px-6 py-5 flex items-start gap-3" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 animate-bounce"
                        style={{ background: '#F59E0B15', border: '1px solid #F59E0B30' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#F59E0B' }}>
                            warning
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-black text-lg" style={{ color: T.textPrimary }}>
                            Duplicate Detected
                        </h3>
                        <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: T.textSecondary }}>
                            We found {duplicates.length} existing {entityType}{duplicates.length > 1 ? 's' : ''} matching the details entered.
                        </p>
                    </div>
                </div>

                {/* Match List */}
                <div className="p-5 flex flex-col gap-3 max-h-[260px] overflow-y-auto" style={{ background: T.bg }}>
                    {duplicates.map(match => (
                        <div key={`${match.type}-${match.id}`} 
                            className="flex items-center justify-between gap-3 p-3 rounded-xl transition-all"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar name={match.primaryText} size={28} />
                                <div className="min-w-0">
                                    <p className="text-xs font-black truncate" style={{ color: T.textPrimary }}>
                                        {match.primaryText}
                                    </p>
                                    {match.secondaryText && (
                                        <p className="text-[10px] truncate" style={{ color: T.textMuted }}>
                                            {match.secondaryText}
                                        </p>
                                    )}
                                    <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                        style={{ background: '#F59E0B12', color: '#F59E0B' }}>
                                        {match.reason || 'Potential match'}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onViewExisting(match)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all cursor-pointer"
                                style={{
                                    background: T.primaryDim,
                                    color: T.primary,
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            >
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex items-center justify-between gap-3" 
                    style={{ background: T.surfaceRaised, borderTop: `1px solid ${T.border}` }}>
                    
                    <button 
                        type="button" 
                        onClick={onSaveAnyway} 
                        className="px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer" 
                        style={{ color: T.textSecondary, background: T.surface, border: `1px solid ${T.border}` }} 
                        onMouseEnter={e => e.currentTarget.style.background = T.borderSubtle} 
                        onMouseLeave={e => e.currentTarget.style.background = T.surface}
                    >
                        Save Anyway
                    </button>

                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="px-5 py-2 text-xs font-black rounded-xl text-white transition-all shadow-sm cursor-pointer" 
                            style={{ background: T.primary }} 
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} 
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                        >
                            Cancel & Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
