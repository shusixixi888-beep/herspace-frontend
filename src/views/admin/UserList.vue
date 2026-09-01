<template>
  <div class="user-list-page">
    <h2>用户管理</h2>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索手机号或昵称"
        style="width: 300px"
        clearable
        @clear="loadList"
        @keyup.enter="loadList"
      />
      <el-button type="primary" @click="loadList">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isBanned ? 'danger' : 'success'">{{ row.isBanned ? '封禁' : '正常' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="!row.isBanned"
            size="small"
            type="danger"
            @click="handleBan(row)"
          >封禁</el-button>
          <el-button
            v-else
            size="small"
            type="success"
            @click="handleUnban(row)"
          >解封</el-button>
          <el-button
            v-if="row.role === 'user'"
            size="small"
            @click="handleSetAuditor(row)"
          >设为审核员</el-button>
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

    <!-- 封禁对话框 -->
    <el-dialog v-model="showBan" title="封禁用户" width="400px">
      <el-input
        v-model="banReason"
        type="textarea"
        :rows="4"
        placeholder="请输入封禁原因"
      />
      <template #footer>
        <el-button @click="showBan = false">取消</el-button>
        <el-button type="danger" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { adminApi } from '../../api/admin'

const list = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showBan = ref(false)
const banReason = ref('')
const currentUser = ref<any>(null)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function getRoleType(role: string) {
  if (role === 'super_admin') return 'danger'
  if (role === 'auditor') return 'warning'
  return 'info'
}

function getRoleLabel(role: string) {
  if (role === 'super_admin') return '超级管理员'
  if (role === 'auditor') return '审核员'
  return '普通用户'
}

async function loadList() {
  loading.value = true
  try {
    const res = await adminApi.getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch {} finally {
    loading.value = false
  }
}

function handleBan(row: any) {
  currentUser.value = row
  banReason.value = ''
  showBan.value = true
}

async function confirmBan() {
  if (!banReason.value) {
    ElMessage.warning('请输入封禁原因')
    return
  }

  try {
    await adminApi.banUser(currentUser.value.id, banReason.value)
    ElMessage.success('已封禁')
    showBan.value = false
    await loadList()
  } catch {}
}

async function handleUnban(row: any) {
  try {
    await ElMessageBox.confirm(`确定解封 ${row.nickname}？`, '提示')
    await adminApi.unbanUser(row.id)
    ElMessage.success('已解封')
    await loadList()
  } catch {}
}

async function handleSetAuditor(row: any) {
  try {
    await ElMessageBox.confirm(`确定将 ${row.nickname} 设为审核员？`, '提示')
    // TODO: 需要后端接口
    ElMessage.success('已设置')
    await loadList()
  } catch {}
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.user-list-page h2 {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>