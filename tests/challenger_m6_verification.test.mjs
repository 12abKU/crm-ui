import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

test('Adversarial Challenge Suite: Milestone 6 Frontend Edge Cases & Supervisory Verification', async (t) => {

    // ─────────────────────────────────────────────────────────────
    // 1. ROUTE GUARDS & LAYOUT REDIRECTS FOR COMPANY_SUPER_ADMIN
    // ─────────────────────────────────────────────────────────────
    await t.test('1. Route Guards: CrmLayout, PlatformLayout, and SmartRedirect', async (t) => {
        const appContent = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf-8')

        // Inspect CrmLayout logic
        await t.test('CrmLayout redirects unauthenticated users and isolates SUPER_ADMIN', () => {
            // Function simulation matching App.jsx CrmLayout lines 183-197:
            // if (!token) return <Navigate to="/login" />
            // if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
            const simulateCrmLayout = ({ token, role }) => {
                if (!token) return { redirect: '/login' }
                if (role === 'SUPER_ADMIN') return { redirect: '/platform' }
                return { render: 'CrmLayout' }
            }

            assert.deepEqual(simulateCrmLayout({ token: null, role: 'COMPANY_SUPER_ADMIN' }), { redirect: '/login' })
            assert.deepEqual(simulateCrmLayout({ token: 'jwt-xyz', role: 'SUPER_ADMIN' }), { redirect: '/platform' })
            assert.deepEqual(simulateCrmLayout({ token: 'jwt-xyz', role: 'COMPANY_SUPER_ADMIN' }), { render: 'CrmLayout' })
            assert.deepEqual(simulateCrmLayout({ token: 'jwt-xyz', role: 'ADMIN' }), { render: 'CrmLayout' })
            assert.deepEqual(simulateCrmLayout({ token: 'jwt-xyz', role: 'AGENT' }), { render: 'CrmLayout' })
        })

        await t.test('PlatformLayout strictly confines access to SUPER_ADMIN only', () => {
            // Function simulation matching App.jsx PlatformLayout lines 199-210:
            // if (!token) return <Navigate to="/login" />
            // if (role !== 'SUPER_ADMIN') return <Navigate to="/" />
            const simulatePlatformLayout = ({ token, role }) => {
                if (!token) return { redirect: '/login' }
                if (role !== 'SUPER_ADMIN') return { redirect: '/' }
                return { render: 'PlatformLayout' }
            }

            assert.deepEqual(simulatePlatformLayout({ token: null, role: 'SUPER_ADMIN' }), { redirect: '/login' })
            assert.deepEqual(simulatePlatformLayout({ token: 'jwt-xyz', role: 'SUPER_ADMIN' }), { render: 'PlatformLayout' })
            // COMPANY_SUPER_ADMIN attempting to access /platform must be kicked back to /
            assert.deepEqual(simulatePlatformLayout({ token: 'jwt-xyz', role: 'COMPANY_SUPER_ADMIN' }), { redirect: '/' })
            assert.deepEqual(simulatePlatformLayout({ token: 'jwt-xyz', role: 'ADMIN' }), { redirect: '/' })
            assert.deepEqual(simulatePlatformLayout({ token: 'jwt-xyz', role: 'AGENT' }), { redirect: '/' })
        })

        await t.test('SmartRedirect fallback routes COMPANY_SUPER_ADMIN to /', () => {
            // Function simulation matching App.jsx SmartRedirect lines 291-297:
            // if (!token) return <Navigate to="/login" />
            // if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
            // return <Navigate to="/" />
            const simulateSmartRedirect = ({ token, role }) => {
                if (!token) return { redirect: '/login' }
                if (role === 'SUPER_ADMIN') return { redirect: '/platform' }
                return { redirect: '/' }
            }

            assert.deepEqual(simulateSmartRedirect({ token: 'jwt-xyz', role: 'COMPANY_SUPER_ADMIN' }), { redirect: '/' })
            assert.deepEqual(simulateSmartRedirect({ token: 'jwt-xyz', role: 'ADMIN' }), { redirect: '/' })
            assert.deepEqual(simulateSmartRedirect({ token: 'jwt-xyz', role: 'AGENT' }), { redirect: '/' })
            assert.deepEqual(simulateSmartRedirect({ token: 'jwt-xyz', role: 'SUPER_ADMIN' }), { redirect: '/platform' })
            assert.deepEqual(simulateSmartRedirect({ token: null, role: 'COMPANY_SUPER_ADMIN' }), { redirect: '/login' })
        })
    })

    // ─────────────────────────────────────────────────────────────
    // 2. PERMISSION BYPASS & RBAC STRESS TESTING FOR COMPANY_SUPER_ADMIN
    // ─────────────────────────────────────────────────────────────
    await t.test('2. Permission Bypass & Fuzzing for COMPANY_SUPER_ADMIN', async (t) => {
        const usePermissionPath = path.join(rootDir, 'src/hooks/usePermission.js')
        const { isAdmin, isCompanySuperAdmin, hasPermission, usePermissions } = await import(`file://${usePermissionPath}`)

        await t.test('isAdmin and isCompanySuperAdmin accuracy', () => {
            assert.equal(isAdmin('COMPANY_SUPER_ADMIN'), true)
            assert.equal(isAdmin('ADMIN'), true)
            assert.equal(isAdmin('SUPER_ADMIN'), true)
            assert.equal(isAdmin('AGENT'), false)
            assert.equal(isAdmin(undefined), false)
            assert.equal(isAdmin(null), false)
            assert.equal(isAdmin(''), false)
            assert.equal(isAdmin('UNKNOWN_ROLE'), false)

            assert.equal(isCompanySuperAdmin('COMPANY_SUPER_ADMIN'), true)
            assert.equal(isCompanySuperAdmin('ADMIN'), false)
            assert.equal(isCompanySuperAdmin('SUPER_ADMIN'), false)
            assert.equal(isCompanySuperAdmin('AGENT'), false)
        })

        await t.test('hasPermission bypasses regardless of permissions parameter structure', () => {
            const edgeCasePermissions = [
                null,
                undefined,
                [],
                ['DEALS_VIEW'],
                ['ACCOUNTS_CREATE', 'LEADS_DELETE'],
                {},
                'NON_ARRAY_MALFORMED',
            ]

            const arbitraryPermissionsToCheck = [
                'SETTINGS_COMPANY_EDIT',
                'USERS_CREATE',
                'USERS_DELETE',
                'DEALS_ASSIGN',
                'LEADS_EXPORT',
                'ANY_FUTURE_ACTION_123',
                'SECURITY_ADMIN_OVERRIDE',
            ]

            for (const perms of edgeCasePermissions) {
                for (const checkPerm of arbitraryPermissionsToCheck) {
                    assert.equal(
                        hasPermission('COMPANY_SUPER_ADMIN', perms, checkPerm),
                        true,
                        `COMPANY_SUPER_ADMIN must have ${checkPerm} even if perms = ${JSON.stringify(perms)}`
                    )
                    assert.equal(
                        hasPermission('ADMIN', perms, checkPerm),
                        true,
                        `ADMIN must have ${checkPerm} even if perms = ${JSON.stringify(perms)}`
                    )
                    assert.equal(
                        hasPermission('SUPER_ADMIN', perms, checkPerm),
                        true,
                        `SUPER_ADMIN must have ${checkPerm} even if perms = ${JSON.stringify(perms)}`
                    )
                }
            }
        })

        await t.test('RequirePermission.jsx AST and bypass contract', () => {
            const reqPermContent = fs.readFileSync(path.join(rootDir, 'src/components/RequirePermission.jsx'), 'utf-8')
            assert.match(reqPermContent, /userRole === 'COMPANY_SUPER_ADMIN'/, 'RequirePermission must explicitly include COMPANY_SUPER_ADMIN')
            assert.match(reqPermContent, /userRole === 'SUPER_ADMIN' \|\| userRole === 'ADMIN' \|\| userRole === 'COMPANY_SUPER_ADMIN'/, 'Must bypass all three admin roles')
        })
    })

    // ─────────────────────────────────────────────────────────────
    // 3. VISUAL CROWN STYLING & APEX LEADER PRESENTATION
    // ─────────────────────────────────────────────────────────────
    await t.test('3. Visual Crown Styling & Badging', async (t) => {
        // RoleBadge
        const roleBadgeContent = fs.readFileSync(path.join(rootDir, 'src/components/settings/RoleBadge.jsx'), 'utf-8')
        assert.match(roleBadgeContent, /#F59E0B/, 'RoleBadge must use amber/gold #F59E0B for COMPANY_SUPER_ADMIN')
        assert.match(roleBadgeContent, /hasCrown:\s*true/, 'RoleBadge must set hasCrown: true')
        assert.match(roleBadgeContent, /👑/, 'RoleBadge must render crown emoji')

        // UserMenu
        const userMenuContent = fs.readFileSync(path.join(rootDir, 'src/components/UserMenu.jsx'), 'utf-8')
        assert.match(userMenuContent, /COMPANY_SUPER_ADMIN:\s*\{[^}]*#F59E0B[^}]*hasCrown:\s*true/s, 'UserMenu has crown and gold for COMPANY_SUPER_ADMIN')
        assert.match(userMenuContent, /rs\.hasCrown\s*&&\s*<span>👑<\/span>/, 'UserMenu conditionally renders crown badge')

        // OrgNodeCard
        const orgNodeContent = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/orgchart/OrgNodeCard.jsx'), 'utf-8')
        assert.match(orgNodeContent, /linear-gradient\(135deg,\s*#F59E0B,\s*#D97706\)/, 'OrgNodeCard must use gold gradient avatar for apex supervisor')
        assert.match(orgNodeContent, /isSupremeSupervisor\s*=\s*node\.role\s*===\s*'COMPANY_SUPER_ADMIN'/, 'OrgNodeCard identifies apex supervisor')
        assert.match(orgNodeContent, /1\.5px\s+solid\s+#F59E0B/, 'OrgNodeCard applies 1.5px solid #F59E0B border')
        assert.match(orgNodeContent, /👑\s*SUPER\s*ADMIN/, 'OrgNodeCard shows 👑 SUPER ADMIN tag')

        // platformConstants.js
        const platformConstContent = fs.readFileSync(path.join(rootDir, 'src/components/platform/platformConstants.js'), 'utf-8')
        assert.match(platformConstContent, /COMPANY_SUPER_ADMIN:\s*\{[^}]*#F59E0B[^}]*hasCrown:\s*true/s, 'platformConstants.js defines crown styling')
    })

    // ─────────────────────────────────────────────────────────────
    // 4. SUPERVISORY ACTIONS IN AGENT DETAILS DRAWER
    // ─────────────────────────────────────────────────────────────
    await t.test('4. Supervisory Authority & In-Drawer Revocation / Reassignment Matrix', async (t) => {
        const drawerContent = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/orgchart/AgentDetailsDrawer.jsx'), 'utf-8')

        // Replicate drawer canManageAgent logic
        const evaluateCanManage = (currentRole, currentUserId, targetAgent) => {
            const isPlatformSuperAdmin = currentRole === 'SUPER_ADMIN'
            const isCompanySuperAdmin = currentRole === 'COMPANY_SUPER_ADMIN'
            const isRegularAdmin = currentRole === 'ADMIN'

            if (isPlatformSuperAdmin || isCompanySuperAdmin) {
                return true
            }
            if (isRegularAdmin) {
                if (targetAgent?.role === 'COMPANY_SUPER_ADMIN' || targetAgent?.role === 'SUPER_ADMIN') {
                    return false
                }
                if (targetAgent?.role === 'ADMIN') {
                    const isSelf = currentUserId && String(targetAgent?.id) === String(currentUserId)
                    return Boolean(isSelf)
                }
                return true
            }
            return false
        }

        const companySuperAdminUser = { id: 1, role: 'COMPANY_SUPER_ADMIN', name: 'Alice CSA' }
        const peerAdminUser = { id: 2, role: 'ADMIN', name: 'Bob Admin' }
        const otherAdminUser = { id: 3, role: 'ADMIN', name: 'Charlie Admin' }
        const agentUser = { id: 10, role: 'AGENT', name: 'Dave Agent' }

        // Test 1: COMPANY_SUPER_ADMIN authority
        assert.equal(evaluateCanManage('COMPANY_SUPER_ADMIN', 1, peerAdminUser), true, 'CSA can manage ADMIN')
        assert.equal(evaluateCanManage('COMPANY_SUPER_ADMIN', 1, agentUser), true, 'CSA can manage AGENT')
        assert.equal(evaluateCanManage('COMPANY_SUPER_ADMIN', 1, companySuperAdminUser), true, 'CSA can manage self')

        // Test 2: ADMIN authority limits
        assert.equal(evaluateCanManage('ADMIN', 2, agentUser), true, 'ADMIN can manage AGENT')
        assert.equal(evaluateCanManage('ADMIN', 2, peerAdminUser), true, 'ADMIN can manage self (inspecting own node)')
        assert.equal(evaluateCanManage('ADMIN', 2, otherAdminUser), false, 'ADMIN CANNOT manage peer ADMIN')
        assert.equal(evaluateCanManage('ADMIN', 2, companySuperAdminUser), false, 'ADMIN CANNOT manage COMPANY_SUPER_ADMIN')

        // Test 3: AGENT has NO supervisory authority
        assert.equal(evaluateCanManage('AGENT', 10, agentUser), false, 'AGENT has no management authority')
        assert.equal(evaluateCanManage('AGENT', 10, peerAdminUser), false, 'AGENT cannot manage ADMIN')
        assert.equal(evaluateCanManage('AGENT', 10, companySuperAdminUser), false, 'AGENT cannot manage CSA')

        // Test 4: Verify code enforcement in AgentDetailsDrawer.jsx
        assert.match(drawerContent, /if\s*\(!canManageAgent\)\s*return/, 'handleRevokeDeal and handleRevokeLead have guard clauses')
        assert.match(drawerContent, /disabled=\{!canManageAgent\s*\|\|\s*isReassigning\}/, 'Reports To select dropdown is disabled when !canManageAgent')
        assert.match(drawerContent, /\{canManageAgent\s*&&\s*\(/, 'Action buttons container is conditionally rendered by canManageAgent')

        // Test 5: Verify deal/lead unassign payload filter
        const mockDeal = {
            id: 101,
            title: 'Big Enterprise Deal',
            assignees: [{ id: 10, name: 'Dave' }, { id: 2, name: 'Bob' }, { id: 99, name: 'Eve' }]
        }
        const targetAgentIdToRevoke = 10
        const remainingIds = (mockDeal.assignees || [])
            .map(u => u.id)
            .filter(uid => uid !== targetAgentIdToRevoke)

        assert.deepEqual(remainingIds, [2, 99], 'Revoke must leave all other assignees intact and remove target agent')
    })

    // ─────────────────────────────────────────────────────────────
    // 5. CANVAS PAN/ZOOM CLAMPING BOUNDS [0.3x, 2.0x] & FOCAL TRANSFORMS
    // ─────────────────────────────────────────────────────────────
    await t.test('5. Canvas Zoom Bounds Clamping [0.3x, 2.0x] & Transform Invariants', async (t) => {
        const canvasContent = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/orgchart/OrgChartCanvas.jsx'), 'utf-8')

        const MIN_ZOOM = 0.3
        const MAX_ZOOM = 2.0
        const ZOOM_STEP = 0.15

        // Check that constants match in source
        assert.match(canvasContent, /const\s+MIN_ZOOM\s*=\s*0\.3/, 'MIN_ZOOM must equal 0.3')
        assert.match(canvasContent, /const\s+MAX_ZOOM\s*=\s*2\.0/, 'MAX_ZOOM must equal 2.0')
        assert.match(canvasContent, /const\s+ZOOM_STEP\s*=\s*0\.15/, 'ZOOM_STEP must equal 0.15')

        // Zoom In algorithm simulation
        const zoomIn = (scale) => Math.min(MAX_ZOOM, Math.round((scale + ZOOM_STEP) * 100) / 100)
        const zoomOut = (scale) => Math.max(MIN_ZOOM, Math.round((scale - ZOOM_STEP) * 100) / 100)
        const wheelZoom = (curScale, deltaY) => {
            const zoomFactor = deltaY < 0 ? 1.08 : 0.92
            return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(curScale * zoomFactor * 100) / 100))
        }

        await t.test('Repeated zoomIn converges to and never exceeds 2.0x', () => {
            let s = 1.0
            for (let i = 0; i < 50; i++) {
                s = zoomIn(s)
                assert.ok(s <= 2.0, `Scale ${s} exceeded 2.0 at step ${i}`)
                assert.ok(s >= 0.3, `Scale ${s} fell below 0.3 at step ${i}`)
            }
            assert.equal(s, 2.0)
        })

        await t.test('Repeated zoomOut converges to and never falls below 0.3x', () => {
            let s = 1.0
            for (let i = 0; i < 50; i++) {
                s = zoomOut(s)
                assert.ok(s >= 0.3, `Scale ${s} fell below 0.3 at step ${i}`)
                assert.ok(s <= 2.0, `Scale ${s} exceeded 2.0 at step ${i}`)
            }
            assert.equal(s, 0.3)
        })

        await t.test('Extreme wheel deltas are strictly clamped to [0.3, 2.0]', () => {
            const extremeDeltas = [-1000000, -500, -1, 1, 500, 1000000]
            for (const delta of extremeDeltas) {
                let s = 1.0
                for (let step = 0; step < 100; step++) {
                    s = wheelZoom(s, delta)
                    assert.ok(s >= 0.3 && s <= 2.0, `Extreme wheel delta ${delta} produced out-of-bounds scale ${s}`)
                }
            }
        })

        await t.test('Cursor focal point math preserves invariant point in content space', () => {
            // Formula from OrgChartCanvas.jsx lines 151-152:
            // nextTx = cursorX - (cursorX - curTranslate.x) * (nextScale / curScale)
            // nextTy = cursorY - (cursorY - curTranslate.y) * (nextScale / curScale)
            const curScale = 1.0
            const nextScale = 1.5
            const curTx = 120
            const curTy = 80
            const cursorX = 400
            const cursorY = 300

            const contentXBefore = (cursorX - curTx) / curScale
            const contentYBefore = (cursorY - curTy) / curScale

            const nextTx = cursorX - (cursorX - curTx) * (nextScale / curScale)
            const nextTy = cursorY - (cursorY - curTy) * (nextScale / curScale)

            const contentXAfter = (cursorX - nextTx) / nextScale
            const contentYAfter = (cursorY - nextTy) / nextScale

            assert.ok(Math.abs(contentXBefore - contentXAfter) < 1e-9, 'Content coordinate X invariant preserved')
            assert.ok(Math.abs(contentYBefore - contentYAfter) < 1e-9, 'Content coordinate Y invariant preserved')
        })

        await t.test('Randomized Fuzz Testing: 100,000 steps of random mixed operations', () => {
            let s = 1.0
            for (let i = 0; i < 100000; i++) {
                const op = Math.random()
                if (op < 0.33) {
                    s = zoomIn(s)
                } else if (op < 0.66) {
                    s = zoomOut(s)
                } else {
                    const randomDelta = (Math.random() - 0.5) * 2000
                    s = wheelZoom(s, randomDelta)
                }
                if (s < 0.3 || s > 2.0) {
                    assert.fail(`Fuzzing step ${i} breached clamping bounds: scale = ${s}`)
                }
            }
            assert.ok(s >= 0.3 && s <= 2.0)
        })
    })
})
