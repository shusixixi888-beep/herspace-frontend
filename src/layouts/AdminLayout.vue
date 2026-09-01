<template>
  <div class="admin-layout">
    <el-container style="height: 100vh">
      <el-aside width="220px" class="admin-aside">
        <div class="admin-logo">
          <span>HerSpace 管理后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin">
            <el-icon><DataBoard /></el-icon>
            <span>控制台</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin/posts">
            <el-icon><Document /></el-icon>
            <span>帖子审核</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isSuperAdmin" index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isSuperAdmin" index="/admin/appeals">
            <el-icon><Bell /></el-icon>
            <span>申诉管理</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isSuperAdmin" index="/admin/logs">
            <el-icon><Tickets /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="admin-header">
          <div class="admin-header-left">
            <span>{{ pageTitle }}</span>
          </div>
          <div class="admin-header-right">
            <el-button text @click="$router.push('/')">
              <el-icon><Back /></el-icon> 返回前台
            </el-button>
            <el-dropdown @command="handleCommand">
              <div class="admin-user">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.nickname?.charAt(0) }}
                </el-avatar>
                <span>{{ userStore.userInfo?.nickname }}</span>
                <el-tag size="small" :type="userStore.isSuperAdmin ? 'danger' : 'warning'">
                  {{ roleLabel }}
                </el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  DataBoard, Document, User, Bell, Tickets, Back,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string) || '管理后台')
const roleLabel = computed(() =>
  userStore.isSuperAdmin ? '超级管理员' : '内容审核员'
)

function handleCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-aside {
  background: #001529;
}

.admin-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.admin-menu {
  border-right: none;
  background: #001529;
}

.admin-menu .el-menu-item {
  color: #ffffffa0;
}

.admin-menu .el-menu-item:hover {
  background: #ffffff15;
  color: #fff;
}

.admin-menu .el-menu-item.is-active {
  background: #ec4899;
  color: #fff;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.admin-header-left {
  font-size: 18px;
  font-weight: 600;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.admin-main {
  background: #f5f5f5;
  padding: 24px;
}
</style>