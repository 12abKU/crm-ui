import { T } from '../../constants/theme'

export default function SettingsSection({ title, description, badge, action, children, noPad = false, className = '' }) {
    return (
        <div
            className={`rounded-2xl overflow-hidden transition-all duration-200 border relative ${className}`}
            style={{
                background: T.surface,
                borderColor: T.border,
                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {/* Subtle top edge accent */}
            <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${T.primary}40 50%, transparent 100%)`,
                }}
            />

            {(title || description || action) && (
                <div
                    className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b"
                    style={{ borderColor: T.borderSubtle }}
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {title && (
                                <h3 className="text-base font-extrabold tracking-tight truncate" style={{ color: T.textPrimary }}>
                                    {title}
                                </h3>
                            )}
                            {badge && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                    style={{
                                        background: T.primaryDim,
                                        color: T.primary,
                                        border: `1px solid ${T.primary}20`,
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: T.textMuted }}>
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            )}
            <div className={noPad ? '' : 'p-6'}>{children}</div>
        </div>
    )
}
