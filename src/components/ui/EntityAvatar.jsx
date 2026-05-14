import { T } from '../../constants/theme'

const AVATARS = [T.primaryDim, T.secondaryDim, T.tertiaryDim, 'rgba(76,175,125,0.15)']
const AVATAR_COLORS = [T.primaryText, T.secondaryText, T.tertiaryText, '#4CAF7D']

export default function EntityAvatar({ label = '', index = 0, rounded = 'full', variant = 'cycle' }) {
    const background = variant === 'primary' ? T.primaryDim : AVATARS[index % AVATARS.length]
    const color = variant === 'primary' ? T.primary : AVATAR_COLORS[index % AVATAR_COLORS.length]
    const shape = rounded === 'xl' ? 'rounded-xl' : 'rounded-full'

    return (
        <div className={`w-10 h-10 ${shape} flex items-center justify-center font-bold text-sm shrink-0`}
            style={{ background, color }}>
            {label.charAt(0).toUpperCase()}
        </div>
    )
}
