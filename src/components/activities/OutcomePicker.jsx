import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconFlag } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { OUTCOMES } from './activityUtils'

export default function OutcomePicker({ activityId, type, current, onSave }) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef(null)
    const dropRef = useRef(null)
    const options = OUTCOMES[type] || []

    // Position the portal dropdown relative to the button
    const openDropdown = () => {
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect()
            setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
        }
        setOpen(o => !o)
    }

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (btnRef.current?.contains(e.target)) return
            if (dropRef.current?.contains(e.target)) return
            setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="relative">
            <button ref={btnRef} onClick={openDropdown}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                style={current
                    ? { background: T.secondaryDim, color: T.secondary }
                    : { background: 'transparent', color: T.textSecondary, border: `1.5px dashed ${T.border}` }
                }>
                <IconFlag size={11} stroke={2.5} />
                {current || 'Set outcome'}
            </button>

            {open && createPortal(
                <div ref={dropRef}
                    className="fixed rounded-xl shadow-xl py-1 min-w-40"
                    style={{
                        top: pos.top, left: pos.left, zIndex: 9999,
                        background: T.surface, border: `1px solid ${T.border}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}>
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
                </div>,
                document.body
            )}
        </div>
    )
}