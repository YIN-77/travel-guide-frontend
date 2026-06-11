import api from './index'

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadVideo: (file) => {
    const formData = new FormData()
    formData.append('video', file)
    return api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
