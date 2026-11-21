import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'

export default function SearchInput({ value, onChange, placeholder, minWidth = 280 }) {
    const [isMobile, setIsMobile] = useState(false)
    const [focused, setFocused] = useState(false)

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 640)
        handler()
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    return (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl min-w-0 w-full sm:w-auto flex-1 sm:flex-none transition-all duration-150"
            style={{ 
                background: T.surface, 
                border: `1px solid ${focused ? T.primary : T.border}`,
                boxShadow: focused ? `0 0 0 3px ${T.primaryDim}, 0 1px 2px rgba(0,0,0,0.04)` : '0 1px 2px rgba(0,0,0,0.02)',
                borderRadius: 12,
                minWidth: isMobile ? undefined : minWidth 
            }}>
            <span className="material-symbols-outlined text-[18px] transition-colors" style={{ color: focused ? T.primary : T.textMuted }}>search</span>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm outline-none w-full font-medium"
                style={{ color: T.textPrimary }}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
                    style={{ background: T.surfaceHigh, color: T.textMuted }}>
                    <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
            )}
        </div>
    )
}
