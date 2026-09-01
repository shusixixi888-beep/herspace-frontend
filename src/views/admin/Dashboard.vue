<template>
  <div class="dashboard-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalPosts }}</div>
          <div class="stat-label">总帖子数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value text-warning">{{ stats.pendingPosts }}</div>
          <div class="stat-label">待审核</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">注册用户</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value text-danger">{{ stats.bannedUsers }}</div>
          <div class="stat-label">封禁用户</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin/posts')">帖子审核</el-button>
            <el-button v-if="userStore.isSuperAdmin" @click="$router.push('/admin/users')">用户管理</el-button>
            <el-button v-if="userStore.isSuperAdmin" @click="$router.push('/admin/appeals')">申诉管理</el-button>
            <el-button v-if="userStore.isSuperAdmin" @click="$router.push('/admin/logs')">操作日志</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>角色信息</template>
          <div class="role-info">
            <p>当前角色：{{ userStore.isSuperAdmin ? '超级管理员' : '内容审核员' }}</p>
            <p>账号：{{ userStore.userInfo?.phone }}</p>
            <p>昵称：{{ userStore.userInfo?.nickname }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { adminApi } from '../../api/admin'

const userStore = useUserStore()
const stats = ref({
  totalPosts: 0,
  pendingPosts: 0,
  totalUsers: 0,
  bannedUsers: 0,
})

async function loadStats() {
  try {
    const res = await adminApi.getPendingPosts({ page: 1, pageSize: 1 })
    stats.value.pendingPosts = res.data.total
  } catch {}
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.stat-label {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.role-info p {
  margin-bottom: 8px;
}
</style>