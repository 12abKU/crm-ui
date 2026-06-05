import { T } from '../../constants/theme'

export default function ContactRow({ contact, selected, onClick, emailCount, isPinned, onPinToggle }) {
    const name = `${contact.firstName} ${contact.lastName}`.trim()
    const initial = name.charAt(0).toUpperCase()
    const isActive = selected?.id === contact.id

    return (
        <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick()} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group cursor-pointer"
            style={{
                background: isActive ? T.primaryDim : 'transparent',
                borderLeft: `3px solid ${isActive ? T.primary : 'transparent'}`,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.surfaceHigh }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: isActive ? T.primaryDim : T.surfaceHigh, color: isActive ? T.primary : T.textSecondary }}>
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: T.textPrimary }}>{name}</p>
                <p className="text-[11px] truncate" style={{ color: T.textMuted }}>{contact.email || 'No email'}</p>
                {contact.account?.name && (
                    <p className="text-[10px] truncate mt-0.5 flex items-center gap-0.5" style={{ color: T.textMuted, opacity: 0.7 }}>
                        <span className="material-symbols-outlined text-[9px]">business</span>
                        {contact.account.name}
                    </p>
                )}

            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {emailCount != null && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: isActive ? T.primary : T.surfaceHigh, color: isActive ? '#fff' : T.textMuted }}>
                        {emailCount}
                    </span>
                )}
                <button 
                    onClick={(e) => { e.stopPropagation(); onPinToggle(); }}
                    className={`p-1 rounded-lg transition-all ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    style={{ color: isPinned ? T.primary : T.textMuted }}
                    title={isPinned ? "Unpin contact" : "Pin contact"}
                    onMouseEnter={e => e.currentTarget.style.background = isActive ? `${T.primary}20` : T.surfaceHigh}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <span className="material-symbols-outlined text-[15px] block select-none" style={{ fontVariationSettings: isPinned ? "'FILL' 1" : "'FILL' 0" }}>
                        push_pin
                    </span>
                </button>
            </div>
        </div>
    )
}