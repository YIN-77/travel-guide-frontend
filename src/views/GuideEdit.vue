<template>
  <div class="guide-edit-page">
    <Navbar />
    <div class="container">
      <Sidebar />
      <main class="main-content">
        <div class="scrollable-content">
          <div class="page-header">
            <h1>{{ isEdit ? '编辑攻略' : '发布新攻略' }}</h1>
          </div>

          <el-card class="form-card">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
              <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入攻略标题" maxlength="100" show-word-limit />
              </el-form-item>

              <el-form-item label="攻略类型">
                <div class="type-selector">
                  <div 
                    v-for="type in guideTypes" 
                    :key="type.value"
                    class="type-tag"
                    :class="{ active: selectedType === type.value }"
                    @click="selectType(type.value)"
                  >
                    {{ type.label }}
                  </div>
                </div>
                <div class="type-hint">选择攻略类型有助于用户快速筛选</div>
              </el-form-item>

              <el-form-item label="简介" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入攻略简介"
                  maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="封面图片">
                <div class="cover-upload" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden-file-input"
                    @change="handleFileUpload"
                  />
                  <div v-if="form.cover_image" class="cover-preview">
                    <img :src="form.cover_image" alt="封面预览" />
                    <el-button type="danger" size="small" class="remove-btn" @click.stop="removeCover">
                      移除
                    </el-button>
                  </div>
                  <div v-else class="cover-placeholder">
                    <span>🖼️</span>
                    <p>点击或拖拽上传图片</p>
                    <p class="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                  </div>
                </div>
                <div class="upload-options">
                  <el-input
                    v-model="form.cover_image"
                    placeholder="或输入封面图片URL"
                    class="url-input"
                  />
                </div>
              </el-form-item>

              <el-form-item label="其他标签">
                <el-input
                  v-model="otherTags"
                  placeholder="请输入其他标签，多个标签用逗号分隔"
                />
                <div class="tag-hint">例如：日本, 东京, 温泉（类型标签已自动添加）</div>
              </el-form-item>

              <el-form-item label="正文内容" prop="content">
                <el-input
                  v-model="form.content"
                  type="textarea"
                  :rows="15"
                  placeholder="请输入正文内容"
                />
              </el-form-item>

              <el-form-item label="发布状态">
                <el-radio-group v-model="form.status">
                  <el-radio label="draft">保存为草稿</el-radio>
                  <el-radio label="published">立即发布</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
                  {{ isEdit ? '更新攻略' : '发布攻略' }}
                </el-button>
                <el-button @click="handleCancel">
                  取消
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import { guideAPI } from '../api/guide'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const fileInput = ref(null)

const isEdit = ref(false)
const submitLoading = ref(false)

// 攻略类型选项
const guideTypes = [
  { label: '自由行', value: '自由行' },
  { label: '跟团游', value: '跟团游' },
  { label: '自驾游', value: '自驾游' },
  { label: '美食', value: '美食' },
  { label: '亲子', value: '亲子' },
  { label: '摄影', value: '摄影' },
  { label: '徒步', value: '徒步' },
  { label: '海岛', value: '海岛' },
  { label: '古镇', value: '古镇' },
  { label: '攻略', value: '攻略' }
]

const selectedType = ref('')
const otherTags = ref('')

const form = reactive({
  id: null,
  title: '',
  description: '',
  cover_image: '',
  tags: '',
  content: '',
  status: 'draft'
})

const rules = {
  title: [
    { required: true, message: '请输入攻略标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入攻略内容', trigger: 'blur' }
  ]
}

const selectType = (type) => {
  selectedType.value = type
  updateTags()
}

const updateTags = () => {
  // 组合类型标签和其他标签
  const tagsList = []
  if (selectedType.value) {
    tagsList.push(selectedType.value)
  }
  if (otherTags.value) {
    const otherTagsList = otherTags.value.split(',').map(t => t.trim()).filter(t => t)
    tagsList.push(...otherTagsList)
  }
  form.tags = tagsList.join(',')
}

const removeCover = () => {
  form.cover_image = ''
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  await uploadFile(file)
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    uploadFile(file)
  }
}

const uploadFile = async (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }
  
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.code === 200) {
      form.cover_image = data.data.url
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

const loadGuide = async (id) => {
  try {
    const res = await guideAPI.getMyGuides()
    if (res.code === 200) {
      const guide = res.data.find(g => g.id === parseInt(id))
      if (guide) {
        Object.assign(form, guide)
        isEdit.value = true
        
        // 解析标签，分离类型和其他标签
        if (form.tags) {
          const tagsList = form.tags.split(',').map(t => t.trim())
          // 查找第一个匹配的类型标签
          const typeTag = tagsList.find(t => guideTypes.some(gt => gt.value === t))
          if (typeTag) {
            selectedType.value = typeTag
            // 其他标签（排除类型标签）
            otherTags.value = tagsList.filter(t => t !== typeTag).join(',')
          } else {
            otherTags.value = form.tags
          }
        }
      } else {
        ElMessage.error('攻略不存在或无权编辑')
        router.push('/guide')
      }
    }
  } catch (error) {
    ElMessage.error('加载攻略失败')
    router.push('/guide')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  // 检查是否选择了类型
  if (!selectedType.value) {
    ElMessage.error('请选择攻略类型')
    return
  }
  
  // 更新标签
  updateTags()
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        let res
        const guideData = {
          title: form.title,
          description: form.description,
          cover_image: form.cover_image,
          tags: form.tags,
          content: form.content,
          status: form.status
        }
        
        if (isEdit.value) {
          res = await guideAPI.update(form.id, guideData)
        } else {
          res = await guideAPI.create(guideData)
        }
        
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
          router.push('/guide')
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || (isEdit.value ? '更新失败' : '发布失败')
        console.error('攻略提交错误详情:', error)
        ElMessage.error(errorMessage)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.push('/guide')
}

// 监听其他标签变化
import { watch } from 'vue'
watch(otherTags, () => {
  updateTags()
})

onMounted(() => {
  const id = route.query.id
  if (id) {
    loadGuide(id)
  }
})
</script>

<style scoped>
.guide-edit-page {
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
  padding-top: 70px;
}

.container {
  display: flex;
  height: 100%;
  overflow: hidden;
  margin-left: 260px;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.page-header {
  text-align: center;
  padding: 20px 0 30px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.form-card {
  max-width: 900px;
  margin: 0 auto;
}

.cover-upload {
  width: 100%;
  height: 250px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: #fafafa;
}

.cover-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.cover-placeholder {
  text-align: center;
  color: #999;
}

.cover-placeholder span {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.cover-placeholder p {
  margin: 0;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px !important;
  color: #bbb !important;
  margin-top: 5px !important;
}

.hidden-file-input {
  display: none;
}

.cover-upload:hover {
  border-color: #111;
  cursor: pointer;
}

.upload-options {
  margin-top: 10px;
}

.url-input {
  width: 400px;
}

.tag-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-tag {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.type-tag:hover {
  border-color: #1e293b;
  background: #f8fafc;
}

.type-tag.active {
  border-color: #1e293b;
  background: #1e293b;
  color: white;
}

.type-hint {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}
</style>
