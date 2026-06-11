<template>
  <div class="destination-edit">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑景点' : '添加景点' }}</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="景点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入景点名称" />
        </el-form-item>

        <el-form-item label="景点地址" prop="location">
          <el-input v-model="form.location" placeholder="请输入景点地址" />
        </el-form-item>

        <el-form-item label="评分" prop="rating">
          <el-input-number v-model="form.rating" :min="0" :max="5" :step="0.1" />
        </el-form-item>

        <!-- 封面图片 -->
        <el-form-item label="封面图片">
          <div class="image-upload-container">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <el-input v-model="form.image" placeholder="请输入封面图片URL或点击上传" style="flex: 1;">
              </el-input>
              <el-button @click="dialogVisible = true" :loading="uploading">
                上传图片
              </el-button>
              <el-button 
                v-if="form.image" 
                type="danger" 
                @click="clearImage"
              >
                删除图片
              </el-button>
            </div>
            <div v-if="form.image" class="image-preview" style="margin-top: 10px;">
              <img :src="processEditImageUrl(form.image)" :alt="封面预览" />
            </div>
          </div>
        </el-form-item>

        <!-- 多图上传 -->
        <el-form-item label="景点相册">
          <div class="images-upload-area">
            <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 15px;">
              <el-input v-model="imageUrlInput" placeholder="通过URL添加图片" style="flex: 1;">
              </el-input>
              <el-button 
                type="success" 
                @click="addImageByUrl"
                :disabled="!imageUrlInput"
              >
                添加URL
              </el-button>
              <el-button @click="showMultiUpload = true" :loading="uploading">
                上传图片
              </el-button>
            </div>
            <div class="images-list">
                <div v-for="(img, index) in form.images" :key="index" class="image-item">
                  <img :src="processEditImageUrl(img)" :alt="图片" />
                  <span class="delete-btn" @click="removeImage(index)">×</span>
                </div>
              <div class="add-image-btn" @click="showMultiUpload = true">
                <span>+</span>
                <span>添加图片</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 视频 -->
        <el-form-item label="视频">
          <div class="video-upload-container">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <el-input v-model="form.video" placeholder="请输入视频URL或点击上传" style="flex: 1;">
              </el-input>
              <el-button @click="videoDialogVisible = true" :loading="videoUploading">
                上传视频
              </el-button>
              <el-button 
                v-if="form.video" 
                type="danger" 
                @click="clearVideo"
              >
                删除视频
              </el-button>
            </div>
            <div v-if="form.video" class="video-preview" style="margin-top: 10px;">
              <video :src="processEditVideoUrl(form.video)" controls style="max-width: 300px; border-radius: 8px;" />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple placeholder="请选择标签" style="width: 100%;">
            <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细介绍" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请输入详细介绍"
          />
        </el-form-item>

        <el-divider content-position="left">地图与增强信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input v-model="form.latitude" placeholder="例如: 39.9042" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input v-model="form.longitude" placeholder="例如: 116.4074" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="开放时间">
          <el-input v-model="form.openingHours" placeholder="例如: 08:00-18:00" />
        </el-form-item>

        <el-form-item label="门票价格">
          <el-input v-model="form.ticketPrice" placeholder="例如: 50元/人" />
        </el-form-item>

        <el-form-item label="建议游玩时间">
          <el-input v-model="form.duration" placeholder="例如: 2-3小时" />
        </el-form-item>

        <el-form-item label="最佳季节">
          <el-input v-model="form.bestTime" placeholder="例如: 春秋两季" />
        </el-form-item>

        <el-form-item label="交通信息">
          <el-input
            v-model="form.transport"
            type="textarea"
            :rows="3"
            placeholder="请输入交通信息"
          />
        </el-form-item>

        <el-form-item label="温馨提示">
          <el-input
            v-model="form.tips"
            type="textarea"
            :rows="3"
            placeholder="请输入温馨提示"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 单图上传对话框 -->
    <el-dialog v-model="dialogVisible" title="上传封面图片" width="500px">
      <div class="upload-area" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none;"
          @change="handleFileChange"
        />
        <div v-if="!uploading && !previewUrl" class="upload-placeholder">
          <span class="upload-icon">📷</span>
          <p>点击或拖拽图片到此处上传</p>
          <span class="upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 5MB</span>
        </div>
        <div v-if="uploading" class="upload-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>上传中...</p>
        </div>
        <div v-if="previewUrl && !uploading" class="upload-preview">
          <img :src="previewUrl" alt="预览" />
          <el-button type="danger" size="small" @click.stop="clearPreview">删除</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 多图上传对话框 -->
    <el-dialog v-model="showMultiUpload" title="上传景点图片" width="600px">
      <div class="multi-upload-area" @click="triggerMultiUpload" @drop.prevent="handleMultiDrop" @dragover.prevent>
        <input
          type="file"
          ref="multiFileInput"
          accept="image/*"
          multiple
          style="display: none;"
          @change="handleMultiFileChange"
        />
        <div class="upload-placeholder">
          <span class="upload-icon">📷</span>
          <p>点击或拖拽图片到此处上传</p>
          <span class="upload-hint">可一次选择多张图片</span>
        </div>
      </div>
      <div v-if="uploadingList.length > 0" class="uploading-list">
        <div v-for="(item, index) in uploadingList" :key="index" class="uploading-item">
          <img :src="item.preview" alt="预览" />
          <div v-if="item.uploading" class="uploading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <div v-if="item.success" class="success-overlay">✓</div>
        </div>
      </div>
    </el-dialog>

    <!-- 视频上传对话框 -->
    <el-dialog v-model="videoDialogVisible" title="上传视频" width="600px">
      <div class="video-upload-area" @click="triggerVideoUpload" @drop.prevent="handleVideoDrop" @dragover.prevent>
        <input
          type="file"
          ref="videoFileInput"
          accept="video/*"
          style="display: none;"
          @change="handleVideoFileChange"
        />
        <div v-if="!videoUploading && !videoPreviewUrl" class="upload-placeholder">
          <span class="upload-icon">🎬</span>
          <p>点击或拖拽视频到此处上传</p>
          <span class="upload-hint">支持 MP4、WebM、OGG、AVI、FLV 格式，最大 100MB</span>
        </div>
        <div v-if="videoUploading" class="upload-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>上传中...</p>
        </div>
        <div v-if="videoPreviewUrl && !videoUploading" class="upload-preview">
          <video :src="videoPreviewUrl" controls style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
          <el-button type="danger" size="small" @click.stop="clearVideoPreview">删除</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { destinationAPI } from '../../api/destinations'
import { tagAPI } from '../../api/tags'
import { uploadAPI } from '../../api/upload'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const allTags = ref([])
const dialogVisible = ref(false)
const showMultiUpload = ref(false)
const videoDialogVisible = ref(false)
const uploading = ref(false)
const videoUploading = ref(false)
const previewUrl = ref('')
const videoPreviewUrl = ref('')
const fileInput = ref(null)
const multiFileInput = ref(null)
const videoFileInput = ref(null)
const uploadingList = ref([])
const imageUrlInput = ref('')

const isEdit = computed(() => !!route.params.id)

// 处理编辑页面的图片URL
const processEditImageUrl = (url) => {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

// 处理编辑页面的视频URL
const processEditVideoUrl = (url) => {
  if (!url) return url
  // 检查是否是YouTube或B站链接
  if (/(?:youtube\.com|youtu\.be)/.test(url) || /bilibili\.com/.test(url)) {
    return url
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const form = reactive({
  name: '',
  location: '',
  rating: 0,
  image: '',
  images: [],
  video: '',
  description: '',
  tags: [],
  latitude: '',
  longitude: '',
  openingHours: '',
  ticketPrice: '',
  transport: '',
  bestTime: '',
  duration: '',
  tips: ''
})

const rules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入景点地址', trigger: 'blur' }]
}

const loadTags = async () => {
  try {
    const res = await tagAPI.getAll()
    if (res.code === 200) {
      allTags.value = res.data
    }
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const loadDestination = async (id) => {
  try {
    const res = await destinationAPI.getById(id)
    if (res.code === 200) {
      const data = res.data
      form.name = data.name
      form.location = data.location
      form.rating = parseFloat(data.rating)
      form.image = data.image || ''
      form.images = data.images || []
      form.video = data.video || ''
      form.description = data.description || ''
      form.tags = data.Tags ? data.Tags.map(t => t.id) : []
      form.latitude = data.latitude || ''
      form.longitude = data.longitude || ''
      form.openingHours = data.openingHours || ''
      form.ticketPrice = data.ticketPrice || ''
      form.transport = data.transport || ''
      form.bestTime = data.bestTime || ''
      form.duration = data.duration || ''
      form.tips = data.tips || ''
    }
  } catch (error) {
    console.error('加载景点信息失败:', error)
  }
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadImage(file)
  }
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    uploadImage(file)
  }
}

const uploadImage = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  uploading.value = true
  previewUrl.value = URL.createObjectURL(file)

  try {
    const res = await uploadAPI.uploadImage(file)
    if (res.code === 200) {
      // 使用相对路径，便于部署到其他环境
      form.image = res.data.url
      ElMessage.success('上传成功')
      dialogVisible.value = false
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const clearPreview = () => {
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 多图上传
const triggerMultiUpload = () => {
  multiFileInput.value?.click()
}

const handleMultiFileChange = (e) => {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    uploadMultipleImages(files)
  }
}

const handleMultiDrop = (e) => {
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  if (files.length > 0) {
    uploadMultipleImages(files)
  }
}

const uploadMultipleImages = async (files) => {
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error(`${file.name} 大小超过 5MB`)
      continue
    }

    const preview = URL.createObjectURL(file)
    const uploadItem = { preview, uploading: true, success: false }
    uploadingList.value.push(uploadItem)

    try {
      const res = await uploadAPI.uploadImage(file)
      if (res.code === 200) {
        // 使用相对路径，便于部署到其他环境
        const imageUrl = res.data.url
        form.images.push(imageUrl)
        uploadItem.success = true
        uploadItem.uploading = false
      }
    } catch (error) {
      ElMessage.error(`${file.name} 上传失败`)
      uploadItem.uploading = false
    }
  }

  // 清空文件输入
  if (multiFileInput.value) {
    multiFileInput.value.value = ''
  }
}

const removeImage = (index) => {
  form.images.splice(index, 1)
}

// 通过URL添加图片
const addImageByUrl = () => {
  const url = imageUrlInput.value.trim()
  if (!url) {
    ElMessage.warning('请输入图片URL')
    return
  }
  
  // 简单验证URL格式
  const urlPattern = /^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp))$/i
  if (!urlPattern.test(url)) {
    ElMessage.warning('请输入有效的图片URL')
    return
  }
  
  form.images.push(url)
  imageUrlInput.value = ''
  ElMessage.success('图片添加成功')
}

// 视频上传相关函数
const triggerVideoUpload = () => {
  videoFileInput.value?.click()
}

const handleVideoFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadVideo(file)
  }
}

const handleVideoDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    uploadVideo(file)
  }
}

const uploadVideo = async (file) => {
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('视频大小不能超过 100MB')
    return
  }

  videoUploading.value = true
  videoPreviewUrl.value = URL.createObjectURL(file)

  try {
    const res = await uploadAPI.uploadVideo(file)
    if (res.code === 200) {
      // 使用相对路径，便于部署到其他环境
      form.video = res.data.url
      ElMessage.success('上传成功')
      videoDialogVisible.value = false
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    videoUploading.value = false
  }
}

const clearVideoPreview = () => {
  videoPreviewUrl.value = ''
  if (videoFileInput.value) {
    videoFileInput.value.value = ''
  }
}

const clearVideo = () => {
  ElMessageBox.confirm(
    '确定要删除该视频吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      form.video = ''
      ElMessage.success('视频已删除')
    })
    .catch(() => {
      // 用户取消删除
    })
}

const clearImage = () => {
  ElMessageBox.confirm(
    '确定要删除该封面图片吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      form.image = ''
      ElMessage.success('封面图片已删除')
    })
    .catch(() => {
      // 用户取消删除
    })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = { ...form }
        let res
        if (isEdit.value) {
          res = await destinationAPI.update(route.params.id, data)
        } else {
          res = await destinationAPI.create(data)
        }

        if (res.code === 200 || res.code === 201) {
          ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
          router.push('/admin/destinations')
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '保存失败' : '创建失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.push('/admin/destinations')
}

onMounted(() => {
  loadTags()
  if (isEdit.value) {
    loadDestination(route.params.id)
  }
})
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.image-preview img {
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.images-upload-area {
  width: 100%;
}

.images-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item .delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

.add-image-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s;
}

.add-image-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.add-image-btn span:first-child {
  font-size: 24px;
}

.add-image-btn span:last-child {
  font-size: 12px;
  margin-top: 4px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.multi-upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.multi-upload-area:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.upload-placeholder {
  color: #909399;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.upload-placeholder p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #c0c4cc;
}

.upload-loading {
  color: #409eff;
}

.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.upload-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.uploading-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.uploading-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.uploading-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploading-overlay,
.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
}

.success-overlay {
  background: rgba(0, 128, 0, 0.5);
  font-size: 24px;
}

.video-upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-upload-area:hover {
  border-color: #409eff;
  background: #f5f7fa;
}
</style>
