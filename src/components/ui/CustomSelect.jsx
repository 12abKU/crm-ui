import React, { useState, useRef, useEffect } from 'react'
import { T } from '../../constants/theme'
import { useFloating, autoUpdate, offset, flip, shift, size, FloatingPortal } from '@floating-ui/react'

const CustomSelect = React.forwardRef(({ value, onChange, onBlur, placeholder = 'Select...', disabled = false, className = '', style = {}, children, name, menuPlacement = 'bottom', wrapperClassName = '', wrapperStyle = {} }, forwardedRef) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: menuPlacement,
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(6),
            flip({ padding: 8 }),
            size({
                apply({ rects, elements, availableHeight }) {
                    Object.assign(elements.floating.style, {
                        minWidth: `${rects.reference.width}px`,
                        maxHeight: `${Math.min(availableHeight, 260)}px`,
                    });
                },
                padding: 8
            }),
            shift({ padding: 8 })
        ]
    })

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            const wrapper = ref.current;
            const floating = refs.floating.current;
            if (wrapper && !wrapper.contains(e.target) && (!floating || !floating.contains(e.target))) {
                if (open && onBlur) onBlur();
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open, refs.floating, onBlur])

    // Parse options and optgroups from standard <option> and <optgroup> children
    const parsedItems = []
    let flatOptions = []
    React.Children.forEach(children, child => {
        if (!child) return
        if (child.type === 'option' || child.props?.value !== undefined) {
            const opt = { type: 'option', value: child.props.value, label: child.props.children, disabled: Boolean(child.props?.disabled) }
            parsedItems.push(opt)
            flatOptions.push(opt)
        } else if (child.type === 'optgroup') {
            const groupOptions = []
            React.Children.forEach(child.props.children, o => {
                if (o && (o.type === 'option' || o.props?.value !== undefined)) {
                    const opt = { type: 'option', value: o.props.value, label: o.props.children, disabled: Boolean(o.props?.disabled) }
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
                ref={(node) => {
                    refs.setReference(node);
                    if (typeof forwardedRef === 'function') forwardedRef(node);
                    else if (forwardedRef) forwardedRef.current = node;
                }}
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
                <FloatingPortal>
                    <div className="rounded-xl overflow-hidden"
                        ref={refs.setFloating}
                        style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            boxShadow: '0 12px 36px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 99999,
                            maxWidth: 'calc(100vw - 16px)',
                            overflowY: 'auto',
                            ...floatingStyles
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
                                                const isDisabled = Boolean(opt.disabled)
                                                return (
                                                    <button
                                                        key={`${opt.value}-${idx}-${oIdx}`}
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={() => !isDisabled && handleSelect(opt.value)}
                                                        className="w-full text-left px-4 py-2.5 pl-6 text-sm transition-all flex items-center justify-between font-bold"
                                                        style={{
                                                            background: active ? T.primary : 'transparent',
                                                            color: active ? '#FFFFFF' : (isDisabled ? T.textMuted : T.textSecondary),
                                                            opacity: isDisabled ? 0.45 : 1,
                                                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                                                        }}
                                                        onMouseEnter={e => {
                                                            if (!active && !isDisabled) e.currentTarget.style.background = T.surfaceHigh
                                                        }}
                                                        onMouseLeave={e => {
                                                            if (!active && !isDisabled) e.currentTarget.style.background = 'transparent'
                                                        }}
                                                    >
                                                        <span className="truncate whitespace-nowrap">{opt.label}</span>
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
                                const isDisabled = Boolean(item.disabled)
                                return (
                                    <button
                                        key={`${item.value}-${idx}`}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => !isDisabled && handleSelect(item.value)}
                                        className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between font-bold"
                                        style={{
                                            background: active ? T.primary : 'transparent',
                                            color: active ? '#FFFFFF' : (isDisabled ? T.textMuted : T.textSecondary),
                                            opacity: isDisabled ? 0.45 : 1,
                                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                                        }}
                                        onMouseEnter={e => {
                                            if (!active && !isDisabled) e.currentTarget.style.background = T.surfaceHigh
                                        }}
                                        onMouseLeave={e => {
                                            if (!active && !isDisabled) e.currentTarget.style.background = 'transparent'
                                        }}
                                    >
                                        <span className="truncate whitespace-nowrap">{item.label}</span>
                                        {active && (
                                            <span className="material-symbols-outlined text-[16px] text-white">check</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </div>
    )
})

export default CustomSelect
