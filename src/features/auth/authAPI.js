import API from '../../api/axios'

export const loginAPI = async (data) => {
  const response = await API.post('/auth/login', data)
  return response.data
}

export const registerAPI = async (data) => {
  const response = await API.post('/auth/register', data)
  return response.data
}

export const logoutAPI = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  const response = await API.post('/auth/logout', { refreshToken })
  return response.data
}
