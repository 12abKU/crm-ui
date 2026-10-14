import OrgNodeCard from './OrgNodeCard'

/**
 * OrgTreeNode recursively renders an individual node card centered above its direct reports.
 * Uses Flexbox self-centering to dynamically align subtrees without layout breaks.
 */
export default function OrgTreeNode({
    node,
    collapsedNodeIds,
    onToggleCollapse,
    selectedAgentId,
    onSelectAgent,
    matchedNodeIds,
    ancestorNodeIds,
    isFilteringActive = false,
    level = 0,
}) {
    if (!node) return null

    const isCollapsed = collapsedNodeIds ? collapsedNodeIds.has(node.id) : false
    const hasReports = Array.isArray(node.directReports) && node.directReports.length > 0

    const isSelected = selectedAgentId === node.id
    const isMatched = matchedNodeIds ? matchedNodeIds.has(node.id) : false
    const isAncestorOfMatch = ancestorNodeIds ? ancestorNodeIds.has(node.id) : false
    const isDimmed = isFilteringActive && !isMatched && !isAncestorOfMatch

    return (
        <div className="flex flex-col items-center shrink-0">
            {/* Parent Node Card */}
            <OrgNodeCard
                node={node}
                isSelected={isSelected}
                isMatched={isMatched}
                isAncestorOfMatch={isAncestorOfMatch}
                isDimmed={isDimmed}
                isCollapsed={isCollapsed}
                onSelect={onSelectAgent}
                onToggleCollapse={onToggleCollapse}
            />

            {/* Direct Reports Subtree Row (rendered only when expanded) */}
            {hasReports && !isCollapsed && (
                <div className="flex flex-row items-start justify-center gap-8 pt-12 relative">
                    {node.directReports.map(child => (
                        <OrgTreeNode
                            key={child.id}
                            node={child}
                            collapsedNodeIds={collapsedNodeIds}
                            onToggleCollapse={onToggleCollapse}
                            selectedAgentId={selectedAgentId}
                            onSelectAgent={onSelectAgent}
                            matchedNodeIds={matchedNodeIds}
                            ancestorNodeIds={ancestorNodeIds}
                            isFilteringActive={isFilteringActive}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
