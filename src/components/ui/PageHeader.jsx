import { T } from '../../constants/theme'

export default function PageHeader({ title, subtitle, actions, icon, badge }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--crm-border-subtle)]">
            <div className="flex items-center gap-3.5 min-w-0">
                {icon && (
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200"
                        style={{
                            background: T.primaryDim,
                            border: `1px solid ${T.primary}30`,
                            boxShadow: `0 4px 12px ${T.primary}15`,
                        }}
                    >
                        <span className="material-symbols-outlined filled text-[22px]" style={{ color: T.primary }}>
                            {icon}
                        </span>
                    </div>
                )}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight truncate" style={{ color: T.textPrimary }}>
                            {title}
                        </h2>
                        {badge && (
                            <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                style={{
                                    background: T.primaryDim,
                                    color: T.primary,
                                    border: `1px solid ${T.primary}25`,
                                }}
                            >
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs sm:text-sm mt-0.5 truncate" style={{ color: T.textMuted }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
        </div>
    )
}
