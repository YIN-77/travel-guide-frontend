import api from './index'

export const adminNewsAPI = {
  // 获取所有资讯
  getAll: (params) => {
    return api.get('/admin/news', { params })
  },
  
  // 获取统计数据
  getStats: () => {
    return api.get('/admin/news/stats')
  },
  
  // 获取单个资讯详情
  getById: (id) => {
    return api.get(`/admin/news/${id}`)
  },
  
  // 创建资讯
  create: (data) => {
    return api.post('/admin/news', data)
  },
  
  // 更新资讯
  update: (id, data) => {
    return api.put(`/admin/news/${id}`, data)
  },
  
  // 删除资讯
  delete: (id) => {
    return api.delete(`/admin/news/${id}`)
  },
  
  // 批量删除
  batchDelete: (ids) => {
    return api.post('/admin/news/batch-delete', { ids })
  }
}
