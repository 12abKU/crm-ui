import { T, SHADOW } from '../constants/theme'

export default function SlideForm({ title, open, onClose, onSubmit, children }) {
    if (!open) return null
    return (
        <>
            <div className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(15,23,42,0.5)' }}
                onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-[440px] z-50 flex flex-col"
                style={{ background: T.surface, borderLeft: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>
                <div className="flex items-center justify-between px-8 py-5"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <h2 className="text-base font-bold" style={{ color: T.textPrimary }}>{title}</h2>
                    <button onClick={onClose}
                        className="material-symbols-outlined text-[20px] p-1.5 rounded-lg transition-colors"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                        close
                    </button>
                </div>
                <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
                    {children}
                    <div className="flex gap-3 pt-2 mt-auto">
                        <button type="button" onClick={onClose} className="crm-btn-ghost flex-1">Cancel</button>
                        <button type="submit" className="crm-btn-primary flex-1">Save</button>
                    </div>
                </form>
            </div>
        </>
    )
}