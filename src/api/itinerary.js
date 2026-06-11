import request from './index'

export const itineraryAPI = {
  // 获取公开行程列表
  getPublicList(params) {
    return request.get('/itineraries/public', { params })
  },

  // 获取热门行程列表
  getHotList(params) {
    return request.get('/itineraries/hot', { params })
  },

  // 获取推荐行程
  getFeaturedList(params) {
    return request.get('/itineraries/featured', { params })
  },

  // 获取官方行程
  getOfficialList(params) {
    return request.get('/itineraries/official', { params })
  },

  // 获取用户的所有行程
  getAll() {
    return request.get('/itineraries')
  },

  // 获取单个行程详情（公开）
  getById(id) {
    return request.get(`/itineraries/public/${id}`)
  },

  // 获取用户自己的行程详情（用于编辑）
  getMyById(id) {
    return request.get(`/itineraries/${id}`)
  },

  // 创建新行程
  create(data) {
    return request.post('/itineraries', data)
  },

  // 更新行程
  update(id, data) {
    return request.put(`/itineraries/${id}`, data)
  },

  // 更新行程公开/私密状态
  updateStatus(id, isPublic) {
    return request.put(`/itineraries/${id}/status`, { isPublic })
  },

  // 删除行程
  delete(id) {
    return request.delete(`/itineraries/${id}`)
  },

  // 添加活动
  addActivity(data) {
    return request.post('/itineraries/activities', data)
  },

  // 更新活动
  updateActivity(id, data) {
    return request.put(`/itineraries/activities/${id}`, data)
  },

  // 删除活动
  deleteActivity(id) {
    return request.delete(`/itineraries/activities/${id}`)
  },

  // 重新排序活动
  reorderActivities(data) {
    return request.post('/itineraries/activities/reorder', data)
  }
}
