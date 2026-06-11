import request from './index'

export const adminUserAPI = {
  // 获取用户列表
  getUsers(params) {
    return request.get('/admin/users', { params })
  },

  // 获取用户统计
  getStats() {
    return request.get('/admin/users/stats')
  },

  // 获取单个用户
  getUser(id) {
    return request.get(`/admin/users/${id}`)
  },

  // 更新用户
  updateUser(id, data) {
    return request.put(`/admin/users/${id}`, data)
  },

  // 删除用户
  deleteUser(id) {
    return request.delete(`/admin/users/${id}`)
  },

  // 批量删除用户
  batchDeleteUsers(ids) {
    return request.post('/admin/users/batch/delete', { ids })
  }
}
