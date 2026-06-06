import { useState, useRef, useEffect } from 'react'
import { T } from '../constants/theme'
import { extractApiErrorMessage } from '../api'
import CustomSelect from './ui/CustomSelect'

export default function InlineEdit({ value, onSave, options, placeholder = '—', type = 'text', readonly = false, allowCustom = false, children }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [hovering, setHovering] = useState(false)
    const [error, setError] = useState('')
    const [isCustom, setIsCustom] = useState(false)
    const inputRef = useRef(null)
    const isSwitchingToCustom = useRef(false)

    useEffect(() => { setDraft(value) }, [value])
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus()
            isSwitchingToCustom.current = false
        }
    }, [editing, isCustom])

    const save = async () => {
        if (isSwitchingToCustom.current) {
            return
        }
        if (draft === value) {
            setEditing(false)
            return
        }

        try {
            await onSave(draft)
            setError('')
            setEditing(false)
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Update failed'))
        }
    }
    const cancel = () => { setEditing(false); setDraft(value); setError(''); setIsCustom(false) }
    const onKeyDown = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }

    return (
        <div className="relative flex flex-col justify-center">
            {editing && !readonly ? (
                <div className="relative flex items-center" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    {options && !isCustom ? (
                        <CustomSelect ref={inputRef} value={draft} onChange={e => {
                            if (e.target.value === '__custom__') {
                                isSwitchingToCustom.current = true
                                setIsCustom(true)
                                setDraft('')
                            } else {
                                setDraft(e.target.value)
                            }
                        }}
                            onBlur={save} className="text-sm py-1"
                            style={{ 
                                minWidth: 110,
                                border: `1.5px solid ${error ? T.error : 'transparent'}`
                            }}>
                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                            {allowCustom && <option value="__custom__">+ Custom...</option>}
                        </CustomSelect>
                    ) : type === 'textarea' ? (
                        <textarea ref={inputRef} value={draft ?? ''} onChange={e => setDraft(e.target.value)}
                            onBlur={save} placeholder={placeholder}
                            className="text-sm rounded-lg p-2 outline-none transition-all duration-150 w-full"
                            style={{ 
                                border: `1.5px solid ${error ? T.error : T.primary}`, 
                                background: T.surfaceRaised, 
                                color: T.textPrimary, 
                                minHeight: 80,
                                minWidth: 200
                            }} />
                    ) : (
                        <input ref={inputRef} type={type} value={draft ?? ''} onChange={e => setDraft(e.target.value)}
                            onBlur={save} onKeyDown={onKeyDown} placeholder={placeholder}
                            className="text-sm rounded-lg pl-2 pr-7 py-1 outline-none transition-all duration-150"
                            style={{ 
                                border: `1.5px solid ${error ? T.error : T.primary}`, 
                                background: T.surfaceRaised, 
                                color: T.textPrimary, 
                                minWidth: 120 
                            }} />
                    )}
                    {error && (
                        <span className="material-symbols-outlined absolute text-[16px] cursor-help"
                            style={{ 
                                position: 'absolute', 
                                right: '6px', 
                                color: T.error, 
                                fontSize: 16,
                                pointerEvents: 'auto'
                            }}
                            title={error}>
                            error
                        </span>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-1.5 cursor-pointer rounded-lg transition-colors"
                    style={{ padding: '2px 6px', margin: '-2px -6px', background: hovering && !readonly ? T.primaryFaint : 'transparent', cursor: readonly ? 'default' : 'pointer' }}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    onClick={() => { if (!readonly) { setError(''); setIsCustom(false); setEditing(true) } }}>
                    {children ?? <span style={{ color: value ? T.textSecondary : T.textMuted }}>{value || placeholder}</span>}
                    {!readonly && (
                        <span className="material-symbols-outlined shrink-0"
                            style={{ fontSize: 13, color: T.primary, opacity: hovering ? 1 : 0, transition: 'opacity 0.15s' }}>
                            edit
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
