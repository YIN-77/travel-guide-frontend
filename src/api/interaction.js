import api from './index'

export const interactionAPI = {
  // 点赞
  like: (targetType, targetId) => api.post('/interactions/like', { targetType, targetId }),

  // 取消点赞
  unlike: (targetType, targetId) => api.delete(`/interactions/like/${targetType}/${targetId}`),

  // 收藏
  favorite: (targetType, targetId) => api.post('/interactions/favorite', { targetType, targetId }),

  // 取消收藏
  unfavorite: (targetType, targetId) => api.delete(`/interactions/favorite/${targetType}/${targetId}`),

  // 记录分享
  share: (targetType, targetId) => api.post('/interactions/share', { targetType, targetId }),

  // 检查是否已点赞/收藏
  check: (targetType, targetId) => api.get(`/interactions/check/${targetType}/${targetId}`),

  // 获取收藏列表
  getFavorites: (targetType, page = 1, limit = 10) => api.get('/interactions/favorites', {
    params: { targetType, page, limit }
  })
}