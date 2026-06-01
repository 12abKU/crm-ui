import { useEffect, useRef, useState } from 'react'

export default function VirtualList({
    items = [],
    itemHeight,
    renderItem,
    getKey = (item, index) => item?.id ?? index,
    overscan = 6,
    className = '',
    style,
    onEndReached,
    endThreshold = 240,
}) {
    const ref = useRef(null)
    const [viewport, setViewport] = useState({ scrollTop: 0, height: 0 })

    useEffect(() => {
        const node = ref.current
        if (!node) return

        const update = () => {
            setViewport({ scrollTop: node.scrollTop, height: node.clientHeight })
            if (onEndReached && node.scrollHeight - node.scrollTop - node.clientHeight < endThreshold) {
                onEndReached()
            }
        }

        update()
        node.addEventListener('scroll', update, { passive: true })
        const resizeObserver = new ResizeObserver(update)
        resizeObserver.observe(node)
        return () => {
            node.removeEventListener('scroll', update)
            resizeObserver.disconnect()
        }
    }, [onEndReached, endThreshold])

    const totalHeight = items.length * itemHeight
    const startIndex = Math.max(0, Math.floor(viewport.scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(viewport.height / itemHeight) + overscan * 2
    const endIndex = Math.min(items.length, startIndex + visibleCount)
    const visibleItems = items.slice(startIndex, endIndex)

    return (
        <div ref={ref} className={className} style={{ overflowY: 'auto', ...style }}>
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map((item, offset) => {
                    const index = startIndex + offset
                    return (
                        <div
                            key={getKey(item, index)}
                            style={{
                                position: 'absolute',
                                top: index * itemHeight,
                                left: 0,
                                right: 0,
                                height: itemHeight,
                            }}
                        >
                            {renderItem(item, index)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
