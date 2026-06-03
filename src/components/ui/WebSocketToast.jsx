import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, SHADOW } from '../../constants/theme'

const NOTIF_STYLES = {
    TICKET_SUBMITTED: { icon: 'confirmation_number', color: '#2563EB', label: 'New Ticket' },
    TICKET_IN_PROGRESS: { icon: 'pending', color: '#D97706', label: 'In Progress' },
    TICKET_RESOLVED: { icon: 'check_circle', color: '#16A34A', label: 'Resolved' },
    TICKET_CLOSED: { icon: 'cancel', color: '#64748B', label: 'Closed' },
    ACTIVITY_REMINDER: { icon: 'notifications_active', color: '#D97706', label: 'Activity Reminder' },
    MENTION: { icon: 'alternate_email', color: '#9333EA', label: 'Mentioned You' },
    AUTOMATION_RUN: { icon: 'smart_toy', color: '#8B5CF6', label: 'Automation Executed' },
    CHAT_MESSAGE: { icon: 'chat', color: '#EA580C', label: 'Internal Chat' }
}

export default function WebSocketToast() {
    const [notice, setNotice] = useState(null)
    const timerRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const onNotification = (event) => {
            clearTimeout(timerRef.current)
            const notif = event.detail
            setNotice(notif)
            
            // Auto hide after 6 seconds
            timerRef.current = setTimeout(() => setNotice(null), 6000)
        }

        window.addEventListener('crm-notification', onNotification)
        return () => {
            clearTimeout(timerRef.current)
            window.removeEventListener('crm-notification', onNotification)
        }
    }, [])

    if (!notice) return null

    const styleMeta = NOTIF_STYLES[notice.type] ?? { icon: 'notifications', color: T.primary, label: 'Notification' }

    const handleClick = () => {
        setNotice(null)
        if (notice.type === 'MENTION') {
            if (notice.dealId) {
                navigate(`/deals?dealId=${notice.dealId}&tab=notes`)
            } else if (notice.contactId) {
                navigate(`/contacts/${notice.contactId}?tab=notes`)
            }
        } else if (notice.type === 'ACTIVITY_REMINDER' && notice.activityId) {
            navigate(`/activities?highlight=${notice.activityId}`)
        } else if (notice.type === 'CHAT_MESSAGE') {
            navigate('/chat', { state: { selectColleagueId: notice.contactId } })
        } else if (notice.ticketId) {
            navigate('/support', { state: { openTicketId: notice.ticketId } })
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-100 w-96 max-w-[calc(100vw-32px)] p-4 flex items-start gap-3 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-transform duration-150"
            style={{
                background: T.surface,
                border: `1.5px solid ${styleMeta.color}35`,
                boxShadow: '0 20px 50px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.06)',
            }}
            onClick={handleClick}>
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{
                    background: styleMeta.color + '15',
                    border: `1.5px solid ${styleMeta.color}30`
                }}>
                <span className="material-symbols-outlined filled text-[18px]" style={{ color: styleMeta.color }}>
                    {styleMeta.icon}
                </span>
            </div>
            
            {/* Content */}
            <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: styleMeta.color }}>
                    {styleMeta.label}
                </span>
                <p className="text-sm font-black mt-0.5 truncate" style={{ color: T.textPrimary }}>
                    {notice.title}
                </p>
                <p className="text-xs mt-1 leading-relaxed text-muted line-clamp-2" style={{ color: T.textSecondary }}>
                    {notice.body}
                </p>
            </div>

            {/* Close Button */}
            <button type="button" 
                onClick={(e) => { e.stopPropagation(); setNotice(null) }} 
                className="p-1 rounded-lg shrink-0"
                style={{ color: T.textMuted }}
                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    )
}
