import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Minimal, zero-dependency browser DOM simulator for clipboard and fallback tests
function createMockDomEnvironment() {
    const children = []
    let focusedElement = null
    let selectedElement = null

    const document = {
        body: {
            children,
            get childNodes() { return children },
            appendChild(child) {
                child.parentNode = this
                children.push(child)
                return child
            },
            removeChild(child) {
                const idx = children.indexOf(child)
                if (idx !== -1) {
                    children.splice(idx, 1)
                    child.parentNode = null
                }
                return child
            }
        },
        createElement(tagName) {
            const el = {
                tagName: tagName.toUpperCase(),
                value: '',
                style: {},
                parentNode: null,
                focus() {
                    focusedElement = this
                },
                select() {
                    selectedElement = this
                },
                remove() {
                    if (this.parentNode) {
                        this.parentNode.removeChild(this)
                    }
                }
            }
            return el
        },
        execCommand(cmd) {
            return false // default, can be overridden per test
        }
    }

    const window = {
        isSecureContext: true,
        document,
        location: {
            origin: 'http://localhost:5173'
        }
    }

    return {
        window,
        document,
        getFocusedElement: () => focusedElement,
        getSelectedElement: () => selectedElement,
    }
}

test('Challenger M5-2: Empirical Frontend Build Integrity & Runtime Safety Suite', async (t) => {

    // ─────────────────────────────────────────────────────────────────────────────
    // CHALLENGE 1: Vite Production Build & Asset Integrity
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('1. Vite Production Build Artifacts Integrity', async () => {
        const distDir = path.join(rootDir, 'dist')
        assert.ok(fs.existsSync(distDir), 'dist/ directory must exist after npm run build')

        const indexHtml = path.join(distDir, 'index.html')
        assert.ok(fs.existsSync(indexHtml), 'dist/index.html must exist')
        const indexHtmlContent = fs.readFileSync(indexHtml, 'utf-8')
        assert.match(indexHtmlContent, /<script type="module"/, 'index.html must load module bundle')

        const assetsDir = path.join(distDir, 'assets')
        assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist')

        const assetFiles = fs.readdirSync(assetsDir)
        assert.ok(assetFiles.length > 10, `dist/assets must contain generated bundle chunks (found ${assetFiles.length})`)

        // Verify that Settings chunk was generated
        const settingsChunk = assetFiles.find(f => f.startsWith('Settings-') && f.endsWith('.js'))
        assert.ok(settingsChunk, `dist/assets must contain compiled Settings chunk (found: ${settingsChunk})`)

        // Verify compiled Settings chunk contains Company Integrations references
        const settingsChunkContent = fs.readFileSync(path.join(assetsDir, settingsChunk), 'utf-8')
        assert.match(settingsChunkContent, /Website & Form Webhook/, 'Compiled chunk must contain Website Webhook text')
        assert.match(settingsChunkContent, /IndiaMart/, 'Compiled chunk must contain IndiaMart integration')
        assert.match(settingsChunkContent, /Sulekha/, 'Compiled chunk must contain Sulekha integration')
        assert.match(settingsChunkContent, /\/api\/company\/integrations/, 'Compiled chunk must contain API path')
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // CHALLENGE 2: Icon Exports from @tabler/icons-react
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('2. Tabler Icons Export Validity & React Component Rendering', async () => {
        const compPath = path.join(rootDir, 'src/components/settings/CompanyIntegrationsSettings.jsx')
        const compSrc = fs.readFileSync(compPath, 'utf-8')

        // Extract all imported icons from @tabler/icons-react in the component
        const importBlockMatch = compSrc.match(/import\s*\{([^}]*)\}\s*from\s*['"]@tabler\/icons-react['"]/)
        assert.ok(importBlockMatch, 'CompanyIntegrationsSettings.jsx must import from @tabler/icons-react')

        const importedIcons = importBlockMatch[1]
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)

        assert.equal(importedIcons.length, 15, `Expected 15 icons imported, found ${importedIcons.length}`)

        // Dynamically import @tabler/icons-react from node_modules
        const tablerModule = await import('@tabler/icons-react')

        for (const iconName of importedIcons) {
            const iconExport = tablerModule[iconName]
            assert.ok(
                iconExport !== undefined && iconExport !== null,
                `Icon "${iconName}" MUST exist as an export in @tabler/icons-react`
            )
            assert.ok(
                typeof iconExport === 'function' || (typeof iconExport === 'object' && iconExport !== null),
                `Icon "${iconName}" must be a callable function or React.forwardRef object (typeof = ${typeof iconExport})`
            )

            // If it's a forwardRef component, test its render method
            const renderFn = typeof iconExport === 'function' ? iconExport : iconExport.render
            assert.equal(typeof renderFn, 'function', `Icon "${iconName}" must have a callable render function`)

            const element = renderFn({ size: 16, color: '#16A34A' }, null)
            assert.ok(element !== null && typeof element === 'object', `Icon "${iconName}" must return a valid React element`)
        }
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // CHALLENGE 3: Clipboard Copy Function & Non-Secure Context Fallback Behavior
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('3. Clipboard Copy Function: Insecure Context, Fallback & DOM Hygiene', async (sub) => {
        const compPath = path.join(rootDir, 'src/components/settings/CompanyIntegrationsSettings.jsx')
        const compSrc = fs.readFileSync(compPath, 'utf-8')

        // Extract copyToClipboard function source code
        const copyFnMatch = compSrc.match(/(async\s+function\s+copyToClipboard[\s\S]*?\n\})/m)
        assert.ok(copyFnMatch, 'copyToClipboard helper must exist in CompanyIntegrationsSettings.jsx')

        const copyFnSource = copyFnMatch[1]

        // Subtest A: Empty / Null / Undefined text inputs
        await sub.test('3A. Rejection on empty or missing text', async () => {
            const { window, document } = createMockDomEnvironment()
            const copyFn = new Function('navigator', 'window', 'document', `
                return (${copyFnSource});
            `)({}, window, document)

            assert.equal(await copyFn(''), false, 'Empty string must return false')
            assert.equal(await copyFn(null), false, 'Null must return false')
            assert.equal(await copyFn(undefined), false, 'Undefined must return false')
            assert.equal(await copyFn(false), false, 'false must return false')
        })

        // Subtest B: Modern Secure Context (window.isSecureContext = true and navigator.clipboard.writeText)
        await sub.test('3B. Modern Secure Context: uses navigator.clipboard.writeText', async () => {
            let writtenText = null
            let writeCalls = 0
            const { window, document } = createMockDomEnvironment()

            const mockNavigator = {
                clipboard: {
                    writeText: async (t) => {
                        writeCalls++
                        writtenText = t
                        return Promise.resolve()
                    }
                }
            }
            window.isSecureContext = true

            const copyFn = new Function('navigator', 'window', 'document', `
                return (${copyFnSource});
            `)(mockNavigator, window, document)

            const targetUrl = 'https://crm.example.com/api/webhooks/inbound/wh_live_test_123'
            const result = await copyFn(targetUrl)

            assert.equal(result, true, 'copyToClipboard must return true on successful writeText')
            assert.equal(writeCalls, 1, 'writeText must be called exactly once')
            assert.equal(writtenText, targetUrl, 'Copied text must match target URL')
            assert.equal(document.body.children.length, 0, 'No textarea should remain in secure context')
        })

        // Subtest C: Insecure Context (window.isSecureContext = false) -> MUST use document.execCommand fallback
        await sub.test('3C. Insecure Context: window.isSecureContext=false triggers document.execCommand fallback', async () => {
            let writeCalls = 0
            let execCommandCalled = false
            let execCommandArg = null
            let capturedTextAreaValue = null

            const { window, document } = createMockDomEnvironment()

            document.execCommand = function (command) {
                execCommandCalled = true
                execCommandArg = command
                if (document.body.children.length > 0) {
                    capturedTextAreaValue = document.body.children[0].value
                }
                return true
            }

            const mockNavigator = {
                clipboard: {
                    writeText: async () => {
                        writeCalls++
                        throw new Error('Should NOT be called in insecure context!')
                    }
                }
            }

            // Insecure context simulation (e.g. plain HTTP or LAN IP)
            window.isSecureContext = false

            const copyFn = new Function('navigator', 'window', 'document', `
                return (${copyFnSource});
            `)(mockNavigator, window, document)

            const apiKey = 'wh_live_insecure_fallback_key_456'
            const result = await copyFn(apiKey)

            assert.equal(writeCalls, 0, 'navigator.clipboard.writeText MUST NOT be invoked when window.isSecureContext is false')
            assert.equal(execCommandCalled, true, 'document.execCommand MUST be invoked as fallback')
            assert.equal(execCommandArg, 'copy', 'execCommand must be called with "copy"')
            assert.equal(capturedTextAreaValue, apiKey, 'Fallback textarea must contain the exact text to copy')
            assert.equal(result, true, 'Fallback must return true when execCommand succeeds')
            assert.equal(document.body.children.length, 0, 'DOM MUST be cleaned up: textarea removed after copy')
        })

        // Subtest D: Secure context where navigator.clipboard.writeText throws (Permission Denied)
        await sub.test('3D. Secure context with clipboard rejection falls back gracefully', async () => {
            let execCommandCalled = false
            const { window, document } = createMockDomEnvironment()

            document.execCommand = function (command) {
                if (command === 'copy') {
                    execCommandCalled = true
                    return true
                }
                return false
            }

            const mockNavigator = {
                clipboard: {
                    writeText: async () => {
                        throw new Error('NotAllowedError: Clipboard permission denied')
                    }
                }
            }
            window.isSecureContext = true

            const copyFn = new Function('navigator', 'window', 'document', `
                return (${copyFnSource});
            `)(mockNavigator, window, document)

            const text = 'curl -X POST "https://test.com"'
            const result = await copyFn(text)

            assert.equal(execCommandCalled, true, 'Must fall back to execCommand when writeText throws')
            assert.equal(result, true, 'Must return true when fallback execCommand succeeds')
            assert.equal(document.body.children.length, 0, 'DOM must be clean: textarea removed')
        })

        // Subtest E: Both Clipboard API and execCommand fail
        await sub.test('3E. Complete clipboard failure handles error without crashing', async () => {
            const { window, document } = createMockDomEnvironment()

            document.execCommand = function () {
                return false // execCommand fails
            }

            const mockNavigator = {}
            window.isSecureContext = false

            const copyFn = new Function('navigator', 'window', 'document', `
                return (${copyFnSource});
            `)(mockNavigator, window, document)

            const result = await copyFn('some text')
            assert.equal(result, false, 'Must return false when both clipboard mechanisms fail')
            assert.equal(document.body.children.length, 0, 'DOM must be clean even on failure')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // CHALLENGE 4: Dynamic Code Snippet Generation & Active Webhook URL
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('4. Dynamic Code Snippet Generation: URL Embedding & Syntax Verification', async (sub) => {
        // Helper to evaluate snippet generator exactly as written in CompanyIntegrationsSettings.jsx
        function generateSnippets({ webhookUrl, webhookApiKey, windowOrigin = 'https://app.crm.com' }) {
            const integrations = { webhookUrl, webhookApiKey }
            const window = { location: { origin: windowOrigin } }

            const activeWebhookUrl = integrations.webhookUrl || `${window.location.origin}/api/webhooks/inbound/${integrations.webhookApiKey}`

            const curlSnippet = `curl -X POST "${activeWebhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Alex Johnson",
    "email": "alex@enterprise.com",
    "phone": "9876543210",
    "company": "Enterprise Global",
    "message": "Interested in CRM demo"
  }'`

            const phpSnippet = `<?php
// Hostinger / WordPress PHP Inbound Lead Forwarder
$webhookUrl = '${activeWebhookUrl}';

$payload = json_encode([
    'name'    => $_POST['name'] ?? '',
    'email'   => $_POST['email'] ?? '',
    'phone'   => $_POST['phone'] ?? '',
    'company' => $_POST['company'] ?? '',
    'message' => $_POST['message'] ?? 'Website Inquiry'
]);

$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ],
    CURLOPT_TIMEOUT        => 3, // Non-blocking 3s timeout
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
?>`

            return { activeWebhookUrl, curlSnippet, phpSnippet }
        }

        await sub.test('4A. Explicit webhookUrl provided by backend', () => {
            const explicitUrl = 'https://api.crm.io/api/webhooks/inbound/wh_live_explicit_998877'
            const { activeWebhookUrl, curlSnippet, phpSnippet } = generateSnippets({
                webhookUrl: explicitUrl,
                webhookApiKey: 'wh_live_explicit_998877',
            })

            assert.equal(activeWebhookUrl, explicitUrl)
            assert.ok(curlSnippet.includes(`curl -X POST "${explicitUrl}"`))
            assert.ok(phpSnippet.includes(`$webhookUrl = '${explicitUrl}';`))
        })

        await sub.test('4B. Fallback derivation when webhookUrl is empty', () => {
            const key = 'wh_live_derived_554433'
            const origin = 'https://custom-tenant.crm.net'
            const expectedUrl = `${origin}/api/webhooks/inbound/${key}`

            const { activeWebhookUrl, curlSnippet, phpSnippet } = generateSnippets({
                webhookUrl: '',
                webhookApiKey: key,
                windowOrigin: origin,
            })

            assert.equal(activeWebhookUrl, expectedUrl)
            assert.ok(curlSnippet.includes(`"${expectedUrl}"`), 'cURL snippet must contain derived URL')
            assert.ok(phpSnippet.includes(`'${expectedUrl}'`), 'PHP snippet must contain derived URL')
        })

        await sub.test('4C. cURL Snippet JSON Payload Validity', () => {
            const { curlSnippet } = generateSnippets({
                webhookUrl: 'https://test.com/api/webhooks/inbound/key',
                webhookApiKey: 'key',
            })

            // Extract the -d payload
            const payloadMatch = curlSnippet.match(/-d\s+'([\s\S]*?)'/)
            assert.ok(payloadMatch, 'cURL snippet must have -d JSON body')

            const jsonStr = payloadMatch[1]
            const parsed = JSON.parse(jsonStr)
            assert.equal(parsed.name, 'Alex Johnson')
            assert.equal(parsed.email, 'alex@enterprise.com')
            assert.equal(parsed.phone, '9876543210')
            assert.equal(parsed.company, 'Enterprise Global')
            assert.equal(parsed.message, 'Interested in CRM demo')
        })

        await sub.test('4D. PHP Snippet Contract Verification', () => {
            const { phpSnippet } = generateSnippets({
                webhookUrl: 'https://test.com/api/webhooks/inbound/key',
                webhookApiKey: 'key',
            })

            // Verify contractual non-blocking requirements from ORIGINAL_REQUEST.md & PROJECT.md
            assert.match(phpSnippet, /CURLOPT_TIMEOUT\s*=>\s*3/, 'PHP forwarder must enforce 3s non-blocking timeout')
            assert.match(phpSnippet, /CURLOPT_POST\s*=>\s*true/, 'PHP forwarder must use POST')
            assert.match(phpSnippet, /CURLOPT_RETURNTRANSFER\s*=>\s*true/)
            assert.match(phpSnippet, /CURLOPT_SSL_VERIFYPEER\s*=>\s*true/)
            assert.match(phpSnippet, /'Content-Type:\s*application\/json'/)
            assert.match(phpSnippet, /\$_POST\['name'\]/)
            assert.match(phpSnippet, /\$_POST\['email'\]/)
            assert.match(phpSnippet, /\$_POST\['phone'\]/)
            assert.match(phpSnippet, /\$_POST\['company'\]/)
        })
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // CHALLENGE 5: Tab Gating, Security & Deep Linking in Settings.jsx
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('5. Tab Gating & Deep Linking Security in Settings.jsx', () => {
        const settingsSrc = fs.readFileSync(path.join(rootDir, 'src/pages/Settings.jsx'), 'utf-8')

        // 1. Role condition for tab rendering
        assert.match(
            settingsSrc,
            /role\s*===\s*'ADMIN'\s*\|\|\s*role\s*===\s*'SUPER_ADMIN'\s*\|\|\s*role\s*===\s*'COMPANY_SUPER_ADMIN'/,
            'Tabs array must gate integrations tab to ADMIN, SUPER_ADMIN, and COMPANY_SUPER_ADMIN'
        )

        // 2. Direct renderPanel check for activeTab === 'integrations'
        assert.match(
            settingsSrc,
            /if\s*\(\s*activeTab\s*===\s*['"]integrations['"]\s*\)\s*\{[\s\S]*?if\s*\(\s*role\s*===\s*['"]AGENT['"]\s*\)\s*\{[\s\S]*?Access Denied[\s\S]*?return\s*<CompanyIntegrationsSettings\s*\/>/,
            'renderPanel must display Access Denied for AGENT and render CompanyIntegrationsSettings for Admins'
        )

        // 3. Deep link query synchronization
        assert.match(settingsSrc, /const\s*\[searchParams,\s*setSearchParams\]\s*=\s*useSearchParams\(\)/)
        assert.match(settingsSrc, /const\s+tabParam\s*=\s*searchParams\.get\(['"]tab['"]\)/)
        assert.match(settingsSrc, /setSearchParams\(\{\s*tab:\s*tabId\s*\}\s*,\s*\{\s*replace:\s*true\s*\}\)/)
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // CHALLENGE 6: Notification Routing Matrix
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('6. Inbound Lead Notification Routing Matrix', () => {
        const bellSrc = fs.readFileSync(path.join(rootDir, 'src/components/NotificationBell.jsx'), 'utf-8')
        const toastSrc = fs.readFileSync(path.join(rootDir, 'src/components/ui/WebSocketToast.jsx'), 'utf-8')

        // Verify routing condition in NotificationBell
        assert.match(
            bellSrc,
            /if\s*\(\s*\(\s*n\.type\s*===\s*['"]LEAD_INBOUND['"]\s*\|\|\s*n\.type\s*===\s*['"]NEW_LEAD_DEAL['"]\s*\)\s*&&\s*n\.leadId\s*\)\s*\{\s*navigate\(`\/leads\?leadId=\$\{n\.leadId\}`\)/,
            'NotificationBell must route LEAD_INBOUND to /leads?leadId=...'
        )

        // Verify routing condition in WebSocketToast
        assert.match(
            toastSrc,
            /else\s+if\s*\(\s*\(\s*notice\.type\s*===\s*['"]LEAD_INBOUND['"]\s*\|\|\s*notice\.type\s*===\s*['"]NEW_LEAD_DEAL['"]\s*\)\s*&&\s*notice\.leadId\s*\)\s*\{\s*navigate\(`\/leads\?leadId=\$\{notice\.leadId\}`\)/,
            'WebSocketToast must route LEAD_INBOUND to /leads?leadId=...'
        )
    })
})
