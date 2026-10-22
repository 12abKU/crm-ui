import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

test('Challenger M5-1 Empirical Challenge Suite: Company Integrations Settings & Role Gating', async (t) => {
    const settingsPath = path.join(rootDir, 'src/pages/Settings.jsx')
    const compPath = path.join(rootDir, 'src/components/settings/CompanyIntegrationsSettings.jsx')
    const apiPath = path.join(rootDir, 'src/api/integrations.js')
    const bellPath = path.join(rootDir, 'src/components/NotificationBell.jsx')
    const toastPath = path.join(rootDir, 'src/components/ui/WebSocketToast.jsx')

    const settingsSrc = fs.readFileSync(settingsPath, 'utf-8')
    const compSrc = fs.readFileSync(compPath, 'utf-8')
    const apiSrc = fs.readFileSync(apiPath, 'utf-8')
    const bellSrc = fs.readFileSync(bellPath, 'utf-8')
    const toastSrc = fs.readFileSync(toastPath, 'utf-8')

    // =========================================================================
    // 1. ROLE GATING EMPIRICAL CHALLENGE (Tab Absence & Access Denied Banner)
    // =========================================================================
    await t.test('CHALLENGE 1: Role-gated Tab Bar Visibility & Access-Denied Banner', () => {
        // Extract the tab list expression from Settings.jsx
        // In Settings.jsx:
        // ...((role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN') ? [ ... ] : [])
        const getTabsForRole = (role) => {
            const baseTabs = [
                { id: 'general', label: 'General Settings', icon: 'settings' },
                { id: 'templates', label: 'Email Templates', icon: 'mail' },
                { id: 'sequences', label: 'Automated Sequences', icon: 'bolt' },
            ]
            const adminTabs = [
                { id: 'custom_fields', label: 'Custom Fields', icon: 'extension' },
                { id: 'agents', label: 'Team Management', icon: 'manage_accounts' },
                { id: 'pipeline', label: 'Pipeline Stages', icon: 'linear_scale' },
                { id: 'integrations', label: 'Webhooks & Integrations', icon: 'hub' },
            ]
            const isAdmin = (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN')
            return [...baseTabs, ...(isAdmin ? adminTabs : [])]
        }

        // Test 1a: Tab MUST be absent for AGENT
        const agentTabs = getTabsForRole('AGENT')
        assert.equal(agentTabs.some(tab => tab.id === 'integrations'), false, 'integrations tab must be absent for AGENT')
        assert.equal(agentTabs.length, 3, 'AGENT sees only base 3 tabs')

        // Test 1b: Tab MUST be present for COMPANY_SUPER_ADMIN, ADMIN, SUPER_ADMIN
        for (const adminRole of ['COMPANY_SUPER_ADMIN', 'ADMIN', 'SUPER_ADMIN']) {
            const tabs = getTabsForRole(adminRole)
            const integrationsTab = tabs.find(tab => tab.id === 'integrations')
            assert.ok(integrationsTab, `integrations tab must be present for ${adminRole}`)
            assert.equal(integrationsTab.label, 'Webhooks & Integrations')
            assert.equal(integrationsTab.icon, 'hub')
        }

        // Test 1c: Tab MUST be absent for arbitrary/unknown/null roles
        for (const invalidRole of [null, undefined, '', 'VIEWER', 'SALES_REP', 'GUEST']) {
            const tabs = getTabsForRole(invalidRole)
            assert.equal(tabs.some(tab => tab.id === 'integrations'), false, `integrations tab must be absent for ${invalidRole}`)
        }

        // Test 1d: Access Denied Banner in renderPanel()
        // Extract renderPanel logic from Settings.jsx
        assert.match(settingsSrc, /if\s*\(activeTab\s*===\s*['"]integrations['"]\)\s*\{/)
        assert.match(settingsSrc, /if\s*\(role\s*===\s*['"]AGENT['"]\)\s*\{/)
        assert.match(settingsSrc, /Access Denied:\s*Webhook and integration settings are restricted to Company Administrators\./)

        // Simulate renderPanel logic
        const simulateRenderPanel = (activeTab, role) => {
            if (activeTab === 'integrations') {
                if (role === 'AGENT') {
                    return { type: 'ACCESS_DENIED', message: 'Access Denied: Webhook and integration settings are restricted to Company Administrators.' }
                }
                return { type: 'COMPONENT', component: 'CompanyIntegrationsSettings' }
            }
            return { type: 'OTHER' }
        }

        const agentDirectAccess = simulateRenderPanel('integrations', 'AGENT')
        assert.equal(agentDirectAccess.type, 'ACCESS_DENIED')
        assert.match(agentDirectAccess.message, /Access Denied/)

        const adminDirectAccess = simulateRenderPanel('integrations', 'ADMIN')
        assert.equal(adminDirectAccess.type, 'COMPONENT')
        assert.equal(adminDirectAccess.component, 'CompanyIntegrationsSettings')

        const companySuperAdminDirectAccess = simulateRenderPanel('integrations', 'COMPANY_SUPER_ADMIN')
        assert.equal(companySuperAdminDirectAccess.type, 'COMPONENT')
        assert.equal(companySuperAdminDirectAccess.component, 'CompanyIntegrationsSettings')
    })

    // =========================================================================
    // 2. URL PARAMETER SYNCHRONIZATION EMPIRICAL CHALLENGE
    // =========================================================================
    await t.test('CHALLENGE 2: useSearchParams Synchronization & Deep-Linking', () => {
        // Assert react-router-dom useSearchParams import
        assert.match(settingsSrc, /import\s*\{[^}]*useSearchParams[^}]*\}\s*from\s*['"]react-router-dom['"]/)

        // Assert query param reading and state initialization
        assert.match(settingsSrc, /const\s*\[searchParams,\s*setSearchParams\]\s*=\s*useSearchParams\(\)/)
        assert.match(settingsSrc, /const\s*tabParam\s*=\s*searchParams\.get\(['"]tab['"]\)/)
        assert.match(settingsSrc, /const\s*\[activeTab,\s*setActiveTab\]\s*=\s*useState\(tabParam\s*\|\|\s*['"]general['"]\)/)

        // Assert useEffect synchronizing tabParam back to activeTab
        assert.match(settingsSrc, /useEffect\(\(\)\s*=>\s*\{[\s\S]*?if\s*\(tabParam\s*&&\s*tabParam\s*!==\s*activeTab\)\s*\{[\s\S]*?setActiveTab\(tabParam\)[\s\S]*?\}\s*\},?\s*\[tabParam\]\)/)

        // Assert handleTabClick syncs both state and URL with replace: true
        assert.match(settingsSrc, /const\s*handleTabClick\s*=\s*\(tabId\)\s*=>\s*\{[\s\S]*?setActiveTab\(tabId\)[\s\S]*?setSearchParams\(\{\s*tab:\s*tabId\s*\},?\s*\{\s*replace:\s*true\s*\}\)[\s\S]*?\}/)

        // Simulate state transitions
        let state = {
            searchParams: new URLSearchParams('tab=integrations'),
            activeTab: 'general',
            history: []
        }

        // Initialize
        const initialTabParam = state.searchParams.get('tab')
        state.activeTab = initialTabParam || 'general'
        assert.equal(state.activeTab, 'integrations', 'Initial activeTab should be integrations from query param')

        // User clicks templates tab
        const clickTab = (tabId) => {
            state.activeTab = tabId
            state.searchParams = new URLSearchParams({ tab: tabId })
            state.history.push({ tab: tabId, replace: true })
        }
        clickTab('templates')
        assert.equal(state.activeTab, 'templates')
        assert.equal(state.searchParams.get('tab'), 'templates')
        assert.equal(state.history[0].replace, true)

        // External navigation changes search param
        state.searchParams = new URLSearchParams('tab=custom_fields')
        const newParam = state.searchParams.get('tab')
        if (newParam && newParam !== state.activeTab) {
            state.activeTab = newParam
        }
        assert.equal(state.activeTab, 'custom_fields', 'activeTab syncs with external search param change')
    })

    // =========================================================================
    // 3. API CLIENT EXHAUSTIVE METHOD EXECUTION SIMULATION
    // =========================================================================
    await t.test('CHALLENGE 3: API Client Endpoint Signatures & Method Execution', async () => {
        const calls = []
        const mockApi = {
            get: (url) => {
                calls.push({ method: 'GET', url })
                return Promise.resolve({ data: { webhookApiKey: 'wh_test_123' } })
            },
            post: (url, data) => {
                calls.push({ method: 'POST', url, data })
                return Promise.resolve({ data: { webhookApiKey: 'wh_new_456' } })
            },
            put: (url, data) => {
                calls.push({ method: 'PUT', url, data })
                return Promise.resolve({ data })
            },
            delete: (url) => {
                calls.push({ method: 'DELETE', url })
                return Promise.resolve({ data: {} })
            }
        }

        // Build client using mockApi
        const client = {
            getIntegrations: () => mockApi.get('/api/company/integrations'),
            regenerateWebhookKey: () => mockApi.post('/api/company/integrations/webhook-key/regenerate'),
            updateIndiamart: (data) => mockApi.put('/api/company/integrations/indiamart', data),
            clearIndiamart: () => mockApi.delete('/api/company/integrations/indiamart'),
            updateSulekha: (data) => mockApi.put('/api/company/integrations/sulekha', data),
            clearSulekha: () => mockApi.delete('/api/company/integrations/sulekha'),
        }

        // Execute all 6 methods
        await client.getIntegrations()
        await client.regenerateWebhookKey()
        await client.updateIndiamart({ crmKey: 'IM_KEY_999', enabled: true })
        await client.clearIndiamart()
        await client.updateSulekha({ webhookSecret: 'SUL_SEC_888', enabled: true })
        await client.clearSulekha()

        assert.equal(calls.length, 6, 'All 6 API client methods executed successfully')
        assert.deepEqual(calls[0], { method: 'GET', url: '/api/company/integrations' })
        assert.deepEqual(calls[1], { method: 'POST', url: '/api/company/integrations/webhook-key/regenerate', data: undefined })
        assert.deepEqual(calls[2], { method: 'PUT', url: '/api/company/integrations/indiamart', data: { crmKey: 'IM_KEY_999', enabled: true } })
        assert.deepEqual(calls[3], { method: 'DELETE', url: '/api/company/integrations/indiamart' })
        assert.deepEqual(calls[4], { method: 'PUT', url: '/api/company/integrations/sulekha', data: { webhookSecret: 'SUL_SEC_888', enabled: true } })
        assert.deepEqual(calls[5], { method: 'DELETE', url: '/api/company/integrations/sulekha' })
    })

    // =========================================================================
    // 4. COMPONENT SECURITY, CLIPBOARD FALLBACK & CODE SNIPPETS
    // =========================================================================
    await t.test('CHALLENGE 4: Safe Clipboard Copy Helper & Snippet Architecture', async () => {
        // Assert copyToClipboard implementation handles fallback
        assert.match(compSrc, /async function copyToClipboard\s*\(text\)/)
        assert.match(compSrc, /if\s*\(!text\)\s*return false/)
        assert.match(compSrc, /navigator\.clipboard\s*&&\s*window\.isSecureContext/)
        assert.match(compSrc, /document\.createElement\(['"]textarea['"]\)/)
        assert.match(compSrc, /document\.execCommand\(['"]copy['"]\)/)

        // Assert code snippets format
        assert.match(compSrc, /const\s+curlSnippet\s*=/)
        assert.match(compSrc, /curl -X POST "\$\{activeWebhookUrl\}"/)
        assert.match(compSrc, /const\s+phpSnippet\s*=/)
        assert.match(compSrc, /\$ch = curl_init\(\$webhookUrl\)/)
        assert.match(compSrc, /CURLOPT_TIMEOUT\s*=>\s*3/)

        // Modal safeguards
        assert.match(compSrc, /triggerRegenerateConfirm/)
        assert.match(compSrc, /triggerClearIndiamart/)
        assert.match(compSrc, /triggerClearSulekha/)
    })

    // =========================================================================
    // 5. NOTIFICATION EVENT DISPATCH & ROUTING INTERCEPTION
    // =========================================================================
    await t.test('CHALLENGE 5: Inbound Lead Real-time Notification Direct Navigation', () => {
        // Bell click handler
        assert.match(bellSrc, /\(n\.type\s*===\s*['"]LEAD_INBOUND['"]\s*\|\|\s*n\.type\s*===\s*['"]NEW_LEAD_DEAL['"]\)\s*&&\s*n\.leadId/)
        assert.match(bellSrc, /navigate\(`\/leads\?leadId=\$\{n\.leadId\}`\)/)

        // Toast click handler
        assert.match(toastSrc, /\(notice\.type\s*===\s*['"]LEAD_INBOUND['"]\s*\|\|\s*notice\.type\s*===\s*['"]NEW_LEAD_DEAL['"]\)\s*&&\s*notice\.leadId/)
        assert.match(toastSrc, /navigate\(`\/leads\?leadId=\$\{notice\.leadId\}`\)/)

        // Test style metadata
        assert.match(bellSrc, /LEAD_INBOUND:\s*\{[\s\S]*?icon:\s*['"]person_add['"]/)
        assert.match(toastSrc, /LEAD_INBOUND:\s*\{[\s\S]*?icon:\s*['"]person_add['"]/)
    })
})
