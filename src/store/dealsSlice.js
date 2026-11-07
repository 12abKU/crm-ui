import { createSlice } from '@reduxjs/toolkit'
import tallyAPI from '../api/tally'
import busyAPI from '../api/busy'

const initialState = {
    // Map of dealId -> { tallySyncStatus, tallySalesOrderNo, tallyDeliveryNoteNo, tallySalesInvoiceNo, tallyLastSyncError, busySyncStatus, busySalesOrderNo, busyDeliveryNoteNo, busySalesInvoiceNo, busyLastSyncError }
    syncStatuses: {},
    tallyConnection: {
        isConfigured: false,
        isConnected: false,
        lastHeartbeatAt: null,
        lastSyncAt: null,
        tallyCompanyName: '',
        agentVersion: '',
        lastFetchedAt: 0,
        loading: false,
        companyId: null,
    },
    busyConnection: {
        isConfigured: false,
        isConnected: false,
        lastHeartbeatAt: null,
        lastSyncAt: null,
        busyCompanyName: '',
        agentVersion: '',
        lastFetchedAt: 0,
        loading: false,
        companyId: null,
    },
}

const dealsSlice = createSlice({
    name: 'deals',
    initialState,
    reducers: {
        resetTallyState: (state) => {
            state.syncStatuses = {}
            state.tallyConnection = {
                isConfigured: false,
                isConnected: false,
                lastHeartbeatAt: null,
                lastSyncAt: null,
                tallyCompanyName: '',
                agentVersion: '',
                lastFetchedAt: 0,
                loading: false,
                companyId: null,
            }
        },
        resetBusyState: (state) => {
            state.busyConnection = {
                isConfigured: false,
                isConnected: false,
                lastHeartbeatAt: null,
                lastSyncAt: null,
                busyCompanyName: '',
                agentVersion: '',
                lastFetchedAt: 0,
                loading: false,
                companyId: null,
            }
        },
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
                            busySyncStatus: d.busySyncStatus,
                            busySalesOrderNo: d.busySalesOrderNo,
                            busyDeliveryNoteNo: d.busyDeliveryNoteNo,
                            busySalesInvoiceNo: d.busySalesInvoiceNo,
                            busyLastSyncError: d.busyLastSyncError,
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
        setBusyConnection: (state, action) => {
            state.busyConnection = {
                ...state.busyConnection,
                ...action.payload,
                lastFetchedAt: Date.now(),
                loading: false,
            }
        },
        setBusyConnectionLoading: (state, action) => {
            state.busyConnection.loading = action.payload ?? true
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase('auth/signOut', (state) => {
                state.syncStatuses = {}
                state.tallyConnection = {
                    isConfigured: false,
                    isConnected: false,
                    lastHeartbeatAt: null,
                    lastSyncAt: null,
                    tallyCompanyName: '',
                    agentVersion: '',
                    lastFetchedAt: 0,
                    loading: false,
                    companyId: null,
                }
                state.busyConnection = {
                    isConfigured: false,
                    isConnected: false,
                    lastHeartbeatAt: null,
                    lastSyncAt: null,
                    busyCompanyName: '',
                    agentVersion: '',
                    lastFetchedAt: 0,
                    loading: false,
                    companyId: null,
                }
            })
            .addCase('auth/setCredentials', (state, action) => {
                const newCompanyId = action.payload?.companyId ? String(action.payload.companyId) : ''
                if (state.tallyConnection.companyId && state.tallyConnection.companyId !== newCompanyId) {
                    state.syncStatuses = {}
                    state.tallyConnection = {
                        isConfigured: false,
                        isConnected: false,
                        lastHeartbeatAt: null,
                        lastSyncAt: null,
                        tallyCompanyName: '',
                        agentVersion: '',
                        lastFetchedAt: 0,
                        loading: false,
                        companyId: newCompanyId,
                    }
                }
                if (state.busyConnection.companyId && state.busyConnection.companyId !== newCompanyId) {
                    state.busyConnection = {
                        isConfigured: false,
                        isConnected: false,
                        lastHeartbeatAt: null,
                        lastSyncAt: null,
                        busyCompanyName: '',
                        agentVersion: '',
                        lastFetchedAt: 0,
                        loading: false,
                        companyId: newCompanyId,
                    }
                }
            })
    },
})

export const {
    resetTallyState,
    resetBusyState,
    setDealSyncStatus,
    batchSetDealSyncStatuses,
    setTallyConnection,
    setTallyConnectionLoading,
    setBusyConnection,
    setBusyConnectionLoading,
} = dealsSlice.actions

export const fetchTallyConnectionStatus = (force = false) => async (dispatch, getState) => {
    const state = getState()
    const currentCompanyId = state.auth?.companyId || localStorage.getItem('companyId') || ''
    const { lastFetchedAt, loading, companyId: storedCompanyId } = state.deals?.tallyConnection || {}
    const now = Date.now()

    const companyChanged = storedCompanyId && currentCompanyId && String(storedCompanyId) !== String(currentCompanyId)
    if (companyChanged) {
        dispatch(dealsSlice.actions.resetTallyState())
    }

    // Throttle to 2 seconds unless force refresh is explicitly requested or company changed
    if (!force && !companyChanged && lastFetchedAt && (now - lastFetchedAt < 2000)) {
        return
    }
    if (!companyChanged && loading && lastFetchedAt && (now - lastFetchedAt < 4000)) {
        return
    }

    dispatch(setTallyConnectionLoading(true))
    try {
        const res = await tallyAPI.getConfig()
        const cfg = res?.data || res || {}

        // Strict tenant isolation: verify that the returned config belongs to current company
        if (cfg.companyId && currentCompanyId && String(cfg.companyId) !== String(currentCompanyId)) {
            dispatch(setTallyConnection({
                companyId: currentCompanyId,
                isConfigured: false,
                isConnected: false,
                tallyCompanyName: '',
            }))
            return
        }

        const isConfigured = Boolean(
            cfg.isConfigured ??
            (cfg.tallyCompanyName && cfg.tallyCompanyName.trim().length > 0 && Boolean(cfg.syncEnabled))
        )
        const isConnected = isConfigured && Boolean(cfg.isConnected ?? cfg.connected)

        dispatch(setTallyConnection({
            companyId: currentCompanyId,
            isConfigured,
            isConnected,
            lastHeartbeatAt: cfg.lastHeartbeatAt || null,
            lastSyncAt: cfg.lastSyncAt || null,
            tallyCompanyName: isConfigured ? (cfg.tallyCompanyName || '') : '',
            agentVersion: cfg.agentVersion || '',
        }))
    } catch (err) {
        console.error('Failed to fetch Tally connection status:', err)
        dispatch(setTallyConnection({
            companyId: currentCompanyId,
            isConfigured: false,
            isConnected: false,
            tallyCompanyName: '',
        }))
    }
}

export const fetchBusyConnectionStatus = (force = false) => async (dispatch, getState) => {
    const state = getState()
    const currentCompanyId = state.auth?.companyId || localStorage.getItem('companyId') || ''
    const { lastFetchedAt, loading, companyId: storedCompanyId } = state.deals?.busyConnection || {}
    const now = Date.now()

    const companyChanged = storedCompanyId && currentCompanyId && String(storedCompanyId) !== String(currentCompanyId)
    if (companyChanged) {
        dispatch(dealsSlice.actions.resetBusyState())
    }

    // Throttle to 2 seconds unless force refresh is explicitly requested or company changed
    if (!force && !companyChanged && lastFetchedAt && (now - lastFetchedAt < 2000)) {
        return
    }
    if (!companyChanged && loading && lastFetchedAt && (now - lastFetchedAt < 4000)) {
        return
    }

    dispatch(setBusyConnectionLoading(true))
    try {
        const res = await busyAPI.getConfig()
        const cfg = res?.data || res || {}

        // Strict tenant isolation: verify that the returned config belongs to current company
        if (cfg.companyId && currentCompanyId && String(cfg.companyId) !== String(currentCompanyId)) {
            dispatch(setBusyConnection({
                companyId: currentCompanyId,
                isConfigured: false,
                isConnected: false,
                busyCompanyName: '',
            }))
            return
        }

        const isConfigured = Boolean(
            cfg.isConfigured ??
            (cfg.busyCompanyName && cfg.busyCompanyName.trim().length > 0 && Boolean(cfg.syncEnabled))
        )
        const isConnected = isConfigured && Boolean(cfg.isConnected ?? cfg.connected)

        dispatch(setBusyConnection({
            companyId: currentCompanyId,
            isConfigured,
            isConnected,
            lastHeartbeatAt: cfg.lastHeartbeatAt || null,
            lastSyncAt: cfg.lastSyncAt || null,
            busyCompanyName: isConfigured ? (cfg.busyCompanyName || '') : '',
            agentVersion: cfg.agentVersion || '',
        }))
    } catch (err) {
        console.error('Failed to fetch BUSY connection status:', err)
        dispatch(setBusyConnection({
            companyId: currentCompanyId,
            isConfigured: false,
            isConnected: false,
            busyCompanyName: '',
        }))
    }
}

export default dealsSlice.reducer
