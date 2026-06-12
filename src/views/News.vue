<template>
  <div class="news-page">
    <Navbar />
    <div class="container">
      <Sidebar />
      <main class="main-content">
        <div class="scrollable-content">
          <div class="page-header">
            <h1>📰 旅游资讯</h1>
            <p>了解最新旅游动态，掌握出行前沿信息</p>
          </div>

          <div class="category-tabs">
            <div
              v-for="cat in categories"
              :key="cat"
              class="category-tab"
              :class="{ active: activeCategory === cat }"
              @click="activeCategory = cat; loadNews()"
            >
              {{ cat }}
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>

          <div class="news-list" v-else>
            <div v-for="(item, index) in newsList" :key="item.id || index" class="news-card" @click="openNewsDetail(item)">
              <img :src="item.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=300&h=220&fit=crop'" :alt="item.title" class="news-image">
              <div class="news-content">
                <div class="news-meta-top">
                  <span class="news-category">{{ item.category || '行业动态' }}</span>
                  <span class="news-date">{{ formatDate(item.created_at) }}</span>
                </div>
                <h3>{{ item.title }}</h3>
                <p class="news-desc">{{ item.description }}</p>
                <div class="news-footer">
                  <span class="news-views">👁️ {{ item.views || 0 }} 阅读</span>
                  <span class="news-action">查看详情 →</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="!loading && newsList.length === 0">
            <div class="empty-icon">📰</div>
            <p>暂无相关资讯</p>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import { newsAPI } from '../api/news'
import MobileBottomNav from '../components/MobileBottomNav.vue'

const router = useRouter()

const categories = ['全部', '行业动态', '签证政策', '目的地推荐', '活动预告', '特惠信息']
const activeCategory = ref('全部')
const loading = ref(false)
const newsList = ref([])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadNews = async () => {
  loading.value = true
  try {
    const res = await newsAPI.getAll({ 
      limit: 20,
      category: activeCategory.value
    })
    if (res.code === 200) {
      newsList.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载资讯列表失败:', error)
  } finally {
    loading.value = false
  }
}

const openNewsDetail = (news) => {
  router.push(`/news-detail?id=${news.id}`)
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-page {
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
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.category-tabs {
  display: flex;
  gap: 12px;
  padding: 0 0 20px;
  overflow-x: auto;
  flex-wrap: wrap;
}

.category-tab {
  padding: 8px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover {
  border-color: #409eff;
  color: #409eff;
}

.category-tab.active {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-card {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.news-image {
  width: 240px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-meta-top {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.news-category {
  background: #ecfdf5;
  color: #059669;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.news-date {
  color: #94a3b8;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.news-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-views {
  color: #94a3b8;
  font-size: 12px;
}

.news-action {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 20px;
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .news-card {
    flex-direction: column;
  }
  
  .news-image {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .news-page .container { margin-left: 0; }
  .news-page .main-content { padding-bottom: 60px; }
  .news-page .page-header h1 { font-size: 20px; }
  .news-page .page-header { padding: 15px; }
  .news-grid { grid-template-columns: 1fr; gap: 12px; }
  .content-area { padding: 15px; }
  .news-card { flex-direction: column; }
  .news-card-img { width: 100%; height: 180px; }
}
</style>
