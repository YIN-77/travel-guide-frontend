import api from './index'

export const newsAPI = {
  getAll: (params) => {
    return api.get('/news', { params })
  },
  getById: (id) => {
    return api.get(`/news/${id}`)
  }
}
