import api from './index'

export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread'),
  markAsRead: (id = null) => api.put(id ? `/notifications/read/${id}` : '/notifications/read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
}