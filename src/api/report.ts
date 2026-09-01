import request from '../utils/request'

export const reportApi = {
  // 获取发布须知
  getNotice() {
    return request.get('/business/report/notice')
  },

  // 发布匿名举报帖
  createReport(data: {
    surname: string
    industry: string
    companyShort: string
    position: string
    timeRange: string
    scene: string
    description: string
    evidenceFiles: { url: string; description: string; isEvidence: boolean }[]
  }) {
    return request.post('/business/report', data)
  },

  // 举报专区列表
  getReportList(params: { page?: number; pageSize?: number; sortBy?: string }) {
    return request.get('/business/report/list', { params })
  },

  // 举报帖详情
  getReportDetail(id: number) {
    return request.get(`/business/report/${id}`)
  },

  // 提交申诉
  submitAppeal(id: number, data: { appellantName: string; contact?: string; reason: string }) {
    return request.post(`/business/report/${id}/appeal`, data)
  },

  // 我发布的匿名帖
  getMyReports(params: { page?: number; pageSize?: number }) {
    return request.get('/business/report/my/list', { params })
  },

  // 匿名评论
  createComment(id: number, data: { content: string; parentId?: number }) {
    return request.post(`/business/report/${id}/comment`, data)
  },

  // 获取举报帖评论
  getReportComments(id: number, params: { page?: number; pageSize?: number }) {
    return request.get(`/business/report/${id}/comments`, { params })
  },
}