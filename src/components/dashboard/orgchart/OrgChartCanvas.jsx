import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { T } from '../../../constants/theme'
import OrgTreeNode from './OrgTreeNode'
import OrgBezierConnector from './OrgBezierConnector'

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2.0
const ZOOM_STEP = 0.15

/**
 * OrgChartCanvas provides an interactive, hardware-accelerated canvas
 * supporting mouse drag panning, cursor-focal mouse wheel zooming,
 * side-by-side multi-root Flexbox forest layout, and smooth SVG bezier connectors.
 */
const OrgChartCanvas = forwardRef(function OrgChartCanvas({
    forest = [],
    treeData, // Alias for forest
    collapsedNodeIds,
    onToggleCollapse,
    selectedAgentId,
    onSelectAgent,
    matchedNodeIds,
    ancestorNodeIds,
    isFilteringActive = false,
    onScaleChange,
}, ref) {
    const data = treeData || forest || []
    const containerRef = useRef(null)
    const contentRef = useRef(null)

    const [scale, setScale] = useState(1)
    const [translate, setTranslate] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)

    const dragOriginRef = useRef({
        startX: 0,
        startY: 0,
        originTx: 0,
        originTy: 0,
        moved: false,
    })

    const stateRef = useRef({ scale, translate })
    stateRef.current = { scale, translate }

    // Notify parent of scale changes if listener provided
    useEffect(() => {
        if (typeof onScaleChange === 'function') {
            onScaleChange(scale)
        }
    }, [scale, onScaleChange])

    // Auto-center & Fit on Mount or when forest changes
    const handleReset = useCallback(() => {
        if (!containerRef.current || !contentRef.current) return
        const containerW = containerRef.current.clientWidth
        const contentW = contentRef.current.scrollWidth

        const targetScale = contentW > containerW - 80
            ? Math.max(MIN_ZOOM, Math.min(1.0, (containerW - 80) / contentW))
            : 1.0

        const centeredX = Math.max(20, (containerW - contentW * targetScale) / 2)
        const centeredY = 40

        setScale(Math.round(targetScale * 100) / 100)
        setTranslate({ x: centeredX, y: centeredY })
    }, [])

    useEffect(() => {
        const timer = setTimeout(handleReset, 80)
        return () => clearTimeout(timer)
    }, [data, handleReset])

    // Zoom In / Out Handlers
    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 100) / 100))
    }, [])

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 100) / 100))
    }, [])

    // Expose controls to parent via forwardRef
    useImperativeHandle(ref, () => ({
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        reset: handleReset,
        getScale: () => scale,
    }), [handleZoomIn, handleZoomOut, handleReset, scale])

    // Mouse Pan Handlers
    const handleMouseDown = (e) => {
        if (e.button !== 0) return
        // Do not pan if clicking an interactive element
        if (e.target.closest('button, input, select, textarea, [data-no-pan]')) return

        dragOriginRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            originTx: translate.x,
            originTy: translate.y,
            moved: false,
        }
        setIsDragging(true)
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e) => {
            const dx = e.clientX - dragOriginRef.current.startX
            const dy = e.clientY - dragOriginRef.current.startY
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                dragOriginRef.current.moved = true
            }
            setTranslate({
                x: dragOriginRef.current.originTx + dx,
                y: dragOriginRef.current.originTy + dy,
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    // Non-passive Wheel Zoom with Cursor Focal Point
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleWheel = (e) => {
            e.preventDefault()
            const { scale: curScale, translate: curTranslate } = stateRef.current
            const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
            const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(curScale * zoomFactor * 100) / 100))
            if (nextScale === curScale) return

            const rect = el.getBoundingClientRect()
            const cursorX = e.clientX - rect.left
            const cursorY = e.clientY - rect.top

            const nextTx = cursorX - (cursorX - curTranslate.x) * (nextScale / curScale)
            const nextTy = cursorY - (cursorY - curTranslate.y) * (nextScale / curScale)

            setScale(nextScale)
            setTranslate({ x: nextTx, y: nextTy })
        }

        el.addEventListener('wheel', handleWheel, { passive: false })
        return () => el.removeEventListener('wheel', handleWheel)
    }, [])

    const handleCardClick = (agentId) => {
        if (dragOriginRef.current.moved) return
        if (typeof onSelectAgent === 'function') {
            onSelectAgent(agentId)
        }
    }

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            className={`relative w-full h-[760px] overflow-hidden select-none rounded-3xl ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
                background: T.surface,
                border: `1px solid ${T.borderSubtle}`,
                backgroundImage: `radial-gradient(circle, ${T.border || 'rgba(148, 163, 184, 0.25)'} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
            }}
        >
            {/* Pannable and Zoomable Content Surface */}
            <div
                ref={contentRef}
                className="absolute origin-top-left"
                style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {/* SVG Bezier Connectors Layer */}
                <OrgBezierConnector
                    contentRef={contentRef}
                    treeData={data}
                    collapsedNodeIds={collapsedNodeIds}
                    scale={scale}
                    selectedAgentId={selectedAgentId}
                    matchedNodeIds={matchedNodeIds}
                />

                {/* Multi-Root Forest Container */}
                <div className="flex flex-row items-start justify-center gap-16 md:gap-24 p-12 min-w-max relative z-10">
                    {data.length > 0 ? (
                        data.map(rootNode => (
                            <OrgTreeNode
                                key={rootNode.id}
                                node={rootNode}
                                collapsedNodeIds={collapsedNodeIds}
                                onToggleCollapse={onToggleCollapse}
                                selectedAgentId={selectedAgentId}
                                onSelectAgent={handleCardClick}
                                matchedNodeIds={matchedNodeIds}
                                ancestorNodeIds={ancestorNodeIds}
                                isFilteringActive={isFilteringActive}
                                level={0}
                            />
                        ))
                    ) : (
                        <div className="py-24 text-center font-bold text-sm" style={{ color: T.textMuted }}>
                            No organizational hierarchy data found.
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Zoom & Center Controls */}
            <div
                className="absolute bottom-6 right-6 z-30 flex items-center gap-1 p-1.5 rounded-2xl shadow-xl backdrop-blur-md"
                data-no-pan
                style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                }}
            >
                <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:opacity-75 cursor-pointer"
                    style={{ color: T.textPrimary }}
                >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>

                <span
                    className="px-2.5 py-1 text-xs font-black min-w-[54px] text-center"
                    style={{ color: T.textPrimary }}
                >
                    {Math.round(scale * 100)}%
                </span>

                <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:opacity-75 cursor-pointer"
                    style={{ color: T.textPrimary }}
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                </button>

                <div className="w-px h-5 mx-1" style={{ background: T.border }} />

                <button
                    type="button"
                    onClick={handleReset}
                    title="Fit & Center View"
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:opacity-75 cursor-pointer"
                    style={{ color: T.primary }}
                >
                    <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                </button>
            </div>
        </div>
    )
})

export default OrgChartCanvas
