import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

test('Milestone 5 Tenant CRM Permissions, Badging & Supervisory Controls Suite', async (t) => {
    await t.test('1. usePermission.js: exports and permission logic contract', async () => {
        const filePath = path.join(rootDir, 'src/hooks/usePermission.js')
        const content = fs.readFileSync(filePath, 'utf-8')

        // Verify exported helper functions exist
        assert.match(content, /export\s+function\s+isAdmin/, 'Must export isAdmin')
        assert.match(content, /export\s+function\s+isCompanySuperAdmin/, 'Must export isCompanySuperAdmin')
        assert.match(content, /export\s+function\s+hasPermission/, 'Must export hasPermission')
        assert.match(content, /export\s+function\s+useIsAdmin/, 'Must export useIsAdmin')
        assert.match(content, /export\s+function\s+useIsCompanySuperAdmin/, 'Must export useIsCompanySuperAdmin')

        // Dynamically import usePermission.js
        const mod = await import(`file://${filePath}`)
        const { isAdmin, isCompanySuperAdmin, hasPermission } = mod

        // isAdmin role checks
        assert.equal(isAdmin('COMPANY_SUPER_ADMIN'), true, 'COMPANY_SUPER_ADMIN must be admin')
        assert.equal(isAdmin('ADMIN'), true, 'ADMIN must be admin')
        assert.equal(isAdmin('SUPER_ADMIN'), true, 'SUPER_ADMIN must be admin')
        assert.equal(isAdmin('AGENT'), false, 'AGENT must not be admin')
        assert.equal(isAdmin(null), false, 'null must not be admin')

        // isCompanySuperAdmin checks
        assert.equal(isCompanySuperAdmin('COMPANY_SUPER_ADMIN'), true, 'COMPANY_SUPER_ADMIN check')
        assert.equal(isCompanySuperAdmin('ADMIN'), false, 'ADMIN is not company super admin')
        assert.equal(isCompanySuperAdmin('SUPER_ADMIN'), false, 'Platform SUPER_ADMIN is distinct')
        assert.equal(isCompanySuperAdmin('AGENT'), false, 'AGENT is not company super admin')

        // hasPermission checks
        assert.equal(hasPermission('COMPANY_SUPER_ADMIN', [], 'ACCOUNTS_CREATE'), true, 'COMPANY_SUPER_ADMIN bypasses all')
        assert.equal(hasPermission('ADMIN', [], 'DEALS_ASSIGN'), true, 'ADMIN bypasses all')
        assert.equal(hasPermission('SUPER_ADMIN', [], 'USERS_DELETE'), true, 'SUPER_ADMIN bypasses all')
        assert.equal(hasPermission('AGENT', ['ACCOUNTS_VIEW'], 'ACCOUNTS_VIEW'), true, 'AGENT has granted permission')
        assert.equal(hasPermission('AGENT', ['ACCOUNTS_VIEW'], 'ACCOUNTS_CREATE'), false, 'AGENT does not have ungranted permission')
    })

    await t.test('2. RequirePermission.jsx: COMPANY_SUPER_ADMIN bypass contract', () => {
        const filePath = path.join(rootDir, 'src/components/RequirePermission.jsx')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /COMPANY_SUPER_ADMIN/, 'Must include COMPANY_SUPER_ADMIN in bypass check')
    })

    await t.test('3. Visual Badging & Navigation: RoleBadge, UserMenu, Sidebar, TopBar', () => {
        const roleBadge = fs.readFileSync(path.join(rootDir, 'src/components/settings/RoleBadge.jsx'), 'utf-8')
        assert.match(roleBadge, /COMPANY_SUPER_ADMIN/, 'RoleBadge must define COMPANY_SUPER_ADMIN')
        assert.match(roleBadge, /#F59E0B/, 'RoleBadge must use amber/gold #F59E0B')
        assert.match(roleBadge, /👑/, 'RoleBadge must feature 👑 icon')

        const userMenu = fs.readFileSync(path.join(rootDir, 'src/components/UserMenu.jsx'), 'utf-8')
        assert.match(userMenu, /COMPANY_SUPER_ADMIN/, 'UserMenu must configure COMPANY_SUPER_ADMIN')
        assert.match(userMenu, /hasCrown:\s*true/, 'UserMenu must set hasCrown: true for apex leader')

        const sidebar = fs.readFileSync(path.join(rootDir, 'src/components/Sidebar.jsx'), 'utf-8')
        assert.match(sidebar, /role\s*===\s*'COMPANY_SUPER_ADMIN'/, 'Sidebar must permit COMPANY_SUPER_ADMIN')

        const topBar = fs.readFileSync(path.join(rootDir, 'src/components/TopBar.jsx'), 'utf-8')
        assert.match(topBar, /role\s*===\s*'COMPANY_SUPER_ADMIN'/, 'TopBar must permit COMPANY_SUPER_ADMIN for upgrade button')
    })

    await t.test('4. Org Chart Drawer: Supervisory Authority Matrix', () => {
        const drawer = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/orgchart/AgentDetailsDrawer.jsx'), 'utf-8')
        assert.match(drawer, /canManageAgent/, 'Must define canManageAgent gate')
        assert.match(drawer, /isCompanySuperAdmin\s*=\s*userRole\s*===\s*'COMPANY_SUPER_ADMIN'/, 'COMPANY_SUPER_ADMIN defined')
        assert.match(drawer, /agent\?\.role\s*===\s*'COMPANY_SUPER_ADMIN'/, 'Superiors check in canManageAgent')
    })

    await t.test('5. Tenant User Management Modals & Tables', () => {
        const inviteModal = fs.readFileSync(path.join(rootDir, 'src/components/settings/InviteUserModal.jsx'), 'utf-8')
        assert.match(inviteModal, /canInviteAdmin/, 'Must restrict admin invitation')
        assert.match(inviteModal, /COMPANY_SUPER_ADMIN/, 'COMPANY_SUPER_ADMIN can invite admins')

        const userTable = fs.readFileSync(path.join(rootDir, 'src/components/settings/UserTable.jsx'), 'utf-8')
        assert.match(userTable, /isTargetSuperAdmin/, 'Must identify target super admins to prevent deletion/demotion')
        assert.match(userTable, /canPromote\s*&&\s*isCompanySuperAdmin\s*&&\s*u\.role\s*===\s*'AGENT'/, 'Must restrict promotion authority to COMPANY_SUPER_ADMIN')
        assert.match(userTable, /canDemote\s*&&\s*isCompanySuperAdmin\s*&&\s*u\.role\s*===\s*'ADMIN'/, 'Must restrict demotion authority to COMPANY_SUPER_ADMIN')

        const editModal = fs.readFileSync(path.join(rootDir, 'src/components/settings/EditUserModal.jsx'), 'utf-8')
        assert.match(editModal, /isBlocked/, 'Must block regular admin from modifying Company Super Admin')
        assert.match(editModal, /isTargetCompanySuperAdmin/, 'Must recognize Company Super Admin target')

        const permEditor = fs.readFileSync(path.join(rootDir, 'src/components/settings/PermissionEditor.jsx'), 'utf-8')
        assert.match(permEditor, /isTargetCompanySuperAdmin/, 'Must recognize Company Super Admin target')
        assert.match(permEditor, /👑/, 'Must show crown banner for Company Super Admin')
    })
})
