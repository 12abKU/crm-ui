import { useEffect, useRef, useState } from 'react'
import { T } from '../../constants/theme'
import { OUTCOMES } from './activityUtils'

export default function OutcomePicker({ activityId, type, current, onSave }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const options = OUTCOMES[type] || []

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(o => !o)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                style={{ background: current ? T.secondaryDim : T.surfaceHigh, color: current ? T.secondary : T.textMuted }}>
                <span className="material-symbols-outlined text-[11px]">flag</span>
                {current || 'Set outcome'}
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 rounded-xl shadow-lg z-50 py-1 min-w-[160px]"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    {options.map(opt => (
                        <button key={opt} onClick={() => { onSave(activityId, opt); setOpen(false) }}
                            className="w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors"
                            style={{ color: opt === current ? T.secondary : T.textPrimary }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {opt}
                        </button>
                    ))}
                    {current && (
                        <button onClick={() => { onSave(activityId, null); setOpen(false) }}
                            className="w-full text-left px-3 py-2 text-[11px] transition-colors"
                            style={{ color: T.textMuted, borderTop: `1px solid ${T.border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Clear outcome
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
