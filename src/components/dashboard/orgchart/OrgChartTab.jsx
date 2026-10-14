import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import api from '../../../api'
import { T } from '../../../constants/theme'
import SearchInput from '../../ui/SearchInput'
import CustomSelect from '../../ui/CustomSelect'
import { TabSkeleton } from '../DashboardWidgets'
import OrgChartCanvas from './OrgChartCanvas'
import useOrgTreeState from './useOrgTreeState'
import AgentDetailsDrawer from './AgentDetailsDrawer'

/**
 * OrgChartTab provides the main organizational hierarchy view.
 * Features a rich toolbar with type-ahead search, dynamic designation filter,
 * system role filter, auto branch uncollapsing, and canvas controls.
 */
export default function OrgChartTab({ onAgentClick }) {
    const canvasRef = useRef(null)

    const [treeData, setTreeData] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)

    // Filter toolbar states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDesignation, setSelectedDesignation] = useState('ALL')
    const [selectedRole, setSelectedRole] = useState('ALL')
    const [zoomScale, setZoomScale] = useState(1.0)

    // Tree state hook
    const {
        collapsedNodeIds,
        setCollapsedNodeIds,
        selectedAgentId,
        selectAgent,
        toggleCollapse,
        collapseAll,
        expandAll,
    } = useOrgTreeState()

    // ── Data Fetching ──────────────────────────────────────────
    const fetchOrgChart = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(null)

        try {
            const res = await api.get('/api/dashboard/org-chart')
            const list = Array.isArray(res.data) ? res.data : []
            setTreeData(list)
        } catch (err) {
            console.error('Failed to load org chart hierarchy:', err)
            setError(err?.response?.data?.message || err?.message || 'Failed to load organizational chart.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        let mounted = true
        api.get('/api/dashboard/org-chart')
            .then(res => {
                if (mounted) {
                    setTreeData(Array.isArray(res.data) ? res.data : [])
                }
            })
            .catch(err => {
                if (mounted) {
                    console.error('Failed to load org chart hierarchy:', err)
                    setError(err?.response?.data?.message || err?.message || 'Failed to load organizational chart.')
                }
            })
            .finally(() => {
                if (mounted) setLoading(false)
            })
        return () => { mounted = false }
    }, [])

    // ── Flat Indexes & Harvested Facets via DFS ────────────────
    const { nodeMap, parentMap, allDesignations } = useMemo(() => {
        const nodeMap = new Map()
        const parentMap = new Map()
        const designationSet = new Set()

        function dfs(node, parentId = null) {
            if (!node || node.id == null) return
            nodeMap.set(node.id, node)
            parentMap.set(node.id, parentId)
            if (node.designation && typeof node.designation === 'string' && node.designation.trim()) {
                designationSet.add(node.designation.trim())
            }

            if (Array.isArray(node.directReports)) {
                for (const child of node.directReports) {
                    dfs(child, node.id)
                }
            }
        }

        if (Array.isArray(treeData)) {
            for (const root of treeData) {
                dfs(root, null)
            }
        }

        return {
            nodeMap,
            parentMap,
            allDesignations: Array.from(designationSet).sort(),
        }
    }, [treeData])

    // ── Multi-Filter Predicate & Ancestor Traversal ────────────
    const { matchedNodeIds, ancestorNodeIds, isFilteringActive } = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const hasSearch = query.length > 0
        const hasDesignation = selectedDesignation && selectedDesignation !== 'ALL'
        const hasRole = selectedRole && selectedRole !== 'ALL'
        const isFilteringActive = hasSearch || hasDesignation || hasRole

        if (!isFilteringActive) {
            return {
                matchedNodeIds: new Set(),
                ancestorNodeIds: new Set(),
                isFilteringActive: false,
            }
        }

        const matched = new Set()
        for (const [id, node] of nodeMap.entries()) {
            const matchesQuery = !hasSearch || (
                (node.name && node.name.toLowerCase().includes(query)) ||
                (node.email && node.email.toLowerCase().includes(query))
            )
            const matchesDesig = !hasDesignation || node.designation === selectedDesignation
            const matchesRole = !hasRole || node.role === selectedRole

            if (matchesQuery && matchesDesig && matchesRole) {
                matched.add(id)
            }
        }

        // Traverse upwards to collect all ancestors of matched nodes (with defensive cycle guard)
        const ancestors = new Set()
        for (const matchedId of matched) {
            let parentId = parentMap.get(matchedId)
            while (parentId != null && !ancestors.has(parentId)) {
                ancestors.add(parentId)
                parentId = parentMap.get(parentId)
            }
        }

        return {
            matchedNodeIds: matched,
            ancestorNodeIds: ancestors,
            isFilteringActive: true,
        }
    }, [searchQuery, selectedDesignation, selectedRole, nodeMap, parentMap])

    // ── Auto-uncollapse Ancestor Branches for Matches ──────────
    useEffect(() => {
        if (isFilteringActive && ancestorNodeIds.size > 0) {
            setCollapsedNodeIds(prev => {
                let changed = false
                const next = new Set(prev)
                for (const ancestorId of ancestorNodeIds) {
                    if (next.has(ancestorId)) {
                        next.delete(ancestorId)
                        changed = true
                    }
                }
                return changed ? next : prev
            })
        }
    }, [isFilteringActive, ancestorNodeIds, setCollapsedNodeIds])

    // Handle agent card click in chart mode (opens in-chart slide-over drawer)
    const handleAgentSelect = (agentId) => {
        selectAgent(agentId)
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedDesignation('ALL')
        setSelectedRole('ALL')
    }

    // Resolve currently selected agent node from flat DFS index
    const selectedAgent = selectedAgentId != null ? nodeMap.get(selectedAgentId) : null

    if (loading) {
        return <TabSkeleton />
    }

    if (error) {
        return (
            <div
                className="p-8 rounded-3xl flex flex-col items-center justify-center gap-4 text-center my-6"
                style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                }}
            >
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-500"
                    style={{ background: 'rgba(239, 68, 68, 0.12)' }}
                >
                    <span className="material-symbols-outlined text-2xl">error</span>
                </div>
                <div>
                    <h3 className="font-extrabold text-base mb-1" style={{ color: T.textPrimary }}>
                        Failed to Load Org Chart
                    </h3>
                    <p className="text-xs max-w-md" style={{ color: T.textMuted }}>
                        {error}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchOrgChart()}
                    className="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer hover:opacity-90 active:scale-95 shadow-sm"
                    style={{ background: T.primary, color: '#FFFFFF' }}
                >
                    Retry Loading
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header Toolbar */}
            <div
                className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-4 rounded-3xl"
                style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
            >
                {/* Left: Search & Filters */}
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                    {/* Search Input */}
                    <div className="w-full sm:w-64 md:w-72">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by name or email..."
                            minWidth={240}
                        />
                    </div>

                    {/* Designation Dropdown Filter */}
                    <div className="w-full sm:w-48">
                        <CustomSelect
                            value={selectedDesignation}
                            onChange={e => setSelectedDesignation(e.target.value)}
                            placeholder="All Designations"
                        >
                            <option value="ALL">All Designations</option>
                            {allDesignations.map(d => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </CustomSelect>
                    </div>

                    {/* Role Dropdown Filter */}
                    <div className="w-full sm:w-36">
                        <CustomSelect
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            placeholder="All Roles"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="AGENT">Agent</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </CustomSelect>
                    </div>

                    {/* Filter Status Badge & Clear Action */}
                    {isFilteringActive && (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                                style={{
                                    background: matchedNodeIds.size > 0 ? T.primaryFaint : 'rgba(239, 68, 68, 0.12)',
                                    color: matchedNodeIds.size > 0 ? T.primaryText : '#EF4444',
                                    border: `1px solid ${matchedNodeIds.size > 0 ? `${T.primary}30` : 'rgba(239, 68, 68, 0.25)'}`,
                                }}
                            >
                                <span>{matchedNodeIds.size > 0 ? '🎯' : '⚠️'}</span>
                                <span>{matchedNodeIds.size} {matchedNodeIds.size === 1 ? 'match' : 'matches'}</span>
                            </span>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="text-xs font-black px-2.5 py-1.5 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
                                style={{
                                    background: T.surfaceRaised,
                                    color: T.textMuted,
                                    border: `1px solid ${T.borderSubtle}`,
                                }}
                                title="Reset all search and filter conditions"
                            >
                                ✕ Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Quick Tree Toggles & Canvas Controls */}
                <div className="flex items-center gap-2 self-end xl:self-center shrink-0">
                    {/* Quick Expand / Collapse Subtrees */}
                    <div
                        className="inline-flex items-center p-1 rounded-2xl shrink-0"
                        style={{
                            background: T.surfaceRaised,
                            border: `1px solid ${T.borderSubtle}`,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => expandAll()}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
                            style={{ color: T.textSecondary }}
                            title="Expand all manager branches"
                        >
                            <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                            <span className="hidden sm:inline">Expand All</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => collapseAll(treeData)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
                            style={{ color: T.textSecondary }}
                            title="Collapse all manager branches"
                        >
                            <span className="material-symbols-outlined text-[15px]">unfold_less</span>
                            <span className="hidden sm:inline">Collapse All</span>
                        </button>
                    </div>

                    {/* Canvas Zoom Controls in Toolbar */}
                    <div
                        className="inline-flex items-center p-1 rounded-2xl shrink-0"
                        style={{
                            background: T.surfaceRaised,
                            border: `1px solid ${T.borderSubtle}`,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => canvasRef.current?.zoomOut()}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-75 transition-opacity cursor-pointer"
                            style={{ color: T.textPrimary }}
                            title="Zoom Out"
                        >
                            <span className="material-symbols-outlined text-[17px]">remove</span>
                        </button>

                        <span
                            className="px-2 text-xs font-black min-w-[44px] text-center"
                            style={{ color: T.textPrimary }}
                        >
                            {Math.round(zoomScale * 100)}%
                        </span>

                        <button
                            type="button"
                            onClick={() => canvasRef.current?.zoomIn()}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-75 transition-opacity cursor-pointer"
                            style={{ color: T.textPrimary }}
                            title="Zoom In"
                        >
                            <span className="material-symbols-outlined text-[17px]">add</span>
                        </button>

                        <div className="w-px h-4 mx-1" style={{ background: T.border }} />

                        <button
                            type="button"
                            onClick={() => canvasRef.current?.reset()}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-75 transition-opacity cursor-pointer"
                            style={{ color: T.primary }}
                            title="Center and fit tree"
                        >
                            <span className="material-symbols-outlined text-[17px]">center_focus_strong</span>
                        </button>
                    </div>

                    {/* Refresh Data Button */}
                    <button
                        type="button"
                        onClick={() => fetchOrgChart(true)}
                        disabled={refreshing}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:opacity-80 cursor-pointer"
                        style={{
                            background: T.surfaceRaised,
                            border: `1px solid ${T.borderSubtle}`,
                            color: T.textPrimary,
                        }}
                        title="Refresh hierarchy data from server"
                    >
                        <span className={`material-symbols-outlined text-[19px] ${refreshing ? 'animate-spin' : ''}`}>
                            refresh
                        </span>
                    </button>
                </div>
            </div>

            {/* Interactive Canvas */}
            <OrgChartCanvas
                ref={canvasRef}
                treeData={treeData}
                collapsedNodeIds={collapsedNodeIds}
                onToggleCollapse={toggleCollapse}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleAgentSelect}
                matchedNodeIds={matchedNodeIds}
                ancestorNodeIds={ancestorNodeIds}
                isFilteringActive={isFilteringActive}
                onScaleChange={setZoomScale}
            />

            {/* Agent Details Slide-Over Drawer */}
            <AgentDetailsDrawer
                agent={selectedAgent}
                isOpen={Boolean(selectedAgent)}
                onClose={() => selectAgent(null)}
                onRefreshChart={() => fetchOrgChart(true)}
                onSelectAgent={(id) => selectAgent(id)}
                onNavigateProfile={onAgentClick}
            />
        </div>
    )
}
