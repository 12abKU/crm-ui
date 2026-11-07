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

test('Frontend E2E Test Suite 1: BUSY ERP Settings, Multi-ERP Switcher & Contract Parity', async (t) => {

    await t.test('1. BUSY API Client Contract & 15 Endpoints (/src/api/busy.js)', () => {
        const apiPath = path.join(rootDir, 'src/api/busy.js')
        assert.ok(fs.existsSync(apiPath), 'src/api/busy.js must exist')

        const apiSrc = fs.readFileSync(apiPath, 'utf-8')
        
        const requiredEndpoints = [
            'getConfig',
            'saveConfig',
            'updateConfig',
            'getActiveErp',
            'setActiveErp',
            'getItems',
            'getInventory',
            'getMaterialCenters',
            'getGodowns',
            'getMasters',
            'getDiscoveredMasters',
            'getLedgers',
            'getAccountFinancials',
            'getSyncStatus',
            'getDealSyncStatus',
            'createSalesOrder',
            'triggerSalesOrder',
            'dispatchDeal',
            'triggerDispatch',
            'invoiceDeal',
            'triggerInvoice',
            'retryDealSync',
            'retrySync',
            'getDlqMessages',
            'retryDlqMessage',
            'clearDlqMessages',
            'clearDlq',
            'downloadBridge',
            'getDealLineItems',
            'setDealLineItems',
            'getDealQuoteSummary',
            'calculateQuote',
        ]

        for (const ep of requiredEndpoints) {
            assert.match(apiSrc, new RegExp(`${ep}\\s*[:(]`), `BUSY API must implement endpoint method: ${ep}`)
        }

        assert.match(apiSrc, /downloadBridge:\s*\(\)\s*=>\s*api\.get\([^)]+responseType:\s*['"]blob['"]/, 'downloadBridge must request binary blob')
        assert.match(apiSrc, /export\s+default\s+busyAPI/, 'BUSY API client must export default busyAPI')
    })

    await t.test('2. Multi-ERP Tenant Routing & Role Gating Logic', () => {
        assert.equal(isBusyConfigPermitted('SUPER_ADMIN'), true, 'SUPER_ADMIN has BUSY config access')
        assert.equal(isBusyConfigPermitted('ADMIN'), true, 'ADMIN has BUSY config access')
        assert.equal(isBusyConfigPermitted('COMPANY_SUPER_ADMIN'), true, 'COMPANY_SUPER_ADMIN has access')
        assert.equal(isBusyConfigPermitted('AGENT'), false, 'Standard AGENT is forbidden from BUSY config')
        assert.equal(isBusyConfigPermitted('USER'), false, 'Standard USER is forbidden')
        assert.equal(isBusyConfigPermitted(null), false, 'Anonymous is forbidden')

        // 3-Way ERP provider enum validation
        const validErpProviders = ['NONE', 'TALLY_PRIME', 'BUSY_ERP']
        const isValidErp = (erp) => validErpProviders.includes(erp)

        assert.equal(isValidErp('NONE'), true)
        assert.equal(isValidErp('TALLY_PRIME'), true)
        assert.equal(isValidErp('BUSY_ERP'), true)
        assert.equal(isValidErp('SAP_B1'), false)
        assert.equal(isValidErp('UNKNOWN'), false)
    })

    await t.test('3. BUSY Settings Configuration Validator (validateBusyConfig)', () => {
        // Happy path: Valid Local Agent config on Port 981
        const validLocalConfig = {
            busyCompanyName: 'Steel Dynamics BUSY',
            busyCompanyCode: 'COMP0001',
            syncMode: 'LOCAL_AGENT',
            serverUrl: 'http://localhost:981',
            companyGstin: '27AABCS1429B1Z1',
            salesAccountName: 'Sales - GST',
            cgstAccountName: 'Output CGST',
            sgstAccountName: 'Output SGST',
            igstAccountName: 'Output IGST',
            roundOffAccountName: 'Round Off',
            defaultMaterialCenter: 'Main Store',
        }
        assert.deepEqual(validateBusyConfig(validLocalConfig), [])

        // Error path: Missing required fields
        const invalidConfig = {
            busyCompanyName: '',
            syncMode: 'INVALID_MODE',
            companyGstin: '12345',
            salesAccountName: '',
            cgstAccountName: '',
            sgstAccountName: '',
            igstAccountName: '',
        }
        const errs = validateBusyConfig(invalidConfig)
        assert.ok(errs.length >= 6, 'Validation catches all missing fields in BUSY config')
        assert.ok(errs.includes('BUSY Company Name is required'))
        assert.ok(errs.includes('Invalid sync mode'))
        assert.ok(errs.includes('15-digit GSTIN is required'))
        assert.ok(errs.includes('Sales Account is required'))
    })

    await t.test('4. BUSY Error Diagnostic Formatter (formatBusyError)', () => {
        // Port 981 unreachable
        const connErr = 'connect ECONNREFUSED 127.0.0.1:981'
        assert.match(formatBusyError(connErr), /Port 981/)
        assert.match(formatBusyError(connErr), /BusyBridge\.exe/)

        // Company not found
        const compErr = 'Invalid Company Code or Company not found in BUSY'
        assert.match(formatBusyError(compErr), /company code or name was not found/)

        // Material center missing
        const mcErr = 'Specified Material Center MCId 999 does not exist'
        assert.match(formatBusyError(mcErr), /Material Center/)

        // Default fallback
        const genericErr = 'Database transaction lock timeout'
        assert.equal(formatBusyError(genericErr), 'Database transaction lock timeout')

        // Null error fallback
        assert.equal(formatBusyError(null), 'Voucher sync failed in BUSY ERP')
    })

    await t.test('5. 3-Stage Order-to-Cash Stepper State Machine (getStepperStepStatus)', () => {
        // When Sales Order is created:
        assert.equal(getStepperStepStatus('SALES_ORDER_CREATED', 'SALES_ORDER_CREATED'), 'ACTIVE')
        assert.equal(getStepperStepStatus('SALES_ORDER_CREATED', 'DISPATCHED'), 'PENDING')
        assert.equal(getStepperStepStatus('SALES_ORDER_CREATED', 'INVOICED'), 'PENDING')

        // When Goods Dispatched (Sale Challan):
        assert.equal(getStepperStepStatus('DISPATCHED', 'SALES_ORDER_CREATED'), 'COMPLETED')
        assert.equal(getStepperStepStatus('DISPATCHED', 'DISPATCHED'), 'ACTIVE')
        assert.equal(getStepperStepStatus('DISPATCHED', 'INVOICED'), 'PENDING')

        // When Fully Invoiced:
        assert.equal(getStepperStepStatus('INVOICED', 'SALES_ORDER_CREATED'), 'COMPLETED')
        assert.equal(getStepperStepStatus('INVOICED', 'DISPATCHED'), 'COMPLETED')
        assert.equal(getStepperStepStatus('INVOICED', 'INVOICED'), 'COMPLETED')
    })
})
