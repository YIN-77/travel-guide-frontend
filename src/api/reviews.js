import api from './index'

export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getByDestination: (id) => api.get(`/destinations/${id}/reviews`),
  create: (destinationId, data) => api.post(`/destinations/${destinationId}/reviews`, data),
  delete: (id) => api.delete(`/reviews/${id}`)
}
