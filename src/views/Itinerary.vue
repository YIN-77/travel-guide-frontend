<template>
  <div class="itinerary-page">
    <Navbar />
    <div class="container">
      <Sidebar />

      <main class="main-content">
        <div class="scrollable-content">
          <!-- 页面头部 -->
          <div class="page-header">
            <div class="header-left">
              <h1 class="page-title">📅 行程规划</h1>
              <p class="page-subtitle">探索精彩行程，获取旅行灵感</p>
            </div>
            <button v-if="isLoggedIn" class="create-btn" @click="openCreateModal">
              <span class="btn-icon">+</span>
              创建行程
            </button>
            <button v-else class="create-btn" @click="showAuthModal = true">
              <span class="btn-icon">+</span>
              创建行程
            </button>
          </div>

          <!-- 我的行程（已登录用户） -->
          <div v-if="isLoggedIn && myItineraries.length > 0" class="section">
            <div class="section-header">
              <h2 class="section-title">📋 我的行程</h2>
            </div>
            <div class="itineraries-grid">
              <div 
                v-for="itinerary in myItineraries" 
                :key="itinerary.id" 
                class="itinerary-card"
                @click="viewItineraryDetail(itinerary)"
              >
                <div class="card-header">
                  <div class="title-wrap">
                    <h3 class="card-title">{{ itinerary.title }}</h3>
                    <span v-if="itinerary.isPublic" class="public-tag">公开</span>
                    <span v-else class="private-tag">私密</span>
                  </div>
                  <div class="card-actions" @click.stop>
                    <button class="action-btn" @click="editItinerary(itinerary)" title="编辑">
                      <span class="action-icon">✏️</span>
                    </button>
                    <button class="action-btn" @click="toggleStatus(itinerary)" :title="itinerary.isPublic ? '设为私密' : '设为公开'">
                      <span class="action-icon">{{ itinerary.isPublic ? '🔒' : '👁️' }}</span>
                    </button>
                    <button class="action-btn delete" @click="deleteItinerary(itinerary.id)" title="删除">
                      <span class="action-icon">🗑️</span>
                    </button>
                  </div>
                </div>
                <div v-if="itinerary.coverImage" class="card-cover-small">
                  <img :src="itinerary.coverImage" :alt="itinerary.title" />
                </div>
                <p v-if="itinerary.description" class="card-desc">{{ itinerary.description }}</p>
                <div class="card-meta">
                  <span class="meta-item">📅 {{ formatDateRange(itinerary.startDate, itinerary.endDate) }}</span>
                  <span class="meta-item">💡 {{ getDaysCount(itinerary.startDate, itinerary.endDate) }} 天</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 官方精选行程 -->
          <div v-if="officialItineraries.length > 0" class="section">
            <div class="section-header">
              <h2 class="section-title">⭐ 官方精选行程</h2>
              <span class="section-subtitle">官方认证优质行程</span>
            </div>
            <div class="content-grid">
              <div v-for="item in officialItineraries" :key="item.id" class="content-card official" @click="viewItineraryDetail(item)">
                <div class="card-cover">
                  <img :src="item.coverImage || getDefaultImage(item.title)" :alt="item.title" />
                  <div class="card-tag official-tag">官方</div>
                </div>
                <div class="card-info">
                  <h3>{{ item.title }}</h3>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <span class="meta-item">📅 {{ getDaysCount(item.startDate, item.endDate) }}天</span>
                    <span class="meta-item">👍 {{ item.favorites || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 热门行程推荐 -->
          <div v-if="hotItineraries.length > 0" class="section">
            <div class="section-header">
              <h2 class="section-title">🔥 热门行程推荐</h2>
              <span class="section-subtitle">最受欢迎的旅行计划</span>
            </div>
            <div class="content-grid">
              <div v-for="item in hotItineraries" :key="item.id" class="content-card" @click="viewItineraryDetail(item)">
                <div class="card-cover">
                  <img :src="item.coverImage || getDefaultImage(item.title)" :alt="item.title" />
                  <div class="card-tag hot-tag">{{ getDaysCount(item.startDate, item.endDate) }}天</div>
                </div>
                <div class="card-info">
                  <h3>{{ item.title }}</h3>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <span class="meta-item">👤 {{ getAuthorName(item) }}</span>
                    <span class="meta-item">👍 {{ item.favorites || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 全部公开行程 -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">🌍 全部行程</h2>
              <span class="section-subtitle">发现更多精彩旅程</span>
            </div>
            <div v-if="publicItineraries.length > 0" class="content-grid">
              <div v-for="item in publicItineraries" :key="item.id" class="content-card" @click="viewItineraryDetail(item)">
                <div class="card-cover">
                  <img :src="item.coverImage || getDefaultImage(item.title)" :alt="item.title" />
                  <div class="card-tag">{{ getDaysCount(item.startDate, item.endDate) }}天</div>
                </div>
                <div class="card-info">
                  <h3>{{ item.title }}</h3>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <span class="meta-item">👤 {{ getAuthorName(item) }}</span>
                    <span class="meta-item">📅 {{ formatDateRange(item.startDate, item.endDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无公开行程</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 创建/编辑行程弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal create-modal">
        <div class="modal-header">
          <h3>{{ editingItinerary ? '编辑行程' : '创建行程' }}</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <!-- 基本信息 -->
          <div class="form-section">
            <h4 class="form-section-title">基本信息</h4>
            <div class="form-group">
              <label class="form-label">行程标题 <span class="required">*</span></label>
              <input v-model="itineraryForm.title" type="text" class="form-input" placeholder="例如：东京5日游" />
            </div>
            <div class="form-group">
              <label class="form-label">行程描述</label>
              <textarea v-model="itineraryForm.description" class="form-textarea" rows="3" placeholder="描述一下你的行程..." />
            </div>
            <div class="form-group">
              <label class="form-label">封面图片</label>
              <div class="upload-options">
                <div class="upload-option">
                  <span class="option-label">本地上传</span>
                  <input type="file" accept="image/*" class="file-input" @change="handleCoverUpload" />
                  <label class="upload-btn" for="cover-upload">选择图片</label>
                  <input type="file" id="cover-upload" accept="image/*" class="hidden-file-input" @change="handleCoverUpload" />
                </div>
                <div class="upload-option">
                  <span class="option-label">URL上传</span>
                  <input v-model="itineraryForm.coverImage" type="text" class="form-input small-input" placeholder="输入图片URL" />
                </div>
              </div>
              <div v-if="itineraryForm.coverImage" class="cover-preview-small">
                <img :src="itineraryForm.coverImage" alt="封面预览" />
                <button type="button" class="remove-image-btn" @click="removeCoverImage">×</button>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">开始日期 <span class="required">*</span></label>
                <input v-model="itineraryForm.startDate" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">结束日期 <span class="required">*</span></label>
                <input v-model="itineraryForm.endDate" type="date" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-checkbox-label">
                <input v-model="itineraryForm.isPublic" type="checkbox" class="form-checkbox" />
                <span>公开行程（其他用户可以看到）</span>
              </label>
            </div>
          </div>

          <!-- 行程活动 -->
          <div class="form-section">
            <div class="form-section-header">
              <h4 class="form-section-title">行程活动</h4>
              <button type="button" class="add-activity-btn" @click="addActivity">
                + 添加活动
              </button>
            </div>
            <div v-if="itineraryForm.activities.length === 0" class="empty-activities">
              <p>暂无活动安排，点击上方按钮添加</p>
            </div>
            <div v-else class="activities-list">
              <div v-for="(activity, index) in itineraryForm.activities" :key="index" class="activity-item">
                <div class="activity-header">
                  <span class="activity-number">第{{ index + 1 }}项</span>
                  <button type="button" class="remove-activity-btn" @click="removeActivity(index)">删除</button>
                </div>
                <div class="activity-form-row">
                  <div class="form-group">
                    <label class="form-label">日期</label>
                    <select v-model="activity.dayNumber" class="form-input">
                      <option v-for="day in totalDays" :key="day" :value="day">第{{ day }}天</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">时间</label>
                    <input v-model="activity.time" type="time" class="form-input" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">活动标题 <span class="required">*</span></label>
                  <input v-model="activity.title" type="text" class="form-input" placeholder="例如：游览故宫" />
                </div>
                <div class="form-group">
                  <label class="form-label">地点/景点</label>
                  <input v-model="activity.location" type="text" class="form-input" placeholder="例如：北京市东城区" />
                </div>
                <div class="form-group">
                  <label class="form-label">详细描述</label>
                  <textarea v-model="activity.description" class="form-textarea" rows="2" placeholder="描述活动详情..." />
                </div>
                <div class="form-group">
                  <label class="form-label">活动图片</label>
                  <div class="activity-images-input">
                    <div v-for="(img, imgIdx) in activity.images" :key="imgIdx" class="activity-image-preview">
                      <img :src="img" alt="活动图片" />
                      <button type="button" class="remove-image-btn" @click="removeActivityImage(index, imgIdx)">×</button>
                    </div>
                    <div class="add-image-input">
                      <div class="upload-options small">
                        <div class="upload-option">
                          <input type="file" accept="image/*" class="file-input" @change="(e) => handleActivityImageUpload(e, index)" />
                          <label class="upload-btn small-btn" :for="'activity-upload-' + index">选择图片</label>
                          <input type="file" :id="'activity-upload-' + index" accept="image/*" class="hidden-file-input" @change="(e) => handleActivityImageUpload(e, index)" />
                        </div>
                        <div class="upload-option">
                          <input v-model="activity.newImageUrl" type="text" class="form-input mini-input" placeholder="图片URL" />
                          <button type="button" class="add-image-btn" @click="addActivityImage(index)">添加</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn cancel" @click="closeCreateModal">取消</button>
          <button class="btn primary" @click="saveItinerary" :disabled="saving">
            {{ saving ? '保存中...' : (editingItinerary ? '更新' : '创建') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 行程详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal detail-modal">
        <div class="modal-header">
          <h3>{{ currentItinerary?.title }}</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="currentItinerary?.coverImage" class="detail-cover">
            <img :src="currentItinerary.coverImage" :alt="currentItinerary.title" />
          </div>
          <p class="detail-desc">{{ currentItinerary?.description }}</p>
          <div class="detail-meta">
            <span>📅 {{ formatDateRange(currentItinerary?.startDate, currentItinerary?.endDate) }}</span>
            <span>💡 {{ getDaysCount(currentItinerary?.startDate, currentItinerary?.endDate) }} 天</span>
            <span>👤 {{ getAuthorName(currentItinerary) }}</span>
          </div>
          
          <!-- 按天显示活动 -->
          <div v-if="groupedActivities && Object.keys(groupedActivities).length > 0" class="days-container">
            <div v-for="(activities, dayNum) in groupedActivities" :key="dayNum" class="day-section">
              <h4 class="day-title">第{{ dayNum }}天</h4>
              <div class="day-activities">
                <div v-for="activity in activities" :key="activity.id" class="activity-detail-item">
                  <div class="activity-time-badge">{{ activity.time || '待定' }}</div>
                  <div class="activity-content">
                    <h5>{{ activity.title }}</h5>
                    <p v-if="activity.location" class="activity-location">📍 {{ activity.location }}</p>
                    <p v-if="activity.description" class="activity-desc">{{ activity.description }}</p>
                    <div v-if="activity.images && activity.images.length > 0" class="activity-detail-images">
                      <img v-for="(img, idx) in activity.images" :key="idx" :src="img" :alt="'活动图片' + (idx + 1)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-activities">
            <p>暂无活动安排</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录提示弹窗 -->
    <div v-if="showAuthModal" class="modal-overlay" @click.self="showAuthModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>提示</h3>
          <button class="close-btn" @click="showAuthModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="auth-tip">
            <span class="tip-icon">🔐</span>
            <p>创建行程需要登录</p>
            <p class="tip-desc">登录后可创建和管理您的旅行行程</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn cancel" @click="showAuthModal = false">取消</button>
          <button class="btn primary" @click="goToLogin">去登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { itineraryAPI } from '../api/itinerary'
import { ElMessage, ElMessageBox } from 'element-plus'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

// 定时刷新热门行程
let hotRefreshInterval = null

// 状态
const myItineraries = ref([])
const hotItineraries = ref([])
const officialItineraries = ref([])
const publicItineraries = ref([])
const currentItinerary = ref(null)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const showAuthModal = ref(false)
const editingItinerary = ref(null)
const saving = ref(false)
const loading = ref(false)

// 表单
const itineraryForm = ref({
  title: '',
  description: '',
  coverImage: '',
  startDate: '',
  endDate: '',
  isPublic: false,
  activities: []
})

// 计算属性
const isLoggedIn = computed(() => authStore.isUserLoggedIn)

const totalDays = computed(() => {
  if (!itineraryForm.value.startDate || !itineraryForm.value.endDate) return 1
  const start = new Date(itineraryForm.value.startDate)
  const end = new Date(itineraryForm.value.endDate)
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
})

const groupedActivities = computed(() => {
  if (!currentItinerary.value?.days) return {}
  const grouped = {}
  currentItinerary.value.days.forEach(day => {
    const dayNum = day.dayNumber
    if (!grouped[dayNum]) grouped[dayNum] = []
    if (day.activities) {
      day.activities.forEach(activity => {
        grouped[dayNum].push({
          ...activity,
          time: activity.startTime
        })
      })
    }
  })
  return grouped
})

// 默认图片
const getDefaultImage = (title) => {
  const images = [
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop'
  ]
  const index = title ? title.charCodeAt(0) % images.length : 0
  return images[index]
}

// 格式化日期
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
}

const getDaysCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
}

// 获取作者名称（官方行程显示"官方平台"）
const getAuthorName = (item) => {
  if (!item) return '匿名'
  if (item.isOfficial || item.userId === 0) return '官方平台'
  return item.User?.nickname || item.User?.username || item.author?.username || '匿名'
}

// 加载数据
const loadHotItineraries = async () => {
  try {
    const res = await itineraryAPI.getHotList({ limit: 4 })
    if (res.code === 200) {
      hotItineraries.value = res.data?.list || res.data || []
    }
  } catch (error) {
    console.error('加载热门行程失败:', error)
  }
}

const loadOfficialItineraries = async () => {
  try {
    const res = await itineraryAPI.getOfficialList({ limit: 4 })
    if (res.code === 200) {
      officialItineraries.value = res.data?.list || res.data || []
    }
  } catch (error) {
    console.error('加载官方行程失败:', error)
  }
}

const loadPublicItineraries = async () => {
  try {
    const res = await itineraryAPI.getPublicList({ limit: 12 })
    if (res.code === 200) {
      publicItineraries.value = res.data?.list || res.data || []
    }
  } catch (error) {
    console.error('加载公开行程失败:', error)
  }
}

const loadMyItineraries = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await itineraryAPI.getAll()
    if (res.code === 200) {
      myItineraries.value = res.data?.list || res.data || []
    }
  } catch (error) {
    console.error('加载我的行程失败:', error)
  }
}

// 查看行程详情
const viewItineraryDetail = (itinerary) => {
  router.push({ path: '/itinerary-detail', query: { id: itinerary.id } })
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentItinerary.value = null
}

// 创建/编辑行程
const openCreateModal = () => {
  editingItinerary.value = null
  const today = new Date()
  const future = new Date(today)
  future.setDate(future.getDate() + 3)
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  itineraryForm.value = {
    title: '',
    description: '',
    coverImage: '',
    startDate: fmt(today),
    endDate: fmt(future),
    isPublic: false,
    activities: []
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingItinerary.value = null
  itineraryForm.value = {
    title: '',
    description: '',
    coverImage: '',
    startDate: '',
    endDate: '',
    isPublic: false,
    activities: []
  }
}

const editItinerary = async (itinerary) => {
  try {
    const res = await itineraryAPI.getMyById(itinerary.id)
    if (res.code === 200) {
      editingItinerary.value = res.data
      // 处理activities数据格式
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
      itineraryForm.value = {
        title: res.data.title,
        description: res.data.description || '',
        coverImage: res.data.coverImage || '',
        startDate: res.data.startDate ? res.data.startDate.split('T')[0] : '',
        endDate: res.data.endDate ? res.data.endDate.split('T')[0] : '',
        isPublic: res.data.isPublic || false,
        activities: activities
      }
      showCreateModal.value = true
    }
  } catch (error) {
    console.error('加载行程详情失败:', error)
    ElMessage.error('加载失败')
  }
}

const addActivity = () => {
  itineraryForm.value.activities.push({
    dayNumber: 1,
    time: '',
    title: '',
    location: '',
    description: '',
    images: [],
    newImageUrl: ''
  })
}

const removeActivity = (index) => {
  itineraryForm.value.activities.splice(index, 1)
}

const addActivityImage = (activityIndex) => {
  const activity = itineraryForm.value.activities[activityIndex]
  if (activity.newImageUrl && activity.newImageUrl.trim()) {
    activity.images.push(activity.newImageUrl.trim())
    activity.newImageUrl = ''
  }
}

const removeActivityImage = (activityIndex, imageIndex) => {
  itineraryForm.value.activities[activityIndex].images.splice(imageIndex, 1)
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
      itineraryForm.value.coverImage = data.data.url
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
  itineraryForm.value.coverImage = ''
}

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
      itineraryForm.value.activities[activityIndex].images.push(data.data.url)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

const saveItinerary = async () => {
  if (!itineraryForm.value.title) {
    ElMessage.warning('请填写行程标题')
    return
  }
  if (!itineraryForm.value.startDate || !itineraryForm.value.endDate) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }

  saving.value = true
  try {
    const data = {
      title: itineraryForm.value.title,
      description: itineraryForm.value.description,
      coverImage: itineraryForm.value.coverImage,
      startDate: itineraryForm.value.startDate,
      endDate: itineraryForm.value.endDate,
      isPublic: itineraryForm.value.isPublic,
      activities: itineraryForm.value.activities.filter(a => a.title).map(a => ({
        dayNumber: a.dayNumber,
        time: a.time,
        title: a.title,
        location: a.location,
        description: a.description,
        images: a.images
      }))
    }

    let res
    if (editingItinerary.value) {
      res = await itineraryAPI.update(editingItinerary.value.id, data)
    } else {
      res = await itineraryAPI.create(data)
    }

    if (res.code === 200 || res.code === 201) {
      ElMessage.success(editingItinerary.value ? '更新成功' : '创建成功')
      closeCreateModal()
      loadMyItineraries()
      loadPublicItineraries()
    }
  } catch (error) {
    console.error('保存行程失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 切换公开/私密状态
const toggleStatus = async (itinerary) => {
  try {
    const newStatus = !itinerary.isPublic
    const res = await itineraryAPI.updateStatus(itinerary.id, newStatus)
    if (res.code === 200) {
      itinerary.isPublic = newStatus
      ElMessage.success(newStatus ? '已设为公开' : '已设为私密')
      loadPublicItineraries()
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新失败')
  }
}

// 删除行程
const deleteItinerary = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await itineraryAPI.delete(id)
    console.log('删除行程响应:', res)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadMyItineraries()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除行程失败:', error)
      const errorMsg = error.response?.data?.message || error.message || '删除失败'
      ElMessage.error(errorMsg)
    }
  }
}

// 跳转到登录
const goToLogin = () => {
  showAuthModal.value = false
  router.push('/')
}

// 初始化
onMounted(() => {
  loadHotItineraries()
  loadOfficialItineraries()
  loadPublicItineraries()
  if (isLoggedIn.value) {
    loadMyItineraries()
  }
  // 启动定时刷新热门行程（每30秒刷新一次）
  hotRefreshInterval = setInterval(() => {
    loadHotItineraries()
  }, 30000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (hotRefreshInterval) {
    clearInterval(hotRefreshInterval)
    hotRefreshInterval = null
  }
})
</script>

<style scoped>
.itinerary-page {
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

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #111;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 区块样式 */
.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.section-subtitle {
  font-size: 14px;
  color: #888;
}

/* 行程卡片 */
.itineraries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.itinerary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.itinerary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.public-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 10px;
}

.private-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: #fff3e0;
  color: #e65100;
  border-radius: 10px;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-btn.delete:hover {
  background: #ffebee;
}

.card-cover-small {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.card-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 13px;
  color: #888;
}

/* 内容卡片网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.content-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.content-card.official {
  border: 2px solid #ffd700;
}

.card-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-card:hover .card-cover img {
  transform: scale(1.1);
}

.card-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.card-tag.official-tag {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #fff;
}

.card-tag.hot-tag {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: #fff;
}

.card-info {
  padding: 16px;
}

.card-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.card-info .card-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-info .card-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  color: #888;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.create-modal {
  max-width: 700px;
}

.detail-modal {
  max-width: 750px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.modal-header .close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  border-radius: 8px;
}

.modal-header .close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px 24px;
}

.auth-tip {
  text-align: center;
  padding: 20px;
}

.tip-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.auth-tip p {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
}

.tip-desc {
  font-size: 14px !important;
  color: #888 !important;
}

/* 表单样式 */
.form-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.form-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.form-section-header .form-section-title {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #e53935;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #111;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-checkbox-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.form-checkbox {
  margin-right: 8px;
}

.cover-preview-small {
  margin-top: 10px;
  width: 100%;
  max-height: 150px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.cover-preview-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-preview-small .remove-image-btn {
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
  gap: 16px;
  align-items: flex-end;
}

.upload-options.small {
  flex-wrap: wrap;
  gap: 12px;
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

.upload-btn.small-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.hidden-file-input {
  display: none;
}

.form-input.small-input {
  width: 200px;
}

.form-input.mini-input {
  width: 150px;
  flex: 1;
}

/* 活动列表 */
.add-activity-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-activity-btn:hover {
  background: #eee;
  border-color: #ccc;
}

.empty-activities {
  text-align: center;
  padding: 30px;
  color: #888;
  background: #fafafa;
  border-radius: 10px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activity-number {
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.remove-activity-btn {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid #e53935;
  border-radius: 4px;
  font-size: 12px;
  color: #e53935;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-activity-btn:hover {
  background: #ffebee;
}

.activity-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.activity-images-input {
  margin-top: 10px;
}

.activity-image-preview {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 10px;
  margin-bottom: 10px;
}

.activity-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-input {
  display: flex;
  gap: 10px;
}

.add-image-btn {
  padding: 10px 16px;
  background: #111;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}

.add-image-btn:hover {
  background: #333;
}

/* 详情弹窗 */
.detail-cover {
  width: 100%;
  max-height: 250px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #888;
}

.days-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.day-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.day-activities {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-detail-item {
  display: flex;
  gap: 12px;
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.activity-time-badge {
  min-width: 60px;
  font-size: 13px;
  font-weight: 600;
  color: #111;
}

.activity-content {
  flex: 1;
}

.activity-content h5 {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 0 0 4px 0;
}

.activity-location {
  font-size: 13px;
  color: #666;
  margin: 0 0 4px 0;
}

.activity-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.activity-detail-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.activity-detail-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: white;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.cancel {
  background: #f5f5f5;
  color: #333;
}

.btn.cancel:hover {
  background: #eee;
}

.btn.primary {
  background: #111;
  color: white;
}

.btn.primary:hover {
  background: #333;
}

.btn.primary:disabled {
  background: #aaa;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .itinerary-page {
    padding-top: 70px;
  }
  
  .container {
    flex-direction: column;
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .itineraries-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .form-row,
  .activity-form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    max-width: 100%;
    margin: 10px;
  }
}
</style>