import { useState, useRef, useEffect } from 'react'
import { T } from '../constants/theme'

export default function InlineEdit({ value, onSave, options, placeholder = '—', children }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [hovering, setHovering] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => { setDraft(value) }, [value])
    useEffect(() => { if (editing && inputRef.current) inputRef.current.focus() }, [editing])

    const save = () => { setEditing(false); if (draft !== value) onSave(draft) }
    const cancel = () => { setEditing(false); setDraft(value) }
    const onKeyDown = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }

    if (editing) return options ? (
        <select ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={save} onKeyDown={onKeyDown} className="crm-select text-sm py-1 px-2"
            style={{ minWidth: 110 }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    ) : (
        <input ref={inputRef} value={draft ?? ''} onChange={e => setDraft(e.target.value)}
            onBlur={save} onKeyDown={onKeyDown} placeholder={placeholder}
            className="text-sm rounded-lg px-2 py-1 outline-none"
            style={{ border: `1.5px solid ${T.primary}`, background: T.surfaceRaised, color: T.textPrimary, minWidth: 120 }} />
    )

    return (
        <div className="flex items-center gap-1.5 cursor-pointer rounded-lg transition-colors"
            style={{ padding: '2px 6px', margin: '-2px -6px', background: hovering ? T.primaryFaint : 'transparent' }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => setEditing(true)}>
            {children ?? <span style={{ color: value ? T.textSecondary : T.textMuted }}>{value || placeholder}</span>}
            <span className="material-symbols-outlined flex-shrink-0"
                style={{ fontSize: 13, color: T.primary, opacity: hovering ? 1 : 0, transition: 'opacity 0.15s' }}>
                edit
            </span>
        </div>
    )
}