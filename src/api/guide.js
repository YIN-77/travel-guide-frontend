import api from './index'

export const guideAPI = {
  getAll: (params) => {
    return api.get('/guides', { params })
  },
  getById: (id) => {
    return api.get(`/guides/${id}`)
  },
  create: (data) => {
    return api.post('/guides', data)
  },
  getMyGuides: () => {
    return api.get('/guides/my/list')
  },
  update: (id, data) => {
    return api.put(`/guides/${id}`, data)
  },
  delete: (id) => {
    return api.delete(`/guides/${id}`)
  },
  getOfficialGuides: (params) => {
    return api.get('/guides/official/list', { params })
  },
  getFeaturedGuides: (params) => {
    return api.get('/guides/featured/list', { params })
  }
}
