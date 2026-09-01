<template>
  <div class="settings-page">
    <div class="settings-container">
      <h2>账号设置</h2>

      <el-form :model="form" label-width="80px" class="settings-form">
        <el-form-item label="头像">
          <el-upload
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <el-avatar :size="64" :src="form.avatar">
              {{ form.nickname?.charAt(0) }}
            </el-avatar>
            <el-button size="small" style="margin-left: 12px">更换头像</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" maxlength="20" show-word-limit />
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { authApi } from '../api/auth'
import { uploadApi } from '../api/upload'

const userStore = useUserStore()

const form = ref({
  nickname: '',
  avatar: '',
  bio: '',
})
const saving = ref(false)

async function handleAvatarChange(file: any) {
  if (file.raw) {
    try {
      const res = await uploadApi.uploadImages([file.raw])
      form.value.avatar = res.data.urls[0]
    } catch {}
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await authApi.updateProfile(form.value)
    await userStore.fetchUserInfo()
    ElMessage.success('保存成功')
  } catch {} finally {
    saving.value = false
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    form.value.nickname = userStore.userInfo.nickname || ''
    form.value.avatar = userStore.userInfo.avatar || ''
    form.value.bio = userStore.userInfo.bio || ''
  }
})
</script>

<style scoped>
.settings-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
}

h2 {
  margin-bottom: 24px;
}
</style>