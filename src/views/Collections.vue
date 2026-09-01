<template>
  <div class="collections-page">
    <h2 class="page-title">我的收藏</h2>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="4" animated />
    </div>

    <div v-else-if="list.length > 0" class="post-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="post-item"
        @click="$router.push(`/post/${item.id}`)"
      >
        <div class="post-info">
          <h4>{{ item.title }}</h4>
          <div class="post-meta">
            <span>收藏于 {{ formatTime(item.collectedAt) }}</span>
            <span>{{ item.likeCount }} 赞</span>
            <span>{{ item.commentCount }} 评论</span>
          </div>
        </div>
        <img v-if="item.coverImage" :src="item.coverImage" class="post-cover" />
      </div>
    </div>

    <el-empty v-else description="还没有收藏内容" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { postApi } from '../api/post'

const list = ref<any[]>([])
const loading = ref(true)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

async function loadCollections() {
  loading.value = true
  try {
    const res = await postApi.getMyCollections({ page: 1, pageSize: 20 })
    list.value = res.data.list
  } catch {} finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCollections()
})
</script>

<style scoped>
.collections-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 20px;
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

.post-info {
  flex: 1;
}

.post-info h4 {
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.post-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}
</style>