/**
 * Centralized Role Archetype and Data Scope Metadata for CRM.
 * Used across Org Chart (M3), Platform Admin Provisioning (M4), and Tenant Settings (M5).
 */

export const DATA_SCOPES = {
    COMPANY: {
        key: 'COMPANY',
        label: 'Company-Wide',
        pillLabel: 'All Data',
        description: 'Full visibility across all tenant company records without reporting line restrictions',
    },
    TEAM_AND_SUBORDINATES: {
        key: 'TEAM_AND_SUBORDINATES',
        label: 'Team & Subordinates',
        pillLabel: 'Subtree',
        description: 'Visibility over owned records and all records owned by direct and indirect reporting subordinates',
    },
    DIRECT_TEAM: {
        key: 'DIRECT_TEAM',
        label: 'Direct Team',
        pillLabel: 'Direct Team',
        description: 'Visibility over owned records and immediate direct reports only',
    },
    OWNED_ONLY: {
        key: 'OWNED_ONLY',
        label: 'Owned Records Only',
        pillLabel: 'Own Only',
        description: 'Strictly restricted to assigned or owned leads, deals, and activities',
    },
}

export const ARCHETYPES = {
    EXECUTIVE: {
        key: 'EXECUTIVE',
        label: 'Executive',
        emoji: '👑',
        scopeLabel: 'All Data',
        scopeKey: 'COMPANY',
        color: '#D97706',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        description: 'Company-wide scope with full administrative & supervisory authority across all teams',
        pillText: '👑 Executive · All Data',
    },
    DEPARTMENT_HEAD: {
        key: 'DEPARTMENT_HEAD',
        label: 'Dept Head',
        emoji: '👔',
        scopeLabel: 'Subtree',
        scopeKey: 'TEAM_AND_SUBORDINATES',
        color: '#2563EB',
        bg: 'rgba(37, 99, 235, 0.12)',
        border: 'rgba(37, 99, 235, 0.35)',
        description: 'Departmental subtree oversight with deal/lead assignment and reporting management',
        pillText: '👔 Dept Head · Subtree',
    },
    TEAM_SUPERVISOR: {
        key: 'TEAM_SUPERVISOR',
        label: 'Supervisor',
        emoji: '👥',
        scopeLabel: 'Subtree',
        scopeKey: 'TEAM_AND_SUBORDINATES',
        color: '#7C3AED',
        bg: 'rgba(124, 58, 237, 0.12)',
        border: 'rgba(124, 58, 237, 0.35)',
        description: 'Team leadership with supervisory visibility over subordinate pipelines and reviews',
        pillText: '👥 Supervisor · Subtree',
    },
    STANDARD_REP: {
        key: 'STANDARD_REP',
        label: 'Rep',
        emoji: '👤',
        scopeLabel: 'Own Only',
        scopeKey: 'OWNED_ONLY',
        color: '#059669',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        description: 'Individual contributor restricted to own assigned deals, leads, and tasks',
        pillText: '👤 Rep · Own Only',
    },
    VIEWER: {
        key: 'VIEWER',
        label: 'Viewer',
        emoji: '👁️',
        scopeLabel: 'Read Only',
        scopeKey: 'OWNED_ONLY',
        color: '#64748B',
        bg: 'rgba(100, 116, 139, 0.12)',
        border: 'rgba(100, 116, 139, 0.35)',
        description: 'Read-only inspection access without mutation or assignment permissions',
        pillText: '👁️ Viewer · Read Only',
    },
}

export const ARCHETYPE_OPTIONS = [
    {
        value: 'EXECUTIVE',
        label: 'Executive',
        emoji: '👑',
        scopeLabel: 'All Data',
        scopeKey: 'COMPANY',
        description: 'Company-wide administrative oversight',
    },
    {
        value: 'DEPARTMENT_HEAD',
        label: 'Department Head',
        emoji: '👔',
        scopeLabel: 'Subtree',
        scopeKey: 'TEAM_AND_SUBORDINATES',
        description: 'Departmental subtree oversight & management',
    },
    {
        value: 'TEAM_SUPERVISOR',
        label: 'Team Supervisor',
        emoji: '👥',
        scopeLabel: 'Subtree',
        scopeKey: 'TEAM_AND_SUBORDINATES',
        description: 'Team leadership & reporting subordinate visibility',
    },
    {
        value: 'STANDARD_REP',
        label: 'Standard Rep',
        emoji: '👤',
        scopeLabel: 'Own Only',
        scopeKey: 'OWNED_ONLY',
        description: 'Quota sales representative, own records only',
    },
    {
        value: 'VIEWER',
        label: 'Viewer',
        emoji: '👁️',
        scopeLabel: 'Read Only',
        scopeKey: 'OWNED_ONLY',
        description: 'Audit & inspection only, read-only permissions',
    },
]

/**
 * Resolves the configuration for an archetype with graceful fallback based on role & reporting lines.
 *
 * @param {string} [archetypeKey] - Explicit archetype key (e.g., 'EXECUTIVE', 'STANDARD_REP')
 * @param {string} [fallbackRole] - User role if archetype is null (e.g., 'COMPANY_SUPER_ADMIN', 'ADMIN', 'AGENT')
 * @param {boolean} [hasReports=false] - Whether the user has direct reports
 * @returns {typeof ARCHETYPES[keyof typeof ARCHETYPES]}
 */
export function getArchetypeConfig(archetypeKey, fallbackRole, hasReports = false) {
    if (archetypeKey && ARCHETYPES[archetypeKey]) {
        return ARCHETYPES[archetypeKey]
    }

    // Role-based fallback matching backend V37 logic
    if (fallbackRole === 'COMPANY_SUPER_ADMIN' || fallbackRole === 'SUPER_ADMIN') {
        return ARCHETYPES.EXECUTIVE
    }
    if (fallbackRole === 'ADMIN') {
        return ARCHETYPES.EXECUTIVE
    }
    if (fallbackRole === 'AGENT') {
        if (hasReports) {
            return ARCHETYPES.TEAM_SUPERVISOR
        }
        return ARCHETYPES.STANDARD_REP
    }

    return ARCHETYPES.STANDARD_REP
}

export const getArchetypeMeta = getArchetypeConfig

/**
 * Returns scope metadata for a given scope key.
 *
 * @param {string} scopeKey - (e.g. 'COMPANY', 'TEAM_AND_SUBORDINATES', 'OWNED_ONLY')
 * @returns {typeof DATA_SCOPES[keyof typeof DATA_SCOPES]}
 */
export function getDataScopeConfig(scopeKey) {
    return DATA_SCOPES[scopeKey] || DATA_SCOPES.OWNED_ONLY
}

/**
 * Canonical auto-assigned permission counts matching backend V37 templates.
 */
export const ARCHETYPE_PERMISSION_COUNTS = {
    EXECUTIVE: 38,
    DEPARTMENT_HEAD: 37,
    TEAM_SUPERVISOR: 31,
    STANDARD_REP: 25,
    VIEWER: 10,
}

export const TOTAL_SYSTEM_PERMISSIONS = 38

/**
 * Returns the count of default auto-assigned permissions for an archetype.
 *
 * @param {string} [archetypeKey]
 * @returns {number}
 */
export function getArchetypePermissionCount(archetypeKey) {
    if (!archetypeKey) return 25
    return ARCHETYPE_PERMISSION_COUNTS[archetypeKey] ?? 25
}

/**
 * Default permission token sets per archetype matching backend PermissionServiceImpl.
 */
export const ARCHETYPE_DEFAULT_PERMISSIONS = {
    EXECUTIVE: [
        'ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT', 'ACCOUNTS_DELETE',
        'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE',
        'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE', 'DEALS_ASSIGN',
        'LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'LEADS_DELETE', 'LEADS_ASSIGN',
        'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE',
        'CALLS_VIEW', 'CALLS_MAKE',
        'CONVERSATIONS_VIEW', 'CONVERSATIONS_SEND',
        'DASHBOARD_VIEW', 'REPORTS_EXPORT',
        'USERS_VIEW', 'USERS_CREATE', 'USERS_DELETE',
        'NOTES_VIEW', 'NOTES_CREATE', 'NOTES_EDIT', 'NOTES_DELETE',
        'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_DELETE',
    ],
    DEPARTMENT_HEAD: [
        'ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT', 'ACCOUNTS_DELETE',
        'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE',
        'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE', 'DEALS_ASSIGN',
        'LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'LEADS_DELETE', 'LEADS_ASSIGN',
        'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE',
        'CALLS_VIEW', 'CALLS_MAKE',
        'CONVERSATIONS_VIEW', 'CONVERSATIONS_SEND',
        'DASHBOARD_VIEW', 'REPORTS_EXPORT',
        'USERS_VIEW', 'USERS_CREATE',
        'NOTES_VIEW', 'NOTES_CREATE', 'NOTES_EDIT', 'NOTES_DELETE',
        'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_DELETE',
    ],
    TEAM_SUPERVISOR: [
        'ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT',
        'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT',
        'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_ASSIGN',
        'LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'LEADS_ASSIGN',
        'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT', 'ACTIVITIES_DELETE',
        'CALLS_VIEW', 'CALLS_MAKE',
        'CONVERSATIONS_VIEW', 'CONVERSATIONS_SEND',
        'DASHBOARD_VIEW', 'REPORTS_EXPORT',
        'USERS_VIEW',
        'NOTES_VIEW', 'NOTES_CREATE', 'NOTES_EDIT', 'NOTES_DELETE',
        'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD',
    ],
    STANDARD_REP: [
        'ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT',
        'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT',
        'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT',
        'LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT',
        'ACTIVITIES_VIEW', 'ACTIVITIES_CREATE', 'ACTIVITIES_EDIT',
        'CALLS_VIEW', 'CALLS_MAKE',
        'CONVERSATIONS_VIEW', 'CONVERSATIONS_SEND',
        'DASHBOARD_VIEW',
        'NOTES_VIEW', 'NOTES_CREATE', 'NOTES_EDIT',
        'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD',
    ],
    VIEWER: [
        'ACCOUNTS_VIEW',
        'CONTACTS_VIEW',
        'DEALS_VIEW',
        'LEADS_VIEW',
        'ACTIVITIES_VIEW',
        'CALLS_VIEW',
        'CONVERSATIONS_VIEW',
        'DASHBOARD_VIEW',
        'NOTES_VIEW',
        'DOCUMENTS_VIEW',
    ],
}

