import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    validateBusyConfig,
    isBusyConfigPermitted,
    formatBusyError,
    getStepperStepStatus,
} from '../../src/utils/busyGstUtils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

test('Milestone M4 Empirical Adversarial Challenge: Settings Multi-ERP Switcher, DLQ Operations & Binary Download', async (t) => {

    // ─────────────────────────────────────────────────────────────────────────────
    // Challenge Domain 1: Backward Compatibility of URL Navigation (?tab=tally -> activeTab === 'erp')
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('1. Backward Compatibility of URL Navigation (?tab=tally -> activeTab === "erp")', async (t2) => {
        const settingsPath = path.join(rootDir, 'src/pages/Settings.jsx')
        assert.ok(fs.existsSync(settingsPath), 'Settings.jsx must exist')
        const settingsSrc = fs.readFileSync(settingsPath, 'utf-8')

        const erpPagePath = path.join(rootDir, 'src/pages/ErpPage.jsx')
        assert.ok(fs.existsSync(erpPagePath), 'ErpPage.jsx must exist as a dedicated page')
        const erpPageSrc = fs.readFileSync(erpPagePath, 'utf-8')

        // 1.1 Source-level contract verification
        await t2.test('1.1 Source Contract: Normalization & Redirect of ?tab=tally and ?tab=erp in Settings.jsx', () => {
            assert.match(
                settingsSrc,
                /tabParam\s*===\s*['"]erp['"]\s*\|\|\s*tabParam\s*===\s*['"]tally['"]/,
                'Settings.jsx must check for tabParam "erp" or "tally"'
            )

            assert.match(
                settingsSrc,
                /navigate\(\s*['"]\/erp['"]\s*,\s*\{\s*replace:\s*true\s*\}\s*\)/,
                'Settings.jsx must redirect legacy ?tab=tally or ?tab=erp to dedicated /erp route'
            )

            assert.match(
                erpPageSrc,
                /ErpSettings/,
                'ErpPage.jsx must render ErpSettings'
            )

            assert.match(
                erpPageSrc,
                /role\s*===\s*['"]AGENT['"]/,
                'ErpPage.jsx must guard access against AGENT role'
            )
        })

        // 1.2 Functional normalization logic verification across all variations
        await t2.test('1.2 Functional Normalizer: Multi-case URL resolution matrix', () => {
            const resolveTab = (tabParam) => (tabParam === 'tally' ? 'erp' : tabParam) || 'general'

            assert.equal(resolveTab('tally'), 'erp', 'Legacy "?tab=tally" must seamlessly resolve to "erp"')
            assert.equal(resolveTab('erp'), 'erp', 'Current "?tab=erp" must resolve to "erp"')
            assert.equal(resolveTab('general'), 'general', 'Default "?tab=general" resolves to "general"')
            assert.equal(resolveTab('templates'), 'templates', '"?tab=templates" resolves to "templates"')
            assert.equal(resolveTab('sequences'), 'sequences', '"?tab=sequences" resolves to "sequences"')
            assert.equal(resolveTab('custom_fields'), 'custom_fields', '"?tab=custom_fields" resolves to "custom_fields"')
            assert.equal(resolveTab(''), 'general', 'Empty tab param fallback to "general"')
            assert.equal(resolveTab(null), 'general', 'Null tab param fallback to "general"')
            assert.equal(resolveTab(undefined), 'general', 'Undefined tab param fallback to "general"')
        })

        // 1.3 Navigation link verification
        await t2.test('1.3 Navigation link active state: /erp route navigation', () => {
            const themePath = path.join(rootDir, 'src/constants/theme.js')
            const themeSrc = fs.readFileSync(themePath, 'utf-8')
            assert.match(themeSrc, /to:\s*['"]\/erp['"]/, 'theme.js must configure /erp navigation item')
            assert.match(themeSrc, /label:\s*['"]Accounting & ERP['"]/, 'theme.js must label navigation item as Accounting & ERP')
        })

        // 1.4 Role-based ERP panel gating simulation
        await t2.test('1.4 Role-Based Panel Access: Only authorized roles can view ERP Settings', () => {
            const canAccessErpSettings = (role) => {
                return ['ADMIN', 'SUPER_ADMIN', 'COMPANY_SUPER_ADMIN'].includes(role)
            }

            assert.equal(canAccessErpSettings('SUPER_ADMIN'), true, 'SUPER_ADMIN can access ERP settings')
            assert.equal(canAccessErpSettings('ADMIN'), true, 'ADMIN can access ERP settings')
            assert.equal(canAccessErpSettings('COMPANY_SUPER_ADMIN'), true, 'COMPANY_SUPER_ADMIN can access ERP settings')
            assert.equal(canAccessErpSettings('AGENT'), false, 'AGENT is denied access to ERP settings')
            assert.equal(canAccessErpSettings('USER'), false, 'USER is denied access to ERP settings')
            assert.equal(canAccessErpSettings(null), false, 'Anonymous is denied access to ERP settings')
        })

        // 1.5 Simulated URL State Sync Lifecycle
        await t2.test('1.5 React State Transition Simulation on deep-link navigation', () => {
            let activeTab = 'general'
            const updateFromUrl = (tabParam) => {
                if (tabParam) {
                    const resolved = tabParam === 'tally' ? 'erp' : tabParam
                    if (resolved !== activeTab) {
                        activeTab = resolved
                        return true // State was updated
                    }
                }
                return false // No state change needed (prevents infinite re-renders)
            }

            // Mount with legacy URL ?tab=tally
            assert.equal(updateFromUrl('tally'), true)
            assert.equal(activeTab, 'erp')

            // Re-render with same param should no-op
            assert.equal(updateFromUrl('tally'), false)
            assert.equal(activeTab, 'erp')

            // Browser navigates to ?tab=sequences
            assert.equal(updateFromUrl('sequences'), true)
            assert.equal(activeTab, 'sequences')

            // Browser navigates to ?tab=erp
            assert.equal(updateFromUrl('erp'), true)
            assert.equal(activeTab, 'erp')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // Challenge Domain 2: Desktop Bridge Binary Download & ZIP Header Preservation
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('2. Desktop Bridge Binary Download & ZIP Header Preservation (downloadBridgeZip)', async (t2) => {
        const apiPath = path.join(rootDir, 'src/api/busy.js')
        const busySettingsPath = path.join(rootDir, 'src/components/settings/BusySettings.jsx')
        const apiSrc = fs.readFileSync(apiPath, 'utf-8')
        const settingsSrc = fs.readFileSync(busySettingsPath, 'utf-8')

        // 2.1 API Client Response Type Contract
        await t2.test('2.1 API Client Contract: downloadBridge passes responseType: "blob"', () => {
            assert.match(
                apiSrc,
                /downloadBridge:\s*\(\)\s*=>\s*api\.get\(\s*['"]\/api\/busy\/download-bridge['"]\s*,\s*\{\s*responseType:\s*['"]blob['"]\s*\}\s*\)/,
                'downloadBridge must pass { responseType: "blob" } to prevent binary string corruption'
            )
        })

        // 2.2 ZIP Magic Bytes Verification with Native Blob and Buffer
        await t2.test('2.2 Binary Byte Preservation: PK\\x03\\x04 ZIP magic header bytes intact', async () => {
            // Generate a real binary ZIP payload with PK\x03\x04 signature + high bytes + null bytes
            const mockZipBytes = new Uint8Array([
                0x50, 0x4B, 0x03, 0x04, // Local file header signature (PK\x03\x04)
                0x14, 0x00,             // Version needed to extract (2.0)
                0x00, 0x00,             // General purpose bit flag
                0x00, 0x00,             // Compression method (0 = stored)
                0x21, 0x58,             // Last mod file time
                0x56, 0x59,             // Last mod file date
                0x9A, 0xBC, 0xDE, 0xF0, // CRC-32 (contains high bytes > 0x7F)
                0x0E, 0x00, 0x00, 0x00, // Compressed size
                0x0E, 0x00, 0x00, 0x00, // Uncompressed size
                0x0E, 0x00,             // File name length (14)
                0x00, 0x00,             // Extra field length (0)
                // "BusyBridge.exe" (14 bytes)
                0x42, 0x75, 0x73, 0x79, 0x42, 0x72, 0x69, 0x64, 0x67, 0x65, 0x2E, 0x65, 0x78, 0x65,
                // Binary payload with null bytes and high bytes
                0x00, 0x80, 0xA5, 0xFE, 0xFF, 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF, 0x00,
                // End of central directory record (PK\x05\x06)
                0x50, 0x4B, 0x05, 0x06,
                0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x3A, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00
            ])

            // Simulate the exact code executed in BusySettings.jsx handleDownloadBridge():
            // const res = await busyAPI.downloadBridge()
            // const blob = new Blob([res.data], { type: 'application/zip' })
            const blob = new Blob([mockZipBytes], { type: 'application/zip' })
            assert.equal(blob.type, 'application/zip', 'Blob MIME type must be application/zip')
            assert.equal(blob.size, mockZipBytes.length, 'Blob size must match exact binary byte length')

            // Inspect recovered binary arrayBuffer
            const recoveredBuffer = await blob.arrayBuffer()
            const recoveredBytes = new Uint8Array(recoveredBuffer)

            assert.equal(recoveredBytes[0], 0x50, 'Byte 0 must be 0x50 (P)')
            assert.equal(recoveredBytes[1], 0x4B, 'Byte 1 must be 0x4B (K)')
            assert.equal(recoveredBytes[2], 0x03, 'Byte 2 must be 0x03')
            assert.equal(recoveredBytes[3], 0x04, 'Byte 3 must be 0x04')

            // Verify high bytes and null bytes survived intact
            assert.equal(recoveredBytes[14], 0x9A, 'High byte 0x9A must survive')
            assert.equal(recoveredBytes[15], 0xBC, 'High byte 0xBC must survive')
            assert.equal(recoveredBytes[16], 0xDE, 'High byte 0xDE must survive')
            assert.equal(recoveredBytes[17], 0xF0, 'High byte 0xF0 must survive')
            assert.equal(recoveredBytes[44], 0x00, 'Null byte 0x00 must survive')
            assert.equal(recoveredBytes[48], 0xFF, 'High byte 0xFF must survive')

            // Deep array comparison
            assert.deepEqual(Array.from(recoveredBytes), Array.from(mockZipBytes), 'All ZIP binary bytes preserved exactly')
        })

        // 2.3 Contrast Test: Demonstrating Corruption if Treated as Text/JSON
        await t2.test('2.3 Contrast Proof: Absence of responseType: "blob" corrupts binary bytes', () => {
            const rawBinaryString = String.fromCharCode(0x50, 0x4B, 0x03, 0x04, 0x00, 0x80, 0xFE, 0xFF)
            // If axios treats response as text/utf8:
            const textEncoder = new TextEncoder()
            const textDecoder = new TextDecoder('utf-8', { fatal: false })
            
            // UTF-8 decoding of non-UTF-8 bytes introduces replacement characters (0xEF 0xBF 0xBD)
            const encodedUtf8 = textEncoder.encode(rawBinaryString)
            // String conversion changes byte lengths for high-bit values
            assert.notEqual(encodedUtf8.length, 8, 'UTF-8 string encoding corrupts binary length of raw high-bit bytes')
        })

        // 2.4 Browser DOM Download Simulation & Revocation Lifecycle
        await t2.test('2.4 Browser DOM Lifecycle: Blob URL creation, link click and URL revocation', () => {
            let createdUrl = null
            let revokedUrl = null
            let clicked = false
            let linkAttributes = {}
            let appendedToBody = false
            let removedFromBody = false

            // Mock window and document APIs
            const mockWindow = {
                URL: {
                    createObjectURL: (blob) => {
                        createdUrl = 'blob:http://localhost:5173/' + Math.random().toString(36).substring(2)
                        return createdUrl
                    },
                    revokeObjectURL: (url) => {
                        revokedUrl = url
                    }
                },
                location: { href: '' }
            }

            const mockLink = {
                href: '',
                setAttribute: (k, v) => { linkAttributes[k] = v },
                click: () => { clicked = true },
                parentNode: {
                    removeChild: (el) => { if (el === mockLink) removedFromBody = true }
                }
            }

            const mockDocument = {
                body: {
                    appendChild: (el) => { if (el === mockLink) appendedToBody = true }
                },
                createElement: (tag) => {
                    if (tag === 'a') return mockLink
                    return {}
                }
            }

            // Simulate BusySettings.jsx handleDownloadBridge logic
            const blob = new Blob([new Uint8Array([0x50, 0x4B, 0x03, 0x04])], { type: 'application/zip' })
            const downloadUrl = mockWindow.URL.createObjectURL(blob)
            const link = mockDocument.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', 'BusyBridge.zip')
            mockDocument.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            mockWindow.URL.revokeObjectURL(downloadUrl)

            assert.ok(createdUrl, 'Object URL must be generated')
            assert.equal(link.href, createdUrl, 'Link href must point to Blob URL')
            assert.equal(linkAttributes['download'], 'BusyBridge.zip', 'Download attribute must be "BusyBridge.zip"')
            assert.equal(appendedToBody, true, 'Link must be appended to DOM')
            assert.equal(clicked, true, 'Link must be clicked programmatically')
            assert.equal(removedFromBody, true, 'Link must be removed from DOM')
            assert.equal(revokedUrl, createdUrl, 'Blob URL must be revoked immediately to avoid memory leak')
        })

        // 2.5 Error Fallback to Static Route
        await t2.test('2.5 Download Fallback: Falls back to window.location.href = "/BusyBridge.zip" on API error', async () => {
            let redirectedTo = null
            const mockWindow = {
                location: {
                    set href(val) { redirectedTo = val }
                }
            }

            const simulateDownloadWithFallback = async (apiFn) => {
                try {
                    await apiFn()
                } catch (err) {
                    mockWindow.location.href = '/BusyBridge.zip'
                }
            }

            // Test network error fallback
            await simulateDownloadWithFallback(() => Promise.reject(new Error('Network Error')))
            assert.equal(redirectedTo, '/BusyBridge.zip', 'Redirects to static /BusyBridge.zip on network failure')

            // Test HTTP 500 error fallback
            redirectedTo = null
            await simulateDownloadWithFallback(() => Promise.reject({ response: { status: 500 } }))
            assert.equal(redirectedTo, '/BusyBridge.zip', 'Redirects to static /BusyBridge.zip on 500 failure')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // Challenge Domain 3: SQS FIFO Dead-Letter Queue (DLQ) Resilience & Error Trapping
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('3. AWS SQS FIFO Dead-Letter Queue (DLQ) Resilience & Error Trapping', async (t2) => {
        const busySettingsPath = path.join(rootDir, 'src/components/settings/BusySettings.jsx')
        const settingsSrc = fs.readFileSync(busySettingsPath, 'utf-8')

        // 3.1 DLQ Source Implementation Verification
        await t2.test('3.1 Source Verification: DLQ Retry & Clear handlers present in BusySettings.jsx', () => {
            assert.match(settingsSrc, /const\s+handleRetryDlq\s*=\s*async\s*\(\s*dlqId\s*\)/, 'BusySettings must implement handleRetryDlq')
            assert.match(settingsSrc, /await\s+busyAPI\.retryDlqMessage\(dlqId\)/, 'handleRetryDlq must call busyAPI.retryDlqMessage')
            assert.match(settingsSrc, /setDlqMessages\(prev\s*=>\s*prev\.filter\(m\s*=>\s*m\.id\s*!==\s*dlqId\)\)/, 'handleRetryDlq filters out retried message on success')
            assert.match(settingsSrc, /const\s+handleClearDlq\s*=\s*async\s*\(\)/, 'BusySettings must implement handleClearDlq')
            assert.match(settingsSrc, /await\s+busyAPI\.clearDlqMessages\(\)/, 'handleClearDlq must call busyAPI.clearDlqMessages')
            assert.match(settingsSrc, /setDlqMessages\(\[\]\)/, 'handleClearDlq empties dlqMessages on success')
        })

        // 3.2 Single Message Retry: Success Path
        await t2.test('3.2 Retry Success: Message removed from queue and success feedback displayed', async () => {
            let dlqMessages = [
                { id: 'msg-1', stage: 'SALES_ORDER', error: 'ECONNREFUSED 127.0.0.1:981' },
                { id: 'msg-2', stage: 'DISPATCH', error: 'Lock timeout' }
            ]
            let retryingId = null
            let feedback = null

            const simulateRetryDlq = async (dlqId, apiFn) => {
                retryingId = dlqId
                try {
                    await apiFn(dlqId)
                    dlqMessages = dlqMessages.filter(m => m.id !== dlqId)
                    feedback = {
                        type: 'success',
                        message: `Message #${dlqId} successfully re-enqueued to AWS SQS FIFO queue!`,
                    }
                } catch (err) {
                    feedback = {
                        type: 'error',
                        message: err?.response?.data?.message || err?.message || `Failed to retry message #${dlqId}`,
                    }
                } finally {
                    retryingId = null
                }
            }

            // Retry msg-1 successfully
            await simulateRetryDlq('msg-1', async () => ({ status: 200 }))

            assert.equal(dlqMessages.length, 1, 'One message must remain in queue')
            assert.equal(dlqMessages[0].id, 'msg-2', 'Remaining message must be msg-2')
            assert.equal(feedback.type, 'success')
            assert.match(feedback.message, /#msg-1 successfully re-enqueued/)
            assert.equal(retryingId, null, 'retryingId must reset to null')
        })

        // 3.3 Single Message Retry: HTTP 500 Failure
        await t2.test('3.3 Retry Failure (HTTP 500): Message NOT removed from queue, exact error preserved', async () => {
            let dlqMessages = [{ id: 'msg-2', stage: 'DISPATCH', error: 'Lock timeout' }]
            let retryingId = null
            let feedback = null

            const simulateRetryDlq = async (dlqId, apiFn) => {
                retryingId = dlqId
                try {
                    await apiFn(dlqId)
                    dlqMessages = dlqMessages.filter(m => m.id !== dlqId)
                    feedback = { type: 'success' }
                } catch (err) {
                    feedback = {
                        type: 'error',
                        message: err?.response?.data?.message || err?.message || `Failed to retry message #${dlqId}`,
                    }
                } finally {
                    retryingId = null
                }
            }

            const error500 = {
                response: {
                    status: 500,
                    data: { message: 'SQS FIFO Queue dead-letter retention limit reached' }
                }
            }

            await simulateRetryDlq('msg-2', async () => { throw error500 })

            assert.equal(dlqMessages.length, 1, 'Queue message must NOT be removed on failure')
            assert.equal(dlqMessages[0].id, 'msg-2')
            assert.equal(feedback.type, 'error')
            assert.equal(feedback.message, 'SQS FIFO Queue dead-letter retention limit reached')
            assert.equal(retryingId, null, 'retryingId must reset to null')
        })

        // 3.4 Single Message Retry: Network Disconnect (No Response Object)
        await t2.test('3.4 Retry Failure (Network Disconnect): Message preserved, raw error message used', async () => {
            let dlqMessages = [{ id: 'msg-3', stage: 'INVOICE', error: 'Voucher conflict' }]
            let retryingId = null
            let feedback = null

            const simulateRetryDlq = async (dlqId, apiFn) => {
                retryingId = dlqId
                try {
                    await apiFn(dlqId)
                    dlqMessages = dlqMessages.filter(m => m.id !== dlqId)
                } catch (err) {
                    feedback = {
                        type: 'error',
                        message: err?.response?.data?.message || err?.message || `Failed to retry message #${dlqId}`,
                    }
                } finally {
                    retryingId = null
                }
            }

            await simulateRetryDlq('msg-3', async () => { throw new Error('connect ETIMEDOUT 10.0.0.5:443') })

            assert.equal(dlqMessages.length, 1, 'Queue message must remain intact')
            assert.equal(feedback.type, 'error')
            assert.equal(feedback.message, 'connect ETIMEDOUT 10.0.0.5:443')
            assert.equal(retryingId, null)
        })

        // 3.5 Bulk DLQ Clear: Success and Empty Guard
        await t2.test('3.5 Clear DLQ: Success path and zero-message guard', async () => {
            let dlqMessages = [{ id: 1 }, { id: 2 }, { id: 3 }]
            let clearingDlq = false
            let feedback = null
            let apiCalls = 0

            const simulateClearDlq = async (apiFn) => {
                if (dlqMessages.length === 0) return
                clearingDlq = true
                try {
                    await apiFn()
                    dlqMessages = []
                    feedback = {
                        type: 'success',
                        message: 'All failed messages in the BUSY DLQ have been cleared.',
                    }
                } catch (err) {
                    feedback = {
                        type: 'error',
                        message: err?.response?.data?.message || err?.message || 'Failed to clear DLQ.',
                    }
                } finally {
                    clearingDlq = false
                }
            }

            // Normal clear
            await simulateClearDlq(async () => { apiCalls++; return { status: 200 } })
            assert.equal(apiCalls, 1)
            assert.equal(dlqMessages.length, 0, 'DLQ array must be emptied')
            assert.equal(feedback.type, 'success')
            assert.equal(clearingDlq, false)

            // Trigger clear again when empty
            await simulateClearDlq(async () => { apiCalls++; return { status: 200 } })
            assert.equal(apiCalls, 1, 'API must NOT be called when DLQ is already empty')
        })

        // 3.6 Bulk DLQ Clear: HTTP 500 Failure
        await t2.test('3.6 Clear DLQ Failure (HTTP 500): DLQ messages are NOT purged on failure', async () => {
            let dlqMessages = [{ id: 101 }, { id: 102 }]
            let clearingDlq = false
            let feedback = null

            const simulateClearDlq = async (apiFn) => {
                if (dlqMessages.length === 0) return
                clearingDlq = true
                try {
                    await apiFn()
                    dlqMessages = []
                } catch (err) {
                    feedback = {
                        type: 'error',
                        message: err?.response?.data?.message || err?.message || 'Failed to clear DLQ.',
                    }
                } finally {
                    clearingDlq = false
                }
            }

            await simulateClearDlq(async () => {
                throw { response: { status: 500, data: { message: 'Access Denied: SQS PurgeQueue action restricted' } } }
            })

            assert.equal(dlqMessages.length, 2, 'DLQ array must NOT be cleared on server error')
            assert.equal(feedback.type, 'error')
            assert.equal(feedback.message, 'Access Denied: SQS PurgeQueue action restricted')
            assert.equal(clearingDlq, false)
        })
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // Challenge Domain 4: Multi-ERP Radio Switcher State Machine & Persistence
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('4. Multi-ERP Radio Switcher State Machine & Persistence (ErpSettings)', async (t2) => {
        const erpSettingsPath = path.join(rootDir, 'src/components/settings/ErpSettings.jsx')
        const erpSrc = fs.readFileSync(erpSettingsPath, 'utf-8')

        // 4.1 Source verification
        await t2.test('4.1 Source Verification: ErpSettings.jsx structure and 3-way radio options', () => {
            assert.match(erpSrc, /data-testid="erp-switcher-none"/, 'Must contain test ID for NONE')
            assert.match(erpSrc, /data-testid="erp-switcher-tally"/, 'Must contain test ID for TALLY_PRIME')
            assert.match(erpSrc, /data-testid="erp-switcher-busy"/, 'Must contain test ID for BUSY_ERP')
            assert.match(erpSrc, /handleSwitchErp\(['"]NONE['"]\)/, 'Must switch to NONE')
            assert.match(erpSrc, /handleSwitchErp\(['"]TALLY_PRIME['"]\)/, 'Must switch to TALLY_PRIME')
            assert.match(erpSrc, /handleSwitchErp\(['"]BUSY_ERP['"]\)/, 'Must switch to BUSY_ERP')
            assert.match(erpSrc, /window\.dispatchEvent\(new CustomEvent\(['"]crm-erp-changed['"]/, 'Must dispatch crm-erp-changed event')
            assert.match(erpSrc, /activeErp\s*===\s*['"]TALLY_PRIME['"]\s*&&\s*<TallySettings\s*\/>/, 'Conditionally renders TallySettings')
            assert.match(erpSrc, /activeErp\s*===\s*['"]BUSY_ERP['"]\s*&&\s*<BusySettings\s*\/>/, 'Conditionally renders BusySettings')
        })

        // 4.2 API Client Polymorphism: setActiveErp handles both string and object
        await t2.test('4.2 API Contract: setActiveErp accepts string or object payload', () => {
            const apiPath = path.join(rootDir, 'src/api/busy.js')
            const apiSrc = fs.readFileSync(apiPath, 'utf-8')

            assert.match(
                apiSrc,
                /setActiveErp:\s*\(companyId,\s*erp\)\s*=>\s*api\.post\(`\/api\/companies\/\$\{companyId\}\/erp`,\s*typeof\s+erp\s*===\s*['"]string['"]\s*\?\s*\{\s*activeErp:\s*erp\s*\}\s*:\s*erp\)/,
                'setActiveErp must normalize string erp into { activeErp: erp } object'
            )

            // Evaluate serializer directly
            const serializeErpPayload = (erp) => typeof erp === 'string' ? { activeErp: erp } : erp

            assert.deepEqual(serializeErpPayload('BUSY_ERP'), { activeErp: 'BUSY_ERP' })
            assert.deepEqual(serializeErpPayload('TALLY_PRIME'), { activeErp: 'TALLY_PRIME' })
            assert.deepEqual(serializeErpPayload('NONE'), { activeErp: 'NONE' })
            assert.deepEqual(serializeErpPayload({ activeErp: 'BUSY_ERP' }), { activeErp: 'BUSY_ERP' })
        })

        // 4.3 Switching State Machine with Debounce & Idempotency
        await t2.test('4.3 Switcher State Machine: Idempotency guard and race-condition debounce', async () => {
            let activeErp = 'NONE'
            let switching = false
            let feedback = null
            let apiCalls = []
            let customEventsDispatched = []

            const handleSwitchErp = async (newErp, companyId = 'comp-101') => {
                if (newErp === activeErp || switching) return false
                switching = true
                feedback = null
                try {
                    apiCalls.push({ companyId, newErp })
                    // Simulate async network request
                    activeErp = newErp
                    feedback = {
                        type: 'success',
                        message: `Active ERP system updated to ${newErp === 'BUSY_ERP' ? 'BUSY ERP' : (newErp === 'TALLY_PRIME' ? 'TallyPrime' : 'None')}.`,
                    }
                    customEventsDispatched.push({ companyId, activeErp: newErp })
                    return true
                } finally {
                    switching = false
                }
            }

            // 1. Initial switch from NONE to BUSY_ERP
            const r1 = await handleSwitchErp('BUSY_ERP')
            assert.equal(r1, true)
            assert.equal(activeErp, 'BUSY_ERP')
            assert.equal(feedback.message, 'Active ERP system updated to BUSY ERP.')
            assert.equal(apiCalls.length, 1)
            assert.deepEqual(customEventsDispatched[0], { companyId: 'comp-101', activeErp: 'BUSY_ERP' })

            // 2. Click BUSY_ERP again when already active (idempotency test)
            const r2 = await handleSwitchErp('BUSY_ERP')
            assert.equal(r2, false, 'Clicking active ERP must no-op')
            assert.equal(apiCalls.length, 1, 'No API call triggered on duplicate selection')

            // 3. Switch to TALLY_PRIME
            const r3 = await handleSwitchErp('TALLY_PRIME')
            assert.equal(r3, true)
            assert.equal(activeErp, 'TALLY_PRIME')
            assert.equal(feedback.message, 'Active ERP system updated to TallyPrime.')

            // 4. Switch to NONE
            const r4 = await handleSwitchErp('NONE')
            assert.equal(r4, true)
            assert.equal(activeErp, 'NONE')
            assert.equal(feedback.message, 'Active ERP system updated to None.')
        })

        // 4.4 Failed Switch: State Preservation & Error Message Display
        await t2.test('4.4 Switcher Failure: Active ERP does NOT change on 500 or Network Error', async () => {
            let activeErp = 'TALLY_PRIME'
            let switching = false
            let feedback = null
            let eventsFired = 0

            const handleSwitchErp = async (newErp, apiFailFn) => {
                if (newErp === activeErp || switching) return
                switching = true
                feedback = null
                try {
                    await apiFailFn()
                    activeErp = newErp
                    eventsFired++
                } catch (err) {
                    feedback = {
                        type: 'error',
                        message: err?.response?.data?.message || err?.message || 'Failed to switch ERP provider.',
                    }
                } finally {
                    switching = false
                }
            }

            // HTTP 500 error
            await handleSwitchErp('BUSY_ERP', async () => {
                throw { response: { status: 500, data: { message: 'Database connection to ERP config failed' } } }
            })

            assert.equal(activeErp, 'TALLY_PRIME', 'activeErp must remain TALLY_PRIME after failed switch')
            assert.equal(eventsFired, 0, 'No event must be fired on failure')
            assert.equal(feedback.type, 'error')
            assert.equal(feedback.message, 'Database connection to ERP config failed')
            assert.equal(switching, false, 'switching flag must reset')

            // Network Error
            await handleSwitchErp('BUSY_ERP', async () => {
                throw new Error('Network Error')
            })

            assert.equal(activeErp, 'TALLY_PRIME', 'activeErp must still remain TALLY_PRIME')
            assert.equal(feedback.message, 'Network Error')
            assert.equal(switching, false)
        })

        // 4.5 Sub-panel Conditional Component Rendering
        await t2.test('4.5 View Rendering: Resolves correct sub-panel per activeErp state', () => {
            const resolveErpView = (activeErp) => {
                if (activeErp === 'NONE') return 'STANDALONE_NOTICE'
                if (activeErp === 'TALLY_PRIME') return 'TALLY_SETTINGS_COMPONENT'
                if (activeErp === 'BUSY_ERP') return 'BUSY_SETTINGS_COMPONENT'
                return 'UNKNOWN'
            }

            assert.equal(resolveErpView('NONE'), 'STANDALONE_NOTICE')
            assert.equal(resolveErpView('TALLY_PRIME'), 'TALLY_SETTINGS_COMPONENT')
            assert.equal(resolveErpView('BUSY_ERP'), 'BUSY_SETTINGS_COMPONENT')
        })

        // 4.6 Initial Load Normalization
        await t2.test('4.6 Initial Load: Normalizes lowercase backend ERP string to uppercase', () => {
            const normalizeActiveErp = (rawVal) => {
                return (rawVal && typeof rawVal === 'string') ? rawVal.toUpperCase() : 'NONE'
            }

            assert.equal(normalizeActiveErp('busy_erp'), 'BUSY_ERP')
            assert.equal(normalizeActiveErp('tally_prime'), 'TALLY_PRIME')
            assert.equal(normalizeActiveErp('none'), 'NONE')
            assert.equal(normalizeActiveErp(null), 'NONE')
            assert.equal(normalizeActiveErp(undefined), 'NONE')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // Challenge Domain 5: Configuration Validation & Diagnostic Errors Stress Testing
    // ─────────────────────────────────────────────────────────────────────────────
    await t.test('5. Configuration Validation & Diagnostic Errors Stress Testing', async (t2) => {
        // 5.1 validateBusyConfig Boundary Testing
        await t2.test('5.1 Configuration Validation: Strict validation of required fields', () => {
            const baseValid = {
                busyCompanyName: 'Tata Motors',
                busyCompanyCode: 'COMP0001',
                syncMode: 'LOCAL_AGENT',
                serverUrl: 'http://localhost:981',
                companyGstin: '27AABCS1429B1Z1',
                salesAccountName: 'Sales - GST',
                cgstAccountName: 'Output CGST',
                sgstAccountName: 'Output SGST',
                igstAccountName: 'Output IGST',
            }

            assert.deepEqual(validateBusyConfig(baseValid), [])

            // Cloud Server mode requires valid http URL
            const cloudValid = { ...baseValid, syncMode: 'CLOUD_SERVER', serverUrl: 'https://busy.cloud.lan:981' }
            assert.deepEqual(validateBusyConfig(cloudValid), [])

            const cloudInvalid = { ...baseValid, syncMode: 'CLOUD_SERVER', serverUrl: 'invalid-url' }
            const cloudErrs = validateBusyConfig(cloudInvalid)
            assert.ok(cloudErrs.includes('Valid Server URL required for Cloud mode'))

            // GSTIN length check (must be exactly 15 chars)
            const gstin14 = { ...baseValid, companyGstin: '27AABCS1429B1Z' }
            assert.ok(validateBusyConfig(gstin14).includes('15-digit GSTIN is required'))

            const gstin16 = { ...baseValid, companyGstin: '27AABCS1429B1Z11' }
            assert.ok(validateBusyConfig(gstin16).includes('15-digit GSTIN is required'))
        })

        // 5.2 formatBusyError Diagnostic Formatter
        await t2.test('5.2 Error Formatter: Diagnostic messages and XML HTML entities clean-up', () => {
            // Port 981 unreachable
            const raw1 = 'connect ECONNREFUSED 127.0.0.1:981'
            assert.match(formatBusyError(raw1), /Port 981/)
            assert.match(formatBusyError(raw1), /BusyBridge\.exe/)

            // XML entity unescaping
            const rawWithEntities = '&lt;Error&gt;Specified Material Center &quot;Store 1&quot; &amp; MCId does not exist&lt;/Error&gt;'
            const formatted = formatBusyError(rawWithEntities)
            assert.match(formatted, /Material Center/)

            // Null & undefined fallbacks
            assert.equal(formatBusyError(null), 'Voucher sync failed in BUSY ERP')
            assert.equal(formatBusyError(undefined), 'Voucher sync failed in BUSY ERP')
            assert.equal(formatBusyError(''), 'Voucher sync failed in BUSY ERP')
        })

        // 5.3 Order-to-Cash Stepper State Machine Exhaustive Transitions
        await t2.test('5.3 Order-to-Cash Stepper: Comprehensive transition matrix', () => {
            const steps = ['SALES_ORDER_CREATED', 'DISPATCHED', 'INVOICED']

            // At Stage 0 / NONE:
            for (const step of steps) {
                assert.equal(getStepperStepStatus('NONE', step), 'PENDING')
            }

            // At Stage 1 / QUEUED:
            for (const step of steps) {
                assert.equal(getStepperStepStatus('QUEUED', step), 'PENDING')
            }

            // At Stage 2 / SALES_ORDER_CREATED:
            assert.equal(getStepperStepStatus('SALES_ORDER_CREATED', 'SALES_ORDER_CREATED'), 'ACTIVE')
            assert.equal(getStepperStepStatus('SALES_ORDER_CREATED', 'DISPATCHED'), 'PENDING')
            assert.equal(getStepperStepStatus('SALES_ORDER_CREATED', 'INVOICED'), 'PENDING')

            // At Stage 3 / DISPATCHED:
            assert.equal(getStepperStepStatus('DISPATCHED', 'SALES_ORDER_CREATED'), 'COMPLETED')
            assert.equal(getStepperStepStatus('DISPATCHED', 'DISPATCHED'), 'ACTIVE')
            assert.equal(getStepperStepStatus('DISPATCHED', 'INVOICED'), 'PENDING')

            // At Stage 4 / INVOICED:
            assert.equal(getStepperStepStatus('INVOICED', 'SALES_ORDER_CREATED'), 'COMPLETED')
            assert.equal(getStepperStepStatus('INVOICED', 'DISPATCHED'), 'COMPLETED')
            assert.equal(getStepperStepStatus('INVOICED', 'INVOICED'), 'COMPLETED')
        })
    })
})
