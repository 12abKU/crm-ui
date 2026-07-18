import { T } from '../../constants/theme'

export default function PageHeader({ title, subtitle, actions, icon }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className={icon ? 'flex items-center gap-4' : undefined}>
                {icon && (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[24px]" style={{ color: T.primary }}>{icon}</span>
                    </div>
                )}
                <div>
                    <h2 className="text-xl sm:text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>{title}</h2>
                    {subtitle && <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
        </div>
    )
}
