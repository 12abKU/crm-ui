import { useEffect, useRef, useState } from 'react'
import { T, ACTIVITY_TYPES, ACTIVITY_STYLES } from '../../constants/theme'
import InlineEdit from '../InlineEdit'
import CompleteToggle from './CompleteToggle'
import OutcomePicker from './OutcomePicker'
import { fmtScheduled, getStatus, STATUS_STYLES } from './activityUtils'

export default function ActivityRow({ activity, highlighted, rowBg, onRemove, onUpdate, onComplete, onOutcome, showOwner }) {
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
        <tr ref={rowRef} className="group transition-all"
            style={{
                borderBottom: `1px solid ${T.borderSubtle}`,
                background: blink ? 'rgba(37,99,235,0.18)' : activity.completed ? T.surfaceRaised : rowBg,
                opacity: activity.completed ? 0.65 : 1,
                transition: 'background 0.3s ease',
            }}
            onMouseEnter={e => { if (!blink) e.currentTarget.style.background = T.surfaceHigh }}
            onMouseLeave={e => { if (!blink) e.currentTarget.style.background = activity.completed ? T.surfaceRaised : rowBg }}>
            <td className="px-4 py-3.5">
                <CompleteToggle activityId={activity.id} completed={activity.completed} onToggle={onComplete} />
            </td>
            <td className="px-4 py-3.5">
                <InlineEdit value={activity.type} options={ACTIVITY_TYPES} onSave={v => onUpdate(activity.id, 'type', v)}>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold w-fit"
                        style={{ background: s.bg, color: s.color }}>
                        <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                        {activity.type}
                    </span>
                </InlineEdit>
            </td>
            <td className="px-4 py-3.5">
                <InlineEdit value={activity.subject} placeholder="Add subject" onSave={v => onUpdate(activity.id, 'subject', v)}>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary, textDecoration: activity.completed ? 'line-through' : 'none' }}>
                        {activity.subject}
                    </p>
                </InlineEdit>
                {activity.description && (
                    <p className="text-[11px] mt-0.5 truncate max-w-[180px]" style={{ color: T.textMuted }}>{activity.description}</p>
                )}
                <OutcomePicker activityId={activity.id} type={activity.type} current={activity.outcome} onSave={onOutcome} />
            </td>
            <td className="px-4 py-3.5">
                {activity.account ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                            style={{ background: T.primaryDim, color: T.primaryText }}>
                            {activity.account.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] font-semibold truncate" style={{ color: T.textPrimary }}>{activity.account.name}</p>
                            {activity.contact && (
                                <p className="text-[11px] truncate" style={{ color: T.textMuted }}>
                                    {activity.contact.firstName} {activity.contact.lastName}
                                </p>
                            )}
                        </div>
                    </div>
                ) : <span className="text-[12px]" style={{ color: T.textMuted }}>—</span>}
            </td>
            {/* Admin only: who created this activity */}
            {showOwner && (
                <td className="px-4 py-3.5">
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
                style={{ color: status === 'overdue' ? T.error : T.textSecondary, fontWeight: status === 'overdue' ? 700 : 400 }}>
                {fmtScheduled(activity.scheduledAt)}
            </td>
            <td className="px-4 py-3.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
            </td>
            <td className="px-4 py-3.5">
                <button onClick={() => onRemove(activity.id)}
                    className="material-symbols-outlined text-[17px] opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                    delete
                </button>
            </td>
        </tr>
    )
}