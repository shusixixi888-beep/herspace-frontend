<template>
  <div class="create-post-page">
    <div class="form-container">
      <h2 class="page-title">发布帖子</h2>

      <el-form :model="form" label-width="0" class="post-form">
        <!-- 标题 -->
        <el-form-item>
          <el-input
            v-model="form.title"
            placeholder="标题（最多200字）"
            size="large"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 正文 -->
        <el-form-item>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="分享你的想法、经历或知识..."
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>

        <!-- 图片上传 -->
        <el-form-item>
          <div class="upload-section">
            <p class="upload-label">添加图片（可选，最多9张）</p>
            <el-upload
              v-model:file-list="fileList"
              list-type="picture-card"
              :auto-upload="false"
              :limit="9"
              :on-change="handleFileChange"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>

        <!-- 标签 -->
        <el-form-item>
          <div class="tags-section">
            <p class="upload-label">添加标签</p>
            <div class="tag-input-area">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="tag-selected"
                closable
              >
                {{ tag }}
                <el-icon class="tag-close" @click="removeTag(tag)"><Close /></el-icon>
              </span>
              <el-input
                v-if="showTagInput"
                ref="tagInputRef"
                v-model="tagInput"
                size="small"
                style="width: 100px"
                placeholder="标签"
                @keyup.enter="addTag"
                @blur="addTag"
              />
              <el-button v-else size="small" @click="showTagInput = true">+ 添加标签</el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <div class="submit-row">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" @click="submitPost" :loading="submitting">
              发布
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { postApi } from '../api/post'
import { uploadApi } from '../api/upload'

const router = useRouter()

const form = ref({
  title: '',
  content: '',
  images: [] as string[],
  tags: [] as string[],
  coverImage: '',
})

const fileList = ref<any[]>([])
const submitting = ref(false)
const showTagInput = ref(false)
const tagInput = ref('')
const tagInputRef = ref()

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
  return res.data.urls
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
  showTagInput.value = false
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

async function submitPost() {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('标题和内容不能为空')
    return
  }

  submitting.value = true
  try {
    // 上传图片
    const imageUrls = await uploadImages()
    form.value.images = imageUrls
    form.value.coverImage = imageUrls[0] || ''

    await postApi.createPost(form.value)
    ElMessage.success('发布成功')
    router.push('/')
  } catch {
    // 错误已在拦截器处理
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 24px;
  color: #333;
}

.post-form {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
}

.upload-section {
  width: 100%;
}

.upload-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.tags-section {
  width: 100%;
}

.tag-input-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tag-selected {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #fdf2f8;
  color: #ec4899;
  border-radius: 16px;
  font-size: 13px;
}

.tag-close {
  cursor: pointer;
  font-size: 12px;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
</style>