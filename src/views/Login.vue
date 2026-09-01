<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="title">登录 HerSpace</h1>
        <p class="subtitle">女性专属社交社区</p>
      </div>

      <el-form :model="form" label-width="0" class="form">
        <el-form-item>
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            size="large"
            maxlength="11"
            :prefix-icon="Phone"
          />
        </el-form-item>
        <el-form-item>
          <div class="code-row">
            <el-input
              v-model="form.code"
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
              {{ cooldown > 0 ? `${cooldown}s` : '发送' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            @click="handleLogin"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 测试账号提示 -->
      <el-alert type="info" :closable="false" class="test-info">
        <template #title>
          【测试账号】超管：13800000000 | 审核员：13800000001 | 验证码：123456
        </template>
      </el-alert>

      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Key } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { authApi } from '../api/auth'
import { registerApi } from '../api/register'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ phone: '', code: '' })
const loading = ref(false)
const cooldown = ref(0)
let timer: any = null

async function sendCode() {
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    await registerApi.sendCode(form.value.phone)
    ElMessage.success('验证码已发送（测试环境固定为123456）')
    cooldown.value = 60
    timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch {}
}

async function handleLogin() {
  if (!form.value.phone || !form.value.code) {
    ElMessage.warning('请输入手机号和验证码')
    return
  }

  loading.value = true
  try {
    const res = await authApi.login(form.value.phone, form.value.code)
    userStore.setAuth(res.data.token, res.data.user)
    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  padding: 20px;
}

.login-container {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.1);
}

.login-header {
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

.test-info {
  margin-top: 16px;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  color: #999;
  font-size: 14px;
}
</style>