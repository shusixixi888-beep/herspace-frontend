import request from '../utils/request'

export const adminApi = {
  // [审核员] 待审核帖子
  getPendingPosts(params: { page?: number; pageSize?: number }) {
    return request.get('/business/admin/posts/pending', { params })
  },

  // [审核员] 审核帖子
  auditPost(id: number, data: { action: 'approve' | 'reject'; reason?: string }) {
    return request.post(`/business/admin/posts/${id}/audit`, data)
  },

  // [审核员] 下架帖子
  takedownPost(id: number, reason: string) {
    return request.post(`/business/admin/posts/${id}/takedown`, { reason })
  },

  // [审核员] 下架评论
  takedownComment(id: number, reason: string) {
    return request.post(`/business/admin/comments/${id}/takedown`, { reason })
  },

  // [超管] 用户列表
  getUserList(params: { page?: number; pageSize?: number; keyword?: string }) {
    return request.get('/business/admin/users', { params })
  },

  // [超管] 封禁
  banUser(id: number, reason: string) {
    return request.post(`/business/admin/users/${id}/ban`, { reason })
  },

  // [超管] 解封
  unbanUser(id: number) {
    return request.post(`/business/admin/users/${id}/unban`)
  },

  // [超管] 查看匿名映射
  viewAnonymousMap(id: number) {
    return request.get(`/business/admin/posts/${id}/anonymous-map`)
  },

  // [超管] 操作日志
  getOperationLogs(params: { page?: number; pageSize?: number }) {
    return request.get('/business/admin/logs', { params })
  },

  // [超管] 申诉列表
  getAppealList(params: { page?: number; pageSize?: number; status?: string }) {
    return request.get('/business/admin/appeals', { params })
  },

  // [超管] 处理申诉
  handleAppeal(id: number, data: { status: 'resolved' | 'rejected'; result: string }) {
    return request.post(`/business/admin/appeals/${id}/handle`, data)
  },
}