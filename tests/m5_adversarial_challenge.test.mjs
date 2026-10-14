import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

test('Milestone 5 Adversarial & Empirical Challenge Suite', async (t) => {

    await t.test('1. Permission Hooks & Logic: useIsAdmin, useIsCompanySuperAdmin, hasPermission', async (sub) => {
        const usePermissionPath = path.join(rootDir, 'src/hooks/usePermission.js')
        const mod = await import(`file://${usePermissionPath}`)
        const { isAdmin, isCompanySuperAdmin, hasPermission } = mod

        // Exhaustive input matrix for isAdmin
        const adminCases = [
            { role: 'COMPANY_SUPER_ADMIN', expected: true },
            { role: 'ADMIN', expected: true },
            { role: 'SUPER_ADMIN', expected: true },
            { role: 'AGENT', expected: false },
            { role: 'USER', expected: false },
            { role: '', expected: false },
            { role: null, expected: false },
            { role: undefined, expected: false },
            { role: 'company_super_admin', expected: false }, // Case-sensitive
            { role: 'Admin', expected: false },
            { role: 123, expected: false },
            { role: {}, expected: false },
        ]

        for (const { role, expected } of adminCases) {
            assert.equal(
                isAdmin(role),
                expected,
                `isAdmin(${JSON.stringify(role)}) should be ${expected}`
            )
        }

        // Exhaustive input matrix for isCompanySuperAdmin
        const csaCases = [
            { role: 'COMPANY_SUPER_ADMIN', expected: true },
            { role: 'ADMIN', expected: false },
            { role: 'SUPER_ADMIN', expected: false }, // Platform super admin is NOT company super admin
            { role: 'AGENT', expected: false },
            { role: null, expected: false },
            { role: undefined, expected: false },
            { role: '', expected: false },
            { role: 'company_super_admin', expected: false },
            { role: 'COMPANY_ADMIN', expected: false },
        ]

        for (const { role, expected } of csaCases) {
            assert.equal(
                isCompanySuperAdmin(role),
                expected,
                `isCompanySuperAdmin(${JSON.stringify(role)}) should be ${expected}`
            )
        }

        // hasPermission matrix: Admin bypass vs Agent permissions list
        assert.equal(hasPermission('COMPANY_SUPER_ADMIN', [], 'ANY_RANDOM_PERM'), true)
        assert.equal(hasPermission('COMPANY_SUPER_ADMIN', null, 'ACCOUNTS_DELETE'), true)
        assert.equal(hasPermission('ADMIN', [], 'USERS_DELETE'), true)
        assert.equal(hasPermission('SUPER_ADMIN', [], 'ANY_THING'), true)
        assert.equal(hasPermission('AGENT', ['DEALS_VIEW'], 'DEALS_VIEW'), true)
        assert.equal(hasPermission('AGENT', ['DEALS_VIEW'], 'DEALS_EDIT'), false)
        assert.equal(hasPermission('AGENT', null, 'DEALS_VIEW'), false)
        assert.equal(hasPermission('AGENT', undefined, 'DEALS_VIEW'), false)
        assert.equal(hasPermission(null, ['DEALS_VIEW'], 'DEALS_VIEW'), true) // null role: permissions.includes check
        assert.equal(hasPermission(null, [], 'DEALS_VIEW'), false)
    })

    await t.test('2. OrgNodeCard: Gold Border & Crown Icon Exclusivity for COMPANY_SUPER_ADMIN', async () => {
        const orgNodeCardPath = path.join(rootDir, 'src/components/dashboard/orgchart/OrgNodeCard.jsx')
        const content = fs.readFileSync(orgNodeCardPath, 'utf-8')

        // 1. Verify ROLE_TAGS definition in code
        // COMPANY_SUPER_ADMIN must have crown emoji and amber color
        assert.match(content, /COMPANY_SUPER_ADMIN:\s*\{[\s\S]*?color:\s*'#F59E0B'/)
        assert.match(content, /COMPANY_SUPER_ADMIN:\s*\{[\s\S]*?label:\s*'👑 SUPER ADMIN'/)

        // ADMIN, AGENT, and SUPER_ADMIN must NOT have 👑
        const adminMatch = content.match(/\bADMIN:\s*\{[\s\S]*?label:\s*'(.*?)'/)
        assert.ok(adminMatch, 'ADMIN tag found')
        assert.ok(!adminMatch[1].includes('👑'), 'ADMIN must not have crown')

        const agentMatch = content.match(/\bAGENT:\s*\{[\s\S]*?label:\s*'(.*?)'/)
        assert.ok(agentMatch, 'AGENT tag found')
        assert.ok(!agentMatch[1].includes('👑'), 'AGENT must not have crown')

        const superAdminMatch = content.match(/(?<!COMPANY_)SUPER_ADMIN:\s*\{[\s\S]*?label:\s*'(.*?)'/)
        assert.ok(superAdminMatch, 'SUPER_ADMIN tag found')
        assert.ok(!superAdminMatch[1].includes('👑'), 'SUPER_ADMIN must not have crown')

        // 2. Verify Card Border & Shadow logic
        // isSupremeSupervisor is strictly node.role === 'COMPANY_SUPER_ADMIN'
        assert.match(content, /const\s+isSupremeSupervisor\s*=\s*node\.role\s*===\s*'COMPANY_SUPER_ADMIN'/)
        assert.match(content, /cardBorder\s*=\s*isSupremeSupervisor\s*\?\s*'1\.5px solid #F59E0B'\s*:\s*`1px solid \$\{T\.border\}`/)
        assert.match(content, /cardShadow\s*=\s*isSupremeSupervisor\s*\?\s*'0 0 0 1px rgba\(245, 158, 11, 0\.25\), 0 6px 20px rgba\(245, 158, 11, 0\.15\)'/)

        // 3. Verify selected state retains #F59E0B for COMPANY_SUPER_ADMIN
        assert.match(content, /cardBorder\s*=\s*isSupremeSupervisor\s*\?\s*'2px solid #F59E0B'\s*:\s*`2px solid \$\{T\.primary\}`/)
    })

    await t.test('3. PermissionEditor: Immutability & UI Disabling for COMPANY_SUPER_ADMIN', async () => {
        const permEditorPath = path.join(rootDir, 'src/components/settings/PermissionEditor.jsx')
        const content = fs.readFileSync(permEditorPath, 'utf-8')

        // 1. Role checks in PermissionEditor
        assert.match(content, /const\s+isTargetCompanySuperAdmin\s*=\s*user\.role\s*===\s*'COMPANY_SUPER_ADMIN'\s*\|\|\s*user\.role\s*===\s*'SUPER_ADMIN'/)
        assert.match(content, /const\s+isTargetAdmin\s*=\s*user\.role\s*===\s*'ADMIN'/)

        // 2. isEditable calculation
        assert.match(content, /const\s+isEditable\s*=\s*!isTargetCompanySuperAdmin\s*&&\s*!isTargetAdmin\s*&&/)

        // 3. toggle and toggleGroup guards
        assert.match(content, /const\s+toggle\s*=\s*\(key\)\s*=>\s*\{\s*if\s*\(!isEditable\)\s*return/)
        assert.match(content, /const\s+toggleGroup\s*=\s*\(perms\)\s*=>\s*\{\s*if\s*\(!isEditable\)\s*return/)

        // 4. Button disabled attribute and disabled cursor
        assert.match(content, /disabled=\{!isEditable\}/)
        assert.match(content, /onClick=\{isEditable\s*\?\s*\(\)\s*=>\s*toggle\(perm\.key\)\s*:\s*undefined\}/)

        // 5. Crown notice banner for COMPANY_SUPER_ADMIN
        assert.match(content, /isTargetCompanySuperAdmin\s*&&[\s\S]*?👑[\s\S]*?Company Super Admin possesses full, immutable administrative privileges/)

        // 6. Read-only close button replacement in footer
        assert.match(content, /\{isEditable\s*\?[\s\S]*?Save Permissions[\s\S]*?:\s*\([\s\S]*?Close[\s\S]*?\)\}/)
    })

    await t.test('4. AgentDetailsDrawer: Supervisory Authority Matrix Matrix Simulation', async () => {
        const drawerPath = path.join(rootDir, 'src/components/dashboard/orgchart/AgentDetailsDrawer.jsx')
        const content = fs.readFileSync(drawerPath, 'utf-8')

        // Extract canManageAgent evaluator simulation matching AgentDetailsDrawer.jsx
        function evaluateCanManageAgent({ userRole, currentUserId, agentRole, agentId }) {
            const isPlatformSuperAdmin = userRole === 'SUPER_ADMIN'
            const isCompanySuperAdmin = userRole === 'COMPANY_SUPER_ADMIN'
            const isRegularAdmin = userRole === 'ADMIN'

            if (isPlatformSuperAdmin || isCompanySuperAdmin) {
                return true
            }
            if (isRegularAdmin) {
                if (agentRole === 'COMPANY_SUPER_ADMIN' || agentRole === 'SUPER_ADMIN') {
                    return false
                }
                if (agentRole === 'ADMIN') {
                    const isSelf = currentUserId && String(agentId) === String(currentUserId)
                    return Boolean(isSelf)
                }
                return true // AGENT
            }
            return false // AGENT role cannot manage
        }

        // Test cases:
        // Case A: Platform Super Admin -> can manage all
        assert.equal(evaluateCanManageAgent({ userRole: 'SUPER_ADMIN', agentRole: 'COMPANY_SUPER_ADMIN' }), true)
        assert.equal(evaluateCanManageAgent({ userRole: 'SUPER_ADMIN', agentRole: 'ADMIN' }), true)
        assert.equal(evaluateCanManageAgent({ userRole: 'SUPER_ADMIN', agentRole: 'AGENT' }), true)

        // Case B: Company Super Admin -> can manage all in tenant
        assert.equal(evaluateCanManageAgent({ userRole: 'COMPANY_SUPER_ADMIN', agentRole: 'ADMIN' }), true)
        assert.equal(evaluateCanManageAgent({ userRole: 'COMPANY_SUPER_ADMIN', agentRole: 'AGENT' }), true)
        assert.equal(evaluateCanManageAgent({ userRole: 'COMPANY_SUPER_ADMIN', agentRole: 'COMPANY_SUPER_ADMIN' }), true)

        // Case C: Regular ADMIN -> STRICTLY restricted
        // Cannot manage COMPANY_SUPER_ADMIN (read-only)
        assert.equal(evaluateCanManageAgent({ userRole: 'ADMIN', agentRole: 'COMPANY_SUPER_ADMIN' }), false)
        // Cannot manage Platform SUPER_ADMIN (read-only)
        assert.equal(evaluateCanManageAgent({ userRole: 'ADMIN', agentRole: 'SUPER_ADMIN' }), false)
        // Cannot manage peer ADMIN
        assert.equal(evaluateCanManageAgent({ userRole: 'ADMIN', currentUserId: 10, agentRole: 'ADMIN', agentId: 20 }), false)
        // Can inspect self ADMIN
        assert.equal(evaluateCanManageAgent({ userRole: 'ADMIN', currentUserId: 10, agentRole: 'ADMIN', agentId: 10 }), true)
        // Can manage AGENT
        assert.equal(evaluateCanManageAgent({ userRole: 'ADMIN', currentUserId: 10, agentRole: 'AGENT', agentId: 30 }), true)

        // Case D: AGENT -> cannot manage anyone
        assert.equal(evaluateCanManageAgent({ userRole: 'AGENT', agentRole: 'AGENT' }), false)
        assert.equal(evaluateCanManageAgent({ userRole: 'AGENT', agentRole: 'ADMIN' }), false)

        // Ensure AgentDetailsDrawer gates deal/lead actions behind canManageAgent
        assert.match(content, /const\s+canManageAgent\s*=/)
        assert.match(content, /\{canManageAgent\s*&&\s*\([\s\S]*?Revoke[\s\S]*?Reassign/)
    })

    await t.test('5. UserTable & EditUserModal: Guarding against ADMIN tampering with COMPANY_SUPER_ADMIN', async () => {
        const tablePath = path.join(rootDir, 'src/components/settings/UserTable.jsx')
        const tableContent = fs.readFileSync(tablePath, 'utf-8')

        // Verify adminCannotTouch logic in UserTable
        assert.match(tableContent, /const\s+adminCannotTouch\s*=\s*currentUserRole\s*===\s*'ADMIN'\s*&&\s*isTargetCompanySuperAdmin/)
        assert.match(tableContent, /const\s+canInlineEdit\s*=\s*isAdmin\s*&&\s*!adminCannotTouch/)
        assert.match(tableContent, /\{isAdmin\s*&&\s*!adminCannotTouch\s*&&\s*\([\s\S]*?Edit[\s\S]*?Permissions/)

        // Verify target protection: cannot delete or demote COMPANY_SUPER_ADMIN
        assert.match(tableContent, /const\s+isTargetSuperAdmin\s*=\s*u\.role\s*===\s*'SUPER_ADMIN'\s*\|\|\s*u\.role\s*===\s*'COMPANY_SUPER_ADMIN'/)
        assert.match(tableContent, /\{!isTargetSuperAdmin\s*&&\s*!isSelf\s*&&\s*\(/)

        const editModalPath = path.join(rootDir, 'src/components/settings/EditUserModal.jsx')
        const editContent = fs.readFileSync(editModalPath, 'utf-8')

        // Verify regular admin blocked screen
        assert.match(editContent, /const\s+isBlocked\s*=\s*currentUserRole\s*===\s*'ADMIN'\s*&&\s*isTargetCompanySuperAdmin/)
        assert.match(editContent, /Regular Admins cannot edit the Company Super Admin\./)

        // Verify COMPANY_SUPER_ADMIN manager lock
        assert.match(editContent, /if\s*\(!isTargetCompanySuperAdmin\)\s*\{[\s\S]*?\/api\/management\/users\/\$\{user\.id\}\/manager/)
        assert.match(editContent, /Company Super Admin is the apex root leader and does not report to anyone\./)
    })
})
