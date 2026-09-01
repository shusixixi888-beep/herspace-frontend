import request from '../utils/request'

export const userApi = {
  // 获取用户公开主页
  getProfile(id: number) {
    return request.get(`/business/user/${id}/profile`)
  },
}