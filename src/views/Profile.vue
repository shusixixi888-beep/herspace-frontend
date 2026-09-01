<template>
  <div class="profile-page">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="profile" class="profile-content">
      <!-- 个人信息卡片 -->
      <div class="profile-header">
        <el-avatar :size="80" :src="profile.avatar">
          {{ profile.nickname?.charAt(0) }}
        </el-avatar>
        <div class="profile-info">
          <h2>{{ profile.nickname }}</h2>
          <p class="bio">{{ profile.bio || '这个人很懒，什么都没写' }}</p>
          <div class="profile-stats">
            <span>帖子 {{ profile.stats.postCount }}</span>
            <span>收藏 {{ profile.stats.collectCount }}</span>
          </div>
          <p class="register-time">加入于 {{ formatTime(profile.registerTime) }}</p>
        </div>
      </div>

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="帖子" name="posts">
          <div v-if="posts.length > 0" class="post-list">
            <div
              v-for="post in posts"
              :key="post.id"
              class="post-item"
              @click="$router.push(`/post/${post.id}`)"
            >
              <div class="post-item-info">
                <h4>{{ post.title }}</h4>
                <div class="post-item-meta">
                  <span>{{ formatTime(post.createdAt) }}</span>
                  <span>{{ post.likeCount }} 赞</span>
                  <span>{{ post.commentCount }} 评论</span>
                </div>
              </div>
              <img v-if="post.coverImage" :src="post.coverImage" class="post-item-cover" />
            </div>
          </div>
          <el-empty v-else description="暂无帖子" />
        </el-tab-pane>

        <el-tab-pane v-if="isMyProfile" label="收藏" name="collections">
          <div v-if="collections.length > 0" class="post-list">
            <div
              v-for="col in collections"
              :key="col.id"
              class="post-item"
              @click="$router.push(`/post/${col.id}`)"
            >
              <div class="post-item-info">
                <h4>{{ col.title }}</h4>
                <div class="post-item-meta">
                  <span>收藏于 {{ formatTime(col.collectedAt) }}</span>
                  <span>{{ col.likeCount }} 赞</span>
                </div>
              </div>
              <img v-if="col.coverImage" :src="col.coverImage" class="post-item-cover" />
            </div>
          </div>
          <el-empty v-else description="暂无收藏" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { useUserStore } from '../stores/user'
import { userApi } from '../api/user'
import { postApi } from '../api/post'

const route = useRoute()
const userStore = useUserStore()

const profile = ref<any>(null)
const loading = ref(true)
const activeTab = ref('posts')
const posts = ref<any[]>([])
const collections = ref<any[]>([])

const isMyProfile = computed(
  () => userStore.userInfo?.id === parseInt(route.params.id as string)
)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD')
}

async function loadProfile() {
  loading.value = true
  try {
    const res = await userApi.getProfile(parseInt(route.params.id as string))
    profile.value = res.data
    await loadPosts()
  } catch {} finally {
    loading.value = false
  }
}

async function loadPosts() {
  try {
    const res = await postApi.getUserPosts(parseInt(route.params.id as string), {
      page: 1,
      pageSize: 20,
    })
    posts.value = res.data.list
  } catch {}
}

async function loadCollections() {
  try {
    const res = await postApi.getMyCollections({ page: 1, pageSize: 20 })
    collections.value = res.data.list
  } catch {}
}

function handleTabChange(tab: string) {
  if (tab === 'collections') {
    loadCollections()
  }
}

watch(() => route.params.id, () => {
  if (route.params.id) loadProfile()
})

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.bio {
  color: #666;
  margin-bottom: 12px;
}

.profile-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.profile-stats span {
  color: #999;
  font-size: 14px;
}

.register-time {
  font-size: 12px;
  color: #ccc;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.post-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.post-item-info {
  flex: 1;
}

.post-item-info h4 {
  margin-bottom: 8px;
}

.post-item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.post-item-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}
</style>