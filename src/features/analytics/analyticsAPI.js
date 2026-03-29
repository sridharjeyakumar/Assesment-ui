import API from '../../api/axios'

export const getDashboardStatsAPI = async () => {
  const response = await API.get('/analytics/dashboard')
  return response.data
}
