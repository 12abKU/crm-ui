import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper functions verbatim from OrgNodeCard.jsx:
export function fmtPipeline(value) {
    const n = Number(value || 0)
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${n.toLocaleString('en-IN')}`
}

export function getInitials(name) {
    if (!name || typeof name !== 'string') return '?'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Empirical Challenge Suite for Org Chart Milestone M3:
 * 1. Multi-level hierarchy auto-expansion & ancestor uncollapsing
 * 2. Search query matching, highlighting, edge cases & empty states
 * 3. Dynamic designation and role filtering, intersection & reset
 * 4. Tree state manipulation (collapseAll, expandAll, toggleCollapse)
 * 5. Card formatting (fmtPipeline, getInitials)
 */

// Replicate exact logic from OrgChartTab.jsx for DFS flat indexing
function buildTreeIndexes(treeData) {
    const nodeMap = new Map();
    const parentMap = new Map();
    const designationSet = new Set();
    const roleSet = new Set();

    function dfs(node, parentId = null) {
        if (!node || node.id == null) return;
        nodeMap.set(node.id, node);
        parentMap.set(node.id, parentId);
        if (node.designation && typeof node.designation === 'string' && node.designation.trim()) {
            designationSet.add(node.designation.trim());
        }
        if (node.role && typeof node.role === 'string') {
            roleSet.add(node.role);
        }

        if (Array.isArray(node.directReports)) {
            for (const child of node.directReports) {
                dfs(child, node.id);
            }
        }
    }

    if (Array.isArray(treeData)) {
        for (const root of treeData) {
            dfs(root, null);
        }
    }

    return {
        nodeMap,
        parentMap,
        allDesignations: Array.from(designationSet).sort(),
        allRoles: Array.from(roleSet).sort(),
    };
}

// Replicate exact filtering and upward traversal logic from OrgChartTab.jsx
function computeFilterMatches(treeData, searchQuery, selectedDesignation, selectedRole) {
    const { nodeMap, parentMap, allDesignations, allRoles } = buildTreeIndexes(treeData);

    const query = searchQuery.trim().toLowerCase();
    const hasSearch = query.length > 0;
    const hasDesignation = selectedDesignation && selectedDesignation !== 'ALL';
    const hasRole = selectedRole && selectedRole !== 'ALL';
    const isFilteringActive = hasSearch || hasDesignation || hasRole;

    if (!isFilteringActive) {
        return {
            matchedNodeIds: new Set(),
            ancestorNodeIds: new Set(),
            isFilteringActive: false,
            allDesignations,
            allRoles,
        };
    }

    const matched = new Set();
    for (const [id, node] of nodeMap.entries()) {
        const matchesQuery = !hasSearch || (
            (node.name && node.name.toLowerCase().includes(query)) ||
            (node.email && node.email.toLowerCase().includes(query))
        );
        const matchesDesig = !hasDesignation || node.designation === selectedDesignation;
        const matchesRole = !hasRole || node.role === selectedRole;

        if (matchesQuery && matchesDesig && matchesRole) {
            matched.add(id);
        }
    }

    // Traverse upwards to collect all ancestors of matched nodes
    const ancestors = new Set();
    for (const matchedId of matched) {
        let parentId = parentMap.get(matchedId);
        while (parentId != null) {
            ancestors.add(parentId);
            parentId = parentMap.get(parentId);
        }
    }

    return {
        matchedNodeIds: matched,
        ancestorNodeIds: ancestors,
        isFilteringActive: true,
        allDesignations,
        allRoles,
    };
}

// Replicate auto-uncollapse effect logic from OrgChartTab.jsx
function applyAutoUncollapse(collapsedNodeIds, isFilteringActive, ancestorNodeIds) {
    if (isFilteringActive && ancestorNodeIds.size > 0) {
        let changed = false;
        const next = new Set(collapsedNodeIds);
        for (const ancestorId of ancestorNodeIds) {
            if (next.has(ancestorId)) {
                next.delete(ancestorId);
                changed = true;
            }
        }
        return changed ? next : collapsedNodeIds;
    }
    return collapsedNodeIds;
}

// Sample complex hierarchy fixture
const sampleHierarchy = [
    {
        id: 1,
        name: 'CEO Jane Smith',
        email: 'jane@company.com',
        role: 'SUPER_ADMIN',
        designation: 'CEO / Founder',
        directReports: [
            {
                id: 2,
                name: 'VP Sales Robert Vance',
                email: 'robert@company.com',
                role: 'ADMIN',
                designation: 'Sales Director',
                directReports: [
                    {
                        id: 4,
                        name: 'Regional Lead Jim Halpert',
                        email: 'jim@company.com',
                        role: 'AGENT',
                        designation: 'Team Lead',
                        directReports: [
                            {
                                id: 8,
                                name: 'Senior AE Dwight Schrute',
                                email: 'dwight@company.com',
                                role: 'AGENT',
                                designation: 'Senior Account Executive',
                                directReports: [
                                    {
                                        id: 14,
                                        name: 'Junior SDR Ryan Howard',
                                        email: 'ryan@company.com',
                                        role: 'AGENT',
                                        designation: 'SDR/BDR',
                                        directReports: []
                                    }
                                ]
                            },
                            {
                                id: 9,
                                name: 'AE Phyllis Vance',
                                email: 'phyllis@company.com',
                                role: 'AGENT',
                                designation: 'Account Executive',
                                directReports: []
                            }
                        ]
                    },
                    {
                        id: 5,
                        name: 'Regional Lead Michael Scott',
                        email: 'michael@company.com',
                        role: 'ADMIN',
                        designation: 'Team Lead',
                        directReports: [
                            {
                                id: 10,
                                name: 'AE Stanley Hudson',
                                email: 'stanley@company.com',
                                role: 'AGENT',
                                designation: 'Account Executive',
                                directReports: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 3,
                name: 'VP Tech Pam Beesly',
                email: 'pam@company.com',
                role: 'ADMIN',
                designation: 'Customer Success',
                directReports: [
                    {
                        id: 6,
                        name: 'Support Lead Oscar Martinez',
                        email: 'oscar@company.com',
                        role: 'AGENT',
                        designation: 'Team Lead',
                        directReports: [
                            {
                                id: 11,
                                name: 'Support Rep Kevin Malone',
                                email: 'kevin@company.com',
                                role: 'AGENT',
                                designation: 'Customer Success',
                                directReports: []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // Multi-root second tree
    {
        id: 100,
        name: 'Advisor David Wallace',
        email: 'david@wallace.com',
        role: 'ADMIN',
        designation: 'CEO / Founder',
        directReports: [
            {
                id: 101,
                name: 'Specialist Andy Bernard',
                email: 'andy@company.com',
                role: 'AGENT',
                designation: 'Senior Account Executive',
                directReports: []
            }
        ]
    }
];

describe('Milestone M3 Challenge Suite: Org Chart Search, Auto-Expansion & Filtering', () => {

    describe('1. Multi-Level Hierarchy Auto-Expansion Challenge', () => {
        it('should auto-expand ALL ancestors (depth 5) when searching for a deeply nested subordinate', () => {
            // Initially, collapse ALL managers in the tree:
            // Node 1 (CEO), Node 2 (VP Sales), Node 4 (Regional Lead), Node 8 (Senior AE)
            const initialCollapsed = new Set([1, 2, 4, 8]);

            // Search for Ryan Howard (ID 14) at depth 5
            const { matchedNodeIds, ancestorNodeIds, isFilteringActive } = computeFilterMatches(
                sampleHierarchy,
                'ryan',
                'ALL',
                'ALL'
            );

            assert.equal(isFilteringActive, true);
            assert.deepEqual(Array.from(matchedNodeIds), [14]);
            // Ancestors of Ryan (14) are Dwight (8), Jim (4), Robert (2), Jane (1)
            assert.deepEqual(Array.from(ancestorNodeIds).sort((a, b) => a - b), [1, 2, 4, 8]);

            // Apply auto-uncollapse
            const updatedCollapsed = applyAutoUncollapse(initialCollapsed, isFilteringActive, ancestorNodeIds);

            // VERIFICATION: ALL 4 ancestor node IDs must be removed from collapsedNodeIds
            assert.equal(updatedCollapsed.has(1), false, 'Ancestor 1 (CEO) must be uncollapsed');
            assert.equal(updatedCollapsed.has(2), false, 'Ancestor 2 (VP Sales) must be uncollapsed');
            assert.equal(updatedCollapsed.has(4), false, 'Ancestor 4 (Regional Lead) must be uncollapsed');
            assert.equal(updatedCollapsed.has(8), false, 'Ancestor 8 (Senior AE) must be uncollapsed');
            assert.equal(updatedCollapsed.size, 0, 'All ancestors must be removed');
        });

        it('should uncollapse ONLY matched branch ancestors, leaving sibling branches collapsed', () => {
            // Collapse Jim (4), Michael (5), Oscar (6), Robert (2), Pam (3), Jane (1)
            const initialCollapsed = new Set([1, 2, 3, 4, 5, 6]);

            // Search for Kevin Malone (ID 11), who is under Oscar (6) -> Pam (3) -> Jane (1)
            const { matchedNodeIds, ancestorNodeIds, isFilteringActive } = computeFilterMatches(
                sampleHierarchy,
                'kevin@company.com',
                'ALL',
                'ALL'
            );

            assert.deepEqual(Array.from(matchedNodeIds), [11]);
            assert.deepEqual(Array.from(ancestorNodeIds).sort((a, b) => a - b), [1, 3, 6]);

            const updatedCollapsed = applyAutoUncollapse(initialCollapsed, isFilteringActive, ancestorNodeIds);

            // Jane (1), Pam (3), Oscar (6) MUST be uncollapsed
            assert.equal(updatedCollapsed.has(1), false);
            assert.equal(updatedCollapsed.has(3), false);
            assert.equal(updatedCollapsed.has(6), false);

            // Sibling branches Robert (2), Jim (4), Michael (5) MUST REMAIN COLLAPSED!
            assert.equal(updatedCollapsed.has(2), true, 'Sibling VP Sales (2) must remain collapsed');
            assert.equal(updatedCollapsed.has(4), true, 'Sibling Lead Jim (4) must remain collapsed');
            assert.equal(updatedCollapsed.has(5), true, 'Sibling Lead Michael (5) must remain collapsed');
            assert.equal(updatedCollapsed.size, 3);
        });

        it('should auto-expand ancestors across multiple disconnected trees in a forest', () => {
            const initialCollapsed = new Set([1, 2, 4, 100]);

            // Search matches Dwight (8, in tree 1) and Andy (101, in tree 2) by designation
            const { matchedNodeIds, ancestorNodeIds, isFilteringActive } = computeFilterMatches(
                sampleHierarchy,
                '',
                'Senior Account Executive',
                'ALL'
            );

            assert.deepEqual(Array.from(matchedNodeIds).sort((a, b) => a - b), [8, 101]);
            // Ancestors of 8: [1, 2, 4]. Ancestors of 101: [100].
            assert.deepEqual(Array.from(ancestorNodeIds).sort((a, b) => a - b), [1, 2, 4, 100]);

            const updatedCollapsed = applyAutoUncollapse(initialCollapsed, isFilteringActive, ancestorNodeIds);
            assert.equal(updatedCollapsed.size, 0, 'All ancestors in both forest trees must be uncollapsed');
        });

        it('should handle root node search with empty ancestor set', () => {
            const initialCollapsed = new Set([1, 2, 3]);

            // Search for CEO Jane Smith (ID 1)
            const { matchedNodeIds, ancestorNodeIds, isFilteringActive } = computeFilterMatches(
                sampleHierarchy,
                'Jane Smith',
                'ALL',
                'ALL'
            );

            assert.deepEqual(Array.from(matchedNodeIds), [1]);
            assert.equal(ancestorNodeIds.size, 0, 'Root node has no ancestors');

            const updatedCollapsed = applyAutoUncollapse(initialCollapsed, isFilteringActive, ancestorNodeIds);
            // collapsedNodeIds remains unchanged
            assert.equal(updatedCollapsed, initialCollapsed);
            assert.equal(updatedCollapsed.size, 3);
        });
    });

    describe('2. Search Highlighting, Case-Insensitivity & Empty States Challenge', () => {
        it('should match case-insensitively across name and email', () => {
            // Upper case name
            const r1 = computeFilterMatches(sampleHierarchy, 'STANLEY', 'ALL', 'ALL');
            assert.deepEqual(Array.from(r1.matchedNodeIds), [10]);

            // Mixed case email
            const r2 = computeFilterMatches(sampleHierarchy, 'dWiGHt@ComPanY.CoM', 'ALL', 'ALL');
            assert.deepEqual(Array.from(r2.matchedNodeIds), [8]);

            // Partial substring
            const r3 = computeFilterMatches(sampleHierarchy, 'halp', 'ALL', 'ALL');
            assert.deepEqual(Array.from(r3.matchedNodeIds), [4]);
        });

        it('should handle leading and trailing whitespace', () => {
            const r = computeFilterMatches(sampleHierarchy, '   Michael   ', 'ALL', 'ALL');
            assert.deepEqual(Array.from(r.matchedNodeIds), [5]);

            // Whitespace-only query should be inactive
            const emptySpace = computeFilterMatches(sampleHierarchy, '     ', 'ALL', 'ALL');
            assert.equal(emptySpace.isFilteringActive, false);
            assert.equal(emptySpace.matchedNodeIds.size, 0);
        });

        it('should safely handle regex special characters without crashing', () => {
            const regexSpecialChars = [
                '.*',
                'name[0]',
                'test(case)',
                '\\d+',
                '^root$',
                'a|b',
                '{2,3}',
                '???',
                '+++',
                '***'
            ];

            for (const charStr of regexSpecialChars) {
                assert.doesNotThrow(() => {
                    const res = computeFilterMatches(sampleHierarchy, charStr, 'ALL', 'ALL');
                    assert.equal(res.isFilteringActive, true);
                    assert.equal(res.matchedNodeIds.size, 0);
                }, `Searching for "${charStr}" should not throw regex syntax error`);
            }
        });

        it('should handle empty search states correctly (zero matches, all dimmed)', () => {
            const r = computeFilterMatches(sampleHierarchy, 'NonExistentPerson12345', 'ALL', 'ALL');

            assert.equal(r.isFilteringActive, true);
            assert.equal(r.matchedNodeIds.size, 0);
            assert.equal(r.ancestorNodeIds.size, 0);

            // Replicate dimming logic from OrgTreeNode.jsx:
            // isDimmed = isFilteringActive && !isMatched && !isAncestorOfMatch
            const { nodeMap } = buildTreeIndexes(sampleHierarchy);
            for (const [id] of nodeMap.entries()) {
                const isMatched = r.matchedNodeIds.has(id);
                const isAncestorOfMatch = r.ancestorNodeIds.has(id);
                const isDimmed = r.isFilteringActive && !isMatched && !isAncestorOfMatch;

                assert.equal(isDimmed, true, `Node ${id} should be dimmed in empty search result`);
            }
        });

        it('should safely handle null, undefined, or missing node fields', () => {
            const corruptedHierarchy = [
                {
                    id: 999,
                    name: null,
                    email: undefined,
                    role: null,
                    designation: null,
                    directReports: null,
                },
                {
                    id: 1000,
                    // missing name, email, etc.
                    directReports: [
                        { id: 1001, name: 'Valid Child', email: 'child@test.com' }
                    ]
                }
            ];

            assert.doesNotThrow(() => {
                const r = computeFilterMatches(corruptedHierarchy, 'valid', 'ALL', 'ALL');
                assert.deepEqual(Array.from(r.matchedNodeIds), [1001]);
                assert.deepEqual(Array.from(r.ancestorNodeIds), [1000]);
            });
        });
    });

    describe('3. Dynamic Designation & Role Filtering Challenge', () => {
        it('should harvest and sort all unique designations and roles across hierarchy', () => {
            const { allDesignations, allRoles } = buildTreeIndexes(sampleHierarchy);

            assert.deepEqual(allDesignations, [
                'Account Executive',
                'CEO / Founder',
                'Customer Success',
                'SDR/BDR',
                'Sales Director',
                'Senior Account Executive',
                'Team Lead'
            ]);

            assert.deepEqual(allRoles, [
                'ADMIN',
                'AGENT',
                'SUPER_ADMIN'
            ]);
        });

        it('should filter by designation alone', () => {
            const r = computeFilterMatches(sampleHierarchy, '', 'Account Executive', 'ALL');
            assert.equal(r.isFilteringActive, true);
            // Phyllis (9) and Stanley (10)
            assert.deepEqual(Array.from(r.matchedNodeIds).sort((a, b) => a - b), [9, 10]);
            // Ancestors: Jim (4), Michael (5), Robert (2), Jane (1)
            assert.deepEqual(Array.from(r.ancestorNodeIds).sort((a, b) => a - b), [1, 2, 4, 5]);
        });

        it('should filter by role alone', () => {
            const r = computeFilterMatches(sampleHierarchy, '', 'ALL', 'SUPER_ADMIN');
            assert.equal(r.isFilteringActive, true);
            // Jane Smith (1)
            assert.deepEqual(Array.from(r.matchedNodeIds), [1]);
            assert.equal(r.ancestorNodeIds.size, 0);
        });

        it('should filter by combined search + designation + role', () => {
            // Search "vance", designation "Sales Director", role "ADMIN"
            const r1 = computeFilterMatches(sampleHierarchy, 'vance', 'Sales Director', 'ADMIN');
            // Matches Robert Vance (2)
            assert.deepEqual(Array.from(r1.matchedNodeIds), [2]);

            // Search "vance", designation "Account Executive", role "AGENT"
            const r2 = computeFilterMatches(sampleHierarchy, 'vance', 'Account Executive', 'AGENT');
            // Matches Phyllis Vance (9)
            assert.deepEqual(Array.from(r2.matchedNodeIds), [9]);

            // Conflict: Search "vance", designation "Sales Director", role "AGENT" (Robert is ADMIN, Phyllis is Account Executive)
            const r3 = computeFilterMatches(sampleHierarchy, 'vance', 'Sales Director', 'AGENT');
            assert.equal(r3.matchedNodeIds.size, 0);
        });

        it('should reset all filters completely back to baseline', () => {
            // Active multi-filter
            let search = 'michael';
            let desig = 'Team Lead';
            let role = 'ADMIN';

            const activeRes = computeFilterMatches(sampleHierarchy, search, desig, role);
            assert.equal(activeRes.isFilteringActive, true);
            assert.equal(activeRes.matchedNodeIds.size, 1);

            // Replicate handleClearFilters
            search = '';
            desig = 'ALL';
            role = 'ALL';

            const resetRes = computeFilterMatches(sampleHierarchy, search, desig, role);
            assert.equal(resetRes.isFilteringActive, false);
            assert.equal(resetRes.matchedNodeIds.size, 0);
            assert.equal(resetRes.ancestorNodeIds.size, 0);
        });
    });

    describe('4. Tree Collapse/Expand State Operations (useOrgTreeState logic)', () => {
        function collapseAll(forest) {
            const allManagerIds = [];
            const traverse = (nodes) => {
                if (!Array.isArray(nodes)) return;
                for (const node of nodes) {
                    if (Array.isArray(node.directReports) && node.directReports.length > 0) {
                        allManagerIds.push(node.id);
                        traverse(node.directReports);
                    }
                }
            };
            traverse(forest);
            return new Set(allManagerIds);
        }

        function expandAll() {
            return new Set();
        }

        it('collapseAll should collect all managers and leave individual contributors unlisted', () => {
            const collapsed = collapseAll(sampleHierarchy);

            // Managers in sampleHierarchy:
            // 1 (CEO), 2 (VP Sales), 4 (Jim), 8 (Dwight), 5 (Michael), 3 (Pam), 6 (Oscar), 100 (David Wallace)
            const expectedManagers = [1, 2, 3, 4, 5, 6, 8, 100];
            assert.deepEqual(Array.from(collapsed).sort((a, b) => a - b), expectedManagers);

            // Leaf nodes must not be in collapsed set: 14 (Ryan), 9 (Phyllis), 10 (Stanley), 11 (Kevin), 101 (Andy)
            for (const leafId of [14, 9, 10, 11, 101]) {
                assert.equal(collapsed.has(leafId), false);
            }
        });

        it('expandAll should return empty set', () => {
            const expanded = expandAll();
            assert.equal(expanded.size, 0);
        });
    });

    describe('5. Formatting & Presentation Helpers', () => {
        it('fmtPipeline should format INR currency cleanly (Cr, L, K)', () => {
            assert.equal(fmtPipeline(15000000), '₹1.5Cr');
            assert.equal(fmtPipeline(20000000), '₹2.0Cr');
            assert.equal(fmtPipeline(450000), '₹4.5L');
            assert.equal(fmtPipeline(100000), '₹1.0L');
            assert.equal(fmtPipeline(25000), '₹25.0K');
            assert.equal(fmtPipeline(1500), '₹1.5K');
            assert.equal(fmtPipeline(500), '₹500');
            assert.equal(fmtPipeline(0), '₹0');
            assert.equal(fmtPipeline(null), '₹0');
            assert.equal(fmtPipeline(undefined), '₹0');
        });

        it('getInitials should extract first and last initials correctly', () => {
            assert.equal(getInitials('Jane Doe'), 'JD');
            assert.equal(getInitials('John Robert Smith'), 'JS');
            assert.equal(getInitials('Madonna'), 'MA');
            assert.equal(getInitials('a b'), 'AB');
            assert.equal(getInitials(''), '?');
            assert.equal(getInitials(null), '?');
            assert.equal(getInitials(undefined), '?');
            assert.equal(getInitials('   '), '?');
        });
    });
});
