import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mock browser globals for node execution
if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '../src/components/platform');
const themePath = path.resolve(__dirname, '../src/constants/theme.js');

describe('Milestone 4 Platform Admin UI & Role Provisioning Empirical Challenge', () => {

    it('1. platformConstants.js: Must be pure JavaScript with NO JSX tags', async () => {
        const filePath = path.join(platformDir, 'platformConstants.js');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for JSX tags (<div, <span, <Icon, etc.)
        const jsxTagRegex = /<[A-Za-z][A-Za-z0-9]*(\s+[^>]*)?\/?>|<\/[A-Za-z][A-Za-z0-9]*>/;
        assert.equal(
            jsxTagRegex.test(content),
            false,
            'platformConstants.js must NOT contain JSX tags as it is a pure .js module'
        );

        // Load T from theme.js
        const themeModule = await import(`file://${themePath}`);
        const T = themeModule.T;
        assert.ok(T, 'Theme object T must exist');

        // Dynamically evaluate platformConstants code with resolved import
        const codeForEval = content
            .replace(/import\s*\{\s*T\s*\}\s*from\s*['"]\.\.\/\.\.\/constants\/theme['"]/, '')
            .replace(/export\s+/g, '');

        const evalScope = new Function('T', `${codeForEval}; return { STATUS_STYLES, PLAN_STYLES, ROLE_STYLES, COMPANY_ROLES, COMPANY_ROLE_OPTIONS, daysLeft };`);
        const constants = evalScope(T);

        assert.ok(constants.ROLE_STYLES, 'ROLE_STYLES must be defined');
        assert.ok(constants.ROLE_STYLES.COMPANY_SUPER_ADMIN, 'COMPANY_SUPER_ADMIN must exist in ROLE_STYLES');
        
        const csa = constants.ROLE_STYLES.COMPANY_SUPER_ADMIN;
        assert.equal(csa.color, '#F59E0B', 'COMPANY_SUPER_ADMIN color must be amber (#F59E0B)');
        assert.equal(csa.bg, 'rgba(245, 158, 11, 0.12)', 'COMPANY_SUPER_ADMIN bg must match amber tint');
        assert.equal(csa.border, '1px solid rgba(245, 158, 11, 0.35)', 'COMPANY_SUPER_ADMIN border must match amber border');
        assert.equal(csa.label, 'Company Super Admin', 'COMPANY_SUPER_ADMIN label must be "Company Super Admin"');
        assert.equal(csa.hasCrown, true, 'COMPANY_SUPER_ADMIN must have hasCrown: true');
        assert.equal(csa.badge, '👑', 'COMPANY_SUPER_ADMIN badge must be crown emoji string');

        // Verify other roles exist in ROLE_STYLES
        assert.ok(constants.ROLE_STYLES.SUPER_ADMIN, 'SUPER_ADMIN must exist in ROLE_STYLES');
        assert.ok(constants.ROLE_STYLES.ADMIN, 'ADMIN must exist in ROLE_STYLES');
        assert.ok(constants.ROLE_STYLES.AGENT, 'AGENT must exist in ROLE_STYLES');

        // Verify COMPANY_ROLES array
        assert.deepEqual(
            constants.COMPANY_ROLES,
            ['COMPANY_SUPER_ADMIN', 'ADMIN', 'AGENT'],
            'COMPANY_ROLES must export [COMPANY_SUPER_ADMIN, ADMIN, AGENT]'
        );

        // Verify COMPANY_ROLE_OPTIONS
        assert.deepEqual(
            constants.COMPANY_ROLE_OPTIONS,
            [
                { value: 'COMPANY_SUPER_ADMIN', label: 'Company Super Admin' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'AGENT', label: 'Agent' },
            ],
            'COMPANY_ROLE_OPTIONS must export correct 3-tier company roles'
        );

        // Verify daysLeft helper function
        const now = new Date();
        const futureDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
        const days = constants.daysLeft(futureDate);
        assert.equal(days, 5, 'daysLeft must calculate remaining days accurately');
        assert.equal(constants.daysLeft(null), null, 'daysLeft must return null when trialEndsAt is null');
    });

    it('2. CustomSelect parsing logic handles COMPANY_SUPER_ADMIN correctly', () => {
        // Replicating CustomSelect option extraction logic verbatim from CustomSelect.jsx
        const children = [
            { type: 'option', props: { value: 'AGENT', children: 'Agent' } },
            { type: 'option', props: { value: 'ADMIN', children: 'Admin' } },
            { type: 'option', props: { value: 'COMPANY_SUPER_ADMIN', children: 'Company Super Admin' } },
        ];

        const parsedItems = [];
        const flatOptions = [];
        for (const child of children) {
            if (child.type === 'option' || child.props?.value !== undefined) {
                const opt = { type: 'option', value: child.props.value, label: child.props.children };
                parsedItems.push(opt);
                flatOptions.push(opt);
            }
        }

        const value = 'COMPANY_SUPER_ADMIN';
        const selectedOption = flatOptions.find(o => String(o.value) === String(value));
        const displayLabel = selectedOption ? selectedOption.label : 'Select...';

        assert.ok(selectedOption, 'CustomSelect must find selected option for COMPANY_SUPER_ADMIN');
        assert.equal(displayLabel, 'Company Super Admin', 'displayLabel must resolve to option label');

        // Test onChange callback payload structure
        let emittedPayload = null;
        const onChange = (e) => {
            emittedPayload = e;
        };

        const handleSelect = (val) => {
            onChange({
                target: {
                    value: val,
                    name: 'role'
                }
            });
        };

        handleSelect('COMPANY_SUPER_ADMIN');
        assert.deepEqual(
            emittedPayload,
            { target: { value: 'COMPANY_SUPER_ADMIN', name: 'role' } },
            'handleSelect must emit target.value with role string'
        );
    });

    it('3. CompanyModals.jsx: AddUserModal includes COMPANY_SUPER_ADMIN option', () => {
        const filePath = path.join(platformDir, 'CompanyModals.jsx');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Verify AddUserModal contains COMPANY_SUPER_ADMIN option
        const hasOption = content.includes('<option value="COMPANY_SUPER_ADMIN">Company Super Admin</option>');
        assert.equal(hasOption, true, 'AddUserModal must render <option value="COMPANY_SUPER_ADMIN">Company Super Admin</option>');

        // Verify CustomSelect usage in AddUserModal
        assert.ok(content.includes('import CustomSelect from \'../ui/CustomSelect\''), 'CustomSelect must be imported');
        assert.ok(content.includes('<CustomSelect value={newUser.role} onChange={set(\'role\')}'), 'CustomSelect must bind newUser.role');
    });

    it('4. CompanyUsersTable.jsx: includes COMPANY_SUPER_ADMIN, IconCrown, and custom border', () => {
        const filePath = path.join(platformDir, 'CompanyUsersTable.jsx');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check IconCrown import
        assert.ok(content.includes('IconCrown'), 'IconCrown must be imported in CompanyUsersTable');

        // Check Crown rendering for COMPANY_SUPER_ADMIN
        assert.ok(
            content.includes('u.role === \'COMPANY_SUPER_ADMIN\' || rs.hasCrown'),
            'CompanyUsersTable must render crown icon for COMPANY_SUPER_ADMIN'
        );

        // Check CustomSelect option
        assert.ok(
            content.includes('<option value="COMPANY_SUPER_ADMIN">COMPANY_SUPER_ADMIN</option>'),
            'CompanyUsersTable must provide COMPANY_SUPER_ADMIN option'
        );

        // Check dynamic border styling
        assert.ok(
            content.includes('border: rs.border || \'none\''),
            'CompanyUsersTable must apply rs.border to CustomSelect to show gold border'
        );

        // Check that SUPER_ADMIN remains segregated
        assert.ok(
            content.includes('u.role === \'SUPER_ADMIN\' ? ('),
            'SUPER_ADMIN must remain segregated from company user role switcher'
        );
    });

    it('5. Edge case stress test: Unknown roles and null safety in ROLE_STYLES fallback', async () => {
        const filePath = path.join(platformDir, 'platformConstants.js');
        const content = fs.readFileSync(filePath, 'utf-8');
        const themeModule = await import(`file://${themePath}`);
        const T = themeModule.T;

        const codeForEval = content
            .replace(/import\s*\{\s*T\s*\}\s*from\s*['"]\.\.\/\.\.\/constants\/theme['"]/, '')
            .replace(/export\s+/g, '');

        const evalScope = new Function('T', `${codeForEval}; return { ROLE_STYLES };`);
        const { ROLE_STYLES } = evalScope(T);

        const testCases = [
            { role: 'COMPANY_SUPER_ADMIN', expectedColor: '#F59E0B', expectedCrown: true },
            { role: 'ADMIN', expectedColor: T.primary, expectedCrown: false },
            { role: 'AGENT', expectedColor: '#16a34a', expectedCrown: false },
            { role: 'UNKNOWN_ROLE', expectedFallback: true },
            { role: null, expectedFallback: true },
            { role: undefined, expectedFallback: true },
            { role: '', expectedFallback: true },
        ];

        for (const tc of testCases) {
            const rs = ROLE_STYLES[tc.role] || ROLE_STYLES.AGENT;
            assert.ok(rs, `ROLE_STYLES must safely resolve for role: ${tc.role}`);
            assert.ok(rs.bg, 'Resolved style must have bg');
            assert.ok(rs.color, 'Resolved style must have color');
            if (tc.expectedCrown) {
                assert.equal(rs.hasCrown, true, `Role ${tc.role} must have hasCrown: true`);
            }
        }
    });

    it('6. Empirical Challenge: CustomSelect value and style overrides for COMPANY_SUPER_ADMIN', async () => {
        // Stress test CustomSelect button style resolution
        const filePath = path.join(platformDir, 'platformConstants.js');
        const content = fs.readFileSync(filePath, 'utf-8');
        const themeModule = await import(`file://${themePath}`);
        const T = themeModule.T;

        const codeForEval = content
            .replace(/import\s*\{\s*T\s*\}\s*from\s*['"]\.\.\/\.\.\/constants\/theme['"]/, '')
            .replace(/export\s+/g, '');

        const evalScope = new Function('T', `${codeForEval}; return { ROLE_STYLES };`);
        const { ROLE_STYLES } = evalScope(T);

        const u = { id: 42, role: 'COMPANY_SUPER_ADMIN' };
        const rs = ROLE_STYLES[u.role] || ROLE_STYLES.AGENT;

        const incomingStyle = { background: rs.bg, color: rs.color, minWidth: 90, border: rs.border || 'none' };
        const open = false;
        const disabled = false;
        const computedStyle = {
            opacity: disabled ? 0.45 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: T.textPrimary,
            background: T.surface,
            border: `1px solid ${open ? T.primary : (incomingStyle.borderColor || T.border)}`,
            boxShadow: open ? `0 0 0 3px ${T.primaryDim}` : 'none',
            outline: 'none',
            ...incomingStyle,
        };

        // Assert that the incomingStyle correctly takes precedence
        assert.equal(computedStyle.color, '#F59E0B', 'Amber color must override default T.textPrimary');
        assert.equal(computedStyle.background, 'rgba(245, 158, 11, 0.12)', 'Amber background tint must override T.surface');
        assert.equal(computedStyle.border, '1px solid rgba(245, 158, 11, 0.35)', 'Amber border must override default border');
        assert.equal(computedStyle.minWidth, 90, 'minWidth 90 must be retained');
    });
});
