import { IconX } from '@tabler/icons-react'
import { T } from '../../constants/theme'

export function Modal({ title, onClose, children, wide }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={`w-full rounded-2xl flex flex-col ${wide ? 'max-w-2xl' : 'max-w-md'}`}
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-lg" style={{ color: T.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <IconX size={16} />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    )
}

export function InputField({ label, type = 'text', value, onChange, placeholder }) {
    return (
        <div className="mb-4">
            <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest"
                style={{ color: T.textMuted }}>{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textPrimary }} />
        </div>
    )
}