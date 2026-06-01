import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconTrash } from '@tabler/icons-react'
import { T, ACTIVITY_TYPES, ACTIVITY_STYLES } from '../../constants/theme'
import InlineEdit from '../InlineEdit'
import CompleteToggle from './CompleteToggle'
import OutcomePicker from './OutcomePicker'
import { fmtScheduled, getStatus, STATUS_STYLES } from './activityUtils'

export default function ActivityRow({ activity, highlighted, rowBg, onRemove, onUpdate, onComplete, onOutcome, showOwner, colWidths = [] }) {
    const navigate = useNavigate()
    const [blink, setBlink] = useState(false)
    const rowRef = useRef(null)
    const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.NOTE
    const status = getStatus(activity.scheduledAt, activity.completed)
    const ss = STATUS_STYLES[status]

    useEffect(() => {
        if (!highlighted) return
        setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
        const t = setTimeout(() => {
            setBlink(true)
            setTimeout(() => { setBlink(false); setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 500) }, 500) }, 500)
        }, 300)
        return () => clearTimeout(t)
    }, [highlighted])

    return (
        <tr ref={rowRef} className="group transition-all cursor-pointer"
            style={{
                borderBottom: `1px solid ${T.borderSubtle}`,
                background: blink ? T.primaryDim : activity.completed ? T.surfaceRaised : rowBg,
                opacity: activity.completed ? 0.65 : 1,
                transition: 'background 0.3s ease',
            }}
            onClick={() => navigate(`/activities/${activity.id}`)}
            onMouseEnter={e => { if (!blink) e.currentTarget.style.background = T.surfaceHigh }}
            onMouseLeave={e => { if (!blink) e.currentTarget.style.background = activity.completed ? T.surfaceRaised : rowBg }}>

            {/* Complete toggle — stop propagation */}
            <td className="px-4 py-3.5" style={{ width: colWidths[0] }} onClick={e => e.stopPropagation()}>
                <CompleteToggle activityId={activity.id} completed={activity.completed} onToggle={onComplete} />
            </td>

            {/* Type badge — inline edit, stop propagation */}
            <td className="px-4 py-3.5" style={{ width: colWidths[1] }} onClick={e => e.stopPropagation()}>
                <InlineEdit value={activity.type} options={ACTIVITY_TYPES} onSave={v => onUpdate(activity.id, 'type', v)}>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold w-fit"
                        style={{ background: s.bg, color: s.color }}>
                        <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                        {activity.type}
                    </span>
                </InlineEdit>
            </td>

            {/* Subject + outcome — inline edit stops propagation, rest of td navigates */}
            <td className="px-4 py-3.5" style={{ width: colWidths[2] }}>
                <div onClick={e => e.stopPropagation()}>
                    <InlineEdit value={activity.subject} placeholder="Add subject" onSave={v => onUpdate(activity.id, 'subject', v)}>
                        <p className="text-sm font-semibold"
                            style={{ color: T.primaryText, textDecoration: activity.completed ? 'line-through' : 'none' }}>
                            {activity.subject}
                        </p>
                    </InlineEdit>
                </div>
                {activity.description && (
                    <p className="text-[11px] mt-0.5 truncate max-w-45" style={{ color: T.textMuted }}>{activity.description}</p>
                )}
                <div onClick={e => e.stopPropagation()}>
                    <OutcomePicker activityId={activity.id} type={activity.type} current={activity.outcome} onSave={onOutcome} />
                </div>
            </td>

            {/* Account / contact — their own navigate, stop row propagation */}
            <td className="px-4 py-3.5" style={{ width: colWidths[3] }}>
                {activity.account ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                            style={{ background: T.primaryDim, color: T.primaryText }}>
                            {activity.account.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] font-semibold truncate cursor-pointer hover:underline"
                                style={{ color: T.textPrimary }}
                                onClick={e => { e.stopPropagation(); navigate(`/accounts/${activity.account.id}`) }}>
                                {activity.account.name}
                            </p>
                            {activity.contact && (
                                <p className="text-[11px] truncate cursor-pointer hover:underline"
                                    style={{ color: T.textMuted }}
                                    onClick={e => { e.stopPropagation(); navigate(`/contacts/${activity.contact.id}`) }}>
                                    {activity.contact.firstName} {activity.contact.lastName}
                                </p>
                            )}
                        </div>
                    </div>
                ) : <span className="text-[12px]" style={{ color: T.textMuted }}>—</span>}
            </td>

            {showOwner && (
                <td className="px-4 py-3.5" style={{ width: colWidths[4] }}>
                    {activity.owner ? (
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                style={{ background: T.secondaryDim, color: T.secondaryText }}>
                                {activity.owner.name?.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[12px] font-semibold" style={{ color: T.textSecondary }}>{activity.owner.name}</p>
                        </div>
                    ) : <span className="text-[12px]" style={{ color: T.textMuted }}>—</span>}
                </td>
            )}

            <td className="px-4 py-3.5 text-[12px]"
                style={{ width: colWidths[showOwner ? 5 : 4], color: status === 'overdue' ? T.error : T.textSecondary, fontWeight: status === 'overdue' ? 700 : 400 }}>
                <div>{fmtScheduled(activity.scheduledAt)}</div>
                {activity.reminderAt && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold" style={{ color: T.warning }}>
                        <span className="material-symbols-outlined text-[11px]">notifications_active</span>
                        {fmtScheduled(activity.reminderAt)}
                    </div>
                )}
                {activity.remindHourlyOneDayBefore && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: T.primary }}>
                        <span className="material-symbols-outlined text-[11px]">update</span>
                        Hourly Reminder
                    </div>
                )}
            </td>

            <td className="px-4 py-3.5" style={{ width: colWidths[showOwner ? 6 : 5] }}>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
            </td>

            {/* Delete — stop propagation */}
            <td className="px-4 py-3.5" style={{ width: colWidths[showOwner ? 7 : 6] }} onClick={e => e.stopPropagation()}>
                <button onClick={() => onRemove(activity.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                    <IconTrash size={17} stroke={1.8} />
                </button>
            </td>
        </tr>
    )
} 
