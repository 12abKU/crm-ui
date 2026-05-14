import { T } from '../../constants/theme'

export default function EyeToggle({ show, onToggle }) {
    return (
        <button type="button" onClick={onToggle}
            className="material-symbols-outlined text-[18px] transition-colors"
            style={{ color: show ? T.primary : T.textMuted, lineHeight: 1 }}>
            {show ? 'visibility' : 'visibility_off'}
        </button>
    )
}
