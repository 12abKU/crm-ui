import { useState } from 'react'
import { T } from '../../constants/theme'

export default function CompleteToggle({ activityId, completed, onToggle }) {
    const [hovered, setHovered] = useState(false)

    return (
        <button
            onClick={() => onToggle(activityId, !completed)}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
            style={{
                borderColor: completed ? T.success : hovered ? T.success : T.border,
                background: completed ? T.success : hovered ? 'rgba(22,163,74,0.15)' : 'transparent',
            }}>
            {(completed || hovered) && (
                <span className="material-symbols-outlined"
                    style={{ fontSize: 12, color: completed ? '#fff' : T.success }}>
                    check
                </span>
            )}
        </button>
    )
}
