import request from '../utils/request'

export const uploadApi = {
  // 上传图片
  uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return request.post('/business/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}