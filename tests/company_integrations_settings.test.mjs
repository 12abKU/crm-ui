import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

test('Milestone 5 Test Suite: Company Settings Webhooks & Integrations UI', async (t) => {

    await t.test('1. Settings.jsx Tab Gating & Routing', () => {
        const settingsSrc = fs.readFileSync(path.join(rootDir, 'src/pages/Settings.jsx'), 'utf-8')

        // Must import CompanyIntegrationsSettings
        assert.match(settingsSrc, /import\s+CompanyIntegrationsSettings\s+from\s+['"]\.\.\/components\/settings\/CompanyIntegrationsSettings['"]/)

        // Must use useSearchParams for deep linking
        assert.match(settingsSrc, /useSearchParams/)
        assert.match(settingsSrc, /searchParams\.get\(['"]tab['"]\)/)

        // Tab must be registered in the admin role-gated array
        assert.match(settingsSrc, /id:\s*['"]integrations['"]/)
        assert.match(settingsSrc, /label:\s*['"]Webhooks & Integrations['"]/)
        assert.match(settingsSrc, /icon:\s*['"]hub['"]/)

        // Tab rendering must have role === 'AGENT' protection
        assert.match(settingsSrc, /activeTab\s*===\s*['"]integrations['"]/)
        assert.match(settingsSrc, /role\s*===\s*['"]AGENT['"]/)
        assert.match(settingsSrc, /Access Denied/)

        // Logical simulation of tab visibility
        const isTabVisible = (role) => (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN')
        assert.equal(isTabVisible('COMPANY_SUPER_ADMIN'), true, 'COMPANY_SUPER_ADMIN can see tab')
        assert.equal(isTabVisible('ADMIN'), true, 'ADMIN can see tab')
        assert.equal(isTabVisible('SUPER_ADMIN'), true, 'SUPER_ADMIN can see tab')
        assert.equal(isTabVisible('AGENT'), false, 'AGENT cannot see tab')
        assert.equal(isTabVisible(null), false, 'Anonymous cannot see tab')
    })

    await t.test('2. API Client for Company Integrations exists and has all endpoints', () => {
        const apiSrc = fs.readFileSync(path.join(rootDir, 'src/api/integrations.js'), 'utf-8')

        assert.match(apiSrc, /getIntegrations:\s*\(\)\s*=>\s*api\.get\(['"]\/api\/company\/integrations['"]\)/)
        assert.match(apiSrc, /regenerateWebhookKey:\s*\(\)\s*=>\s*api\.post\(['"]\/api\/company\/integrations\/webhook-key\/regenerate['"]\)/)
        assert.match(apiSrc, /updateIndiamart:\s*\(data\)\s*=>\s*api\.put\(['"]\/api\/company\/integrations\/indiamart['"]/)
        assert.match(apiSrc, /clearIndiamart:\s*\(\)\s*=>\s*api\.delete\(['"]\/api\/company\/integrations\/indiamart['"]\)/)
        assert.match(apiSrc, /updateSulekha:\s*\(data\)\s*=>\s*api\.put\(['"]\/api\/company\/integrations\/sulekha['"]/)
        assert.match(apiSrc, /clearSulekha:\s*\(\)\s*=>\s*api\.delete\(['"]\/api\/company\/integrations\/sulekha['"]\)/)

        // Must export named and default
        assert.match(apiSrc, /export\s+const\s+companyIntegrationsAPI/)
        assert.match(apiSrc, /export\s+default\s+companyIntegrationsAPI/)
    })

    await t.test('3. CompanyIntegrationsSettings Component Architecture', () => {
        const compSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/CompanyIntegrationsSettings.jsx'), 'utf-8')

        // 3 Cards verification
        assert.match(compSrc, /Website & Form Webhook/)
        assert.match(compSrc, /IndiaMart \(Push API\)/)
        assert.match(compSrc, /Sulekha Leads/)

        // Action & Copy features
        assert.match(compSrc, /handleCopyUrl/)
        assert.match(compSrc, /handleCopyKey/)
        assert.match(compSrc, /handleCopySnippet/)
        assert.match(compSrc, /triggerRegenerateConfirm/)
        assert.match(compSrc, /handleSaveIndiamart/)
        assert.match(compSrc, /triggerClearIndiamart/)
        assert.match(compSrc, /handleSaveSulekha/)
        assert.match(compSrc, /triggerClearSulekha/)

        // Code snippets
        assert.match(compSrc, /curl -X POST/)
        assert.match(compSrc, /CURLOPT_TIMEOUT/)

        // Modal integration
        assert.match(compSrc, /<ConfirmModal/)
    })

    await t.test('4. WebhooksIntegrationsSettings alias export exists', () => {
        const aliasSrc = fs.readFileSync(path.join(rootDir, 'src/components/settings/WebhooksIntegrationsSettings.jsx'), 'utf-8')
        assert.match(aliasSrc, /export\s+\{\s*default\s*\}\s+from\s+['"]\.\/CompanyIntegrationsSettings['"]/)
    })

    await t.test('5. NotificationBell and WebSocketToast direct routing to /leads?leadId=...', () => {
        const bellSrc = fs.readFileSync(path.join(rootDir, 'src/components/NotificationBell.jsx'), 'utf-8')
        const toastSrc = fs.readFileSync(path.join(rootDir, 'src/components/ui/WebSocketToast.jsx'), 'utf-8')

        assert.match(bellSrc, /LEAD_INBOUND:\s*\{\s*icon:\s*['"]person_add['"]/)
        assert.match(bellSrc, /\/leads\?leadId=/)

        assert.match(toastSrc, /LEAD_INBOUND:\s*\{\s*icon:\s*['"]person_add['"]/)
        assert.match(toastSrc, /\/leads\?leadId=/)
    })
})
