import api from './index'

export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getByDestination: (id) => api.get(`/destinations/${id}/reviews`),
  create: (destinationId, data) => api.post(`/destinations/${destinationId}/reviews`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  reply: (reviewId, data) => api.post(`/reviews/${reviewId}/reply`, data),
  like: (reviewId) => api.post(`/reviews/${reviewId}/like`),
  uploadImage: (formData) => api.post('/reviews/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
