import { createSlice } from '@reduxjs/toolkit'
import tallyAPI from '../api/tally'

const initialState = {
    // Map of dealId -> { tallySyncStatus, tallySalesOrderNo, tallyDeliveryNoteNo, tallySalesInvoiceNo, tallyLastSyncError }
    syncStatuses: {},
    tallyConnection: {
        isConnected: false,
        lastHeartbeatAt: null,
        lastSyncAt: null,
        tallyCompanyName: '',
        agentVersion: '',
        lastFetchedAt: 0,
        loading: false,
    },
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
        setTallyConnection: (state, action) => {
            state.tallyConnection = {
                ...state.tallyConnection,
                ...action.payload,
                lastFetchedAt: Date.now(),
                loading: false,
            }
        },
        setTallyConnectionLoading: (state, action) => {
            state.tallyConnection.loading = action.payload ?? true
        },
    },
})

export const {
    setDealSyncStatus,
    batchSetDealSyncStatuses,
    setTallyConnection,
    setTallyConnectionLoading,
} = dealsSlice.actions

export const fetchTallyConnectionStatus = (force = false) => async (dispatch, getState) => {
    const state = getState()
    const { lastFetchedAt, loading } = state.deals?.tallyConnection || {}
    const now = Date.now()

    // Cache for 30 seconds unless force refresh is explicitly requested
    if (!force && lastFetchedAt && (now - lastFetchedAt < 30000)) {
        return
    }
    if (loading) return

    dispatch(setTallyConnectionLoading(true))
    try {
        const res = await tallyAPI.getConfig()
        const cfg = res?.data || res || {}
        dispatch(setTallyConnection({
            isConnected: Boolean(cfg.isConnected ?? cfg.connected),
            lastHeartbeatAt: cfg.lastHeartbeatAt || null,
            lastSyncAt: cfg.lastSyncAt || null,
            tallyCompanyName: cfg.tallyCompanyName || '',
            agentVersion: cfg.agentVersion || '',
        }))
    } catch (err) {
        console.error('Failed to fetch Tally connection status:', err)
        dispatch(setTallyConnection({ isConnected: false }))
    }
}

export default dealsSlice.reducer
