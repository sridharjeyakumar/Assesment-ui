import API from '../../api/axios'

export const getWorkflowsAPI = async (page = 1, limit = 10) => {
  const response = await API.get(`/workflows?page=${page}&limit=${limit}`)
  return response.data
}

export const getWorkflowByIdAPI = async (id) => {
  const response = await API.get(`/workflows/${id}`)
  return response.data
}

export const createWorkflowAPI = async (data) => {
  const response = await API.post('/workflows', data)
  return response.data
}

export const updateWorkflowAPI = async (id, data) => {
  const response = await API.put(`/workflows/${id}`, data)
  return response.data
}

export const deleteWorkflowAPI = async (id) => {
  const response = await API.delete(`/workflows/${id}`)
  return response.data
}

export const triggerWorkflowAPI = async (id) => {
  const response = await API.post(`/workflows/${id}/trigger`)
  return response.data
}

export const getExecutionsAPI = async (id) => {
  const response = await API.get(`/workflows/${id}/executions`)
  return response.data
}
