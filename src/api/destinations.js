import api from './index'

export const destinationAPI = {
  getList: (params) => api.get('/destinations', { params }),
  getById: (id) => api.get(`/destinations/${id}`),
  create: (data) => api.post('/destinations', data),
  update: (id, data) => api.put(`/destinations/${id}`, data),
  delete: (id) => api.delete(`/destinations/${id}`),
  batchDelete: (ids) => api.delete('/destinations/batch/delete', { data: { ids } })
}
