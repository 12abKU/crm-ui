import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    // Map of dealId -> { tallySyncStatus, tallySalesOrderNo, tallyDeliveryNoteNo, tallySalesInvoiceNo, tallyLastSyncError }
    syncStatuses: {},
}

const dealsSlice = createSlice({
    name: 'deals',
    initialState,
    reducers: {
        setDealSyncStatus: (state, action) => {
            const { dealId, ...data } = action.payload
            if (!dealId) return
            state.syncStatuses[dealId] = {
                ...(state.syncStatuses[dealId] || {}),
                ...data,
            }
        },
        batchSetDealSyncStatuses: (state, action) => {
            if (Array.isArray(action.payload)) {
                action.payload.forEach(d => {
                    if (d && d.id) {
                        state.syncStatuses[d.id] = {
                            tallySyncStatus: d.tallySyncStatus,
                            tallySalesOrderNo: d.tallySalesOrderNo,
                            tallyDeliveryNoteNo: d.tallyDeliveryNoteNo,
                            tallySalesInvoiceNo: d.tallySalesInvoiceNo,
                            tallyLastSyncError: d.tallyLastSyncError,
                        }
                    }
                })
            } else if (action.payload && typeof action.payload === 'object') {
                state.syncStatuses = {
                    ...state.syncStatuses,
                    ...action.payload,
                }
            }
        },
    },
})

export const { setDealSyncStatus, batchSetDealSyncStatuses } = dealsSlice.actions
export default dealsSlice.reducer
