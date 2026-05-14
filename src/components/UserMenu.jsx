import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { T } from '../constants/theme'
import RoleBadge from './settings/RoleBadge'

export default function UserMenu() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const name = localStorage.getItem('name') || 'User'
    const role = localStorage.getItem('role') || 'AGENT'

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const signOut = () => {
        localStorage.clear()
        navigate('/login')
    }

    const menuItems = [
        { icon: 'manage_accounts', label: 'My Profile', action: () => { navigate('/profile'); setOpen(false) } },
        { icon: 'settings', label: 'Settings', action: () => { navigate('/settings'); setOpen(false) } },
    ]

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 p-1.5 rounded-xl transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: T.primary, color: T.textInverse }}>
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold leading-tight" style={{ color: T.textPrimary }}>{name}</p>
                    <p className="text-[10px]" style={{ color: T.textMuted }}>{role}</p>
                </div>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>

                    {/* Header */}
                    <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ background: T.primary, color: T.textInverse }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: T.textPrimary }}>{name}</p>
                            <RoleBadge role={role} />
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                        {menuItems.map(({ icon, label, action }) => (
                            <button key={label} onClick={action}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                                style={{ color: T.textSecondary }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceRaised; e.currentTarget.style.color = T.textPrimary }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSecondary }}>
                                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Sign out */}
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                        <button onClick={signOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                            style={{ color: T.error }}
                            onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}