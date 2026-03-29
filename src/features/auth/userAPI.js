import API from '../../api/axios'

export const getUsersAPI = async () => {
  const response = await API.get('/users')
  return response.data
}

export const getManagersAPI = async () => {
  const response = await API.get('/users/managers')
  return response.data
}

export const createUserAPI = async (data) => {
  const response = await API.post('/users', data)
  return response.data
}

export const updateUserAPI = async (id, data) => {
  const response = await API.put(`/users/${id}`, data)
  return response.data
}

export const deleteUserAPI = async (id) => {
  const response = await API.delete(`/users/${id}`)
  return response.data
}
