import { createSlice } from '@reduxjs/toolkit'

const pipelineSlice = createSlice({
    name: 'pipeline',
    initialState: {
        stages: [],
        loading: false,
    },
    reducers: {
        setStages: (state, action) => {
            state.stages = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const { setStages, setLoading } = pipelineSlice.actions
export default pipelineSlice.reducer
