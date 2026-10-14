import { useState, useLayoutEffect, useCallback } from 'react'
import { T } from '../../../constants/theme'

/**
 * OrgBezierConnector renders hardware-accelerated SVG cubic bezier curves
 * connecting managers to direct report cards within the canvas content container.
 */
export default function OrgBezierConnector({
    contentRef,
    treeData,
    collapsedNodeIds,
    scale = 1,
    selectedAgentId,
    matchedNodeIds,
}) {
    const [connectors, setConnectors] = useState([])

    const computeConnectors = useCallback(() => {
        if (!contentRef?.current) return
        const content = contentRef.current
        const contentRect = content.getBoundingClientRect()
        if (contentRect.width === 0 || contentRect.height === 0) return

        const cards = content.querySelectorAll('[data-node-id]')
        const posMap = new Map()

        cards.forEach(el => {
            const id = el.getAttribute('data-node-id')
            const parentId = el.getAttribute('data-parent-id')
            const rect = el.getBoundingClientRect()

            // Calculate unscaled coordinates local to content container
            const currentScale = scale > 0 ? scale : 1
            const x = (rect.left - contentRect.left + rect.width / 2) / currentScale
            const topY = (rect.top - contentRect.top) / currentScale
            const bottomY = (rect.bottom - contentRect.top) / currentScale

            posMap.set(String(id), { x, topY, bottomY, parentId })
        })

        const lines = []
        posMap.forEach((child, childId) => {
            if (child.parentId && posMap.has(String(child.parentId))) {
                const parent = posMap.get(String(child.parentId))
                lines.push({
                    id: `${child.parentId}->${childId}`,
                    parentId: String(child.parentId),
                    childId: String(childId),
                    x1: parent.x,
                    y1: parent.bottomY,
                    x2: child.x,
                    y2: child.topY,
                })
            }
        })

        setConnectors(lines)
    }, [contentRef, scale])

    // Recompute on tree changes, collapse/expand, and scale
    useLayoutEffect(() => {
        // Initial micro-delay to let DOM layout settle
        const timer = setTimeout(() => {
            computeConnectors()
        }, 30)
        return () => clearTimeout(timer)
    }, [treeData, collapsedNodeIds, computeConnectors])

    // Track content container resizes
    useLayoutEffect(() => {
        if (!contentRef?.current || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => {
            computeConnectors()
        })
        observer.observe(contentRef.current)
        return () => observer.disconnect()
    }, [contentRef, computeConnectors])

    return (
        <svg
            className="absolute inset-0 pointer-events-none w-full h-full"
            style={{ overflow: 'visible', zIndex: 0 }}
        >
            <defs>
                <filter id="org-bezier-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor={T.primary} floodOpacity="0.45" />
                </filter>
            </defs>

            {connectors.map(c => {
                const isChildMatched = matchedNodeIds?.has(Number(c.childId))
                const isParentMatched = matchedNodeIds?.has(Number(c.parentId))
                const isChildSelected = selectedAgentId != null && String(selectedAgentId) === String(c.childId)
                const isParentSelected = selectedAgentId != null && String(selectedAgentId) === String(c.parentId)

                const isHighlighted = isChildMatched || isParentMatched
                const isSelected = isChildSelected || isParentSelected
                const isActive = isHighlighted || isSelected

                const midY = (c.y1 + c.y2) / 2
                // Cubic Bezier curve formula: M x1 y1 C x1 midY, x2 midY, x2 y2
                const pathData = `M ${c.x1} ${c.y1} C ${c.x1} ${midY}, ${c.x2} ${midY}, ${c.x2} ${c.y2}`
                const strokeColor = isActive ? T.primary : `${T.border}`

                return (
                    <g key={c.id}>
                        <path
                            d={pathData}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={isActive ? 2.5 : 1.75}
                            strokeLinecap="round"
                            filter={isActive ? 'url(#org-bezier-glow)' : 'none'}
                            style={{
                                transition: 'stroke 200ms ease, stroke-width 200ms ease',
                            }}
                        />
                        {/* Anchor docking dots */}
                        <circle cx={c.x1} cy={c.y1} r={3} fill={strokeColor} />
                        <circle cx={c.x2} cy={c.y2} r={3} fill={strokeColor} />
                    </g>
                )
            })}
        </svg>
    )
}
