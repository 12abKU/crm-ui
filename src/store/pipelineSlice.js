import { createSlice } from '@reduxjs/toolkit'

const pipelineSlice = createSlice({
    name: 'pipeline',
    initialState: {
        dealStages: [],
        leadStages: [],
        loading: false,
    },
    reducers: {
        setStages: (state, action) => {
            state.dealStages = action.payload // Keep for backward compatibility or specifically for deals
        },
        setDealStages: (state, action) => {
            state.dealStages = action.payload
        },
        setLeadStages: (state, action) => {
            state.leadStages = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const { setStages, setDealStages, setLeadStages, setLoading } = pipelineSlice.actions
export default pipelineSlice.reducer
