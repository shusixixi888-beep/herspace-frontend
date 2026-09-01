import request from '../utils/request'

export const registerApi = {
  // 步骤一：发送验证码
  sendCode(phone: string) {
    return request.post('/register/send-code', { phone })
  },

  // 步骤一：验证验证码
  verifyCode(code: string) {
    return request.post('/register/verify-code', { code })
  },

  // 步骤二：获取答题题目
  getQuiz() {
    return request.get('/register/quiz')
  },

  // 步骤二：提交答题
  submitQuiz(answers: number[]) {
    return request.post('/register/quiz/submit', { answers })
  },

  // 步骤二：获取剩余答题次数
  getQuizAttempts() {
    return request.get('/register/quiz/attempts')
  },

  // 步骤三：实名校验
  verifyRealname(realName: string) {
    return request.post('/register/verify-realname', { realName })
  },

  // 步骤四：创建账号
  createAccount(nickname: string) {
    return request.post('/register/create-account', { nickname })
  },
}