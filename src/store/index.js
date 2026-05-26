import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import pipelineReducer from './pipelineSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        pipeline: pipelineReducer,
    },
})
