<template>
  <div class="news-detail-page">
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
            返回旅游资讯
          </button>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>

          <template v-else-if="newsData">
            <!-- 资讯头部 -->
            <div class="news-header">
              <img :src="newsData.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=800&h=400&fit=crop'" :alt="newsData.title" class="news-cover">
              <div class="news-category-badge">
                <span class="category-tag">{{ newsData.category || '行业动态' }}</span>
              </div>
            </div>

            <!-- 资讯信息 -->
            <div class="news-info-card">
              <div class="news-meta-top">
                <span class="news-date">{{ formatDate(newsData.created_at) }}</span>
                <span class="news-views">👁️ {{ newsData.views || 0 }} 阅读</span>
              </div>
              <h1 class="news-title">{{ newsData.title }}</h1>
              
              <!-- 交互按钮 -->
              <div class="interaction-section">
                <InteractionButtons
                  targetType="news"
                  :targetId="newsData.id"
                  :initialLikeCount="newsData.likes || 0"
                  :initialFavoriteCount="newsData.favorites || 0"
                  :initialShareCount="newsData.shares || 0"
                />
              </div>
            </div>

            <!-- 资讯正文 -->
            <div class="news-content">
              <div v-if="newsData.content" class="content-paragraph" v-for="(para, idx) in newsData.content.split('\n')" :key="idx">
                <p>{{ para }}</p>
              </div>
              <div v-else class="empty-state" style="text-align: center; padding: 40px;">
                <p>暂无内容</p>
              </div>
            </div>
          </template>

          <div v-else class="empty-state">
            <p>资讯不存在</p>
          </div>

          <!-- 底部操作 -->
          <div class="detail-footer">
            <button class="action-btn secondary" @click="goBack">
              返回列表
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import InteractionButtons from '../components/InteractionButtons.vue'
import { newsAPI } from '../api/news'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const newsData = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadNewsDetail = async () => {
  loading.value = true
  try {
    const id = route.query.id
    if (id) {
      const res = await newsAPI.getById(id)
      if (res.code === 200) {
        newsData.value = res.data
      }
    }
  } catch (error) {
    console.error('加载资讯详情失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadNewsDetail()
})
</script>

<style scoped>
.news-detail-page {
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

.news-header {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.news-cover {
  width: 100%;
  height: 350px;
  object-fit: cover;
}

.news-category-badge {
  position: absolute;
  top: 20px;
  left: 20px;
}

.category-tag {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.news-info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.news-meta-top {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.news-date {
  color: #64748b;
  font-size: 14px;
}

.news-views {
  color: #64748b;
  font-size: 14px;
}

.news-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.interaction-section {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.news-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.content-paragraph {
  margin-bottom: 20px;
}

.content-paragraph:last-child {
  margin-bottom: 0;
}

.content-paragraph p {
  color: #475569;
  line-height: 1.9;
  font-size: 15px;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-footer {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
  position: sticky;
  bottom: 20px;
}

.action-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .news-detail-page {
    padding-top: 70px;
  }
  
  .container {
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }

  .news-cover {
    height: 220px;
  }

  .news-title {
    font-size: 22px;
  }

  .news-content {
    padding: 20px;
  }

  .detail-footer {
    flex-direction: column;
    gap: 12px;
    bottom: 12px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>