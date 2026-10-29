import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import pipelineReducer from './pipelineSlice'
import dealsReducer from './dealsSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        pipeline: pipelineReducer,
        deals: dealsReducer,
    },
})
