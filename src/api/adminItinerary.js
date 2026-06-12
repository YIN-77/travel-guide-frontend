import api from './index'

export const adminItineraryAPI = {
  // 获取所有行程
  getAll: (params) => {
    return api.get('/admin/itineraries', { params })
  },
  
  // 获取统计数据
  getStats: () => {
    return api.get('/admin/itineraries/stats')
  },
  
  // 获取单个行程详情
  getById: (id) => {
    return api.get(`/admin/itineraries/${id}`)
  },
  
  // 删除行程
  delete: (id) => {
    return api.delete(`/admin/itineraries/${id}`)
  },
  
  // 批量删除
  batchDelete: (ids) => {
    return api.post('/admin/itineraries/batch-delete', { ids })
  },
  
  // 更新行程状态
  updateStatus: (id, isPublic) => {
    return api.put(`/admin/itineraries/${id}/status`, { isPublic })
  },

  // 创建官方行程
  createOfficial: (data) => {
    return api.post('/admin/itineraries/official', data)
  },

  // 设置热门推荐
  updateFeatured: (id, isFeatured) => {
    return api.put(`/admin/itineraries/${id}/featured`, { isFeatured })
  },

  // 设置官方行程
  updateOfficial: (id, isOfficial) => {
    return api.put(`/admin/itineraries/${id}/official`, { isOfficial })
  },

  // 更新官方行程
  update: (id, data) => {
    return api.put(`/admin/itineraries/${id}`, data)
  }
}
