<template>
  <div class="home-page">
    <!-- 欢迎横幅（仅游客可见） -->
    <div v-if="!userStore.isLoggedIn" class="welcome-banner">
      <div class="banner-content">
        <h1>HerSpace</h1>
        <p>女性专属社交社区 · 安全、友善、互助</p>
        <div class="banner-actions">
          <el-button type="primary" size="large" round @click="$router.push('/register')">
            立即注册
          </el-button>
          <el-button size="large" round @click="$router.push('/about')">
            了解更多
          </el-button>
        </div>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="filter-bar">
      <div class="tag-list">
        <span
          v-for="tag in tags"
          :key="tag"
          class="tag-item"
          :class="{ active: selectedTag === tag }"
          @click="selectTag(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 帖子信息流 -->
    <div class="feed-container">
      <div v-if="loading" class="loading-list">
        <el-skeleton v-for="i in 3" :key="i" :rows="4" animated class="skeleton-item" />
      </div>

      <div v-else-if="posts.length > 0" class="post-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="goToPost(post.id)"
        >
          <div v-if="post.coverImage" class="post-cover">
            <img :src="post.coverImage" alt="cover" />
          </div>
          <div class="post-info">
            <h3 class="post-title">{{ post.title }}</h3>
            <p v-if="post.isGuest" class="post-summary">{{ post.summary }}...</p>
            <div class="post-tags" v-if="post.tags && post.tags.length">
              <span v-for="tag in post.tags" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
            <div class="post-meta">
              <div class="post-author">
                <el-avatar :size="24" :src="post.author?.avatar">
                  {{ post.author?.nickname?.charAt(0) }}
                </el-avatar>
                <span>{{ post.author?.nickname }}</span>
              </div>
              <div class="post-stats">
                <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-empty description="暂无内容" />
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadPosts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Star, ChatDotRound } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { postApi } from '../api/post'

const router = useRouter()
const userStore = useUserStore()

const posts = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const selectedTag = ref('')
const tags = ref(['全部', '生活', '职场', '穿搭', '美妆', '情感', '学习', '美食'])

async function loadPosts() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    if (selectedTag.value && selectedTag.value !== '全部') {
      params.tag = selectedTag.value
    }
    const res = await postApi.getFeed(params)
    posts.value = res.data.list
    total.value = res.data.total
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

function selectTag(tag: string) {
  selectedTag.value = tag === '全部' ? '' : tag
  currentPage.value = 1
  loadPosts()
}

function goToPost(id: number) {
  router.push(`/post/${id}`)
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.welcome-banner {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 16px;
  padding: 48px 32px;
  margin-bottom: 24px;
  color: #fff;
  text-align: center;
}

.banner-content h1 {
  font-size: 36px;
  font-weight: 700;
}

.banner-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 12px 0 24px;
}

.banner-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.banner-actions .el-button--default {
  color: #ec4899;
}

.filter-bar {
  margin-bottom: 20px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 16px;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.tag-item:hover {
  border-color: #ec4899;
  color: #ec4899;
}

.tag-item.active {
  background: #ec4899;
  color: #fff;
  border-color: #ec4899;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.post-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.post-cover img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.post-info {
  padding: 16px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-summary {
  color: #999;
  font-size: 13px;
  margin: 8px 0;
}

.post-tags {
  margin: 8px 0;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-stats {
  display: flex;
  gap: 12px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-list .skeleton-item {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>