import test from 'node:test'
import assert from 'node:assert/strict'
import {
    checkMaterialCenterAvailability,
    computeLineItemAmounts,
    computeGstSplit,
} from '../../src/utils/busyGstUtils.js'

test('Frontend E2E Test Suite 2: BUSY Deal Quote Builder, Material Center Stock & GST Engine', async (t) => {

    // =========================================================================
    // 1. PRODUCT LOOKUP & MATERIAL CENTER STOCK AVAILABILITY
    // =========================================================================

    await t.test('1. Material Center stock balance lookup and availability check', () => {
        const inventoryCache = [
            {
                itemName: 'Industrial SS Flange 50mm',
                partNumber: 'FLG-50-SS',
                uom: 'Nos',
                closingRate: 450.00,
                closingBalance: 300,
                hsnCode: '73072100',
                gstRate: 18.0,
                materialCenterBalances: [
                    { materialCenterName: 'Main Store', balance: 250 },
                    { materialCenterName: 'Plant 1 Warehouse', balance: 50 },
                ]
            },
            {
                itemName: 'Industrial SS Flange 100mm',
                partNumber: 'FLG-100-SS',
                uom: 'Nos',
                closingRate: 850.00,
                closingBalance: 0,
                hsnCode: '73072100',
                gstRate: 18.0,
                materialCenterBalances: [
                    { materialCenterName: 'Main Store', balance: 0 },
                ]
            },
            {
                itemName: 'Brass Ball Valve 25mm',
                partNumber: 'VLV-25-BR',
                closingRate: 220.00,
                closingBalance: 120, // No per-center breakdown, global fallback
            }
        ]

        // Test sufficient stock in Main Store
        const check1 = checkMaterialCenterAvailability(inventoryCache[0], 'Main Store', 100)
        assert.equal(check1.availableStock, 250)
        assert.equal(check1.isAvailable, true)
        assert.equal(check1.shortfall, 0)

        // Test insufficient stock in Main Store
        const check2 = checkMaterialCenterAvailability(inventoryCache[0], 'Main Store', 300)
        assert.equal(check2.availableStock, 250)
        assert.equal(check2.isAvailable, false)
        assert.equal(check2.shortfall, 50)

        // Test Plant 1 Warehouse stock
        const check3 = checkMaterialCenterAvailability(inventoryCache[0], 'Plant 1 Warehouse', 40)
        assert.equal(check3.availableStock, 50)
        assert.equal(check3.isAvailable, true)
        assert.equal(check3.shortfall, 0)

        // Test zero stock item
        const check4 = checkMaterialCenterAvailability(inventoryCache[1], 'Main Store', 10)
        assert.equal(check4.availableStock, 0)
        assert.equal(check4.isAvailable, false)
        assert.equal(check4.shortfall, 10)

        // Test global fallback when no per-center list exists
        const check5 = checkMaterialCenterAvailability(inventoryCache[2], 'Main Store', 50)
        assert.equal(check5.availableStock, 120)
        assert.equal(check5.isAvailable, true)
        assert.equal(check5.shortfall, 0)

        // Test null item
        const checkNull = checkMaterialCenterAvailability(null, 'Main Store', 5)
        assert.equal(checkNull.availableStock, 0)
        assert.equal(checkNull.isAvailable, false)
        assert.equal(checkNull.shortfall, 5)
    })

    // =========================================================================
    // 2. LINE ITEM PRICING & DISCOUNT CALCULATIONS
    // =========================================================================

    await t.test('2. Line item gross, discount, and taxable amount computation', () => {
        // Standard line item with 10% discount
        const line1 = computeLineItemAmounts(50, 450.00, 10.0)
        assert.equal(line1.gross, 22500.00)
        assert.equal(line1.discount, 2250.00)
        assert.equal(line1.taxable, 20250.00)

        // Line item with 0% discount
        const line2 = computeLineItemAmounts(15, 850.00, 0)
        assert.equal(line2.gross, 12750.00)
        assert.equal(line2.discount, 0.00)
        assert.equal(line2.taxable, 12750.00)

        // Line item with 100% discount
        const line3 = computeLineItemAmounts(10, 100.00, 100)
        assert.equal(line3.gross, 1000.00)
        assert.equal(line3.discount, 1000.00)
        assert.equal(line3.taxable, 0.00)
    })

    // =========================================================================
    // 3. GST STATE CODE SPLITTING & SECTION 170 ROUND-OFF
    // =========================================================================

    await t.test('3. Indian GST state code extraction and Intrastate vs Interstate splitting', () => {
        // Case A: Intrastate (Maharashtra 27 -> Maharashtra 27)
        const mhToMh = computeGstSplit('27AABCS1429B1Z1', '27AAACB1234C1Z5', 20000.00, 18.0)
        assert.equal(mhToMh.isIntrastate, true)
        assert.equal(mhToMh.cgstRate, 9.0)
        assert.equal(mhToMh.sgstRate, 9.0)
        assert.equal(mhToMh.igstRate, 0.0)
        assert.equal(mhToMh.cgstAmount, 1800.00)
        assert.equal(mhToMh.sgstAmount, 1800.00)
        assert.equal(mhToMh.igstAmount, 0.00)
        assert.equal(mhToMh.totalGst, 3600.00)
        assert.equal(mhToMh.netPayable, 23600.00)
        assert.equal(mhToMh.roundOff, 0.00)

        // Case B: Interstate (Maharashtra 27 -> Delhi 07)
        const mhToDl = computeGstSplit('27AABCS1429B1Z1', '07AAACB1234C1Z5', 20000.00, 18.0)
        assert.equal(mhToDl.isIntrastate, false)
        assert.equal(mhToDl.cgstAmount, 0.00)
        assert.equal(mhToDl.sgstAmount, 0.00)
        assert.equal(mhToDl.igstRate, 18.0)
        assert.equal(mhToDl.igstAmount, 3600.00)
        assert.equal(mhToDl.netPayable, 23600.00)

        // Case C: Section 170 Round-off with fractional paise (Taxable 155.75 at 18% IGST)
        // 155.75 * 18% = 28.035 -> 28.04. ExactGross = 183.79 -> Net = 184.00 -> Round off = +0.21
        const roundTest = computeGstSplit('27AABCS1429B1Z1', '07AAACB1234C1Z5', 155.75, 18.0)
        assert.equal(roundTest.exactGross, 183.79)
        assert.equal(roundTest.netPayable, 184.00)
        assert.equal(roundTest.roundOff, 0.21)
    })

    // =========================================================================
    // 4. MULTI-ERP PAYLOAD SERIALIZATION WITH BUSY FIELD COMPATIBILITY
    // =========================================================================

    await t.test('4. Quote Builder line items array mutation and multi-ERP API payload serialization', () => {
        let lineItems = []

        const addItem = (item) => {
            lineItems = [...lineItems, { id: 'temp-' + Date.now() + Math.random(), ...item }]
        }

        const updateItem = (id, field, value) => {
            lineItems = lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
        }

        const deleteItem = (id) => {
            lineItems = lineItems.filter(item => item.id !== id)
        }

        // Add 2 BUSY items
        addItem({ itemName: 'Steel Flange 50mm', quantity: 5, rate: 450, godownName: 'Main Store' })
        addItem({ itemName: 'Steel Flange 100mm', quantity: 2, rate: 850, godownName: 'Plant 1 Warehouse' })
        assert.equal(lineItems.length, 2)

        // Update first item quantity
        const firstId = lineItems[0].id
        updateItem(firstId, 'quantity', 10)
        assert.equal(lineItems.find(i => i.id === firstId).quantity, 10)

        // Delete second item
        const secondId = lineItems[1].id
        deleteItem(secondId)
        assert.equal(lineItems.length, 1)

        // Serialize to multi-ERP backend payload
        const apiPayload = lineItems.map(item => ({
            itemName: item.itemName,
            tallyItemName: item.itemName,
            busyItemName: item.itemName,
            godownName: item.godownName,
            quantity: item.quantity,
            rate: item.rate,
        }))

        assert.equal(apiPayload[0].itemName, 'Steel Flange 50mm')
        assert.equal(apiPayload[0].busyItemName, 'Steel Flange 50mm')
        assert.equal(apiPayload[0].godownName, 'Main Store')
        assert.equal(apiPayload[0].quantity, 10)
    })
})
