import { T } from '../../constants/theme'

export default function SettingsSection({ title, description, children, noPad = false }) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {(title || description) && (
                <div className="px-6 py-5" style={{ borderBottom: `1px solid ${T.border}` }}>
                    {title && <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>{title}</h3>}
                    {description && <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{description}</p>}
                </div>
            )}
            <div className={noPad ? '' : 'p-6'}>{children}</div>
        </div>
    )
}