<template>
  <div class="itinerary-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>行程管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索行程标题"
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
              <el-option label="公开" value="public" />
              <el-option label="私密" value="private" />
            </el-select>
            <el-button type="success" @click="handleCreateOfficial" style="margin-right: 10px">
              创建官方行程
            </el-button>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalItineraries }}</div>
                <div class="stat-label">行程总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-icon public">🌍</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.publicItineraries }}</div>
                <div class="stat-label">公开行程</div>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-icon private">🔒</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.privateItineraries }}</div>
                <div class="stat-label">私密行程</div>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-icon featured">🔥</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.featuredItineraries || 0 }}</div>
                <div class="stat-label">热门行程</div>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-icon official">⭐</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.officialItineraries || 0 }}</div>
                <div class="stat-label">官方行程</div>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-icon today">📈</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.todayItineraries }}</div>
                <div class="stat-label">今日新增</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table
        :data="itineraries"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        style="margin-top: 20px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="行程标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建者" width="150">
          <template #default="{ row }">
            <div v-if="row.User">
              <div class="user-name">{{ row.User.nickname || row.User.username }}</div>
              <div class="user-email">{{ row.User.email }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="daysCount" label="天数" width="80">
          <template #default="{ row }">
            {{ row.daysCount || 0 }}天
          </template>
        </el-table-column>
        <el-table-column prop="activityCount" label="活动数" width="80">
          <template #default="{ row }">
            {{ row.activityCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="isPublic" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isPublic ? 'success' : 'info'">
              {{ row.isPublic ? '公开' : '私密' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标识" width="120">
          <template #default="{ row }">
            <div class="tag-badges">
              <el-tag v-if="row.isFeatured" type="warning" size="small" style="margin-right: 4px">热门</el-tag>
              <el-tag v-if="row.isOfficial" type="danger" size="small">官方</el-tag>
              <span v-if="!row.isFeatured && !row.isOfficial" class="no-tag">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.isOfficial"
              type="success"
              size="small"
              @click="handleEditOfficial(row)"
            >
              编辑
            </el-button>
            <el-button
              :type="row.isFeatured ? 'info' : 'warning'"
              size="small"
              @click="handleToggleFeatured(row)"
            >
              {{ row.isFeatured ? '取消热门' : '设为热门' }}
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

    <!-- 行程详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="行程详情"
      width="800px"
      top="5vh"
    >
      <div v-if="currentItinerary" class="itinerary-detail">
        <div class="detail-header">
          <h2>{{ currentItinerary.title }}</h2>
          <el-tag :type="currentItinerary.isPublic ? 'success' : 'info'">
            {{ currentItinerary.isPublic ? '公开' : '私密' }}
          </el-tag>
          <el-tag v-if="currentItinerary.isFeatured" type="warning">热门</el-tag>
          <el-tag v-if="currentItinerary.isOfficial" type="danger">官方</el-tag>
        </div>

        <div class="detail-meta">
          <span>创建者：{{ currentItinerary.User?.nickname || currentItinerary.User?.username || '-' }}</span>
          <span>创建时间：{{ formatDate(currentItinerary.created_at) }}</span>
        </div>

        <div class="detail-cover" v-if="currentItinerary.coverImage">
          <h4>封面图片</h4>
          <img :src="currentItinerary.coverImage" alt="封面图片" class="cover-image" />
        </div>

        <div class="detail-description" v-if="currentItinerary.description">
          <h4>行程描述</h4>
          <p>{{ currentItinerary.description }}</p>
        </div>

        <div class="detail-days">
          <h4>行程安排</h4>
          <el-timeline>
            <el-timeline-item
              v-for="day in currentItinerary.days"
              :key="day.id"
              :timestamp="formatDate(day.date)"
              placement="top"
            >
              <el-card>
                <h5>第 {{ day.dayNumber }} 天</h5>
                <div v-if="day.activities && day.activities.length > 0" class="activities-list">
                  <div
                    v-for="activity in day.activities"
                    :key="activity.id"
                    class="activity-item"
                  >
                    <span class="activity-time">{{ activity.startTime || '-' }}</span>
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-location" v-if="activity.location">📍 {{ activity.location }}</span>
                  </div>
                </div>
                <div v-else class="no-activities">暂无活动安排</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>

    <!-- 创建/编辑官方行程弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="editingItineraryId ? '编辑官方行程' : '创建官方行程'"
      width="800px"
      top="5vh"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="行程标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入行程标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="行程描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入行程描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="行程天数" prop="daysCount">
          <el-input-number v-model="createForm.daysCount" :min="1" :max="30" @change="syncDaysCountToDates" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="createForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%" @change="updateEndDate" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="createForm.endDate" type="date" placeholder="选择结束日期" style="width: 100%" @change="updateDaysCount" />
        </el-form-item>
        <el-form-item label="封面图片">
          <div class="upload-options">
            <div class="upload-option">
              <span class="option-label">本地上传</span>
              <input type="file" id="admin-cover-upload" accept="image/*" class="hidden-file-input" @change="handleCoverUpload" />
              <label class="upload-btn" for="admin-cover-upload">选择图片</label>
            </div>
            <div class="upload-option">
              <span class="option-label">URL上传</span>
              <el-input v-model="createForm.coverImage" placeholder="输入图片URL" class="url-input" />
            </div>
          </div>
          <div v-if="createForm.coverImage" class="cover-preview">
            <img :src="createForm.coverImage" alt="封面预览" class="cover-preview-img" />
            <button type="button" class="remove-image-btn" @click="removeCoverImage">×</button>
          </div>
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="createForm.isPublic" />
        </el-form-item>
        <el-form-item label="设为热门推荐">
          <el-switch v-model="createForm.isFeatured" />
        </el-form-item>
        
        <!-- 活动管理 -->
        <el-form-item label="行程活动">
          <div class="activities-section">
            <el-button type="primary" size="small" @click="addActivity">+ 添加活动</el-button>
            <div v-if="createForm.activities.length === 0" class="empty-activities">
              <span>暂无活动安排，点击上方按钮添加</span>
            </div>
            <div v-else class="activities-list-admin">
              <div v-for="(activity, index) in createForm.activities" :key="index" class="activity-item-admin">
                <div class="activity-header">
                  <span class="activity-number">第{{ index + 1 }}项</span>
                  <el-button type="danger" size="small" @click="removeActivity(index)">删除</el-button>
                </div>
                <div class="activity-form-row">
                  <el-form-item label="天数">
                    <el-select v-model="activity.dayNumber" style="width: 100%">
                      <el-option v-for="d in dayRange" :key="d" :label="`第${d}天`" :value="d" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="时间">
                    <el-input v-model="activity.time" type="time" placeholder="选择时间" />
                  </el-form-item>
                </div>
                <el-form-item label="活动标题" required>
                  <el-input v-model="activity.title" placeholder="例如：游览故宫" maxlength="100" />
                </el-form-item>
                <el-form-item label="地点">
                  <el-input v-model="activity.location" placeholder="例如：北京市东城区" />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input v-model="activity.description" type="textarea" :rows="2" placeholder="描述活动详情" />
                </el-form-item>
                <el-form-item label="活动图片">
                  <div class="activity-images">
                    <div v-for="(img, imgIdx) in activity.images" :key="imgIdx" class="image-preview">
                      <img :src="img" alt="活动图片" />
                      <el-button type="danger" size="small" circle @click="removeActivityImage(index, imgIdx)">×</el-button>
                    </div>
                  </div>
                  <div class="image-upload-row">
                    <input
                      type="file"
                      :id="'activity-upload-' + index"
                      accept="image/*"
                      class="hidden-file-input"
                      @change="(e) => handleActivityImageUpload(e, index)"
                    />
                    <label class="upload-btn" :for="'activity-upload-' + index" style="margin-right: 10px">选择图片</label>
                    <el-input v-model="activity.newImageUrl" placeholder="输入图片URL" style="width: 200px; margin-right: 10px" />
                    <el-button size="small" @click="addActivityImage(index)">添加URL</el-button>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="createLoading">
          {{ editingItineraryId ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const dayRange = computed(() => {
  const count = createForm.daysCount || 1
  return Array.from({ length: count }, (_, i) => i + 1)
})
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminItineraryAPI } from '../../api/adminItinerary'

const loading = ref(false)
const itineraries = ref([])
const selectedRows = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailDialogVisible = ref(false)
const currentItinerary = ref(null)

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)

const createForm = reactive({
  title: '',
  description: '',
  daysCount: 1,
  startDate: '',
  endDate: '',
  coverImage: '',
  isPublic: true,
  isFeatured: false,
  activities: []
})

const editingItineraryId = ref(null)

const createRules = {
  title: [
    { required: true, message: '请输入行程标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入行程描述', trigger: 'blur' }
  ],
  daysCount: [
    { required: true, message: '请输入行程天数', trigger: 'blur' }
  ]
}

const stats = ref({
  totalItineraries: 0,
  publicItineraries: 0,
  privateItineraries: 0,
  featuredItineraries: 0,
  officialItineraries: 0,
  todayItineraries: 0
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadItineraries = async () => {
  loading.value = true
  try {
    const res = await adminItineraryAPI.getAll({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchQuery.value,
      status: statusFilter.value
    })
    if (res.code === 200) {
      itineraries.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载行程列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await adminItineraryAPI.getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadItineraries()
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadItineraries()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadItineraries()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadItineraries()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleView = async (row) => {
  try {
    const res = await adminItineraryAPI.getById(row.id)
    if (res.code === 200) {
      currentItinerary.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载行程详情失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    const res = await adminItineraryAPI.updateStatus(row.id, !row.isPublic)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      loadItineraries()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('更新状态失败')
  }
}

const handleToggleFeatured = async (row) => {
  try {
    const newStatus = !row.isFeatured
    const res = await adminItineraryAPI.updateFeatured(row.id, newStatus)
    if (res.code === 200) {
      ElMessage.success(newStatus ? '已设为热门推荐' : '已取消热门推荐')
      loadItineraries()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('更新热门状态失败')
  }
}

const handleToggleOfficial = async (row) => {
  try {
    const newStatus = !row.isOfficial
    const res = await adminItineraryAPI.updateOfficial(row.id, newStatus)
    if (res.code === 200) {
      ElMessage.success(newStatus ? '已设为官方行程' : '已取消官方行程')
      loadItineraries()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('更新官方状态失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await adminItineraryAPI.delete(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadItineraries()
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
    ElMessage.warning('请选择要删除的行程')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个行程吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    const res = await adminItineraryAPI.batchDelete(ids)
    if (res.code === 200) {
      ElMessage.success(res.message || '批量删除成功')
      loadItineraries()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.code === 200) {
      createForm.coverImage = data.data.url
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

const removeCoverImage = () => {
  createForm.coverImage = ''
}

const formatDateStr = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const syncDaysCountToDates = () => {
  if (createForm.startDate) {
    const start = new Date(createForm.startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + (createForm.daysCount - 1))
    createForm.endDate = formatDateStr(end)
  } else {
    const start = new Date()
    createForm.startDate = formatDateStr(start)
    const end = new Date(start)
    end.setDate(end.getDate() + (createForm.daysCount - 1))
    createForm.endDate = formatDateStr(end)
  }
}

const updateEndDate = () => {
  if (createForm.startDate && createForm.daysCount) {
    const start = new Date(createForm.startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + (createForm.daysCount - 1))
    createForm.endDate = formatDateStr(end)
  }
}

const updateDaysCount = () => {
  if (createForm.startDate && createForm.endDate) {
    const start = new Date(createForm.startDate)
    const end = new Date(createForm.endDate)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    createForm.daysCount = Math.max(1, diff)
  }
}

// 添加活动
const addActivity = () => {
  createForm.activities.push({
    dayNumber: 1,
    time: '',
    title: '',
    location: '',
    description: '',
    images: [],
    newImageUrl: ''
  })
}

// 删除活动
const removeActivity = (index) => {
  createForm.activities.splice(index, 1)
}

// 添加活动图片
const addActivityImage = (activityIndex) => {
  const activity = createForm.activities[activityIndex]
  if (activity.newImageUrl && activity.newImageUrl.trim()) {
    activity.images.push(activity.newImageUrl.trim())
    activity.newImageUrl = ''
  }
}

// 删除活动图片
const removeActivityImage = (activityIndex, imageIndex) => {
  createForm.activities[activityIndex].images.splice(imageIndex, 1)
}

// 活动图片上传
const handleActivityImageUpload = async (event, activityIndex) => {
  const file = event.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.code === 200) {
      createForm.activities[activityIndex].images.push(data.data.url)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

const handleCreateOfficial = () => {
  editingItineraryId.value = null
  createForm.title = ''
  createForm.description = ''
  createForm.daysCount = 1
  createForm.startDate = ''
  createForm.endDate = ''
  createForm.coverImage = ''
  createForm.isPublic = true
  createForm.isFeatured = false
  createForm.activities = []
  createDialogVisible.value = true
  setTimeout(() => syncDaysCountToDates(), 100)
}

// 编辑官方行程
const handleEditOfficial = async (row) => {
  try {
    const res = await adminItineraryAPI.getById(row.id)
    if (res.code === 200) {
      editingItineraryId.value = row.id
      createForm.title = res.data.title
      createForm.description = res.data.description || ''
      createForm.daysCount = res.data.days?.length || 1
      const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : ''
      createForm.startDate = fmt(res.data.startDate)
      createForm.endDate = fmt(res.data.endDate)
      createForm.coverImage = res.data.coverImage || ''
      createForm.isPublic = res.data.isPublic
      createForm.isFeatured = res.data.isFeatured
      
      // 转换活动数据
      const activities = []
      if (res.data.days) {
        res.data.days.forEach(day => {
          if (day.activities) {
            day.activities.forEach(act => {
              activities.push({
                dayNumber: day.dayNumber,
                time: act.startTime || '',
                title: act.title || '',
                location: act.location || '',
                description: act.description || '',
                images: act.images || [],
                newImageUrl: ''
              })
            })
          }
        })
      }
      createForm.activities = activities
      
      createDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载行程详情失败')
  }
}

const handleSubmitCreate = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      createLoading.value = true
      try {
        // 按天分组活动，并按时间排序
        const sortedActivities = [...createForm.activities].sort((a, b) => {
          if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber
          return (a.time || '').localeCompare(b.time || '')
        })
        
        const daysMap = {}
        sortedActivities.forEach(activity => {
          if (activity.title) {
            if (!daysMap[activity.dayNumber]) {
              daysMap[activity.dayNumber] = {
                dayNumber: activity.dayNumber,
                activities: []
              }
            }
            daysMap[activity.dayNumber].activities.push({
              title: activity.title,
              time: activity.time,
              location: activity.location,
              description: activity.description,
              images: activity.images
            })
          }
        })
        
        // 按天数排序
        const dayNumbers = Object.keys(daysMap).map(Number).sort((a, b) => a - b)
        const days = dayNumbers.map(num => daysMap[num])
        
        const data = {
          title: createForm.title,
          description: createForm.description,
          daysCount: createForm.daysCount,
          startDate: createForm.startDate || null,
          endDate: createForm.endDate || null,
          coverImage: createForm.coverImage,
          isPublic: createForm.isPublic,
          isFeatured: createForm.isFeatured,
          days: days
        }
        
        let res
        if (editingItineraryId.value) {
          // 编辑官方行程
          res = await adminItineraryAPI.update(editingItineraryId.value, data)
          if (res.code === 200) {
            ElMessage.success('更新官方行程成功')
          }
        } else {
          // 创建官方行程
          res = await adminItineraryAPI.createOfficial(data)
          if (res.code === 200) {
            ElMessage.success('创建官方行程成功')
          }
        }
        
        if (res.code === 200) {
          createDialogVisible.value = false
          loadItineraries()
          loadStats()
        }
      } catch (error) {
        ElMessage.error(editingItineraryId.value ? '更新官方行程失败' : '创建官方行程失败')
      } finally {
        createLoading.value = false
      }
    }
  })
}

onMounted(() => {
  loadItineraries()
  loadStats()
})
</script>

<style scoped>
.itinerary-manage {
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

.stat-icon.public {
  background: #ecfdf5;
}

.stat-icon.private {
  background: #f1f5f9;
}

.stat-icon.featured {
  background: #fff7ed;
}

.stat-icon.official {
  background: #fef2f2;
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

.user-name {
  font-weight: 500;
  color: #333;
}

.user-email {
  font-size: 12px;
  color: #999;
}

.tag-badges {
  display: flex;
  align-items: center;
}

.no-tag {
  color: #999;
}

.itinerary-detail {
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

.detail-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-cover {
  margin-bottom: 20px;
}

.detail-cover h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.cover-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
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

.detail-days h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
}

.activity-time {
  color: #999;
  min-width: 50px;
}

.activity-title {
  flex: 1;
  color: #333;
}

.activity-location {
  color: #666;
}

.no-activities {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.cover-preview {
  margin-top: 10px;
  position: relative;
  max-width: 400px;
}

.cover-preview-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.cover-preview .remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-options {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.upload-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-size: 12px;
  color: #888;
}

.upload-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
}

.upload-btn:hover {
  background: #eee;
  border-color: #ccc;
}

.hidden-file-input {
  display: none;
}

.url-input {
  width: 250px;
}

/* 活动管理样式 */
.activities-section {
  width: 100%;
}

.empty-activities {
  padding: 30px;
  text-align: center;
  color: #999;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  margin-top: 10px;
}

.activities-list-admin {
  margin-top: 15px;
}

.activity-item-admin {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.activity-number {
  font-weight: 600;
  color: #333;
}

.activity-form-row {
  display: flex;
  gap: 15px;
}

.activity-form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.activity-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview .el-button {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 12px;
}

.image-upload-row {
  display: flex;
  align-items: center;
}
</style>