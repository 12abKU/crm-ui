import { useState } from 'react'
import { T } from '../../constants/theme'
import { decodeHtml, timeAgo } from './conversationUtils'

export default function EmailBubble({ email }) {
    const [expanded, setExpanded] = useState(false)
    const isReceived = email.received
    const senderName = isReceived ? (email.from?.split('<')[0].trim() || email.from) : 'You'
    const initial = senderName.charAt(0).toUpperCase()

    const fullBody = decodeHtml(email.body?.trim().split('\n')
        .filter(line => !line.startsWith('>') && !(line.startsWith('On ') && line.includes('wrote:')))
        .join('\n').trim())
    const snippet = decodeHtml((email.snippet || '').slice(0, 160) + ((email.snippet?.length || 0) > 160 ? '...' : ''))

    return (
        <div className={`flex gap-2.5 mb-5 ${isReceived ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0 mt-1"
                style={{ background: isReceived ? T.secondaryDim : T.primaryDim, color: isReceived ? T.secondary : T.primary }}>
                {initial}
            </div>
            <div className={`flex flex-col max-w-[72%] ${isReceived ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                    <p className="text-[12px] font-bold" style={{ color: T.textPrimary }}>{senderName}</p>
                    <p className="text-[12px]" style={{ color: T.textMuted }}>{timeAgo(email.date)}</p>
                </div>
                {email.subject && (
                    <div className="mb-1.5 px-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: isReceived ? T.surfaceHigh : T.primaryDim, color: isReceived ? T.textMuted : T.primary }}>
                            {email.subject}
                        </span>
                    </div>
                )}
                <div className="px-4 py-3"
                    style={{
                        background: isReceived ? T.surfaceRaised : T.primaryDim,
                        border: `1px solid ${isReceived ? T.border : T.primary + '30'}`,
                        borderRadius: isReceived ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
                    }}>
                    <p className="text-[13px] leading-relaxed"
                        style={{ color: isReceived ? T.textPrimary : T.primaryText, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {expanded && email.body ? fullBody : snippet}
                    </p>
                    {email.body?.trim().length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-[13px]" style={{ color: isReceived ? T.textMuted : T.primary }}>
                                {expanded ? 'expand_less' : 'expand_more'}
                            </span>
                            <p className="text-[11px] font-semibold cursor-pointer"
                                style={{ color: isReceived ? T.textMuted : T.primary }}
                                onClick={() => {
                                    if (window.getSelection()?.toString().length > 0) return
                                    setExpanded(value => !value)
                                }}>
                                {expanded ? 'Show less' : 'Show full email'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
