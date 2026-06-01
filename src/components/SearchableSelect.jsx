import { useState, useRef, useEffect } from 'react'
import { Field } from './FormField'
import { T } from '../constants/theme'

export default function SearchableSelect({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    loading = false,
    error,
    onSearch,
    searchDelay = 250,
    minSearchLength = 0,
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [remoteOptions, setRemoteOptions] = useState([])
    const [remoteLoading, setRemoteLoading] = useState(false)
    const ref = useRef(null)
    const inputRef = useRef(null)
    const requestIdRef = useRef(0)

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])
    useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open])

    useEffect(() => {
        requestIdRef.current += 1
        if (!open || !onSearch) return

        const q = search.trim()
        const requestId = requestIdRef.current
        if (q.length < minSearchLength) {
            const timer = setTimeout(() => {
                if (requestId === requestIdRef.current) {
                    setRemoteOptions([])
                    setRemoteLoading(false)
                }
            }, 0)
            return () => clearTimeout(timer)
        }

        const timer = setTimeout(() => {
            if (requestId !== requestIdRef.current) return
            setRemoteLoading(true)
            Promise.resolve(onSearch(q))
                .then(result => {
                    if (requestId === requestIdRef.current) {
                        setRemoteOptions(Array.isArray(result) ? result : [])
                    }
                })
                .catch(() => {
                    if (requestId === requestIdRef.current) setRemoteOptions([])
                })
                .finally(() => {
                    if (requestId === requestIdRef.current) setRemoteLoading(false)
                })
        }, searchDelay)

        return () => clearTimeout(timer)
    }, [open, search, onSearch, searchDelay, minSearchLength])

    const displayOptions = onSearch ? remoteOptions : options
    const filtered = onSearch
        ? displayOptions.slice(0, 10)
        : options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    const selectedLabel = [...options, ...displayOptions].find(o => String(o.id) === String(value))?.label
    const isLoading = loading || remoteLoading

    // toolbar mode = no label (used as filter), form mode = has label
    const isToolbar = !label

    const content = (
        <div className="relative" ref={ref}>
            <button type="button" disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className="crm-select w-full flex items-center justify-between gap-2 text-left transition-all duration-150"
                style={{ 
                    opacity: disabled ? 0.4 : 1, 
                    cursor: disabled ? 'not-allowed' : 'pointer', 
                    color: selectedLabel ? T.textPrimary : T.textMuted, 
                    paddingRight: 10, 
                    minWidth: isToolbar ? 200 : undefined,
                    borderColor: error ? T.error : undefined,
                    boxShadow: error ? `0 0 0 3px ${T.error}15` : undefined
                }}>
                <span className="truncate text-sm">{selectedLabel || placeholder}</span>
                <div className="flex items-center gap-1 shrink-0">
                    {selectedLabel && !disabled && (
                        <span onClick={e => { e.stopPropagation(); onChange(''); setSearch('') }}
                            className="material-symbols-outlined text-[15px]" style={{ color: T.textMuted }}>close</span>
                    )}
                    <span className="material-symbols-outlined text-[18px]"
                        style={{ color: T.textMuted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                    </span>
                </div>
            </button>

            {open && (
                <div className="absolute mt-1 rounded-xl overflow-hidden z-50"
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        top: '100%',
                        // toolbar: pin to right edge, fixed width; form: stretch full width
                        ...(isToolbar
                            ? { right: 0, left: 'auto', minWidth: 240 }
                            : { left: 0, right: 0 }
                        )
                    }}>
                    <div className="p-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: T.bg }}>
                            <span className="material-symbols-outlined text-[16px]" style={{ color: T.textMuted }}>search</span>
                            <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.textPrimary }} />
                        </div>
                    </div>
                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                                <span className="text-xs" style={{ color: T.textMuted }}>Loading...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-6 text-center text-xs" style={{ color: T.textMuted }}>
                                {search ? 'No results' : 'No options'}
                            </div>
                        ) : (
                            <>
                                {filtered.map(opt => {
                                    const active = String(opt.id) === String(value)
                                    return (
                                        <button key={opt.id} type="button"
                                            onClick={() => { onChange(String(opt.id)); setSearch(''); setOpen(false) }}
                                            className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                            style={{ background: active ? T.primary : 'transparent', color: active ? '#fff' : T.textSecondary }}
                                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.surfaceRaised }}
                                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                                            {opt.label}
                                        </button>
                                    )
                                })}
                                {options.length > 6 && (
                                    <p className="text-center text-[10px] py-2" style={{ color: T.textMuted, borderTop: `1px solid ${T.borderSubtle}` }}>
                                        {options.length - 6} more — type to search
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    return label ? <Field label={label} error={error}>{content}</Field> : content
}
