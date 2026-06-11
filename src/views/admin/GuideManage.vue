<template>
  <div class="guide-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>攻略管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索攻略标题"
              style="width: 300px; margin-right: 10px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <span>🔍</span>
              </template>
            </el-input>
            <el-select
              v-model="statusFilter"
              placeholder="状态筛选"
              style="width: 150px; margin-right: 10px"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              批量删除
            </el-button>
            <el-button type="primary" @click="handleCreate">
              新建攻略
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalGuides }}</div>
                <div class="stat-label">攻略总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon published">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.publishedGuides }}</div>
                <div class="stat-label">已发布</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon draft">📝</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.draftGuides }}</div>
                <div class="stat-label">草稿</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon today">📈</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.todayGuides }}</div>
                <div class="stat-label">今日新增</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table
        :data="guides"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        style="margin-top: 20px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="攻略标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="作者" width="150">
          <template #default="{ row }">
            <div v-if="row.author_name">
              <div class="author-name">{{ row.author_name }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="150">
          <template #default="{ row }">
            <span v-if="row.tags">{{ row.tags }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="80">
          <template #default="{ row }">
            {{ row.views || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞" width="80">
          <template #default="{ row }">
            {{ row.likes || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_featured" label="推荐" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_featured ? 'success' : 'info'" size="small">
              {{ row.is_featured ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_official" label="官方" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_official" type="danger" size="small">
              官方
            </el-tag>
            <span v-else class="no-official">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              :type="row.status === 'published' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'published' ? '下架' : '发布' }}
            </el-button>
            <el-button
              :type="row.is_featured ? 'info' : 'warning'"
              size="small"
              @click="handleToggleFeatured(row)"
            >
              {{ row.is_featured ? '取消推荐' : '推荐' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 攻略详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="攻略详情"
      width="800px"
      top="5vh"
    >
      <div v-if="currentGuide" class="guide-detail">
        <div class="detail-header">
          <h2>{{ currentGuide.title }}</h2>
          <div class="detail-tags">
            <el-tag :type="getStatusType(currentGuide.status)">
              {{ getStatusText(currentGuide.status) }}
            </el-tag>
            <el-tag v-if="currentGuide.is_featured" type="success">推荐</el-tag>
            <el-tag v-if="currentGuide.is_official" type="danger">官方</el-tag>
          </div>
        </div>

        <div class="detail-meta">
          <span>作者：{{ currentGuide.author_name || '-' }}</span>
          <span>浏览：{{ currentGuide.views || 0 }}</span>
          <span>点赞：{{ currentGuide.likes || 0 }}</span>
          <span>评论：{{ currentGuide.comments || 0 }}</span>
          <span>创建时间：{{ formatDate(currentGuide.created_at) }}</span>
        </div>

        <div class="detail-cover" v-if="currentGuide.cover_image">
          <img :src="currentGuide.cover_image" alt="封面图" />
        </div>

        <div class="detail-description" v-if="currentGuide.description">
          <h4>简介</h4>
          <p>{{ currentGuide.description }}</p>
        </div>

        <div class="detail-content" v-if="currentGuide.content">
          <h4>正文内容</h4>
          <div class="content-text" v-html="currentGuide.content"></div>
        </div>

        <div class="detail-tags-list" v-if="currentGuide.tags">
          <h4>标签</h4>
          <el-tag
            v-for="tag in currentGuide.tags.split(',')"
            :key="tag"
            style="margin-right: 8px"
          >
            {{ tag.trim() }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 新建攻略弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建攻略"
      width="700px"
      top="5vh"
    >
      <el-form :model="guideForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="guideForm.title" placeholder="请输入攻略标题" />
        </el-form-item>
        <el-form-item label="攻略类型" required>
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
        <el-form-item label="作者">
          <el-input v-model="guideForm.author_name" placeholder="请输入作者名称（默认为官方平台）" />
        </el-form-item>
        <el-form-item label="其他标签">
          <el-input v-model="otherTags" placeholder="请输入其他标签，多个标签用逗号分隔" />
          <div class="tag-hint">例如：日本, 东京, 温泉（类型标签已自动添加）</div>
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
            <div v-if="guideForm.cover_image" class="cover-preview">
              <img :src="guideForm.cover_image" alt="封面预览" />
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
              v-model="guideForm.cover_image"
              placeholder="或输入封面图片URL"
              class="url-input"
            />
          </div>
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="guideForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入攻略简介"
          />
        </el-form-item>
        <el-form-item label="正文内容">
          <el-input
            v-model="guideForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入正文内容"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="guideForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
            <el-radio label="archived">归档</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为推荐">
          <el-switch v-model="guideForm.is_featured" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="submitLoading">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminGuideAPI } from '../../api/adminGuide'

const loading = ref(false)
const guides = ref([])
const selectedRows = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailDialogVisible = ref(false)
const currentGuide = ref(null)
const createDialogVisible = ref(false)
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

const guideForm = ref({
  title: '',
  author_name: '',
  tags: '',
  cover_image: '',
  description: '',
  content: '',
  status: 'draft',
  is_featured: false
})

const fileInput = ref(null)

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
  guideForm.value.tags = tagsList.join(',')
}

// 监听其他标签变化
watch(otherTags, () => {
  updateTags()
})

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
      guideForm.value.cover_image = data.data.url
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

const removeCover = () => {
  guideForm.value.cover_image = ''
}

const stats = ref({
  totalGuides: 0,
  publishedGuides: 0,
  draftGuides: 0,
  todayGuides: 0
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getStatusType = (status) => {
  const types = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return texts[status] || status
}

const loadGuides = async () => {
  loading.value = true
  try {
    const res = await adminGuideAPI.getAll({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchQuery.value,
      status: statusFilter.value
    })
    if (res.code === 200) {
      guides.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载攻略列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await adminGuideAPI.getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadGuides()
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadGuides()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadGuides()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadGuides()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleView = async (row) => {
  try {
    const res = await adminGuideAPI.getById(row.id)
    if (res.code === 200) {
      currentGuide.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载攻略详情失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'published' ? 'draft' : 'published'
    const res = await adminGuideAPI.update(row.id, { status: newStatus })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      loadGuides()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('更新状态失败')
  }
}

const handleToggleFeatured = async (row) => {
  try {
    const res = await adminGuideAPI.update(row.id, { is_featured: !row.is_featured })
    if (res.code === 200) {
      ElMessage.success(row.is_featured ? '已取消推荐' : '已设为推荐')
      loadGuides()
    }
  } catch (error) {
    ElMessage.error('更新推荐状态失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个攻略吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await adminGuideAPI.delete(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadGuides()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的攻略')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个攻略吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    const res = await adminGuideAPI.batchDelete(ids)
    if (res.code === 200) {
      ElMessage.success(res.message || '批量删除成功')
      loadGuides()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleCreate = () => {
  selectedType.value = ''
  otherTags.value = ''
  guideForm.value = {
    title: '',
    author_name: '',
    tags: '',
    cover_image: '',
    description: '',
    content: '',
    status: 'draft',
    is_featured: false
  }
  createDialogVisible.value = true
}

const handleSubmitCreate = async () => {
  if (!guideForm.value.title) {
    ElMessage.warning('请输入攻略标题')
    return
  }

  if (!selectedType.value) {
    ElMessage.warning('请选择攻略类型')
    return
  }

  // 更新标签
  updateTags()

  // 如果没有填写作者名称，默认为官方平台
  if (!guideForm.value.author_name) {
    guideForm.value.author_name = '官方平台'
  }

  submitLoading.value = true
  try {
    const res = await adminGuideAPI.create(guideForm.value)
    if (res.code === 200) {
      ElMessage.success('创建成功')
      createDialogVisible.value = false
      loadGuides()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadGuides()
  loadStats()
})
</script>

<style scoped>
.guide-manage {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.published {
  background: #ecfdf5;
}

.stat-icon.draft {
  background: #fef3c7;
}

.stat-icon.today {
  background: #fef3c7;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin: 5px 0 0 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.guide-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-header h2 {
  margin: 0;
}

.detail-tags {
  display: flex;
  gap: 8px;
}

.detail-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.detail-cover {
  margin-bottom: 20px;
}

.detail-cover img {
  max-width: 100%;
  border-radius: 8px;
}

.detail-description {
  margin-bottom: 20px;
}

.detail-description h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.detail-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.content-text {
  color: #666;
  line-height: 1.8;
}

.detail-tags-list {
  margin-bottom: 20px;
}

.detail-tags-list h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.cover-upload {
  width: 100%;
  height: 180px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: #fafafa;
  cursor: pointer;
}

.cover-upload:hover {
  border-color: #111;
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
  font-size: 36px;
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

.upload-options {
  margin-top: 10px;
}

.url-input {
  width: 100%;
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

.tag-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
