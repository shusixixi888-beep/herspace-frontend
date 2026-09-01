<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="post" class="post-content">
      <!-- 游客提示 -->
      <el-alert
        v-if="post.isGuest"
        type="warning"
        :closable="false"
        class="guest-alert"
      >
        <template #title>
          登录后可查看完整内容和评论
          <el-button type="primary" size="small" @click="$router.push('/login')" style="margin-left: 12px">
            去登录
          </el-button>
        </template>
      </el-alert>

      <!-- 帖子头部 -->
      <div class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <div class="post-author">
            <el-avatar :size="40" :src="post.author?.avatar">
              {{ post.author?.nickname?.charAt(0) }}
            </el-avatar>
            <div class="author-info">
              <span class="author-name">{{ post.author?.nickname }}</span>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
          <div v-if="post.tags && post.tags.length" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag-item">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- 帖子正文 -->
      <div class="post-body">
        <p v-if="post.isGuest" class="guest-content">{{ post.summary }}...</p>
        <div v-else v-html="formatContent(post.content)" class="full-content"></div>

        <!-- 图片 -->
        <div v-if="post.images && post.images.length && !post.isGuest" class="post-images">
          <el-image
            v-for="(img, index) in post.images"
            :key="index"
            :src="img"
            :preview-src-list="post.images"
            :initial-index="index"
            fit="cover"
            class="post-image"
          />
        </div>
      </div>

      <!-- 互动栏 -->
      <div v-if="!post.isGuest" class="interaction-bar">
        <div class="interaction-item" :class="{ active: interaction.liked }" @click="handleLike">
          <el-icon><Star /></el-icon>
          <span>{{ post.likeCount }}</span>
        </div>
        <div class="interaction-item" :class="{ active: interaction.collected }" @click="handleCollect">
          <el-icon><CollectionTag /></el-icon>
          <span>{{ post.collectCount }}</span>
        </div>
        <div class="interaction-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ post.commentCount }}</span>
        </div>
      </div>

      <!-- 评论区 -->
      <div v-if="!post.isGuest" class="comment-section">
        <h3>评论 ({{ post.commentCount }})</h3>

        <!-- 发评论 -->
        <div class="comment-input">
          <el-input
            v-model="commentText"
            type="textarea"
            :rows="3"
            placeholder="说点什么..."
            maxlength="500"
            show-word-limit
          />
          <div class="comment-options">
            <el-checkbox v-model="isAnonymous">匿名评论</el-checkbox>
            <el-button type="primary" size="small" @click="submitComment">发表</el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <el-avatar :size="32" :src="comment.author?.avatar">
              {{ comment.isAnonymous ? comment.anonymousName?.charAt(2) : comment.author?.nickname?.charAt(0) }}
            </el-avatar>
            <div class="comment-content">
              <div class="comment-author">
                {{ comment.isAnonymous ? comment.anonymousName : comment.author?.nickname }}
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-meta">
                <span>{{ formatTime(comment.createdAt) }}</span>
                <span v-if="comment.author?.id === userStore.userInfo?.id" class="comment-delete" @click="deleteComment(comment.id)">
                  删除
                </span>
              </div>

              <!-- 子回复 -->
              <div v-if="comment.replies && comment.replies.length" class="reply-list">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <span class="reply-name">{{ reply.anonymousName || reply.author?.nickname }}</span>
                  <span class="reply-text">{{ reply.content }}</span>
                  <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="帖子不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, CollectionTag, ChatDotRound } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useUserStore } from '../stores/user'
import { postApi } from '../api/post'
import { commentApi } from '../api/comment'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref<any>(null)
const loading = ref(true)
const interaction = ref({ liked: false, collected: false })
const comments = ref<any[]>([])
const commentText = ref('')
const isAnonymous = ref(false)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function formatContent(content: string) {
  return content.replace(/\n/g, '<br>')
}

async function loadPost() {
  loading.value = true
  try {
    const res = await postApi.getPostDetail(parseInt(route.params.id as string))
    post.value = res.data

    // 登录用户获取交互状态
    if (userStore.isLoggedIn && !res.data.isGuest) {
      const intRes = await postApi.getInteraction(parseInt(route.params.id as string))
      interaction.value = intRes.data
    }

    // 加载评论
    if (!res.data.isGuest) {
      await loadComments()
    }
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const res = await commentApi.getComments(parseInt(route.params.id as string))
    comments.value = res.data.list
  } catch {}
}

async function handleLike() {
  try {
    const res = await postApi.toggleLike(post.value.id)
    interaction.value.liked = res.data.liked
    post.value.likeCount = res.data.likeCount
  } catch {}
}

async function handleCollect() {
  try {
    const res = await postApi.toggleCollect(post.value.id)
    interaction.value.collected = res.data.collected
    post.value.collectCount = res.data.collectCount
  } catch {}
}

async function submitComment() {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    await commentApi.createComment({
      postId: post.value.id,
      content: commentText.value,
      isAnonymous: isAnonymous.value,
    })
    commentText.value = ''
    isAnonymous.value = false
    ElMessage.success('评论成功')
    await loadComments()
    post.value.commentCount++
  } catch {}
}

async function deleteComment(id: number) {
  try {
    await commentApi.deleteComment(id)
    ElMessage.success('删除成功')
    await loadComments()
    post.value.commentCount--
  } catch {}
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.post-detail-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.guest-alert {
  margin-bottom: 20px;
}

.post-header {
  margin-bottom: 24px;
}

.post-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-body {
  margin-bottom: 24px;
  line-height: 1.8;
}

.guest-content {
  color: #666;
  font-size: 15px;
}

.full-content {
  font-size: 15px;
  white-space: pre-wrap;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.post-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  cursor: pointer;
}

.interaction-bar {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.interaction-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.interaction-item:hover {
  color: #ec4899;
}

.interaction-item.active {
  color: #ec4899;
}

.comment-section h3 {
  margin-bottom: 16px;
}

.comment-input {
  margin-bottom: 24px;
}

.comment-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-author {
  font-weight: 500;
  font-size: 13px;
  color: #333;
}

.comment-text {
  margin: 4px 0;
  font-size: 14px;
}

.comment-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.comment-delete {
  cursor: pointer;
  color: #999;
}

.comment-delete:hover {
  color: #f56c6c;
}

.reply-list {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  font-size: 13px;
  margin-bottom: 4px;
}

.reply-name {
  color: #ec4899;
  margin-right: 6px;
}

.reply-time {
  color: #ccc;
  margin-left: 8px;
}
</style>