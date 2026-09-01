<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-text">HerSpace</span>
          <span class="logo-sub">女性专属社交社区</span>
        </div>

        <el-menu mode="horizontal" :default-active="activeMenu" router class="nav-menu">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/report">职场经历专区</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>

        <div class="header-right">
          <template v-if="userStore.isLoggedIn">
            <el-button type="primary" round @click="$router.push('/create-post')">
              <el-icon><Edit /></el-icon> 发布
            </el-button>
            <el-dropdown @command="handleCommand">
              <div class="user-avatar">
                <el-avatar :size="36" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.nickname?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile" :icon="User">个人主页</el-dropdown-item>
                  <el-dropdown-item command="collections" :icon="Star">我的收藏</el-dropdown-item>
                  <el-dropdown-item command="settings" :icon="Setting">账号设置</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isAdmin" command="admin" :icon="Monitor" divided>
                    管理后台
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" :icon="SwitchButton" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" round @click="$router.push('/login')">登录</el-button>
            <el-button round @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>

    <!-- 底部 -->
    <el-footer class="footer">
      <p>HerSpace 女性专属社交社区 | 用户自主发布内容，不代表平台立场</p>
      <p>
        <router-link to="/community-rules">社区公约</router-link> |
        <router-link to="/about">关于我们</router-link>
      </p>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  Edit, User, Star, Setting, Monitor, SwitchButton,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push(`/profile/${userStore.userInfo?.id}`)
      break
    case 'collections':
      router.push('/collections')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        userStore.logout()
        router.push('/')
      }).catch(() => {})
      break
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  height: 60px;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: baseline;
  cursor: pointer;
  margin-right: 40px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #ec4899;
}

.logo-sub {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.nav-menu {
  border-bottom: none !important;
  flex: 1;
}

.nav-menu .el-menu-item.is-active {
  color: #ec4899 !important;
  border-bottom-color: #ec4899 !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 0;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.footer {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.footer a {
  color: #999;
  margin: 0 4px;
}

.footer a:hover {
  color: #ec4899;
}
</style>