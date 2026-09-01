<template>
  <div class="report-detail-page">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="report" class="report-content">
      <!-- 争议提示 -->
      <el-alert
        v-if="report.isDisputed"
        type="warning"
        :closable="false"
        class="dispute-alert"
      >
        <template #title>
          该帖存在争议申诉。平台对用户发布内容不做事实判定，请自行判断。
        </template>
      </el-alert>

      <!-- 匿名说明 -->
      <el-alert type="info" :closable="false" class="anon-alert">
        <template #title>
          此为匿名发布内容，排序依据为材料完整度，不代表事件真实性。
        </template>
      </el-alert>

      <!-- 详情头部 -->
      <div class="report-header">
        <span class="anonymous-name">{{ report.anonymousName }}</span>
        <span class="report-time">{{ formatTime(report.createdAt) }}</span>
      </div>

      <!-- 基本信息 -->
      <div class="info-grid">
        <div class="info-item">
          <span class="label">姓氏：</span>
          <span>{{ report.surname }}</span>
        </div>
        <div class="info-item">
          <span class="label">行业：</span>
          <span>{{ report.industry }}</span>
        </div>
        <div class="info-item">
          <span class="label">公司简称：</span>
          <span>{{ report.companyShort }}</span>
        </div>
        <div class="info-item">
          <span class="label">职位：</span>
          <span>{{ report.position }}</span>
        </div>
        <div class="info-item">
          <span class="label">时间：</span>
          <span>{{ report.timeRange }}</span>
        </div>
        <div class="info-item">
          <span class="label">场景：</span>
          <span>{{ report.scene }}</span>
        </div>
      </div>

      <!-- 事件描述 -->
      <div class="description-section">
        <h3>事件描述</h3>
        <div class="description-content">{{ report.description }}</div>
      </div>

      <!-- 证据图片 -->
      <div v-if="report.evidenceFiles && report.evidenceFiles.length" class="evidence-section">
        <h3>证据材料</h3>
        <div class="evidence-images">
          <el-image
            v-for="(file, index) in report.evidenceFiles"
            :key="index"
            :src="file.url"
            :preview-src-list="report.evidenceFiles.map((f: any) => f.url)"
            :initial-index="index"
            fit="cover"
            class="evidence-image"
          />
        </div>
      </div>

      <!-- 完整度评分 -->
      <div class="score-section">
        <span class="score-label">材料完整度：</span>
        <el-progress
          :percentage="report.completenessScore"
          :stroke-width="12"
          :color="scoreColor(report.completenessScore)"
          style="flex: 1; max-width: 300px"
        />
        <span class="score-value">{{ report.completenessScore }}/100</span>
      </div>

      <!-- 申诉入口 -->
      <div class="appeal-entry">
        <el-button text type="primary" @click="showAppealDialog = true">
          认为内容不实？提交申诉 →
        </el-button>
      </div>

      <!-- 匿名评论区 -->
      <div class="comment-section">
        <h3>匿名评论 ({{ report.commentCount }})</h3>

        <!-- 发评论 -->
        <div v-if="userStore.isLoggedIn" class="comment-input">
          <el-input
            v-model="commentText"
            type="textarea"
            :rows="3"
            placeholder="匿名发表评论..."
            maxlength="500"
            show-word-limit
          />
          <el-button
            type="primary"
            size="small"
            @click="submitComment"
            style="margin-top: 8px"
          >
            发表
          </el-button>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <span class="comment-author">{{ comment.anonymousName }}</span>
            <p class="comment-text">{{ comment.content }}</p>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="内容不存在" />

    <!-- 申诉对话框 -->
    <el-dialog v-model="showAppealDialog" title="提交申诉" width="500px">
      <el-form :model="appealForm" label-width="100px">
        <el-form-item label="您的姓名">
          <el-input v-model="appealForm.appellantName" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="appealForm.contact" placeholder="可选" />
        </el-form-item>
        <el-form-item label="申诉理由">
          <el-input
            v-model="appealForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请说明您认为内容不实的理由"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAppealDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAppeal">提交申诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useUserStore } from '../../stores/user'
import { reportApi } from '../../api/report'

const route = useRoute()
const userStore = useUserStore()

const report = ref<any>(null)
const loading = ref(true)
const comments = ref<any[]>([])
const commentText = ref('')
const showAppealDialog = ref(false)
const appealForm = ref({
  appellantName: '',
  contact: '',
  reason: '',
})

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function scoreColor(score: number) {
  if (score >= 80) return '#67c23a'
  if (score >= 50) return '#e6a23c'
  return '#f56c6c'
}

async function loadReport() {
  loading.value = true
  try {
    const res = await reportApi.getReportDetail(parseInt(route.params.id as string))
    report.value = res.data
    await loadComments()
  } catch {} finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const res = await reportApi.getReportComments(parseInt(route.params.id as string), {
      page: 1,
      pageSize: 50,
    })
    comments.value = res.data.list
  } catch {}
}

async function submitComment() {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    await reportApi.createComment(report.value.id, {
      content: commentText.value,
    })
    commentText.value = ''
    ElMessage.success('评论成功')
    await loadComments()
    report.value.commentCount++
  } catch {}
}

async function submitAppeal() {
  if (!appealForm.value.appellantName || !appealForm.value.reason) {
    ElMessage.warning('请填写姓名和申诉理由')
    return
  }

  try {
    await reportApi.submitAppeal(report.value.id, appealForm.value)
    ElMessage.success('申诉已提交，管理员将尽快处理')
    showAppealDialog.value = false
    appealForm.value = { appellantName: '', contact: '', reason: '' }
  } catch {}
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.report-detail-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.dispute-alert, .anon-alert {
  margin-bottom: 16px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.anonymous-name {
  font-weight: 600;
  color: #666;
}

.report-time {
  color: #999;
  font-size: 13px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.info-item .label {
  color: #999;
}

.description-section {
  margin-bottom: 24px;
}

.description-section h3 {
  margin-bottom: 12px;
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.8;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.evidence-section {
  margin-bottom: 24px;
}

.evidence-section h3 {
  margin-bottom: 12px;
}

.evidence-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.evidence-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  cursor: pointer;
}

.score-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.score-label {
  color: #666;
  white-space: nowrap;
}

.score-value {
  font-weight: 600;
}

.appeal-entry {
  text-align: right;
  margin-bottom: 24px;
}

.comment-section h3 {
  margin-bottom: 16px;
}

.comment-input {
  margin-bottom: 20px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.comment-author {
  font-weight: 500;
  color: #666;
  font-size: 13px;
}

.comment-text {
  margin: 6px 0;
}

.comment-time {
  font-size: 12px;
  color: #ccc;
}
</style>