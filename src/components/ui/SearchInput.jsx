import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'

export default function SearchInput({ value, onChange, placeholder, minWidth = 280 }) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 640)
        handler()
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0 w-full sm:w-auto flex-1 sm:flex-none"
            style={{ 
                background: T.surface, 
                border: `1px solid ${T.border}`, 
                minWidth: isMobile ? undefined : minWidth 
            }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>search</span>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm outline-none w-full"
                style={{ color: T.textPrimary }}
            />
            {value && (
                <span onClick={() => onChange('')}
                    className="material-symbols-outlined text-[16px] cursor-pointer shrink-0"
                    style={{ color: T.textMuted }}>close</span>
            )}
        </div>
    )
}
