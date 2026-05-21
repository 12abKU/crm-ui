import { T } from '../../constants/theme'

export default function ContactRow({ contact, selected, onClick, emailCount }) {
    const name = `${contact.firstName} ${contact.lastName}`.trim()
    const initial = name.charAt(0).toUpperCase()
    const isActive = selected?.id === contact.id

    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
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
            {emailCount != null && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: isActive ? T.primary : T.surfaceHigh, color: isActive ? '#fff' : T.textMuted }}>
                    {emailCount}
                </span>
            )}
        </button>
    )
}