<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="title">加入 HerSpace</h1>
        <p class="subtitle">女性专属社交社区 · 注册需完成三步验证</p>
      </div>

      <!-- 步骤指示器 -->
      <el-steps :active="stepIndex" align-center class="steps">
        <el-step title="手机验证" description="验证手机号" />
        <el-step title="社区规则" description="准入答题" />
        <el-step title="实名验证" description="性别核验" />
        <el-step title="创建账号" description="设置昵称" />
      </el-steps>

      <!-- 步骤一：手机号验证 -->
      <div v-if="currentStep === 'phone'" class="step-content">
        <el-form :model="phoneForm" label-width="0" class="form">
          <el-form-item>
            <el-input
              v-model="phoneForm.phone"
              placeholder="请输入手机号"
              size="large"
              maxlength="11"
              :prefix-icon="Phone"
            />
          </el-form-item>
          <el-form-item>
            <div class="code-row">
              <el-input
                v-model="phoneForm.code"
                placeholder="验证码（测试环境固定123456）"
                size="large"
                maxlength="6"
                :prefix-icon="Key"
              />
              <el-button
                type="primary"
                size="large"
                :disabled="cooldown > 0"
                @click="sendCode"
              >
                {{ cooldown > 0 ? `${cooldown}s后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              @click="verifyCode"
            >
              验证并继续
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤二：准入答题 -->
      <div v-else-if="currentStep === 'quiz'" class="step-content">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="questions.length > 0" class="quiz-container">
          <el-alert type="info" :closable="false" class="quiz-info">
            <template #title>
              共{{ questions.length }}题，正确率≥80%通过。
              剩余答题机会：{{ remainingAttempts }}次
            </template>
          </el-alert>

          <div
            v-for="(q, qIndex) in questions"
            :key="qIndex"
            class="quiz-item"
          >
            <p class="quiz-question">
              {{ qIndex + 1 }}. {{ q.question }}
            </p>
            <el-radio-group v-model="answers[qIndex]" class="quiz-options">
              <el-radio
                v-for="(opt, optIndex) in q.options"
                :key="optIndex"
                :label="optIndex"
                class="quiz-option"
              >
                {{ opt }}
              </el-radio>
            </el-radio-group>
          </div>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            @click="submitQuiz"
            :disabled="answers.some((a) => a === null)"
          >
            提交答题
          </el-button>
        </div>
      </div>

      <!-- 步骤三：实名校验 -->
      <div v-else-if="currentStep === 'realname'" class="step-content">
        <el-alert type="warning" :closable="false" class="warning-alert">
          <template #title>
            本社区为女性专属社区，需进行实名性别校验。
            平台不会存储您的身份证号，仅记录核验状态和性别。
          </template>
        </el-alert>

        <el-alert type="info" :closable="false" class="mock-alert">
          <template #title>
            【测试环境】姓名含「女」→ 通过+女性；含「男」→ 通过+男性；含「失败」→ 不通过
          </template>
        </el-alert>

        <el-form :model="realnameForm" label-width="100px" class="form">
          <el-form-item label="真实姓名">
            <el-input
              v-model="realnameForm.name"
              placeholder="请输入真实姓名"
              size="large"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              @click="verifyRealname"
            >
              进行实名验证
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤四：创建账号 -->
      <div v-else-if="currentStep === 'create_account'" class="step-content">
        <el-result
          icon="success"
          title="实名验证通过"
          sub-title="请设置您的社区昵称，完成注册"
        />

        <el-form :model="accountForm" label-width="100px" class="form">
          <el-form-item label="昵称">
            <el-input
              v-model="accountForm.nickname"
              placeholder="给自己取一个昵称吧"
              size="large"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              @click="createAccount"
            >
              完成注册
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 已有账号链接 -->
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Phone, Key } from '@element-plus/icons-vue'
import { useRegisterStore } from '../../stores/register'
import { useUserStore } from '../../stores/user'
import { registerApi } from '../../api/register'

const router = useRouter()
const registerStore = useRegisterStore()
const userStore = useUserStore()

const currentStep = ref('phone')
const registerToken = ref('')
const loading = ref(false)

// 步骤索引
const stepIndex = computed(() => {
  const steps = ['phone', 'quiz', 'realname', 'create_account']
  const idx = steps.indexOf(currentStep.value)
  return idx === -1 ? 0 : idx
})

// 表单数据
const phoneForm = ref({ phone: '', code: '' })
const realnameForm = ref({ name: '' })
const accountForm = ref({ nickname: '' })

// 答题数据
const questions = ref<any[]>([])
const answers = ref<number[]>([])
const remainingAttempts = ref(5)
const cooldown = ref(0)
let cooldownTimer: any = null

// 发送验证码
async function sendCode() {
  if (!/^1[3-9]\d{9}$/.test(phoneForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    const res = await registerApi.sendCode(phoneForm.value.phone)
    registerStore.setToken(res.data.token, 'phone')
    registerToken.value = res.data.token
    ElMessage.success(res.data.message || '验证码已发送')

    // 开启冷却倒计时
    cooldown.value = 60
    cooldownTimer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(cooldownTimer)
      }
    }, 1000)
  } catch {
    // 错误已在拦截器处理
  }
}

// 验证验证码
async function verifyCode() {
  if (!phoneForm.value.code) {
    ElMessage.warning('请输入验证码')
    return
  }

  try {
    const res = await registerApi.verifyCode(phoneForm.value.code)
    registerStore.setToken(res.data.token, 'quiz')
    registerToken.value = res.data.token
    currentStep.value = 'quiz'
    ElMessage.success('手机号验证通过')
    await loadQuiz()
  } catch {
    // 错误已在拦截器处理
  }
}

// 加载答题题目
async function loadQuiz() {
  loading.value = true
  try {
    const res = await registerApi.getQuiz()
    registerStore.setToken(res.data.token, 'quiz')
    registerToken.value = res.data.token
    questions.value = res.data.questions
    answers.value = new Array(res.data.questions.length).fill(null)

    // 获取剩余次数
    const attemptRes = await registerApi.getQuizAttempts()
    remainingAttempts.value = attemptRes.data.remaining
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

// 提交答题
async function submitQuiz() {
  if (answers.value.some((a) => a === null)) {
    ElMessage.warning('请完成所有题目')
    return
  }

  try {
    const res = await registerApi.submitQuiz(answers.value)

    if (res.data.passed) {
      registerStore.setToken(res.data.token, 'realname')
      registerToken.value = res.data.token
      currentStep.value = 'realname'
      ElMessage.success('答题通过！')
    } else {
      // 不通过，不暴露具体分数
      ElMessageBox.confirm(
        '答题未通过，可以重新答题。是否继续？',
        '提示',
        { confirmButtonText: '重新答题', cancelButtonText: '稍后再试' }
      ).then(() => {
        loadQuiz()
      }).catch(() => {
        router.push('/login')
      })
    }
  } catch {
    // 错误已在拦截器处理
  }
}

// 实名验证
async function verifyRealname() {
  if (!realnameForm.value.name) {
    ElMessage.warning('请输入真实姓名')
    return
  }

  try {
    const res = await registerApi.verifyRealname(realnameForm.value.name)

    if (res.data.passed) {
      registerStore.setToken(res.data.token, 'create_account')
      registerToken.value = res.data.token
      currentStep.value = 'create_account'
      ElMessage.success('实名验证通过！')
    } else {
      // 统一提示，不区分具体失败原因
      ElMessage.error('实名校验未通过，注册终止')
      registerStore.clear()
      setTimeout(() => router.push('/login'), 2000)
    }
  } catch {
    // 错误已在拦截器处理
  }
}

// 创建账号
async function createAccount() {
  if (!accountForm.value.nickname) {
    ElMessage.warning('请输入昵称')
    return
  }

  try {
    const res = await registerApi.createAccount(accountForm.value.nickname)
    userStore.setAuth(res.data.token, res.data.user)
    registerStore.clear()
    ElMessage.success('注册成功，欢迎加入社区！')
    router.push('/')
  } catch {
    // 错误已在拦截器处理
  }
}

onMounted(() => {
  // 恢复注册流程
  if (registerStore.token && registerStore.currentStep !== 'phone') {
    currentStep.value = registerStore.currentStep
    registerToken.value = registerStore.token
    if (currentStep.value === 'quiz') {
      loadQuiz()
    }
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  padding: 20px;
}

.register-container {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  max-width: 640px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #ec4899;
}

.subtitle {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

.steps {
  margin-bottom: 32px;
}

.step-content {
  min-height: 300px;
}

.form {
  margin-top: 24px;
}

.code-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-row .el-input {
  flex: 1;
}

.submit-btn {
  width: 100%;
}

.quiz-container {
  margin-top: 16px;
}

.quiz-info {
  margin-bottom: 20px;
}

.quiz-item {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.quiz-question {
  font-weight: 500;
  margin-bottom: 12px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quiz-option {
  display: flex;
  align-items: center;
  margin: 0;
}

.warning-alert, .mock-alert {
  margin-bottom: 16px;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: #999;
  font-size: 14px;
}

.loading {
  padding: 20px;
}
</style>