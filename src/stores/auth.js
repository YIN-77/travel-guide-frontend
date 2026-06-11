import { defineStore } from 'pinia'
import { authAPI } from '../api/auth'
import { userAPI } from '../api/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    admin: JSON.parse(localStorage.getItem('admin') || 'null'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdminLoggedIn: (state) => !!state.admin,
    isUserLoggedIn: (state) => !!state.user
  },

  actions: {
    async login(credentials) {
      const res = await authAPI.login(credentials)
      if (res.code === 200) {
        this.token = res.data.token
        this.admin = res.data.admin
        this.user = null
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('admin', JSON.stringify(res.data.admin))
        localStorage.removeItem('user')
        return true
      }
      return false
    },

    async userLogin(credentials) {
      const res = await userAPI.login(credentials)
      if (res.code === 200) {
        this.token = res.data.token
        this.user = res.data.user
        this.admin = null
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        localStorage.removeItem('admin')
        return true
      }
      return false
    },

    async register(userData) {
      const res = await userAPI.register(userData)
      if (res.code === 200) {
        this.token = res.data.token
        this.user = res.data.user
        this.admin = null
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        localStorage.removeItem('admin')
        return true
      }
      return false
    },

    async updateProfile(data) {
      const res = await userAPI.updateProfile(data)
      if (res.code === 200) {
        this.user = { ...this.user, ...res.data }
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      }
      return false
    },

    logout() {
      this.token = ''
      this.admin = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      localStorage.removeItem('user')
    }
  }
})
