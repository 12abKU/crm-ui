import { T } from '../../constants/theme'

export default function ProfileInputField({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</label>
            <div className="relative">
                <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
                    className="crm-input w-full" style={{ paddingRight: rightSlot ? '40px' : undefined }} />
                {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
            </div>
        </div>
    )
}
