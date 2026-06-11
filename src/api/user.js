import request from './index'

export const userAPI = {
  // 用户注册
  register(data) {
    return request.post('/users/register', data)
  },

  // 用户登录
  login(data) {
    return request.post('/users/login', data)
  },

  // 获取用户信息
  getProfile() {
    return request.get('/users/profile')
  },

  // 更新用户信息
  updateProfile(data) {
    return request.put('/users/profile', data)
  },

  // 修改密码
  changePassword(data) {
    return request.put('/users/password', data)
  },

  // 收藏/取消收藏（景点）
  toggleFavorite(destinationId) {
    return request.post('/users/favorite', { destinationId })
  },

  // 获取收藏列表（景点）
  getFavorites() {
    return request.get('/users/favorites')
  },

  // 点赞/取消点赞（景点）
  toggleLike(destinationId) {
    return request.post('/users/like', { destinationId })
  },

  // 获取点赞列表（景点）
  getLikes() {
    return request.get('/users/likes')
  },

  // 添加评论
  addReview(data) {
    return request.post('/users/review', data)
  },

  // 删除评论
  deleteReview(id) {
    return request.delete(`/users/review/${id}`)
  },

  // 获取用户评论
  getUserReviews() {
    return request.get('/users/reviews')
  },

  // 获取所有收藏（支持按类型筛选：destination/itinerary/guide/news）
  getAllFavorites(targetType) {
    const params = targetType ? { targetType } : {}
    return request.get('/interactions/favorites', { params })
  },

  // 获取所有点赞（支持按类型筛选：destination/itinerary/guide/news）
  getAllLikes(targetType) {
    const params = targetType ? { targetType } : {}
    return request.get('/interactions/likes', { params })
  }
}
