<template>
  <div class="appeals-page">
    <h2>申诉管理</h2>

    <div class="filter-bar">
      <el-radio-group v-model="statusFilter" @change="loadList">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="pending">待处理</el-radio-button>
        <el-radio-button value="resolved">已处理</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="list" v-loading="loading" style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="appellantName" label="申诉人" width="100" />
      <el-table-column prop="report.title" label="关联帖子" min-width="200" show-overflow-tooltip />
      <el-table-column prop="reason" label="申诉理由" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            size="small"
            type="primary"
            @click="handleAppeal(row)"
          >处理</el-button>
          <el-button
            v-else
            size="small"
            @click="viewResult(row)"
          >查看结果</el-button>
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

    <!-- 处理申诉对话框 -->
    <el-dialog v-model="showHandle" title="处理申诉" width="500px">
      <div v-if="currentAppeal" class="appeal-detail">
        <p><strong>申诉人：</strong>{{ currentAppeal.appellantName }}</p>
        <p><strong>联系方式：</strong>{{ currentAppeal.contact || '无' }}</p>
        <p><strong>申诉理由：</strong></p>
        <div class="reason-box">{{ currentAppeal.reason }}</div>
      </div>

      <el-form label-width="80px" style="margin-top: 20px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="handleForm.status">
            <el-radio value="resolved">标记已处理</el-radio>
            <el-radio value="rejected">驳回申诉</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="handleForm.result"
            type="textarea"
            :rows="4"
            placeholder="处理说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showHandle = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">确认</el-button>
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
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showHandle = ref(false)
const currentAppeal = ref<any>(null)
const handleForm = ref({ status: 'resolved', result: '' })

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function getStatusType(status: string) {
  if (status === 'resolved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

function getStatusLabel(status: string) {
  if (status === 'resolved') return '已处理'
  if (status === 'rejected') return '已驳回'
  return '待处理'
}

async function loadList() {
  loading.value = true
  try {
    const res = await adminApi.getAppealList({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch {} finally {
    loading.value = false
  }
}

function handleAppeal(row: any) {
  currentAppeal.value = row
  handleForm.value = { status: 'resolved', result: '' }
  showHandle.value = true
}

function viewResult(row: any) {
  ElMessage.info(row.result || '无处理说明')
}

async function confirmHandle() {
  if (!handleForm.value.result) {
    ElMessage.warning('请输入处理说明')
    return
  }

  try {
    await adminApi.handleAppeal(currentAppeal.value.id, handleForm.value)
    ElMessage.success('处理完成')
    showHandle.value = false
    await loadList()
  } catch {}
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.appeals-page h2 {
  margin-bottom: 20px;
}

.filter-bar {
  margin-bottom: 20px;
}

.appeal-detail p {
  margin-bottom: 8px;
}

.reason-box {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  line-height: 1.6;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>