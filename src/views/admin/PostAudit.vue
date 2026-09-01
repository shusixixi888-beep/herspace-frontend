<template>
  <div class="audit-page">
    <h2>帖子审核</h2>

    <el-table :data="list" v-loading="loading" style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="author.nickname" label="作者" width="120" />
      <el-table-column prop="createdAt" label="提交时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">查看</el-button>
          <el-button size="small" type="success" @click="handleAudit(row, 'approve')">通过</el-button>
          <el-button size="small" type="danger" @click="handleAudit(row, 'reject')">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadList"
      />
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="showDetail" title="帖子详情" width="700px">
      <div v-if="currentPost" class="post-detail">
        <h3>{{ currentPost.title }}</h3>
        <p class="author">作者：{{ currentPost.author?.nickname }}</p>
        <div class="content">{{ currentPost.content }}</div>
        <div v-if="currentPost.images?.length" class="images">
          <el-image
            v-for="(img, i) in currentPost.images"
            :key="i"
            :src="img"
            fit="cover"
            class="post-img"
            :preview-src-list="currentPost.images"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button type="success" @click="handleAudit(currentPost, 'approve')">通过</el-button>
        <el-button type="danger" @click="handleAudit(currentPost, 'reject')">拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="showReject" title="拒绝原因" width="400px">
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入拒绝原因"
      />
      <template #footer>
        <el-button @click="showReject = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { adminApi } from '../../api/admin'

const list = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showDetail = ref(false)
const showReject = ref(false)
const currentPost = ref<any>(null)
const rejectReason = ref('')

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function viewDetail(row: any) {
  currentPost.value = row
  showDetail.value = true
}

async function loadList() {
  loading.value = true
  try {
    const res = await adminApi.getPendingPosts({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch {} finally {
    loading.value = false
  }
}

async function handleAudit(post: any, action: 'approve' | 'reject') {
  if (action === 'reject') {
    currentPost.value = post
    rejectReason.value = ''
    showReject.value = true
    return
  }

  try {
    await adminApi.auditPost(post.id, { action })
    ElMessage.success('已通过')
    await loadList()
  } catch {}
}

async function confirmReject() {
  if (!rejectReason.value) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    await adminApi.auditPost(currentPost.value.id, {
      action: 'reject',
      reason: rejectReason.value,
    })
    ElMessage.success('已拒绝')
    showReject.value = false
    showDetail.value = false
    await loadList()
  } catch {}
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.audit-page h2 {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.post-detail .author {
  color: #999;
  margin: 8px 0;
}

.post-detail .content {
  white-space: pre-wrap;
  line-height: 1.8;
  margin-bottom: 16px;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}
</style>