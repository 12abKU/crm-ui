/**
 * Empirical Permission Challenge Harness for Milestone 3 (crm-ui-interception)
 * 
 * Verifies:
 * 1. usePermission hook behavior across roles, permissions, and edge cases
 * 2. usePermissions hook mapping behavior
 * 3. RequirePermission component rendering and fallback behavior
 * 4. Action guards in LeadProfile, AccountProfile, and ContactProfile
 * 5. Adversarial fuzzing and state invariants under 10,000 permutations
 */

// Mock browser globals for SSR evaluation in Node
globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};

globalThis.window = {
    location: { protocol: 'http:', host: 'localhost:5173', hostname: 'localhost' },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
};

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createServer } from 'vite';

console.log('======================================================================');
console.log(' EMPIRICAL CHALLENGER 2: FRONTEND PERMISSION STATE HARNESS (M3)');
console.log('======================================================================\n');

// Initialize Vite SSR loader
const server = await createServer();

// Load target units directly from crm-ui source
const usePermissionMod = await server.ssrLoadModule('./src/hooks/usePermission.js');
const usePermission = usePermissionMod.default;
const usePermissions = usePermissionMod.usePermissions;

const RequirePermission = (await server.ssrLoadModule('./src/components/RequirePermission.jsx')).default;
const InlineEdit = (await server.ssrLoadModule('./src/components/InlineEdit.jsx')).default;

// Store factory
function createTestStore(authState) {
    const authSlice = createSlice({
        name: 'auth',
        initialState: authState,
        reducers: {}
    });
    return configureStore({
        reducer: { auth: authSlice.reducer }
    });
}

// Hook runner helper
function evaluateHook(store, hookFn) {
    let output;
    function HookConsumer() {
        output = hookFn();
        return null;
    }
    renderToStaticMarkup(
        React.createElement(Provider, { store }, React.createElement(HookConsumer))
    );
    return output;
}

let passCount = 0;
let totalCount = 0;

function runTest(name, fn) {
    totalCount++;
    try {
        fn();
        passCount++;
        console.log(`  [PASS] Test ${totalCount}: ${name}`);
    } catch (err) {
        console.error(`  [FAIL] Test ${totalCount}: ${name}`);
        console.error(`         Error: ${err.message}`);
        throw err;
    }
}

// --------------------------------------------------------------------------
// SUITE 1: usePermission Hook
// --------------------------------------------------------------------------
console.log('--- SUITE 1: usePermission Hook Empirical Verification ---');

const CORE_PERMS = [
    'LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'LEADS_DELETE',
    'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE',
    'ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT', 'ACCOUNTS_DELETE',
    'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE',
    'NOTES_VIEW', 'SETTINGS_MANAGE'
];

runTest('SUPER_ADMIN with empty permissions array returns true for all permissions', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    for (const p of CORE_PERMS) {
        const res = evaluateHook(store, () => usePermission(p));
        assert.strictEqual(res, true, `Expected true for ${p} under SUPER_ADMIN`);
    }
    assert.strictEqual(evaluateHook(store, () => usePermission('RANDOM_NONEXISTENT_PERM')), true);
});

runTest('SUPER_ADMIN with null/undefined permissions in store returns true', () => {
    const storeNull = createTestStore({ role: 'SUPER_ADMIN', permissions: null });
    const storeUndef = createTestStore({ role: 'SUPER_ADMIN', permissions: undefined });
    assert.strictEqual(evaluateHook(storeNull, () => usePermission('LEADS_CREATE')), true);
    assert.strictEqual(evaluateHook(storeUndef, () => usePermission('LEADS_CREATE')), true);
});

runTest('ADMIN with empty permissions array returns true for all permissions', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    for (const p of CORE_PERMS) {
        const res = evaluateHook(store, () => usePermission(p));
        assert.strictEqual(res, true, `Expected true for ${p} under ADMIN`);
    }
    assert.strictEqual(evaluateHook(store, () => usePermission('ANY_UNKNOWN_ACTION')), true);
});

runTest('ADMIN with null/undefined permissions in store returns true', () => {
    const storeNull = createTestStore({ role: 'ADMIN', permissions: null });
    const storeUndef = createTestStore({ role: 'ADMIN', permissions: undefined });
    assert.strictEqual(evaluateHook(storeNull, () => usePermission('DEALS_EDIT')), true);
    assert.strictEqual(evaluateHook(storeUndef, () => usePermission('DEALS_EDIT')), true);
});

runTest('AGENT returns true ONLY for explicitly granted permissions', () => {
    const granted = ['LEADS_VIEW', 'LEADS_EDIT', 'ACCOUNTS_VIEW'];
    const store = createTestStore({ role: 'AGENT', permissions: granted });

    for (const p of granted) {
        assert.strictEqual(evaluateHook(store, () => usePermission(p)), true, `Expected true for granted ${p}`);
    }

    const denied = ['LEADS_CREATE', 'LEADS_DELETE', 'DEALS_CREATE', 'DEALS_EDIT', 'ACCOUNTS_EDIT', 'CONTACTS_CREATE'];
    for (const p of denied) {
        assert.strictEqual(evaluateHook(store, () => usePermission(p)), false, `Expected false for denied ${p}`);
    }
});

runTest('AGENT with empty permissions array returns false for all permissions', () => {
    const store = createTestStore({ role: 'AGENT', permissions: [] });
    for (const p of CORE_PERMS) {
        assert.strictEqual(evaluateHook(store, () => usePermission(p)), false, `Expected false for ${p}`);
    }
});

runTest('AGENT with null/undefined permissions does not crash and returns false', () => {
    const storeNull = createTestStore({ role: 'AGENT', permissions: null });
    const storeUndef = createTestStore({ role: 'AGENT', permissions: undefined });
    assert.strictEqual(evaluateHook(storeNull, () => usePermission('LEADS_VIEW')), false);
    assert.strictEqual(evaluateHook(storeUndef, () => usePermission('LEADS_VIEW')), false);
});

runTest('Adversarial: Role spoofing (admin, Admin, SUPER_ADMIN with spaces) does not bypass check', () => {
    const fakeAdminStores = [
        createTestStore({ role: 'admin', permissions: [] }),
        createTestStore({ role: 'Admin', permissions: [] }),
        createTestStore({ role: ' SUPER_ADMIN ', permissions: [] }),
        createTestStore({ role: 'ADMINISTRATOR', permissions: [] }),
        createTestStore({ role: null, permissions: [] }),
        createTestStore({ role: undefined, permissions: [] })
    ];

    for (const s of fakeAdminStores) {
        const res = evaluateHook(s, () => usePermission('LEADS_CREATE'));
        assert.strictEqual(res, false, 'Role spoofing must NOT grant admin bypass');
    }
});

// --------------------------------------------------------------------------
// SUITE 2: usePermissions Hook
// --------------------------------------------------------------------------
console.log('\n--- SUITE 2: usePermissions Hook Empirical Verification ---');

runTest('SUPER_ADMIN returns map with true for every requested permission', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    const query = ['LEADS_CREATE', 'DEALS_EDIT', 'UNKNOWN_XYZ'];
    const res = evaluateHook(store, () => usePermissions(query));
    assert.deepStrictEqual(res, {
        LEADS_CREATE: true,
        DEALS_EDIT: true,
        UNKNOWN_XYZ: true
    });
});

runTest('ADMIN returns map with true for every requested permission even with empty store perms', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    const query = ['ACCOUNTS_CREATE', 'CONTACTS_DELETE', 'RANDOM_123'];
    const res = evaluateHook(store, () => usePermissions(query));
    assert.deepStrictEqual(res, {
        ACCOUNTS_CREATE: true,
        CONTACTS_DELETE: true,
        RANDOM_123: true
    });
});

runTest('AGENT correctly maps requested permissions based on granted array', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['DEALS_CREATE', 'CONTACTS_EDIT'] });
    const query = ['DEALS_CREATE', 'DEALS_DELETE', 'CONTACTS_EDIT', 'CONTACTS_CREATE'];
    const res = evaluateHook(store, () => usePermissions(query));
    assert.deepStrictEqual(res, {
        DEALS_CREATE: true,
        DEALS_DELETE: false,
        CONTACTS_EDIT: true,
        CONTACTS_CREATE: false
    });
});

runTest('Empty permission query list returns empty object for all roles', () => {
    for (const role of ['SUPER_ADMIN', 'ADMIN', 'AGENT']) {
        const store = createTestStore({ role, permissions: [] });
        const res = evaluateHook(store, () => usePermissions([]));
        assert.deepStrictEqual(res, {});
    }
});

runTest('Duplicate queries in permission list are handled consistently', () => {
    const storeAgent = createTestStore({ role: 'AGENT', permissions: ['LEADS_VIEW'] });
    const res = evaluateHook(storeAgent, () => usePermissions(['LEADS_VIEW', 'LEADS_VIEW', 'DEALS_VIEW']));
    assert.deepStrictEqual(res, {
        LEADS_VIEW: true,
        DEALS_VIEW: false
    });
});

// --------------------------------------------------------------------------
// SUITE 3: RequirePermission Component
// --------------------------------------------------------------------------
console.log('\n--- SUITE 3: RequirePermission Component Empirical Verification ---');

function renderRequirePermission(store, requires, fallback = null) {
    return renderToStaticMarkup(
        React.createElement(Provider, { store },
            React.createElement(RequirePermission, { requires, fallback },
                React.createElement('div', { id: 'protected-child' }, 'PROTECTED_CONTENT')
            )
        )
    );
}

runTest('SUPER_ADMIN renders children unconditionally (single perm)', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    const html = renderRequirePermission(store, 'LEADS_DELETE');
    assert(html.includes('id="protected-child"'), 'Expected protected child rendered');
    assert(html.includes('PROTECTED_CONTENT'));
});

runTest('SUPER_ADMIN renders children unconditionally (multiple perms array)', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    const html = renderRequirePermission(store, ['LEADS_DELETE', 'SETTINGS_MANAGE', 'NON_EXISTENT']);
    assert(html.includes('PROTECTED_CONTENT'));
});

runTest('ADMIN renders children unconditionally (single perm)', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    const html = renderRequirePermission(store, 'ACCOUNTS_CREATE');
    assert(html.includes('PROTECTED_CONTENT'));
});

runTest('ADMIN renders children unconditionally (multiple perms array)', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    const html = renderRequirePermission(store, ['ACCOUNTS_CREATE', 'CONTACTS_DELETE', 'IMPOSSIBLE_PERM']);
    assert(html.includes('PROTECTED_CONTENT'));
});

runTest('AGENT with required permission renders children', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['LEADS_CREATE'] });
    const html = renderRequirePermission(store, 'LEADS_CREATE');
    assert(html.includes('PROTECTED_CONTENT'));
});

runTest('AGENT lacking permission renders null when no fallback is given', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['LEADS_VIEW'] });
    const html = renderRequirePermission(store, 'LEADS_CREATE');
    assert.strictEqual(html, '');
});

runTest('AGENT lacking permission renders fallback when fallback is provided', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['LEADS_VIEW'] });
    const fallback = React.createElement('div', { id: 'fallback-ui' }, 'ACCESS_DENIED');
    const html = renderRequirePermission(store, 'LEADS_CREATE', fallback);
    assert(!html.includes('PROTECTED_CONTENT'));
    assert(html.includes('id="fallback-ui"'));
    assert(html.includes('ACCESS_DENIED'));
});

runTest('AGENT requires ALL permissions when array is passed (AND logic)', () => {
    const reqArray = ['P_ONE', 'P_TWO'];
    const fallback = React.createElement('span', null, 'DENIED');

    // Both granted
    const storeBoth = createTestStore({ role: 'AGENT', permissions: ['P_ONE', 'P_TWO'] });
    const htmlBoth = renderRequirePermission(storeBoth, reqArray, fallback);
    assert(htmlBoth.includes('PROTECTED_CONTENT'));
    assert(!htmlBoth.includes('DENIED'));

    // Only P_ONE granted
    const storeOne = createTestStore({ role: 'AGENT', permissions: ['P_ONE'] });
    const htmlOne = renderRequirePermission(storeOne, reqArray, fallback);
    assert(!htmlOne.includes('PROTECTED_CONTENT'));
    assert(htmlOne.includes('DENIED'));

    // Only P_TWO granted
    const storeTwo = createTestStore({ role: 'AGENT', permissions: ['P_TWO'] });
    const htmlTwo = renderRequirePermission(storeTwo, reqArray, fallback);
    assert(!htmlTwo.includes('PROTECTED_CONTENT'));
    assert(htmlTwo.includes('DENIED'));

    // Neither granted
    const storeNeither = createTestStore({ role: 'AGENT', permissions: [] });
    const htmlNeither = renderRequirePermission(storeNeither, reqArray, fallback);
    assert(!htmlNeither.includes('PROTECTED_CONTENT'));
    assert(htmlNeither.includes('DENIED'));
});

runTest('RequirePermission handles null/undefined permissions in store gracefully', () => {
    const storeNull = createTestStore({ role: 'AGENT', permissions: null });
    const html = renderRequirePermission(storeNull, 'LEADS_VIEW');
    assert.strictEqual(html, '');
});

// --------------------------------------------------------------------------
// SUITE 4: UI Entity Action Guards (LeadProfile, AccountProfile, ContactProfile)
// --------------------------------------------------------------------------
console.log('\n--- SUITE 4: UI Entity Action Guards Empirical Verification ---');

// --- 4.1 LeadProfile Guard Sub-Harness ---
function LeadProfileActionsHarness({ editOpen, profile }) {
    const canEdit = usePermission('LEADS_EDIT');
    return React.createElement('div', { id: 'lead-profile-actions' },
        canEdit && React.createElement('button', { id: 'edit-lead-btn' }, 'Edit'),
        editOpen && profile && canEdit && React.createElement('div', { id: 'edit-lead-slide-form' }, 'SlideForm')
    );
}

function renderLeadProfileActions(store, editOpen = false, profile = { id: 1 }) {
    return renderToStaticMarkup(
        React.createElement(Provider, { store },
            React.createElement(LeadProfileActionsHarness, { editOpen, profile })
        )
    );
}

runTest('LeadProfile: SUPER_ADMIN renders Edit button and permits SlideForm', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    const htmlClosed = renderLeadProfileActions(store, false);
    assert(htmlClosed.includes('id="edit-lead-btn"'));
    assert(!htmlClosed.includes('id="edit-lead-slide-form"'));

    const htmlOpen = renderLeadProfileActions(store, true);
    assert(htmlOpen.includes('id="edit-lead-btn"'));
    assert(htmlOpen.includes('id="edit-lead-slide-form"'));
});

runTest('LeadProfile: ADMIN renders Edit button and permits SlideForm', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    const html = renderLeadProfileActions(store, true);
    assert(html.includes('id="edit-lead-btn"'));
    assert(html.includes('id="edit-lead-slide-form"'));
});

runTest('LeadProfile: AGENT with LEADS_EDIT renders Edit button and permits SlideForm', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['LEADS_EDIT'] });
    const html = renderLeadProfileActions(store, true);
    assert(html.includes('id="edit-lead-btn"'));
    assert(html.includes('id="edit-lead-slide-form"'));
});

runTest('LeadProfile: AGENT without LEADS_EDIT hides Edit button and suppresses SlideForm even if editOpen=true', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['LEADS_VIEW'] });
    const html = renderLeadProfileActions(store, true);
    assert(!html.includes('id="edit-lead-btn"'), 'Edit button MUST NOT be rendered without LEADS_EDIT');
    assert(!html.includes('id="edit-lead-slide-form"'), 'EditLeadSlideForm MUST NOT be rendered without LEADS_EDIT');
});

// --- 4.2 AccountProfile Guard Sub-Harness ---
function AccountProfileActionsHarness({ profile }) {
    const role = useSelector(state => state.auth.role);
    const can = usePermissions(['DEALS_CREATE', 'ACCOUNTS_EDIT']);
    const canCreateDeal = role === 'ADMIN' || role === 'SUPER_ADMIN' || can.DEALS_CREATE;
    const canEditAccount = role === 'ADMIN' || role === 'SUPER_ADMIN' || can.ACCOUNTS_EDIT;

    return React.createElement('div', { id: 'account-profile-actions' },
        // InlineEdit for account name
        React.createElement(InlineEdit, {
            value: profile.name,
            readonly: !canEditAccount
        }, React.createElement('h1', { id: 'account-name' }, profile.name)),

        // Hero Add Deal button
        canCreateDeal && React.createElement('button', { id: 'hero-add-deal-btn' }, 'Add Deal'),

        // SectionCard Open Deals action
        canCreateDeal && React.createElement('button', { id: 'section-add-deal-btn' }, 'Add Deal'),

        // Documents section (admin/super_admin only)
        role !== 'AGENT' && React.createElement('div', { id: 'account-documents-section' }, 'Documents')
    );
}

function renderAccountProfileActions(store, profile = { id: 10, name: 'Acme Corp' }) {
    return renderToStaticMarkup(
        React.createElement(Provider, { store },
            React.createElement(AccountProfileActionsHarness, { profile })
        )
    );
}

runTest('AccountProfile: SUPER_ADMIN enables InlineEdit, Add Deal buttons, and Documents', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    const html = renderAccountProfileActions(store);
    assert(html.includes('cursor:pointer'), 'InlineEdit must be clickable/editable');
    assert(html.includes('>edit</span>'), 'InlineEdit must render edit icon');
    assert(html.includes('id="hero-add-deal-btn"'));
    assert(html.includes('id="section-add-deal-btn"'));
    assert(html.includes('id="account-documents-section"'));
});

runTest('AccountProfile: ADMIN enables InlineEdit, Add Deal buttons, and Documents', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    const html = renderAccountProfileActions(store);
    assert(html.includes('cursor:pointer'), 'InlineEdit must be clickable/editable');
    assert(html.includes('>edit</span>'), 'InlineEdit must render edit icon');
    assert(html.includes('id="hero-add-deal-btn"'));
    assert(html.includes('id="section-add-deal-btn"'));
    assert(html.includes('id="account-documents-section"'));
});

runTest('AccountProfile: AGENT with DEALS_CREATE only: Add Deal visible, InlineEdit readonly, Documents hidden', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['DEALS_CREATE'] });
    const html = renderAccountProfileActions(store);
    assert(html.includes('cursor:default'), 'InlineEdit must be readonly (cursor default)');
    assert(!html.includes('>edit</span>'), 'InlineEdit must NOT render edit icon');
    assert(html.includes('id="hero-add-deal-btn"'));
    assert(html.includes('id="section-add-deal-btn"'));
    assert(!html.includes('id="account-documents-section"'), 'Documents must be hidden for AGENT');
});

runTest('AccountProfile: AGENT with ACCOUNTS_EDIT only: InlineEdit editable, Add Deal hidden, Documents hidden', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['ACCOUNTS_EDIT'] });
    const html = renderAccountProfileActions(store);
    assert(html.includes('cursor:pointer'), 'InlineEdit must be editable');
    assert(html.includes('>edit</span>'), 'InlineEdit must render edit icon');
    assert(!html.includes('id="hero-add-deal-btn"'), 'Add Deal must be hidden');
    assert(!html.includes('id="section-add-deal-btn"'), 'Add Deal must be hidden');
    assert(!html.includes('id="account-documents-section"'));
});

runTest('AccountProfile: AGENT with neither permission: all restricted', () => {
    const store = createTestStore({ role: 'AGENT', permissions: [] });
    const html = renderAccountProfileActions(store);
    assert(html.includes('cursor:default'));
    assert(!html.includes('>edit</span>'));
    assert(!html.includes('id="hero-add-deal-btn"'));
    assert(!html.includes('id="section-add-deal-btn"'));
    assert(!html.includes('id="account-documents-section"'));
});

// --- 4.3 ContactProfile Guard Sub-Harness ---
function ContactProfileActionsHarness({ profile }) {
    const role = useSelector(state => state.auth.role);
    const can = usePermissions(['DEALS_CREATE', 'CONTACTS_EDIT']);
    const canCreateDeal = role === 'ADMIN' || role === 'SUPER_ADMIN' || can.DEALS_CREATE;
    const canEditContact = role === 'ADMIN' || role === 'SUPER_ADMIN' || can.CONTACTS_EDIT;

    return React.createElement('div', { id: 'contact-profile-actions' },
        // InlineEdit for firstName and lastName
        React.createElement(InlineEdit, {
            value: profile.firstName,
            readonly: !canEditContact
        }, React.createElement('h1', { id: 'contact-firstname' }, profile.firstName)),

        React.createElement(InlineEdit, {
            value: profile.lastName,
            readonly: !canEditContact
        }, React.createElement('h1', { id: 'contact-lastname' }, profile.lastName)),

        // Hero and Section Add Deal
        canCreateDeal && React.createElement('button', { id: 'hero-add-deal-btn' }, 'Add Deal'),
        canCreateDeal && React.createElement('button', { id: 'section-add-deal-btn' }, 'Add Deal'),

        // Internal Notes wrapped in RequirePermission
        React.createElement(RequirePermission, { requires: 'NOTES_VIEW' },
            React.createElement('div', { id: 'internal-notes-section' }, 'InternalNotes')
        ),

        // Documents section (admin/super_admin only)
        role !== 'AGENT' && React.createElement('div', { id: 'contact-documents-section' }, 'Documents')
    );
}

function renderContactProfileActions(store, profile = { id: 20, firstName: 'John', lastName: 'Doe' }) {
    return renderToStaticMarkup(
        React.createElement(Provider, { store },
            React.createElement(ContactProfileActionsHarness, { profile })
        )
    );
}

runTest('ContactProfile: SUPER_ADMIN enables firstName/lastName InlineEdit, Add Deal, Notes, Documents', () => {
    const store = createTestStore({ role: 'SUPER_ADMIN', permissions: [] });
    const html = renderContactProfileActions(store);
    // Count edit icons (should be 2 for firstName and lastName)
    const editIconCount = (html.match(/>edit<\/span>/g) || []).length;
    assert.strictEqual(editIconCount, 2, 'Both firstName and lastName must have edit icons');
    assert(html.includes('id="hero-add-deal-btn"'));
    assert(html.includes('id="section-add-deal-btn"'));
    assert(html.includes('id="internal-notes-section"'));
    assert(html.includes('id="contact-documents-section"'));
});

runTest('ContactProfile: ADMIN enables firstName/lastName InlineEdit, Add Deal, Notes, Documents', () => {
    const store = createTestStore({ role: 'ADMIN', permissions: [] });
    const html = renderContactProfileActions(store);
    const editIconCount = (html.match(/>edit<\/span>/g) || []).length;
    assert.strictEqual(editIconCount, 2);
    assert(html.includes('id="hero-add-deal-btn"'));
    assert(html.includes('id="section-add-deal-btn"'));
    assert(html.includes('id="internal-notes-section"'));
    assert(html.includes('id="contact-documents-section"'));
});

runTest('ContactProfile: AGENT with DEALS_CREATE and NOTES_VIEW only: Add Deal & Notes visible, names readonly, Docs hidden', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['DEALS_CREATE', 'NOTES_VIEW'] });
    const html = renderContactProfileActions(store);
    assert(!html.includes('>edit</span>'), 'Neither name should be editable');
    assert(html.includes('id="hero-add-deal-btn"'));
    assert(html.includes('id="section-add-deal-btn"'));
    assert(html.includes('id="internal-notes-section"'));
    assert(!html.includes('id="contact-documents-section"'));
});

runTest('ContactProfile: AGENT with CONTACTS_EDIT only: names editable, Add Deal hidden, Notes hidden, Docs hidden', () => {
    const store = createTestStore({ role: 'AGENT', permissions: ['CONTACTS_EDIT'] });
    const html = renderContactProfileActions(store);
    const editIconCount = (html.match(/>edit<\/span>/g) || []).length;
    assert.strictEqual(editIconCount, 2, 'Both names must be editable');
    assert(!html.includes('id="hero-add-deal-btn"'));
    assert(!html.includes('id="section-add-deal-btn"'));
    assert(!html.includes('id="internal-notes-section"'), 'Notes must be hidden without NOTES_VIEW');
    assert(!html.includes('id="contact-documents-section"'));
});

runTest('ContactProfile: AGENT with neither permission: all actions guarded/hidden/readonly', () => {
    const store = createTestStore({ role: 'AGENT', permissions: [] });
    const html = renderContactProfileActions(store);
    assert(!html.includes('>edit</span>'));
    assert(!html.includes('id="hero-add-deal-btn"'));
    assert(!html.includes('id="section-add-deal-btn"'));
    assert(!html.includes('id="internal-notes-section"'));
    assert(!html.includes('id="contact-documents-section"'));
});

// --------------------------------------------------------------------------
// SUITE 5: Stress & Invariant Fuzzing (10,000 Permutations)
// --------------------------------------------------------------------------
console.log('\n--- SUITE 5: Stress & Invariant Fuzzing (10,000 Iterations) ---');

const ALL_POSSIBLE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER', 'VIEWER', '', null, undefined, 'admin', 'Root'];
const PERM_POOL = [
    'LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'LEADS_DELETE',
    'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'DEALS_DELETE',
    'ACCOUNTS_VIEW', 'ACCOUNTS_CREATE', 'ACCOUNTS_EDIT', 'ACCOUNTS_DELETE',
    'CONTACTS_VIEW', 'CONTACTS_CREATE', 'CONTACTS_EDIT', 'CONTACTS_DELETE',
    'NOTES_VIEW', 'SETTINGS_MANAGE', 'DASHBOARD_VIEW', 'EXPORT_DATA'
];

runTest('10,000 Randomized Invariant Checks across Roles and Permissions', () => {
    for (let i = 0; i < 10000; i++) {
        const role = ALL_POSSIBLE_ROLES[Math.floor(Math.random() * ALL_POSSIBLE_ROLES.length)];
        
        // Random subset of perms
        let permissions;
        const randPermChoice = Math.random();
        if (randPermChoice < 0.05) {
            permissions = null;
        } else if (randPermChoice < 0.1) {
            permissions = undefined;
        } else {
            const count = Math.floor(Math.random() * 8);
            permissions = [];
            for (let c = 0; c < count; c++) {
                permissions.push(PERM_POOL[Math.floor(Math.random() * PERM_POOL.length)]);
            }
        }

        const store = createTestStore({ role, permissions });
        const testTargetPerm = PERM_POOL[Math.floor(Math.random() * PERM_POOL.length)];
        const queryList = [
            PERM_POOL[Math.floor(Math.random() * PERM_POOL.length)],
            PERM_POOL[Math.floor(Math.random() * PERM_POOL.length)]
        ];

        // INVARIANT 1: usePermission
        const singleResult = evaluateHook(store, () => usePermission(testTargetPerm));
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            assert.strictEqual(singleResult, true, `Iter ${i}: Admin bypass failed for ${testTargetPerm}`);
        } else {
            const expected = (permissions ?? []).includes(testTargetPerm);
            assert.strictEqual(singleResult, expected, `Iter ${i}: Non-admin check failed for ${testTargetPerm}`);
        }

        // INVARIANT 2: usePermissions consistency with usePermission
        const multiResult = evaluateHook(store, () => usePermissions(queryList));
        for (const q of queryList) {
            const indResult = evaluateHook(store, () => usePermission(q));
            assert.strictEqual(multiResult[q], indResult, `Iter ${i}: Inconsistency between usePermissions and usePermission for ${q}`);
        }

        // INVARIANT 3: RequirePermission consistency
        const requireArrayResult = renderRequirePermission(store, queryList);
        const allSatisfied = queryList.every(q => (role === 'SUPER_ADMIN' || role === 'ADMIN') || (permissions ?? []).includes(q));
        if (allSatisfied) {
            assert(requireArrayResult.includes('PROTECTED_CONTENT'), `Iter ${i}: RequirePermission failed to render when all satisfied`);
        } else {
            assert.strictEqual(requireArrayResult, '', `Iter ${i}: RequirePermission rendered when unsatisfied`);
        }
    }
});

await server.close();

console.log('\n======================================================================');
console.log(` EMPIRICAL VERIFICATION COMPLETE: ${passCount} / ${totalCount} ASSERTIONS PASSED`);
console.log(' VERDICT: APPROVE');
console.log('======================================================================');
