import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

test('Adversarial Challenge Suite: Milestone 5 Frontend Tenant CRM Permissions & Hierarchy', async (t) => {

    await t.test('ATTACK VECTOR 1: Can an ADMIN demote or delete a COMPANY_SUPER_ADMIN?', () => {
        const userTableSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/UserTable.jsx'), 'utf-8')
        const agentMgmtSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/AgentManagementSettings.jsx'), 'utf-8')

        // 1. In UserTable, target COMPANY_SUPER_ADMIN is flagged as isTargetSuperAdmin
        assert.match(userTableSrc, /isTargetSuperAdmin\s*=\s*u\.role\s*===\s*'SUPER_ADMIN'\s*\|\|\s*u\.role\s*===\s*'COMPANY_SUPER_ADMIN'/)
        
        // 2. Demote and Delete actions are gated behind !isTargetSuperAdmin
        assert.match(userTableSrc, /\{!isTargetSuperAdmin\s*&&\s*!isSelf\s*&&/)

        // 3. Demote is strictly gated to isCompanySuperAdmin
        assert.match(userTableSrc, /canDemote\s*&&\s*isCompanySuperAdmin\s*&&\s*u\.role\s*===\s*'ADMIN'/)

        // 4. Delete for regular ADMIN is strictly locked to u.role === 'AGENT'
        assert.match(userTableSrc, /canDelete\s*&&\s*\(isCompanySuperAdmin\s*\|\|\s*\(currentUserRole\s*===\s*'ADMIN'\s*&&\s*u\.role\s*===\s*'AGENT'\)\)/)

        // 5. In AgentManagementSettings, regular ADMIN only gets users with role === 'AGENT'
        assert.match(agentMgmtSrc, /const\s+displayedUsers\s*=\s*isCompanySuperAdmin\s*\?\s*users\.filter\(u\s*=>\s*u\.role\s*!==\s*'SUPER_ADMIN'\)\s*:\s*users\.filter\(u\s*=>\s*u\.role\s*===\s*'AGENT'\)/)

        // Simulate logic:
        const simulateCanDemote = (callerRole, targetRole) => {
            const isCompanySuperAdmin = callerRole === 'COMPANY_SUPER_ADMIN' || callerRole === 'SUPER_ADMIN'
            const isTargetSuperAdmin = targetRole === 'SUPER_ADMIN' || targetRole === 'COMPANY_SUPER_ADMIN'
            if (isTargetSuperAdmin) return false
            return isCompanySuperAdmin && targetRole === 'ADMIN'
        }

        const simulateCanDelete = (callerRole, targetRole) => {
            const isCompanySuperAdmin = callerRole === 'COMPANY_SUPER_ADMIN' || callerRole === 'SUPER_ADMIN'
            const isTargetSuperAdmin = targetRole === 'SUPER_ADMIN' || targetRole === 'COMPANY_SUPER_ADMIN'
            if (isTargetSuperAdmin) return false
            return isCompanySuperAdmin || (callerRole === 'ADMIN' && targetRole === 'AGENT')
        }

        // Regular ADMIN against COMPANY_SUPER_ADMIN
        assert.equal(simulateCanDemote('ADMIN', 'COMPANY_SUPER_ADMIN'), false, 'ADMIN MUST NOT be able to demote COMPANY_SUPER_ADMIN')
        assert.equal(simulateCanDelete('ADMIN', 'COMPANY_SUPER_ADMIN'), false, 'ADMIN MUST NOT be able to delete COMPANY_SUPER_ADMIN')
        
        // Regular ADMIN against another ADMIN
        assert.equal(simulateCanDemote('ADMIN', 'ADMIN'), false, 'ADMIN MUST NOT demote peer ADMIN')
        assert.equal(simulateCanDelete('ADMIN', 'ADMIN'), false, 'ADMIN MUST NOT delete peer ADMIN')

        // COMPANY_SUPER_ADMIN demoting/deleting
        assert.equal(simulateCanDemote('COMPANY_SUPER_ADMIN', 'COMPANY_SUPER_ADMIN'), false, 'COMPANY_SUPER_ADMIN cannot demote self/apex')
        assert.equal(simulateCanDelete('COMPANY_SUPER_ADMIN', 'COMPANY_SUPER_ADMIN'), false, 'COMPANY_SUPER_ADMIN cannot delete self/apex')
        assert.equal(simulateCanDemote('COMPANY_SUPER_ADMIN', 'ADMIN'), true, 'COMPANY_SUPER_ADMIN can demote ADMIN')
        assert.equal(simulateCanDelete('COMPANY_SUPER_ADMIN', 'ADMIN'), true, 'COMPANY_SUPER_ADMIN can delete ADMIN')
        assert.equal(simulateCanDelete('COMPANY_SUPER_ADMIN', 'AGENT'), true, 'COMPANY_SUPER_ADMIN can delete AGENT')
    })

    await t.test('ATTACK VECTOR 2: Can an ADMIN invite another ADMIN?', () => {
        const inviteModalSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/InviteUserModal.jsx'), 'utf-8')
        const agentMgmtSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/AgentManagementSettings.jsx'), 'utf-8')

        // 1. canInviteAdmin check in InviteUserModal
        assert.match(inviteModalSrc, /const\s+canInviteAdmin\s*=\s*isCompanySuperAdmin\s*\|\|\s*\(allowAdminRole\s*&&\s*!isRegularAdmin\)/)

        // 2. Submission payload role enforcement
        assert.match(inviteModalSrc, /role:\s*canInviteAdmin\s*\?\s*form\.role\s*:\s*'AGENT'/)

        // 3. AgentManagementSettings createUser enforcement
        assert.match(agentMgmtSrc, /const\s+userRole\s*=\s*isCompanySuperAdmin\s*\?\s*\(form\.role\s*\|\|\s*'AGENT'\)\s*:\s*'AGENT'/)

        // Simulate logic:
        const simulateCanInviteRole = (callerRole, requestedRole) => {
            const isCompanySuperAdmin = callerRole === 'COMPANY_SUPER_ADMIN' || callerRole === 'SUPER_ADMIN'
            const isRegularAdmin = callerRole === 'ADMIN'
            const canInviteAdmin = isCompanySuperAdmin || (!isRegularAdmin)
            return canInviteAdmin ? requestedRole : 'AGENT'
        }

        assert.equal(simulateCanInviteRole('ADMIN', 'ADMIN'), 'AGENT', 'ADMIN attempting to invite ADMIN must be downgraded to AGENT')
        assert.equal(simulateCanInviteRole('ADMIN', 'AGENT'), 'AGENT', 'ADMIN inviting AGENT yields AGENT')
        assert.equal(simulateCanInviteRole('COMPANY_SUPER_ADMIN', 'ADMIN'), 'ADMIN', 'COMPANY_SUPER_ADMIN can invite ADMIN')
        assert.equal(simulateCanInviteRole('COMPANY_SUPER_ADMIN', 'AGENT'), 'AGENT', 'COMPANY_SUPER_ADMIN can invite AGENT')
    })

    await t.test('ATTACK VECTOR 3: Can an ADMIN revoke deals from another ADMIN or COMPANY_SUPER_ADMIN in the drawer?', () => {
        const drawerSrc = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/orgchart/AgentDetailsDrawer.jsx'), 'utf-8')

        // 1. canManageAgent authority matrix
        assert.match(drawerSrc, /const\s+canManageAgent\s*=\s*\(\(\)\s*=>/)
        assert.match(drawerSrc, /if\s*\(isPlatformSuperAdmin\s*\|\|\s*isCompanySuperAdmin\)\s*\{\s*return true\s*\}/)
        assert.match(drawerSrc, /agent\?\.role\s*===\s*'COMPANY_SUPER_ADMIN'/)

        // 2. Action buttons protected by canManageAgent
        assert.match(drawerSrc, /\{canManageAgent\s*&&\s*\(\s*<div className="flex items-center justify-end gap-2 pt-1 border-t"/)

        // 3. Direct function guards
        assert.match(drawerSrc, /const\s+handleRevokeDeal\s*=\s*async\s*\(deal\)\s*=>\s*\{\s*if\s*\(!canManageAgent\)\s*return/)
        assert.match(drawerSrc, /const\s+handleRevokeLead\s*=\s*async\s*\(lead\)\s*=>\s*\{\s*if\s*\(!canManageAgent\)\s*return/)
        assert.match(drawerSrc, /const\s+handleReassignSubordinateManager\s*=\s*async\s*\(subordinate,\s*newManagerValue\)\s*=>\s*\{\s*if\s*\(!canManageAgent\)\s*return/)

        // Simulate logic:
        const simulateCanManage = (callerRole, callerId, targetRole, targetId) => {
            const isPlatformSuperAdmin = callerRole === 'SUPER_ADMIN'
            const isCompanySuperAdmin = callerRole === 'COMPANY_SUPER_ADMIN'
            const isRegularAdmin = callerRole === 'ADMIN'

            if (isPlatformSuperAdmin || isCompanySuperAdmin) return true
            if (isRegularAdmin) {
                if (targetRole === 'COMPANY_SUPER_ADMIN' || targetRole === 'SUPER_ADMIN') return false
                if (targetRole === 'ADMIN') {
                    return Boolean(callerId && String(targetId) === String(callerId))
                }
                return true // AGENT
            }
            return false
        }

        // Regular ADMIN (id: 10) inspecting COMPANY_SUPER_ADMIN (id: 1)
        assert.equal(simulateCanManage('ADMIN', 10, 'COMPANY_SUPER_ADMIN', 1), false, 'ADMIN MUST NOT manage COMPANY_SUPER_ADMIN')
        
        // Regular ADMIN (id: 10) inspecting peer ADMIN (id: 11)
        assert.equal(simulateCanManage('ADMIN', 10, 'ADMIN', 11), false, 'ADMIN MUST NOT manage peer ADMIN')

        // Regular ADMIN (id: 10) inspecting AGENT (id: 20)
        assert.equal(simulateCanManage('ADMIN', 10, 'AGENT', 20), true, 'ADMIN CAN manage AGENT')

        // COMPANY_SUPER_ADMIN inspecting anyone
        assert.equal(simulateCanManage('COMPANY_SUPER_ADMIN', 1, 'ADMIN', 10), true, 'COMPANY_SUPER_ADMIN can manage ADMIN')
        assert.equal(simulateCanManage('COMPANY_SUPER_ADMIN', 1, 'AGENT', 20), true, 'COMPANY_SUPER_ADMIN can manage AGENT')
    })

    await t.test('ATTACK VECTOR 4: Can a COMPANY_SUPER_ADMIN be assigned a manager in EditUserModal?', () => {
        const editModalSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/EditUserModal.jsx'), 'utf-8')

        // 1. Recognizes target COMPANY_SUPER_ADMIN
        assert.match(editModalSrc, /const\s+isTargetCompanySuperAdmin\s*=\s*user\?\.role\s*===\s*'COMPANY_SUPER_ADMIN'/)

        // 2. Blocks regular ADMIN callers immediately
        assert.match(editModalSrc, /const\s+isBlocked\s*=\s*currentUserRole\s*===\s*'ADMIN'\s*&&\s*isTargetCompanySuperAdmin/)
        assert.match(editModalSrc, /Regular Admins cannot edit the Company Super Admin/)

        // 3. Manager select UI is replaced with crown apex indicator for COMPANY_SUPER_ADMIN
        assert.match(editModalSrc, /\{isTargetCompanySuperAdmin\s*\?\s*\(/)
        assert.match(editModalSrc, /Company Super Admin is the apex root leader and does not report to anyone/)

        // 4. Submit handler bypasses manager endpoint for COMPANY_SUPER_ADMIN
        assert.match(editModalSrc, /if\s*\(!isTargetCompanySuperAdmin\)\s*\{\s*const\s+newManagerId/)

        // Simulate logic:
        const simulateManagerUpdateAllowed = (targetUserRole) => {
            const isTargetCompanySuperAdmin = targetUserRole === 'COMPANY_SUPER_ADMIN'
            return !isTargetCompanySuperAdmin
        }

        assert.equal(simulateManagerUpdateAllowed('COMPANY_SUPER_ADMIN'), false, 'Manager update MUST be blocked for COMPANY_SUPER_ADMIN')
        assert.equal(simulateManagerUpdateAllowed('ADMIN'), true, 'Manager update is allowed for ADMIN')
        assert.equal(simulateManagerUpdateAllowed('AGENT'), true, 'Manager update is allowed for AGENT')
    })

    await t.test('ATTACK VECTOR 5: Can permissions of COMPANY_SUPER_ADMIN or ADMIN be tampered in PermissionEditor?', () => {
        const permEditorSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/PermissionEditor.jsx'), 'utf-8')

        // 1. isEditable flag
        assert.match(permEditorSrc, /const\s+isEditable\s*=\s*!isTargetCompanySuperAdmin\s*&&\s*!isTargetAdmin\s*&&/)

        // 2. Toggle guard
        assert.match(permEditorSrc, /const\s+toggle\s*=\s*\(key\)\s*=>\s*\{\s*if\s*\(!isEditable\)\s*return/)

        // 3. ToggleGroup guard
        assert.match(permEditorSrc, /const\s+toggleGroup\s*=\s*\(perms\)\s*=>\s*\{\s*if\s*\(!isEditable\)\s*return/)

        // 4. Save and Reset buttons removed when !isEditable
        assert.match(permEditorSrc, /\{isEditable\s*\?\s*\(/)
        assert.match(permEditorSrc, /<button\s+onClick=\{onClose\}[^>]*>\s*Close\s*<\/button>/)
    })
})
