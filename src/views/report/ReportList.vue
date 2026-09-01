<template>
  <div class="report-list-page">
    <!-- 专区说明 -->
    <el-alert type="warning" :closable="false" class="zone-notice">
      <template #title>
        本专区为用户自主发布职场相关经历分享，平台仅做形式合规性审核，
        排序依据为材料完整度，不代表内容真实性。
      </template>
    </el-alert>

    <!-- 排序切换 -->
    <div class="sort-bar">
      <el-radio-group v-model="sortBy" @change="loadList">
        <el-radio-button value="completeness">按完整度</el-radio-button>
        <el-radio-button value="latest">最新发布</el-radio-button>
      </el-radio-group>
      <el-button v-if="userStore.isLoggedIn" type="primary" @click="$router.push('/report/create')">
        <el-icon><Edit /></el-icon> 发布经历
      </el-button>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="loading">
      <el-skeleton v-for="i in 3" :key="i" :rows="3" animated class="skeleton-item" />
    </div>

    <div v-else-if="list.length > 0" class="report-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="report-card"
        :class="{ disputed: item.isDisputed }"
        @click="goToDetail(item.id)"
      >
        <div class="report-header">
          <span class="report-anonymous">{{ item.anonymousName }}</span>
          <el-tag v-if="item.isDisputed" type="warning" size="small">存在争议</el-tag>
        </div>
        <h3 class="report-title">{{ item.title }}</h3>
        <div class="report-meta">
          <span v-if="item.industry">{{ item.industry }}</span>
          <span v-if="item.position">{{ item.position }}</span>
        </div>
        <div class="report-score">
          <span class="score-label">材料完整度：</span>
          <el-progress
            :percentage="item.completenessScore"
            :stroke-width="8"
            :color="scoreColor(item.completenessScore)"
            style="flex: 1; max-width: 200px"
          />
          <span class="score-value">{{ item.completenessScore }}/100</span>
          <span class="score-notice">· 不代表事件真实性</span>
        </div>
        <div class="report-stats">
          <span><el-icon><ChatDotRound /></el-icon> {{ item.commentCount }}</span>
          <span>{{ formatTime(item.createdAt) }}</span>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无内容" />

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, ChatDotRound } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useUserStore } from '../../stores/user'
import { reportApi } from '../../api/report'

const router = useRouter()
const userStore = useUserStore()

const list = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const sortBy = ref('completeness')

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function scoreColor(score: number) {
  if (score >= 80) return '#67c23a'
  if (score >= 50) return '#e6a23c'
  return '#f56c6c'
}

function goToDetail(id: number) {
  router.push(`/report/${id}`)
}

async function loadList() {
  loading.value = true
  try {
    const res = await reportApi.getReportList({
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch {} finally {
    loading.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.report-list-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.zone-notice {
  margin-bottom: 20px;
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  border: 1px solid #f0f0f0;
}

.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.report-card.disputed {
  border-color: #f0c040;
  background: #fffef5;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.report-anonymous {
  font-weight: 600;
  color: #666;
}

.report-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.report-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.report-score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.score-label {
  color: #666;
  white-space: nowrap;
}

.score-value {
  font-weight: 600;
}

.score-notice {
  color: #f56c6c;
  font-size: 12px;
}

.report-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.report-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>