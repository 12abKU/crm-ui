import test from 'node:test'
import assert from 'node:assert/strict'
import {
    checkMaterialCenterAvailability,
    computeLineItemAmounts,
    computeGstSplit,
    getStepperStepStatus,
    formatBusyError,
    validateBusyConfig,
} from '../../src/utils/busyGstUtils.js'

test('Frontend Adversarial & Empirical Challenge Suite: Deal Quote Builder, Material Center Stock & Stepper State Machine', async (t) => {

    // =========================================================================
    // 1. STRESS TESTS: checkMaterialCenterAvailability
    // =========================================================================

    await t.test('1.1 Zero Stock handling across centers and fallback levels', () => {
        // Item with a center explicitly at 0 balance
        const zeroStockItem = {
            itemName: 'Piston Ring 85mm',
            materialCenterBalances: [
                { materialCenterName: 'Main Store', balance: 0 },
                { materialCenterName: 'Factory Yard', closingBalance: 0 },
                { materialCenterName: 'Assembly Line', stock: 0 },
            ]
        }

        // Positive requested quantity against 0 stock
        const res1 = checkMaterialCenterAvailability(zeroStockItem, 'Main Store', 1)
        assert.equal(res1.availableStock, 0, 'availableStock should be 0')
        assert.equal(res1.isAvailable, false, 'isAvailable must be false when requesting > 0 against 0 stock')
        assert.equal(res1.shortfall, 1, 'shortfall should be 1')

        // Zero requested quantity against 0 stock: 0 >= 0 is true, shortfall 0
        const resZeroReq = checkMaterialCenterAvailability(zeroStockItem, 'Main Store', 0)
        assert.equal(resZeroReq.availableStock, 0)
        assert.equal(resZeroReq.isAvailable, true)
        assert.equal(resZeroReq.shortfall, 0)

        // Negative requested quantity: Number(-5) <= 0
        const resNegReq = checkMaterialCenterAvailability(zeroStockItem, 'Main Store', -5)
        assert.equal(resNegReq.availableStock, 0)
        assert.equal(resNegReq.isAvailable, true)
        assert.equal(resNegReq.shortfall, 0)

        // Nullish requested quantity: should default to 0
        const resNullReq = checkMaterialCenterAvailability(zeroStockItem, 'Main Store', null)
        assert.equal(resNullReq.availableStock, 0)
        assert.equal(resNullReq.isAvailable, true)
        assert.equal(resNullReq.shortfall, 0)
    })

    await t.test('1.2 Negative Balance handling (oversold/unbilled issue state in BUSY)', () => {
        // In BUSY ERP, material centers can have negative balances if stock was issued before purchase receipt
        const negativeStockItem = {
            itemName: 'Crankshaft Bearing 45mm',
            materialCenterBalances: [
                { materialCenterName: 'Main Store', balance: -15 },
                { materialCenterName: 'Plant 1', balance: -2.5 },
            ]
        }

        // Requesting 10 units when balance is -15: shortfall must be 10 - (-15) = 25
        const res1 = checkMaterialCenterAvailability(negativeStockItem, 'Main Store', 10)
        assert.equal(res1.availableStock, -15, 'availableStock must reflect exact negative balance')
        assert.equal(res1.isAvailable, false, 'Negative stock cannot fulfill any positive demand')
        assert.equal(res1.shortfall, 25, 'Shortfall must account for negative deficit + requested quantity')

        // Requesting 0 units when balance is -15
        const resZero = checkMaterialCenterAvailability(negativeStockItem, 'Main Store', 0)
        assert.equal(resZero.availableStock, -15)
        assert.equal(resZero.isAvailable, false, 'Zero quantity is not available if stock is in negative deficit (-15 >= 0 is false)')
        assert.equal(resZero.shortfall, 15, 'Shortfall when requesting 0 is the 15 units deficit')

        // Fractional negative balance
        const resFrac = checkMaterialCenterAvailability(negativeStockItem, 'Plant 1', 5)
        assert.equal(resFrac.availableStock, -2.5)
        assert.equal(resFrac.isAvailable, false)
        assert.equal(resFrac.shortfall, 7.5)
    })

    await t.test('1.3 Boundary Stock conditions (qty === balance and fractional precision)', () => {
        const item = {
            itemName: 'Sheet Metal 2mm CR',
            materialCenterBalances: [
                { materialCenterName: 'Main Store', balance: 50 },
                { materialCenterName: 'Raw Materials', balance: 0.75 }, // 750 grams / fractional MT
            ]
        }

        // Exact match (qty === balance)
        const exact = checkMaterialCenterAvailability(item, 'Main Store', 50)
        assert.equal(exact.availableStock, 50)
        assert.equal(exact.isAvailable, true, 'qty === balance must be available')
        assert.equal(exact.shortfall, 0, 'qty === balance has 0 shortfall')

        // Just over boundary (qty = balance + 1)
        const overByOne = checkMaterialCenterAvailability(item, 'Main Store', 51)
        assert.equal(overByOne.isAvailable, false)
        assert.equal(overByOne.shortfall, 1)

        // Fractional boundary: exact match
        const exactFrac = checkMaterialCenterAvailability(item, 'Raw Materials', 0.75)
        assert.equal(exactFrac.availableStock, 0.75)
        assert.equal(exactFrac.isAvailable, true)
        assert.equal(exactFrac.shortfall, 0)

        // Fractional boundary: slight deficit (0.76 vs 0.75)
        const overFrac = checkMaterialCenterAvailability(item, 'Raw Materials', 0.76)
        assert.equal(overFrac.availableStock, 0.75)
        assert.equal(overFrac.isAvailable, false)
        assert.ok(Math.abs(overFrac.shortfall - 0.01) < 1e-9)
    })

    await t.test('1.4 Missing, Unmapped, or Null Material Center and Fallbacks', () => {
        const itemWithCenters = {
            itemName: 'Alternator 12V 90A',
            materialCenterBalances: [
                { materialCenterName: 'Main Store', balance: 40 },
                { materialCenterName: 'Regional Depot', balance: 15 },
            ]
        }

        // Requesting a non-existent material center
        const missing = checkMaterialCenterAvailability(itemWithCenters, 'NonExistent Store', 10)
        assert.equal(missing.availableStock, 0, 'Unmapped center returns 0 stock')
        assert.equal(missing.isAvailable, false)
        assert.equal(missing.shortfall, 10)

        // Center name case-insensitivity and whitespace trimming
        const casePadded = checkMaterialCenterAvailability(itemWithCenters, '   mAiN sToRe   ', 20)
        assert.equal(casePadded.availableStock, 40, 'Should match case-insensitively with trimmed whitespace')
        assert.equal(casePadded.isAvailable, true)
        assert.equal(casePadded.shortfall, 0)

        // Requested material center is undefined or empty: defaults to 'Main Store'
        const defTarget = checkMaterialCenterAvailability(itemWithCenters, null, 15)
        assert.equal(defTarget.availableStock, 40, 'Null target defaults to Main Store')
        assert.equal(defTarget.isAvailable, true)

        // Item with NO centers list: should fall back to global closingBalance or balance
        const itemGlobalOnly = {
            itemName: 'Starter Motor Cable',
            closingBalance: 88,
        }
        const fallbackClosing = checkMaterialCenterAvailability(itemGlobalOnly, 'Main Store', 30)
        assert.equal(fallbackClosing.availableStock, 88, 'Should fall back to global closingBalance')
        assert.equal(fallbackClosing.isAvailable, true)

        const itemBalanceOnly = {
            itemName: 'Starter Motor Bolt',
            balance: 125,
        }
        const fallbackBal = checkMaterialCenterAvailability(itemBalanceOnly, 'Main Store', 25)
        assert.equal(fallbackBal.availableStock, 125, 'Should fall back to global balance')
        assert.equal(fallbackBal.isAvailable, true)

        // Item completely null or undefined
        const nullItem = checkMaterialCenterAvailability(null, 'Main Store', 12)
        assert.equal(nullItem.availableStock, 0)
        assert.equal(nullItem.isAvailable, false)
        assert.equal(nullItem.shortfall, 12)
    })

    await t.test('1.5 Multiple Centers isolation, naming aliases, and nullish balance preservation', () => {
        const complexItem = {
            itemName: 'Fuel Injection Pump',
            // Supports multiple property name aliases: materialCenters, godowns, godownBalances
            materialCenters: [
                { materialCenterName: 'Main Store', balance: 10 },
                { name: 'Secondary Store', closingBalance: 20 },
                { godownName: 'Godown West', stock: 30 },
                { materialCenterName: 'Quarantine Depot', balance: 0, closingBalance: 99 }, // 0 must NOT fall through to 99
                { name: 'Scrap Yard', balance: -5 },
            ]
        }

        // Check alias `name` and `closingBalance`
        const c2 = checkMaterialCenterAvailability(complexItem, 'Secondary Store', 15)
        assert.equal(c2.availableStock, 20)
        assert.equal(c2.isAvailable, true)

        // Check alias `godownName` and `stock`
        const c3 = checkMaterialCenterAvailability(complexItem, 'Godown West', 25)
        assert.equal(c3.availableStock, 30)
        assert.equal(c3.isAvailable, true)

        // Nullish coalescing check: balance: 0 must NOT be overridden by closingBalance: 99
        const c4 = checkMaterialCenterAvailability(complexItem, 'Quarantine Depot', 1)
        assert.equal(c4.availableStock, 0, '0 balance must be preserved via nullish coalescing, not fall back to 99')
        assert.equal(c4.isAvailable, false)
        assert.equal(c4.shortfall, 1)

        // Check Scrap Yard isolation
        const c5 = checkMaterialCenterAvailability(complexItem, 'Scrap Yard', 5)
        assert.equal(c5.availableStock, -5)
        assert.equal(c5.isAvailable, false)
        assert.equal(c5.shortfall, 10)
    })

    // =========================================================================
    // 2. STRESS TESTS: GST SPLIT CALCULATIONS & SECTION 170 ROUND-OFF
    // =========================================================================

    await t.test('2.1 Intrastate (CGST+SGST) vs Interstate (IGST) split across tax slabs', () => {
        const taxSlabs = [5.0, 12.0, 18.0, 28.0]
        const taxable = 50000.00

        // Intrastate: Maharashtra (27) to Maharashtra (27)
        for (const slab of taxSlabs) {
            const res = computeGstSplit('27AABCS1429B1Z1', '27AAACB1234C1Z5', taxable, slab)
            assert.equal(res.isIntrastate, true)
            assert.equal(res.cgstRate, slab / 2)
            assert.equal(res.sgstRate, slab / 2)
            assert.equal(res.igstRate, 0)
            assert.equal(res.cgstAmount, res.sgstAmount, 'CGST and SGST amounts must be identical')
            assert.equal(res.igstAmount, 0)
            assert.equal(res.totalGst, Math.round(taxable * (slab / 100) * 100) / 100)
            assert.equal(res.exactGross, taxable + res.totalGst)
            assert.equal(res.netPayable, Math.round(res.exactGross))
        }

        // Interstate: Maharashtra (27) to Delhi (07), Karnataka (29), Gujarat (24)
        const interstateBuyers = ['07AAACB1234C1Z5', '29BBBCB5678D1Z2', '24CCCCB9012E1Z9']
        for (const buyer of interstateBuyers) {
            for (const slab of taxSlabs) {
                const res = computeGstSplit('27AABCS1429B1Z1', buyer, taxable, slab)
                assert.equal(res.isIntrastate, false)
                assert.equal(res.cgstRate, 0)
                assert.equal(res.sgstRate, 0)
                assert.equal(res.cgstAmount, 0)
                assert.equal(res.sgstAmount, 0)
                assert.equal(res.igstRate, slab)
                assert.equal(res.igstAmount, Math.round(taxable * (slab / 100) * 100) / 100)
                assert.equal(res.totalGst, res.igstAmount)
                assert.equal(res.netPayable, Math.round(res.exactGross))
            }
        }
    })

    await t.test('2.2 Missing, Null, or Malformed GSTIN handling', () => {
        const taxable = 10000.00
        const rate = 18.0

        // Case A: Missing buyer GSTIN (Unregistered B2C buyer)
        // Seller in Maharashtra (27), buyer GSTIN is null or empty
        // When buyer GSTIN is missing, buyerState becomes '00' which differs from '27', triggering Interstate IGST
        const missingBuyer = computeGstSplit('27AABCS1429B1Z1', null, taxable, rate)
        assert.equal(missingBuyer.sellerState, '27')
        assert.equal(missingBuyer.buyerState, '00')
        assert.equal(missingBuyer.isIntrastate, false, 'State mismatch between 27 and 00 results in interstate')
        assert.equal(missingBuyer.igstRate, 18.0)
        assert.equal(missingBuyer.igstAmount, 1800.00)

        // Case B: Both seller and buyer GSTIN missing
        // Both default to '00', resulting in Intrastate local CGST + SGST
        const bothMissing = computeGstSplit('', '', taxable, rate)
        assert.equal(bothMissing.sellerState, '00')
        assert.equal(bothMissing.buyerState, '00')
        assert.equal(bothMissing.isIntrastate, true, 'Both missing states (00 === 00) fallback to intrastate')
        assert.equal(bothMissing.cgstRate, 9.0)
        assert.equal(bothMissing.sgstRate, 9.0)
        assert.equal(bothMissing.cgstAmount, 900.00)
        assert.equal(bothMissing.sgstAmount, 900.00)

        // Case C: Malformed short GSTIN (< 2 chars)
        const malformed = computeGstSplit('2', 'X', taxable, rate)
        assert.equal(malformed.sellerState, '00')
        assert.equal(malformed.buyerState, '00')
        assert.equal(malformed.isIntrastate, true)
    })

    await t.test('2.3 0% Tax Rate (Nil-Rated / Exempt Goods)', () => {
        const taxable = 42500.50

        // Intrastate 0%
        const intra0 = computeGstSplit('27AABCS1429B1Z1', '27AAACB1234C1Z5', taxable, 0)
        assert.equal(intra0.cgstRate, 0)
        assert.equal(intra0.sgstRate, 0)
        assert.equal(intra0.igstRate, 0)
        assert.equal(intra0.cgstAmount, 0)
        assert.equal(intra0.sgstAmount, 0)
        assert.equal(intra0.igstAmount, 0)
        assert.equal(intra0.totalGst, 0)
        assert.equal(intra0.exactGross, taxable)
        assert.equal(intra0.netPayable, Math.round(taxable))
        assert.equal(intra0.roundOff, Math.round((Math.round(taxable) - taxable) * 100) / 100)

        // Interstate 0%
        const inter0 = computeGstSplit('27AABCS1429B1Z1', '07AAACB1234C1Z5', taxable, 0)
        assert.equal(inter0.igstRate, 0)
        assert.equal(inter0.igstAmount, 0)
        assert.equal(inter0.totalGst, 0)
        assert.equal(inter0.exactGross, taxable)
    })

    await t.test('2.4 Section 170 CGST Act integer round-off accuracy across fractional paise boundaries', () => {
        // Test Boundary 1: .49 paise rounds down -> negative round-off
        // Taxable 100.41 at 18% IGST -> Tax = 18.07, exactGross = 118.48 -> Net = 118.00 -> Round-off = -0.48
        const r1 = computeGstSplit('27AABCS1429B1Z1', '07AAACB1234C1Z5', 100.41, 18.0)
        // Note: exactGross is raw float (tax + totalGst = 118.47999999999999), Math.round produces 118.48
        assert.ok(Math.abs(r1.exactGross - 118.48) < 1e-12, 'exactGross is mathematically 118.48 (within IEEE-754 precision)')
        assert.equal(r1.netPayable, 118.00)
        assert.equal(r1.roundOff, -0.48)
        assert.equal(Math.round((r1.exactGross + r1.roundOff) * 100) / 100, r1.netPayable)

        // Test Boundary 2: .50 paise rounds up -> positive round-off
        // Taxable 150.00 at 5% IGST -> Tax = 7.50, exactGross = 157.50 -> Net = 158.00 -> Round-off = +0.50
        const r2 = computeGstSplit('27AABCS1429B1Z1', '07AAACB1234C1Z5', 150.00, 5.0)
        assert.equal(r2.exactGross, 157.50)
        assert.equal(r2.netPayable, 158.00)
        assert.equal(r2.roundOff, 0.50)
        assert.equal(Math.round((r2.exactGross + r2.roundOff) * 100) / 100, r2.netPayable)

        // Test Boundary 3: .51 paise rounds up -> positive round-off (+0.49)
        // Taxable 100.43 at 18% IGST -> Tax = 18.08, exactGross = 118.51 -> Net = 119.00 -> Round-off = +0.49
        const r3 = computeGstSplit('27AABCS1429B1Z1', '07AAACB1234C1Z5', 100.43, 18.0)
        assert.equal(r3.exactGross, 118.51)
        assert.equal(r3.netPayable, 119.00)
        assert.equal(r3.roundOff, 0.49)
        assert.equal(Math.round((r3.exactGross + r3.roundOff) * 100) / 100, r3.netPayable)

        // Invariant Stress Test: Run 100 fractional pricing combinations and assert Section 170 mathematical law:
        // netPayable === exactGross + roundOff (within IEEE-754 precision)
        for (let i = 1; i <= 100; i++) {
            const pseudoTaxable = (i * 37.19)
            const pseudoRate = (i % 4 === 0) ? 28.0 : (i % 3 === 0 ? 18.0 : (i % 2 === 0 ? 12.0 : 5.0))
            const split = computeGstSplit('27AABCS1429B1Z1', (i % 2 === 0 ? '27A' : '07A'), pseudoTaxable, pseudoRate)
            
            assert.equal(split.netPayable, Math.round(split.exactGross), `netPayable must be exact Math.round for iteration ${i}`)
            const sum = Math.round((split.exactGross + split.roundOff) * 100) / 100
            assert.equal(sum, split.netPayable, `exactGross (${split.exactGross}) + roundOff (${split.roundOff}) must equal netPayable (${split.netPayable})`)
            assert.ok(split.roundOff >= -0.50 && split.roundOff <= 0.50, `roundOff must be in [-0.50, +0.50] range, was ${split.roundOff}`)
        }
    })

    // =========================================================================
    // 3. STRESS TESTS: STEPPER STATE MACHINE & AUTO-POLLING UNDER SQS DELAYS
    // =========================================================================

    await t.test('3.1 3-Stage Order-to-Cash Stepper lifecycle transitions & progress bar', () => {
        // Reproduce BusyFulfillmentStepper stage logic
        const evaluateStepper = ({ currentStatus, liveSO, liveDN, liveINV, isQueued, isFailed, hasLineItems, isConfigured }) => {
            const step1Completed = Boolean(liveSO || liveDN || liveINV || ['SALES_ORDER_CREATED', 'DISPATCHED', 'INVOICED'].includes(currentStatus))
            const step2Completed = Boolean(liveDN || liveINV || ['DISPATCHED', 'INVOICED'].includes(currentStatus))
            const step3Completed = Boolean(liveINV || currentStatus === 'INVOICED')

            const step1Status = step1Completed
                ? 'COMPLETED'
                : (isQueued && !step2Completed && !step3Completed
                    ? 'QUEUED'
                    : (isFailed
                        ? 'FAILED'
                        : (!hasLineItems
                            ? 'QUOTE_NEEDED'
                            : (isConfigured ? 'READY' : 'PENDING'))))

            const step2Status = step2Completed
                ? 'COMPLETED'
                : (step1Completed && isQueued && !step3Completed ? 'QUEUED' : (step1Completed && isConfigured ? 'READY' : 'PENDING'))

            const step3Status = step3Completed
                ? 'COMPLETED'
                : (step2Completed && isQueued ? 'QUEUED' : (step2Completed && isConfigured ? 'READY' : 'PENDING'))

            let progressWidth = '0%'
            if (step3Completed) progressWidth = '100%'
            else if (step2Completed) progressWidth = step3Status === 'QUEUED' ? '82%' : '66%'
            else if (step1Completed) progressWidth = step2Status === 'QUEUED' ? '48%' : '33%'
            else if (step1Status === 'QUEUED') progressWidth = '15%'

            return { step1Completed, step2Completed, step3Completed, step1Status, step2Status, step3Status, progressWidth }
        }

        // State 0: Unconfigured company
        const s0 = evaluateStepper({ currentStatus: 'NONE', hasLineItems: true, isConfigured: false })
        assert.equal(s0.step1Status, 'PENDING')
        assert.equal(s0.progressWidth, '0%')

        // State 1: Configured, but quote not yet built
        const s1 = evaluateStepper({ currentStatus: 'NONE', hasLineItems: false, isConfigured: true })
        assert.equal(s1.step1Status, 'QUOTE_NEEDED')
        assert.equal(s1.progressWidth, '0%')

        // State 2: Quote built, ready to create Sales Order
        const s2 = evaluateStepper({ currentStatus: 'NONE', hasLineItems: true, isConfigured: true })
        assert.equal(s2.step1Status, 'READY')
        assert.equal(s2.progressWidth, '0%')

        // State 3: User triggers SO -> Enqueued in SQS (simulated SQS delay)
        const s3 = evaluateStepper({ currentStatus: 'QUEUED', isQueued: true, hasLineItems: true, isConfigured: true })
        assert.equal(s3.step1Status, 'QUEUED')
        assert.equal(s3.progressWidth, '15%')

        // State 4: Desktop Bridge consumes SQS message and creates SO in BUSY
        const s4 = evaluateStepper({ currentStatus: 'SALES_ORDER_CREATED', liveSO: 'SO-101', hasLineItems: true, isConfigured: true })
        assert.equal(s4.step1Completed, true)
        assert.equal(s4.step1Status, 'COMPLETED')
        assert.equal(s4.step2Status, 'READY')
        assert.equal(s4.progressWidth, '33%')

        // State 5: User triggers Dispatch -> Enqueued in SQS
        const s5 = evaluateStepper({ currentStatus: 'QUEUED', liveSO: 'SO-101', isQueued: true, hasLineItems: true, isConfigured: true })
        assert.equal(s5.step1Completed, true)
        assert.equal(s5.step1Status, 'COMPLETED')
        assert.equal(s5.step2Status, 'QUEUED')
        assert.equal(s5.progressWidth, '48%')

        // State 6: Desktop Bridge creates Sale Challan in BUSY
        const s6 = evaluateStepper({ currentStatus: 'DISPATCHED', liveSO: 'SO-101', liveDN: 'DN-201', hasLineItems: true, isConfigured: true })
        assert.equal(s6.step1Completed, true)
        assert.equal(s6.step2Completed, true)
        assert.equal(s6.step2Status, 'COMPLETED')
        assert.equal(s6.step3Status, 'READY')
        assert.equal(s6.progressWidth, '66%')

        // State 7: User triggers Invoice -> Enqueued in SQS
        const s7 = evaluateStepper({ currentStatus: 'QUEUED', liveSO: 'SO-101', liveDN: 'DN-201', isQueued: true, hasLineItems: true, isConfigured: true })
        assert.equal(s7.step2Completed, true)
        assert.equal(s7.step3Status, 'QUEUED')
        assert.equal(s7.progressWidth, '82%')

        // State 8: Desktop Bridge creates Sales Tax Invoice in BUSY (Order-to-Cash Complete)
        const s8 = evaluateStepper({ currentStatus: 'INVOICED', liveSO: 'SO-101', liveDN: 'DN-201', liveINV: 'INV-301', hasLineItems: true, isConfigured: true })
        assert.equal(s8.step1Completed, true)
        assert.equal(s8.step2Completed, true)
        assert.equal(s8.step3Completed, true)
        assert.equal(s8.step1Status, 'COMPLETED')
        assert.equal(s8.step2Status, 'COMPLETED')
        assert.equal(s8.step3Status, 'COMPLETED')
        assert.equal(s8.progressWidth, '100%')
    })

    await t.test('3.2 Simulated SQS Async Delay & Polling loop behavior', async () => {
        // Simulate SQS Delay:
        // Background SQS job takes 3 polling cycles to process
        let pollCount = 0
        const mockDealId = 'deal-999'

        const mockFetchDealSyncStatus = async (dealId) => {
            pollCount++
            if (pollCount < 3) {
                // SQS message still sitting in queue or bridge offline
                return { data: { busySyncStatus: 'QUEUED' } }
            }
            // SQS message picked up by bridge and processed on 3rd poll
            return {
                data: {
                    busySyncStatus: 'SALES_ORDER_CREATED',
                    busySalesOrderNo: 'SO-BUSY-2026-0099',
                    lastSyncError: null,
                }
            }
        }

        // Harness modeling the useEffect in BusyFulfillmentStepper
        let activeStatus = 'QUEUED'
        let dispatchedAction = null
        let isPolling = true

        const executePollerCycle = async () => {
            const res = await mockFetchDealSyncStatus(mockDealId)
            const status = (res?.data?.busySyncStatus || '').toUpperCase()
            if (status && status !== 'QUEUED') {
                dispatchedAction = {
                    dealId: mockDealId,
                    busySyncStatus: res.data.busySyncStatus,
                    busySalesOrderNo: res.data.busySalesOrderNo,
                }
                activeStatus = status
                isPolling = false
            }
        }

        // Cycle 1: SQS delayed
        await executePollerCycle()
        assert.equal(activeStatus, 'QUEUED')
        assert.equal(dispatchedAction, null, 'Must NOT update Redux while still QUEUED')
        assert.equal(isPolling, true)

        // Cycle 2: SQS still delayed
        await executePollerCycle()
        assert.equal(activeStatus, 'QUEUED')
        assert.equal(dispatchedAction, null)
        assert.equal(isPolling, true)

        // Cycle 3: SQS job successfully acknowledged by BUSY Bridge
        await executePollerCycle()
        assert.equal(activeStatus, 'SALES_ORDER_CREATED')
        assert.ok(dispatchedAction, 'Redux action dispatched upon SQS completion')
        assert.equal(dispatchedAction.busySalesOrderNo, 'SO-BUSY-2026-0099')
        assert.equal(isPolling, false, 'Poller terminates interval when status leaves QUEUED')
    })

    await t.test('3.3 SQS Failure & Dead Letter Queue (DLQ) state handling', () => {
        // Raw errors returned when SQS consumer encounters local bridge failure
        const portError = 'connect ECONNREFUSED 127.0.0.1:981'
        const cleanPort = formatBusyError(portError)
        assert.match(cleanPort, /Port 981/, 'Error formatter diagnoses port 981 connection refusal')
        assert.match(cleanPort, /BusyBridge\.exe/)

        const compError = 'Invalid Company Code or Company not found in BUSY'
        const cleanComp = formatBusyError(compError)
        assert.match(cleanComp, /company code or name was not found/)

        const mcError = 'Specified Material Center MCId 999 does not exist'
        const cleanMc = formatBusyError(mcError)
        assert.match(cleanMc, /Material Center/)

        // Stepper evaluation under failure
        const failedStep = getStepperStepStatus('FAILED', 'SALES_ORDER_CREATED')
        assert.equal(failedStep, 'PENDING', 'Failed state does not falsely mark step active or completed')
    })

    // =========================================================================
    // 4. DEAL QUOTE BUILDER: COMPUTATION & TAX HEURISTIC ANALYSIS
    // =========================================================================

    await t.test('4.1 Line Item Pricing, Discount, and Taxable calculations', () => {
        // Edge case: Negative discount clamped to 0
        const cNeg = computeLineItemAmounts(10, 500, -10)
        assert.equal(cNeg.discount, 0)
        assert.equal(cNeg.taxable, 5000)

        // Edge case: Discount > 100% clamped to 100%
        const cOver = computeLineItemAmounts(10, 500, 150)
        assert.equal(cOver.discount, 5000)
        assert.equal(cOver.taxable, 0)

        // Normal precision discount (e.g. 7.5%)
        const cFrac = computeLineItemAmounts(15, 333.33, 7.5)
        // gross = 15 * 333.33 = 4999.95
        assert.equal(cFrac.gross, 4999.95)
        // discount = 4999.95 * 0.075 = 374.99625 -> 375.00
        assert.equal(cFrac.discount, 375.00)
        // taxable = 4999.95 - 375.00 = 4624.95
        assert.equal(cFrac.taxable, 4624.95)
    })

    await t.test('4.2 Quote Builder maxGstRate aggregation behavior analysis', () => {
        // Documenting the behavior of maxGstRate initialization in DealQuoteBuilder.jsx (Line 313):
        // In DealQuoteBuilder.jsx, maxGstRate is initialized to 18.0.
        // If an item has taxRate = 5.0, Math.max(18.0, 5.0) remains 18.0.
        // Therefore, items entered with 5% or 0% tax rate in a single quote will be taxed at 18% if maxGstRate defaults to 18.0.
        const lineItems = [
            { itemName: 'Agricultural Grade Valve', taxRate: 5.0, quantity: 10, rate: 1000 },
        ]

        let maxGstRateDefault = 18.0
        lineItems.forEach(item => {
            if (item.taxRate) maxGstRateDefault = Math.max(maxGstRateDefault, Number(item.taxRate))
        })
        assert.equal(maxGstRateDefault, 18.0, 'Confirms empirical observation: default 18.0 baseline does not scale down to 5.0%')

        // Proposed improved calculation:
        const dynamicMaxRate = lineItems.length > 0
            ? Math.max(...lineItems.map(i => Number(i.taxRate) || 0))
            : 18.0
        assert.equal(dynamicMaxRate, 5.0, 'Dynamic max correctly identifies 5.0% for 5% line items')
    })
})
