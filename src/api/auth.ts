import request from '../utils/request'

export const authApi = {
  // 登录（测试环境验证码固定123456）
  login(phone: string, code: string) {
    return request.post('/auth/login', { phone, code })
  },

  // 获取当前用户信息
  getMe() {
    return request.get('/auth/me')
  },

  // 更新个人资料
  updateProfile(data: { nickname?: string; avatar?: string; bio?: string }) {
    return request.put('/auth/profile', data)
  },
}