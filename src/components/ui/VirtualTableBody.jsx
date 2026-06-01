import VirtualList from './VirtualList'
import { T } from '../../constants/theme'

/**
 * Virtualized table body — keeps thead/footer pagination; only visible rows mount in DOM.
 */
export default function VirtualTableBody({
    items = [],
    colSpan = 6,
    rowHeight = 72,
    maxHeight = 560,
    renderRow,
    onEndReached,
}) {
    if (!items.length) return null

    return (
        <tbody>
            <tr>
                <td colSpan={colSpan} style={{ padding: 0, border: 'none' }}>
                    <VirtualList
                        className="w-full"
                        style={{ maxHeight, width: '100%' }}
                        items={items}
                        itemHeight={rowHeight}
                        onEndReached={onEndReached}
                        renderItem={(item, index) => (
                            <table className="w-full text-left" style={{ tableLayout: 'fixed', minWidth: 900 }}>
                                <tbody>
                                    {renderRow(item, index)}
                                </tbody>
                            </table>
                        )}
                        getKey={(item, index) => item?.id ?? index}
                    />
                </td>
            </tr>
        </tbody>
    )
}

export function virtualRowHandlers(rowBg) {
    return {
        onMouseEnter: (e) => {
            e.currentTarget.style.background = T.surfaceHigh
            e.currentTarget.style.transform = 'translateX(2px)'
        },
        onMouseLeave: (e) => {
            e.currentTarget.style.background = rowBg
            e.currentTarget.style.transform = 'none'
        },
    }
}
