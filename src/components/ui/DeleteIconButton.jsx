import { T } from '../../constants/theme'

export default function DeleteIconButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
            style={{ color: T.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
            delete
        </button>
    )
}
