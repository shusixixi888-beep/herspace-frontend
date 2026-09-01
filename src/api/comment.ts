import request from '../utils/request'

export const commentApi = {
  // 发表评论
  createComment(data: {
    postId: number
    content: string
    parentId?: number
    isAnonymous?: boolean
  }) {
    return request.post('/business/comment', data)
  },

  // 获取评论列表
  getComments(postId: number, params: { page?: number; pageSize?: number }) {
    return request.get(`/business/comment/post/${postId}`, { params })
  },

  // 删除评论
  deleteComment(id: number) {
    return request.delete(`/business/comment/${id}`)
  },
}