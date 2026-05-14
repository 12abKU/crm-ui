import { T } from '../../constants/theme'

export default function SearchInput({ value, onChange, placeholder, minWidth = 280 }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: T.surface, border: `1px solid ${T.border}`, minWidth }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: T.textMuted }}>search</span>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: T.textPrimary }}
            />
            {value && (
                <span onClick={() => onChange('')}
                    className="material-symbols-outlined text-[16px] cursor-pointer"
                    style={{ color: T.textMuted }}>close</span>
            )}
        </div>
    )
}
