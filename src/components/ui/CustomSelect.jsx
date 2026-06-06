import React, { useState, useRef, useEffect } from 'react'
import { T } from '../../constants/theme'

const CustomSelect = React.forwardRef(({ value, onChange, onBlur, placeholder = 'Select...', disabled = false, className = '', style = {}, children, name, menuPlacement = 'bottom', wrapperClassName = '', wrapperStyle = {} }, forwardedRef) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                if (open && onBlur) onBlur();
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Parse options and optgroups from standard <option> and <optgroup> children
    const parsedItems = []
    let flatOptions = []
    React.Children.forEach(children, child => {
        if (!child) return
        if (child.type === 'option' || child.props?.value !== undefined) {
            const opt = { type: 'option', value: child.props.value, label: child.props.children }
            parsedItems.push(opt)
            flatOptions.push(opt)
        } else if (child.type === 'optgroup') {
            const groupOptions = []
            React.Children.forEach(child.props.children, o => {
                if (o && (o.type === 'option' || o.props?.value !== undefined)) {
                    const opt = { type: 'option', value: o.props.value, label: o.props.children }
                    groupOptions.push(opt)
                    flatOptions.push(opt)
                }
            })
            if (groupOptions.length > 0) {
                parsedItems.push({ type: 'optgroup', label: child.props.label, options: groupOptions })
            }
        }
    })

    const selectedOption = flatOptions.find(o => String(o.value) === String(value))
    const displayLabel = selectedOption ? selectedOption.label : placeholder

    const handleSelect = (val) => {
        if (onChange) {
            onChange({
                target: {
                    value: val,
                    name: name
                }
            })
        }
        setOpen(false)
        if (onBlur) onBlur();
    }

    // Extract width-related classes to apply to the wrapper so that flex grids and columns respect the desired width
    const widthClasses = className.split(' ').filter(c => /(?:^|:)w-/.test(c)).join(' ')
    const defaultWidth = widthClasses ? '' : '' // If no width classes are passed, we don't force anything, allowing it to shrink to content or stretch via flex parent

    return (
        <div className={`relative min-w-0 ${widthClasses} ${defaultWidth} ${wrapperClassName}`.trim()} ref={ref} style={wrapperStyle}>
            <button
                ref={forwardedRef}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className={`w-full flex items-center justify-between gap-2 text-left cursor-pointer transition-all duration-150 ${className}`}
                style={{
                    opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    color: selectedOption && selectedOption.value !== '' ? T.textPrimary : T.textMuted,
                    background: T.surface,
                    border: `1px solid ${open ? T.primary : (style.borderColor || T.border)}`,
                    boxShadow: open ? `0 0 0 3px ${T.primaryDim}` : 'none',
                    outline: 'none',
                    ...style,
                    backgroundImage: 'none',
                    backgroundPosition: 'unset',
                    paddingRight: '12px'
                }}
            >
                <span className="truncate text-sm">{displayLabel}</span>
                <span className="material-symbols-outlined text-[18px] shrink-0 transition-transform duration-200"
                    style={{ color: T.textMuted, transform: open ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className={`absolute ${menuPlacement === 'top' ? 'mb-1.5' : 'mt-1.5'} rounded-xl overflow-hidden z-[100]`}
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
                        left: 0,
                        right: 0,
                        ...(menuPlacement === 'top' ? { bottom: '100%' } : { top: '100%' }),
                        maxHeight: '260px',
                        overflowY: 'auto'
                    }}>
                    <div className="py-1 flex flex-col">
                        {parsedItems.map((item, idx) => {
                            if (item.type === 'optgroup') {
                                return (
                                    <div key={`group-${idx}`} className="flex flex-col">
                                        <div className="px-4 py-1.5 mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                            {item.label}
                                        </div>
                                        {item.options.map((opt, oIdx) => {
                                            const active = String(opt.value) === String(value)
                                            return (
                                                <button
                                                    key={`${opt.value}-${idx}-${oIdx}`}
                                                    type="button"
                                                    onClick={() => handleSelect(opt.value)}
                                                    className="w-full text-left px-4 py-2.5 pl-6 text-sm transition-all flex items-center justify-between font-bold"
                                                    style={{
                                                        background: active ? T.primary : 'transparent',
                                                        color: active ? '#FFFFFF' : T.textSecondary
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (!active) e.currentTarget.style.background = T.surfaceHigh
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (!active) e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    <span className="truncate">{opt.label}</span>
                                                    {active && (
                                                        <span className="material-symbols-outlined text-[16px] text-white">check</span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            }
                            
                            const active = String(item.value) === String(value)
                            return (
                                <button
                                    key={`${item.value}-${idx}`}
                                    type="button"
                                    onClick={() => handleSelect(item.value)}
                                    className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between font-bold"
                                    style={{
                                        background: active ? T.primary : 'transparent',
                                        color: active ? '#FFFFFF' : T.textSecondary
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) e.currentTarget.style.background = T.surfaceHigh
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) e.currentTarget.style.background = 'transparent'
                                    }}
                                >
                                    <span className="truncate">{item.label}</span>
                                    {active && (
                                        <span className="material-symbols-outlined text-[16px] text-white">check</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
})

export default CustomSelect
