import api from './index'

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard')
}
