import { T } from '../../constants/theme'

export default function DeleteIconButton({ onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`material-symbols-outlined text-[16px] transition-opacity p-1 rounded-lg ${className}`}
            style={{ color: T.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
            delete
        </button>
    )
}
