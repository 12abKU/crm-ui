import { useState, useCallback } from 'react'

/**
 * Custom hook for managing Org Chart tree collapse/expand states and active node selection.
 */
export function useOrgTreeState({ initialCollapsedIds = [] } = {}) {
    // Set of collapsed node IDs for O(1) checks during recursive rendering
    const [collapsedNodeIds, setCollapsedNodeIds] = useState(() => new Set(initialCollapsedIds))

    // Active selected agent ID (e.g. for card glow and slide-out drawer)
    const [selectedAgentId, setSelectedAgentId] = useState(null)

    // 1. Toggle collapse state for a given node
    const toggleCollapse = useCallback((nodeId) => {
        setCollapsedNodeIds(prev => {
            const next = new Set(prev)
            if (next.has(nodeId)) {
                next.delete(nodeId)
            } else {
                next.add(nodeId)
            }
            return next
        })
    }, [])

    // 2. Explicitly collapse a node
    const collapseNode = useCallback((nodeId) => {
        setCollapsedNodeIds(prev => {
            if (prev.has(nodeId)) return prev
            const next = new Set(prev)
            next.add(nodeId)
            return next
        })
    }, [])

    // 3. Explicitly expand a node
    const expandNode = useCallback((nodeId) => {
        setCollapsedNodeIds(prev => {
            if (!prev.has(nodeId)) return prev
            const next = new Set(prev)
            next.delete(nodeId)
            return next
        })
    }, [])

    // 4. Collapse all manager nodes in the tree
    const collapseAll = useCallback((forest) => {
        const allManagerIds = []
        const traverse = (nodes) => {
            if (!Array.isArray(nodes)) return
            for (const node of nodes) {
                if (Array.isArray(node.directReports) && node.directReports.length > 0) {
                    allManagerIds.push(node.id)
                    traverse(node.directReports)
                }
            }
        }
        traverse(forest)
        setCollapsedNodeIds(new Set(allManagerIds))
    }, [])

    // 5. Expand all nodes in the tree
    const expandAll = useCallback(() => {
        setCollapsedNodeIds(new Set())
    }, [])

    // 6. Select or toggle selection of an agent
    const selectAgent = useCallback((agentId) => {
        setSelectedAgentId(prev => (prev === agentId ? null : agentId))
    }, [])

    // 7. Check if a node is collapsed
    const isCollapsed = useCallback((id) => collapsedNodeIds.has(id), [collapsedNodeIds])

    return {
        collapsedNodeIds,
        setCollapsedNodeIds,
        selectedAgentId,
        setSelectedAgentId,
        toggleCollapse,
        collapseNode,
        expandNode,
        collapseAll,
        expandAll,
        selectAgent,
        isCollapsed,
    }
}

export default useOrgTreeState
