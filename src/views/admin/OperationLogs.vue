<template>
  <div class="logs-page">
    <h2>操作日志</h2>

    <el-table :data="list" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="operator.nickname" label="操作人" width="120" />
      <el-table-column prop="action" label="操作" width="150">
        <template #default="{ row }">{{ getActionLabel(row.action) }}</template>
      </el-table-column>
      <el-table-column prop="targetType" label="对象类型" width="100" />
      <el-table-column prop="targetId" label="对象ID" width="80" />
      <el-table-column prop="reason" label="原因/备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="操作时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { adminApi } from '../../api/admin'

const list = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    post_approve: '通过帖子',
    post_reject: '拒绝帖子',
    post_takedown: '下架帖子',
    comment_takedown: '下架评论',
    user_ban: '封禁用户',
    user_unban: '解封用户',
    appeal_resolve: '处理申诉',
    view_anonymous: '查看匿名映射',
  }
  return labels[action] || action
}

async function loadList() {
  loading.value = true
  try {
    const res = await adminApi.getOperationLogs({
      page: currentPage.value,
      pageSize: pageSize.value,
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
.logs-page h2 {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>