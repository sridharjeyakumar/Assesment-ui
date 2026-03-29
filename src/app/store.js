import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import workflowReducer from '../features/workflow/workflowSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflow: workflowReducer,
  },
})
