import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/Home.vue'),
        meta: { title: 'HerSpace - 首页' },
      },
      {
        path: 'post/:id',
        name: 'post-detail',
        component: () => import('../views/PostDetail.vue'),
        meta: { title: '帖子详情' },
      },
      {
        path: 'create-post',
        name: 'create-post',
        component: () => import('../views/CreatePost.vue'),
        meta: { title: '发布帖子', requiresAuth: true },
      },
      {
        path: 'profile/:id',
        name: 'profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人主页' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '账号设置', requiresAuth: true },
      },
      {
        path: 'collections',
        name: 'collections',
        component: () => import('../views/Collections.vue'),
        meta: { title: '我的收藏', requiresAuth: true },
      },
    ],
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/register/RegisterFlow.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue'),
    meta: { title: '关于HerSpace' },
  },
  {
    path: '/community-rules',
    name: 'community-rules',
    component: () => import('../views/CommunityRules.vue'),
    meta: { title: '社区公约' },
  },
  // 匿名举报专区
  {
    path: '/report',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'report-list',
        component: () => import('../views/report/ReportList.vue'),
        meta: { title: '职场经历专区' },
      },
      {
        path: ':id',
        name: 'report-detail',
        component: () => import('../views/report/ReportDetail.vue'),
        meta: { title: '经历详情' },
      },
      {
        path: 'create',
        name: 'report-create',
        component: () => import('../views/report/CreateReport.vue'),
        meta: { title: '发布经历', requiresAuth: true },
      },
    ],
  },
  // 管理后台
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理后台' },
      },
      {
        path: 'posts',
        name: 'admin-posts',
        component: () => import('../views/admin/PostAudit.vue'),
        meta: { title: '帖子审核', roles: ['auditor', 'super_admin'] },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/admin/UserList.vue'),
        meta: { title: '用户管理', roles: ['super_admin'] },
      },
      {
        path: 'logs',
        name: 'admin-logs',
        component: () => import('../views/admin/OperationLogs.vue'),
        meta: { title: '操作日志', roles: ['super_admin'] },
      },
      {
        path: 'appeals',
        name: 'admin-appeals',
        component: () => import('../views/admin/AppealList.vue'),
        meta: { title: '申诉管理', roles: ['super_admin'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || 'HerSpace'

  const userStore = useUserStore()

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login' })
    return
  }

  // 需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  // 特定角色权限
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    if (!to.meta.roles.includes(userStore.role)) {
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router
