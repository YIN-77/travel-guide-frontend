import api from './index'

export const adminGuideAPI = {
  // 获取所有攻略
  getAll: (params) => {
    return api.get('/admin/guides', { params })
  },
  
  // 获取统计数据
  getStats: () => {
    return api.get('/admin/guides/stats')
  },
  
  // 获取单个攻略详情
  getById: (id) => {
    return api.get(`/admin/guides/${id}`)
  },
  
  // 创建攻略
  create: (data) => {
    return api.post('/admin/guides', data)
  },
  
  // 更新攻略
  update: (id, data) => {
    return api.put(`/admin/guides/${id}`, data)
  },
  
  // 删除攻略
  delete: (id) => {
    return api.delete(`/admin/guides/${id}`)
  },
  
  // 批量删除
  batchDelete: (ids) => {
    return api.post('/admin/guides/batch-delete', { ids })
  }
}
