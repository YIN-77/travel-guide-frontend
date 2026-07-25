import api from './index'
export const searchAPI = {
  globalSearch: (params) => api.get('/search', { params }),
  getHotSearches: () => api.get('/search/hot')
}
