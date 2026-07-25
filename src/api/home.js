import api from './index'

export default {
  getHomeData() {
    return api.get('/home')
  }
}
