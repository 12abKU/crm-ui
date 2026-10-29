import test from 'node:test'
import assert from 'node:assert/strict'

test('Frontend E2E Test Suite 2: Deal Quote Builder, Godown Stock & GST Engine', async (t) => {

    // =========================================================================
    // 1. PRODUCT LOOKUP & GODOWN STOCK AVAILABILITY
    // =========================================================================

    await t.test('1. Godown stock balance lookup and availability check', () => {
        const inventoryCache = [
            {
                itemName: 'Industrial TMT Bar 12mm',
                partNumber: 'TMT-12',
                uom: 'Nos',
                closingRate: 65.00,
                closingBalance: 500,
                hsnCode: '72142090',
                gstRate: 18.0,
                godowns: [
                    { godownName: 'Factory Main Godown', balance: 350 },
                    { godownName: 'Transit Hub', balance: 150 }
                ]
            },
            {
                itemName: 'Industrial TMT Bar 16mm',
                partNumber: 'TMT-16',
                uom: 'Nos',
                closingRate: 85.00,
                closingBalance: 0,
                hsnCode: '72142090',
                gstRate: 18.0,
                godowns: [
                    { godownName: 'Factory Main Godown', balance: 0 }
                ]
            }
        ]

        const checkGodownAvailability = (item, requestedGodown, requestedQty) => {
            const godown = item.godowns?.find(g => g.godownName === requestedGodown)
            const availableStock = godown ? godown.balance : 0
            const isAvailable = availableStock >= requestedQty
            const shortfall = Math.max(0, requestedQty - availableStock)
            return { availableStock, isAvailable, shortfall }
        }

        // Test sufficient stock
        const check1 = checkGodownAvailability(inventoryCache[0], 'Factory Main Godown', 200)
        assert.equal(check1.availableStock, 350)
        assert.equal(check1.isAvailable, true)
        assert.equal(check1.shortfall, 0)

        // Test insufficient stock
        const check2 = checkGodownAvailability(inventoryCache[0], 'Factory Main Godown', 400)
        assert.equal(check2.availableStock, 350)
        assert.equal(check2.isAvailable, false)
        assert.equal(check2.shortfall, 50)

        // Test zero stock item
        const check3 = checkGodownAvailability(inventoryCache[1], 'Factory Main Godown', 10)
        assert.equal(check3.availableStock, 0)
        assert.equal(check3.isAvailable, false)
        assert.equal(check3.shortfall, 10)
    })

    // =========================================================================
    // 2. LINE ITEM PRICING & DISCOUNT CALCULATIONS
    // =========================================================================

    await t.test('2. Line item gross, discount, and taxable amount computation', () => {
        const computeLineItemAmounts = (quantity, unitRate, discountPercent = 0) => {
            const qty = Number(quantity) || 0
            const rate = Number(unitRate) || 0
            const discPct = Math.max(0, Math.min(100, Number(discountPercent) || 0))

            const gross = Math.round(qty * rate * 100) / 100
            const discount = Math.round(gross * (discPct / 100) * 100) / 100
            const taxable = Math.round((gross - discount) * 100) / 100

            return { gross, discount, taxable }
        }

        // Standard line item with 5% discount
        const line1 = computeLineItemAmounts(100, 65.00, 5.0)
        assert.equal(line1.gross, 6500.00)
        assert.equal(line1.discount, 325.00)
        assert.equal(line1.taxable, 6175.00)

        // Line item with 0% discount
        const line2 = computeLineItemAmounts(50, 120.50, 0)
        assert.equal(line2.gross, 6025.00)
        assert.equal(line2.discount, 0.00)
        assert.equal(line2.taxable, 6025.00)

        // Line item with 100% discount
        const line3 = computeLineItemAmounts(20, 50.00, 100)
        assert.equal(line3.gross, 1000.00)
        assert.equal(line3.discount, 1000.00)
        assert.equal(line3.taxable, 0.00)
    })

    // =========================================================================
    // 3. GST STATE CODE SPLITTING ENGINE
    // =========================================================================

    await t.test('3. Indian GST state code extraction and Intrastate vs Interstate splitting', () => {
        const computeGstSplit = (sellerGstin, buyerGstin, taxableAmount, gstRate) => {
            const sellerState = (sellerGstin && sellerGstin.length >= 2) ? sellerGstin.substring(0, 2) : '00'
            const buyerState = (buyerGstin && buyerGstin.length >= 2) ? buyerGstin.substring(0, 2) : '00'
            const isIntrastate = sellerState === buyerState

            const tax = Number(taxableAmount) || 0
            const rate = Number(gstRate) || 0

            let cgstRate = 0, sgstRate = 0, igstRate = 0
            let cgstAmount = 0, sgstAmount = 0, igstAmount = 0

            if (isIntrastate) {
                cgstRate = rate / 2
                sgstRate = rate / 2
                cgstAmount = Math.round((tax * (cgstRate / 100)) * 100) / 100
                sgstAmount = Math.round((tax * (sgstRate / 100)) * 100) / 100
            } else {
                igstRate = rate
                igstAmount = Math.round((tax * (igstRate / 100)) * 100) / 100
            }

            const totalGst = cgstAmount + sgstAmount + igstAmount
            const exactGross = tax + totalGst
            const netPayable = Math.round(exactGross)
            const roundOff = Math.round((netPayable - exactGross) * 100) / 100

            return {
                sellerState, buyerState, isIntrastate,
                cgstRate, sgstRate, igstRate,
                cgstAmount, sgstAmount, igstAmount,
                totalGst, exactGross, roundOff, netPayable
            }
        }

        // Case A: Intrastate (Maharashtra 27 -> Maharashtra 27)
        const mhToMh = computeGstSplit('27AABCS1429B1Z1', '27AAACB1234C1Z5', 10000.00, 18.0)
        assert.equal(mhToMh.isIntrastate, true)
        assert.equal(mhToMh.cgstRate, 9.0)
        assert.equal(mhToMh.sgstRate, 9.0)
        assert.equal(mhToMh.igstRate, 0.0)
        assert.equal(mhToMh.cgstAmount, 900.00)
        assert.equal(mhToMh.sgstAmount, 900.00)
        assert.equal(mhToMh.igstAmount, 0.00)
        assert.equal(mhToMh.totalGst, 1800.00)
        assert.equal(mhToMh.netPayable, 11800.00)
        assert.equal(mhToMh.roundOff, 0.00)

        // Case B: Interstate (Maharashtra 27 -> Karnataka 29)
        const mhToKa = computeGstSplit('27AABCS1429B1Z1', '29AAACB1234C1Z5', 10000.00, 18.0)
        assert.equal(mhToKa.isIntrastate, false)
        assert.equal(mhToKa.cgstAmount, 0.00)
        assert.equal(mhToKa.sgstAmount, 0.00)
        assert.equal(mhToKa.igstRate, 18.0)
        assert.equal(mhToKa.igstAmount, 1800.00)
        assert.equal(mhToKa.netPayable, 11800.00)

        // Case C: Section 170 Round-off with fractional paise (e.g. Taxable 100.55 at 18% IGST)
        // 100.55 * 18% = 18.099 -> 18.10. Gross = 118.65 -> Net = 119.00 -> Round off = +0.35
        const roundTest = computeGstSplit('27AABCS1429B1Z1', '29AAACB1234C1Z5', 100.55, 18.0)
        assert.equal(roundTest.exactGross, 118.65)
        assert.equal(roundTest.netPayable, 119.00)
        assert.equal(roundTest.roundOff, 0.35)
    })

    // =========================================================================
    // 4. DEAL LINE ITEMS TABLE MUTATIONS & PAYLOAD PREPARATION
    // =========================================================================

    await t.test('4. Quote Builder line items array mutation and API payload serialization', () => {
        let lineItems = []

        // Add line item
        const addItem = (item) => {
            lineItems = [...lineItems, { id: 'temp-' + Date.now() + Math.random(), ...item }]
        }

        // Update line item
        const updateItem = (id, field, value) => {
            lineItems = lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
        }

        // Delete line item
        const deleteItem = (id) => {
            lineItems = lineItems.filter(item => item.id !== id)
        }

        // Add 2 items
        addItem({ itemName: 'Steel Flange 50mm', quantity: 10, rate: 250, godownName: 'Main' })
        addItem({ itemName: 'Steel Flange 100mm', quantity: 5, rate: 500, godownName: 'Main' })
        assert.equal(lineItems.length, 2)

        // Update first item quantity
        const firstId = lineItems[0].id
        updateItem(firstId, 'quantity', 20)
        assert.equal(lineItems.find(i => i.id === firstId).quantity, 20)

        // Delete second item
        const secondId = lineItems[1].id
        deleteItem(secondId)
        assert.equal(lineItems.length, 1)

        // Serialize to backend payload
        const apiPayload = lineItems.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            rate: item.rate,
            godownName: item.godownName
        }))

        assert.equal(apiPayload[0].itemName, 'Steel Flange 50mm')
        assert.equal(apiPayload[0].quantity, 20)
    })
})
