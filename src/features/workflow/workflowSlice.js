import { createSlice } from '@reduxjs/toolkit'

const workflowSlice = createSlice({
  name: 'workflow',
  initialState: {
    workflows: [],
    currentWorkflow: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setWorkflows: (state, action) => {
      state.workflows = action.payload.workflows
      state.pagination = action.payload.pagination
    },
    setCurrentWorkflow: (state, action) => {
      state.currentWorkflow = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setWorkflows, setCurrentWorkflow, setLoading, setError } = workflowSlice.actions
export default workflowSlice.reducer
