import { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { T } from '../../constants/theme'

export default function SkeletonThemeWrapper({ children }) {
    return (
        <SkeletonTheme baseColor={T.surfaceHigh} highlightColor={T.surfaceRaised}>
            {children}
        </SkeletonTheme>
    )
}