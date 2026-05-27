import { T } from '../../constants/theme'

export default function WhatsAppBubble({ msg }) {
    const isOutbound = msg.direction === 'OUTBOUND'
    const cleanDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            const date = new Date(dateStr)
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        } catch {
            return ''
        }
    }

    return (
        <div className={`flex mb-3.5 px-2 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[65%] rounded-2xl px-4 py-2.5 relative shadow-sm transition-all duration-200"
                style={{
                    minWidth: '85px',
                    background: isOutbound 
                        ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryHover} 100%)` 
                        : T.surface,
                    border: `1px solid ${isOutbound ? T.primary + '20' : T.border}`,
                    color: isOutbound ? '#fff' : T.textPrimary,
                    borderRadius: isOutbound ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    paddingBottom: '20px', // spacing for time and tick
                }}
            >
                {/* Body Text */}
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap select-text break-words">
                    {msg.body}
                </p>

                {/* Footer status and time info */}
                <div className="absolute bottom-1 right-3.5 flex items-center gap-1 mt-1 select-none">
                    <span style={{ fontSize: '9px', color: isOutbound ? 'rgba(255,255,255,0.75)' : T.textMuted }}>
                        {cleanDate(msg.createdAt)}
                    </span>
                    {isOutbound && (
                        <span className="material-symbols-outlined text-[13px]" 
                            style={{ 
                                color: msg.status === 'READ' || msg.status === 'RECEIVED' ? '#93C5FD' : 'rgba(255,255,255,0.7)',
                                verticalAlign: 'middle'
                            }}>
                            {msg.status === 'SENT' ? 'check' : 'done_all'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
