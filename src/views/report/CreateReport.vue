<template>
  <div class="create-report-page">
    <div class="form-container">
      <h2 class="page-title">发布职场经历</h2>

      <!-- 须知 -->
      <el-alert type="warning" :closable="false" class="notice">
        <template #title>
          {{ notice }}
        </template>
      </el-alert>

      <el-form :model="form" label-width="120px" class="report-form">
        <!-- 基本信息 -->
        <el-divider>基本信息</el-divider>

        <el-form-item label="姓氏">
          <el-input
            v-model="form.surname"
            placeholder="如：张、李、王（仅姓氏，不可填写完整姓名）"
            maxlength="2"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="行业大类">
          <el-select v-model="form.industry" placeholder="选择行业大类" style="width: 100%">
            <el-option v-for="ind in industries" :key="ind" :label="ind" :value="ind" />
          </el-select>
        </el-form-item>

        <el-form-item label="公司简称">
          <el-input
            v-model="form.companyShort"
            placeholder="如：某互联网大厂、某外企（不可填写全称）"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="职位简称">
          <el-input
            v-model="form.position"
            placeholder="如：产品经理、前端开发"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="时间段">
          <el-input
            v-model="form.timeRange"
            placeholder="如：2023年6月-2024年1月"
            maxlength="50"
          />
        </el-form-item>

        <!-- 事件描述 -->
        <el-divider>事件描述</el-divider>

        <el-form-item label="场景类型">
          <el-select v-model="form.scene" placeholder="选择场景类型" style="width: 100%">
            <el-option v-for="s in scenes" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="8"
            placeholder="请客观描述事件经过。请使用姓氏简称，不可填写完整姓名。\n审核系统会自动拦截手机号、微信号、身份证号等隐私信息。"
            maxlength="3000"
            show-word-limit
          />
        </el-form-item>

        <!-- 证据材料 -->
        <el-divider>证据材料（可选）</el-divider>

        <el-form-item label="上传图片">
          <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :auto-upload="false"
            :limit="9"
            accept="image/*"
            :on-change="handleFileChange"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <!-- 提交 -->
        <el-form-item>
          <div class="submit-row">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" @click="submitReport" :loading="submitting">
              发布
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { reportApi } from '../../api/report'
import { uploadApi } from '../../api/upload'

const router = useRouter()

const form = ref({
  surname: '',
  industry: '',
  companyShort: '',
  position: '',
  timeRange: '',
  scene: '',
  description: '',
  evidenceFiles: [] as { url: string; description: string; isEvidence: boolean }[],
})

const fileList = ref<any[]>([])
const submitting = ref(false)
const notice = ref('')

const industries = [
  '互联网/IT', '金融', '教育', '医疗', '制造业',
  '零售/电商', '房地产', '媒体/广告', '法律', '咨询',
  '餐饮/酒店', '物流', '政府/非营利', '其他',
]

const scenes = [
  '面试歧视', '职场骚扰', '薪酬不公', '晋升不公',
  '辞退/裁员', '工作环境', '其他',
]

function handleFileChange(_file: any, files: any[]) {
  fileList.value = files
}

async function uploadImages() {
  if (fileList.value.length === 0) return []

  const files = fileList.value
    .filter((f) => f.raw)
    .map((f) => f.raw) as File[]

  if (files.length === 0) return []

  const res = await uploadApi.uploadImages(files)
  return res.data.urls.map((url: string) => ({
    url,
    description: '',
    isEvidence: true,
  }))
}

async function submitReport() {
  if (!form.value.surname || !form.value.industry || !form.value.description) {
    ElMessage.warning('请填写姓氏、行业和事件描述')
    return
  }

  submitting.value = true
  try {
    form.value.evidenceFiles = await uploadImages()
    const res = await reportApi.createReport(form.value)
    ElMessage.success('发布成功')
    router.push(`/report/${res.data.id}`)
  } catch {} finally {
    submitting.value = false
  }
}

async function loadNotice() {
  try {
    const res = await reportApi.getNotice()
    notice.value = res.data.notice
  } catch {}
}

onMounted(() => {
  loadNotice()
})
</script>

<style scoped>
.create-report-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 20px;
}

.notice {
  margin-bottom: 20px;
}

.report-form {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
</style>