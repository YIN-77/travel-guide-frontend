<template>
  <div class="itinerary-detail-page">
    <Navbar />
    <div class="container">
      <Sidebar />
      
      <main class="main-content">
        <div class="scrollable-content">
          <!-- 返回按钮 -->
          <button class="back-btn" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回行程规划
          </button>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>

          <template v-else-if="itinerary">
            <!-- 行程封面 -->
            <div class="detail-header">
              <img :src="itinerary.coverImage || getDefaultImage(itinerary.title)" :alt="itinerary.title" class="detail-cover">
              <div class="detail-overlay">
                <div class="cover-tags">
                  <span v-if="itinerary.isOfficial" class="tag official-tag">官方</span>
                  <span v-if="itinerary.isPublic" class="tag public-tag">公开</span>
                </div>
              </div>
            </div>

            <!-- 行程信息 -->
            <div class="itinerary-info-card">
              <h1 class="itinerary-title">{{ itinerary.title }}</h1>
              <div v-if="itinerary.description" class="itinerary-description">
                {{ itinerary.description }}
              </div>
              <div class="itinerary-meta">
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>{{ formatDateRange(itinerary.startDate, itinerary.endDate) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">⏱️</span>
                  <span>{{ getDaysCount(itinerary.startDate, itinerary.endDate) }} 天</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">👤</span>
                  <span>{{ getAuthorName() }}</span>
                </div>
              </div>
              
              <!-- 交互按钮 -->
              <div class="interaction-section">
                <InteractionButtons
                  targetType="itinerary"
                  :targetId="itinerary.id"
                  :initialLikeCount="itinerary.likes || 0"
                  :initialFavoriteCount="itinerary.favorites || 0"
                  :initialShareCount="itinerary.shares || 0"
                />
              </div>
            </div>

            <!-- 行程活动 -->
            <div class="activities-section">
              <h2 class="section-title">📍 行程安排</h2>
              <div v-if="groupedActivities && Object.keys(groupedActivities).length > 0" class="days-container">
                <div v-for="(activities, dayNum) in groupedActivities" :key="dayNum" class="day-section">
                  <div class="day-header">
                    <div class="day-badge">第{{ dayNum }}天</div>
                    <div class="day-date">{{ getDayDate(dayNum) }}</div>
                  </div>
                  <div class="day-activities">
                    <div v-for="(activity, idx) in activities" :key="activity.id || idx" class="activity-item">
                      <div v-if="activity.startTime" class="activity-time">
                        {{ activity.startTime }}
                      </div>
                      <div class="activity-content">
                        <div class="activity-main">
                          <h4 class="activity-title">{{ activity.title }}</h4>
                          <p v-if="activity.location" class="activity-location">📍 {{ activity.location }}</p>
                          <p v-if="activity.description" class="activity-description">{{ activity.description }}</p>
                        </div>
                        <div v-if="activity.images && activity.images.length > 0" class="activity-images">
                          <img 
                            v-for="(img, imgIdx) in activity.images" 
                            :key="imgIdx" 
                            :src="img" 
                            :alt="'活动图片' + (imgIdx + 1)"
                            class="activity-img"
                            @click="previewImage(img)"
                          />
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
          </template>

          <div v-else class="empty-state">
            <p>行程不存在</p>
          </div>
        </div>
      </main>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewImageUrl" class="image-preview-overlay" @click="previewImageUrl = null">
      <img :src="previewImageUrl" alt="预览图片" class="preview-img" />
      <button class="close-preview" @click="previewImageUrl = null">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import InteractionButtons from '../components/InteractionButtons.vue'
import { itineraryAPI } from '../api/itinerary'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const itinerary = ref(null)
const previewImageUrl = ref(null)

// 默认图片
const getDefaultImage = (title) => {
  const images = [
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=400&fit=crop'
  ]
  const index = title ? title.charCodeAt(0) % images.length : 0
  return images[index]
}

// 格式化日期范围
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
}

// 获取天数
const getDaysCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
}

// 获取某天的日期
const getDayDate = (dayNum) => {
  if (!itinerary.value?.startDate) return ''
  const start = new Date(itinerary.value.startDate)
  start.setDate(start.getDate() + dayNum - 1)
  return `${start.getMonth() + 1}月${start.getDate()}日`
}

// 获取作者名称
const getAuthorName = () => {
  if (!itinerary.value) return '匿名'
  if (itinerary.value.isOfficial || itinerary.value.userId === 0) return '官方平台'
  return itinerary.value.User?.nickname || itinerary.value.User?.username || '匿名'
}

// 按天分组活动
const groupedActivities = computed(() => {
  if (!itinerary.value?.days) return {}
  const grouped = {}
  itinerary.value.days.forEach(day => {
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

// 预览图片
const previewImage = (imgUrl) => {
  previewImageUrl.value = imgUrl
}

// 返回
const goBack = () => {
  router.back()
}

// 加载行程详情
const loadItineraryDetail = async () => {
  loading.value = true
  try {
    const id = route.query.id
    if (id) {
      const res = await itineraryAPI.getById(id)
      if (res.code === 200) {
        itinerary.value = res.data
      }
    }
  } catch (error) {
    console.error('加载行程详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadItineraryDetail()
})
</script>

<style scoped>
.itinerary-detail-page {
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
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.back-btn:hover {
  background: #f5f5f5;
  transform: translateX(-4px);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-header {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.detail-cover {
  width: 100%;
  height: 350px;
  object-fit: cover;
}

.detail-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
}

.cover-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.tag.official-tag {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: white;
}

.tag.public-tag {
  background: rgba(255, 255, 255, 0.95);
  color: #2e7d32;
}

.itinerary-info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.itinerary-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.itinerary-description {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-left: 3px solid #667eea;
  border-radius: 4px;
}

.itinerary-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.meta-icon {
  font-size: 16px;
}

.interaction-section {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.activities-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.days-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.day-section {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.day-badge {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
}

.day-date {
  font-size: 14px;
  color: #64748b;
}

.day-activities {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 16px;
}

.activity-time {
  min-width: 60px;
  padding: 8px 12px;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.activity-content {
  flex: 1;
}

.activity-main {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.activity-location {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 4px 0;
}

.activity-description {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
}

.activity-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.activity-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.activity-img:hover {
  transform: scale(1.05);
}

.empty-activities {
  text-align: center;
  padding: 40px;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.preview-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}

.close-preview {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-preview:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .itinerary-detail-page {
    padding-top: 70px;
  }
  
  .container {
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }

  .detail-cover {
    height: 220px;
  }

  .itinerary-title {
    font-size: 22px;
  }

  .itinerary-meta {
    flex-direction: column;
    gap: 12px;
  }

  .activities-section {
    padding: 16px;
  }

  .activity-item {
    flex-direction: column;
    gap: 8px;
  }

  .activity-time {
    align-self: flex-start;
  }
}
</style>
