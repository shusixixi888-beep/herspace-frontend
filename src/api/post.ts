import request from '../utils/request'

export const postApi = {
  // 发帖
  createPost(data: {
    title: string
    content: string
    images?: string[]
    tags?: string[]
    coverImage?: string
  }) {
    return request.post('/business/post', data)
  },

  // 信息流
  getFeed(params: { page?: number; pageSize?: number; tag?: string }) {
    return request.get('/business/post/feed', { params })
  },

  // 帖子详情
  getPostDetail(id: number) {
    return request.get(`/business/post/${id}`)
  },

  // 点赞/取消点赞
  toggleLike(id: number) {
    return request.post(`/business/post/${id}/like`)
  },

  // 收藏/取消收藏
  toggleCollect(id: number) {
    return request.post(`/business/post/${id}/collect`)
  },

  // 获取用户交互状态
  getInteraction(id: number) {
    return request.get(`/business/post/${id}/interaction`)
  },

  // 删除帖子
  deletePost(id: number) {
    return request.delete(`/business/post/${id}`)
  },

  // 获取用户帖子
  getUserPosts(userId: number, params: { page?: number; pageSize?: number }) {
    return request.get(`/business/post/user/${userId}`, { params })
  },

  // 我的收藏
  getMyCollections(params: { page?: number; pageSize?: number }) {
    return request.get('/business/post/my/collections', { params })
  },
}