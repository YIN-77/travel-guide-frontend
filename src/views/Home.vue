<template>
  <div class="home">
    <Navbar />
    <div class="container">
      <Sidebar />

      <main class="main-content">
        <div class="scrollable-content">
          <!-- 轮播图 -->
          <section class="carousel-section">
            <el-carousel :interval="4000" arrow="hover" height="360px">
              <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
                <div class="carousel-item" :style="{ backgroundImage: `url(${item.image})` }">
                  <div class="carousel-content">
                    <h2>{{ item.title }}</h2>
                    <p>{{ item.description }}</p>
                    <el-button type="primary" size="large" v-if="item.action" @click="handleCarouselAction(item)">
                      {{ item.action }}
                    </el-button>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </section>

          <section class="hot-destinations">
            <div class="section-header">
              <h2 class="section-title">🔥 热门景点推荐</h2>
              <span class="see-more" @click="goToDestinations">查看更多 →</span>
            </div>
            <div class="hot-destinations-scroll">
              <div
                v-for="dest in hotDestinations"
                :key="dest.id"
                class="hot-destination-card"
                @click="viewDestination(dest.id)"
              >
                <img :src="processCardImageUrl(dest.image)" :alt="dest.name" class="hot-card-img" />
                <div class="hot-card-info">
                  <h4 class="hot-card-name">{{ dest.name }}</h4>
                  <div class="hot-card-meta">
                    <span class="hot-card-rating">⭐ {{ dest.rating }}</span>
                    <span class="hot-card-hot">热度: {{ dest.hotScore || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 热门行程规划 -->
          <section class="section-block">
            <div class="section-header">
              <h2 class="section-title">📅 热门行程规划</h2>
              <span class="see-more" @click="goToItinerary">查看更多 →</span>
            </div>
            <div class="content-grid">
              <div v-for="item in hotItineraries" :key="item.id" class="content-card" @click="viewItinerary(item.id)">
                <div class="card-cover">
                  <img :src="processCardImageUrl(item.coverImage || item.cover_image || item.image)" :alt="item.title">
                  <div class="card-tag">{{ item.days || 1 }}天</div>
                </div>
                <div class="card-info">
                  <h3>{{ item.title }}</h3>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <span class="meta-item">👤 {{ item.author_name || item.author || '匿名' }}</span>
                    <span class="meta-item">👍 {{ item.likes || 0 }}</span>
                    <span class="meta-item">👁️ {{ item.views || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 热门旅游攻略 -->
          <section class="section-block">
            <div class="section-header">
              <h2 class="section-title">📖 热门旅游攻略</h2>
              <span class="see-more" @click="goToGuide">查看更多 →</span>
            </div>
            <div class="content-grid">
              <div v-for="item in hotGuides" :key="item.id" class="content-card" @click="viewGuide(item.id)">
                <div class="card-cover">
                  <img :src="processCardImageUrl(item.cover_image || item.coverImage || item.image)" :alt="item.title">
                </div>
                <div class="card-info">
                  <h3>{{ item.title }}</h3>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <span class="meta-item">👤 {{ item.author_name || item.author || '匿名' }}</span>
                    <span class="meta-item">👍 {{ item.likes || 0 }}</span>
                    <span class="meta-item">💬 {{ item.comments || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 旅游资讯 -->
          <section class="section-block">
            <div class="section-header">
              <h2 class="section-title">📰 旅游资讯</h2>
              <span class="see-more" @click="goToNews">查看更多 →</span>
            </div>
            <div class="news-list">
              <div v-for="item in newsList" :key="item.id" class="news-item" @click="viewNews(item.id)">
                <img :src="processCardImageUrl(item.cover_image || item.coverImage || item.image)" :alt="item.title" class="news-image">
                <div class="news-content">
                  <h3>{{ item.title }}</h3>
                  <p class="news-desc">{{ item.description }}</p>
                  <div class="news-meta">
                    <span>{{ formatDate(item.created_at || item.date) }}</span>
                    <span>{{ item.category }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { destinationAPI } from '../api/destinations'
import { guideAPI } from '../api/guide'
import { itineraryAPI } from '../api/itinerary'
import { newsAPI } from '../api/news'
import { useRouter } from 'vue-router'

const router = useRouter()
const destinations = ref([])
const guides = ref([])
const itineraries = ref([])
const newsList = ref([])

// 轮播图数据（保持静态）
const carouselItems = ref([
  {
    title: '探索世界之美',
    description: '发现全球最美景点，开启您的旅行梦想',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=400&fit=crop',
    action: '立即探索',
    type: 'destinations'
  },
  {
    title: '热门行程规划',
    description: '智能规划您的完美旅程，省时又省心',
    image: 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=1200&h=400&fit=crop',
    action: '开始规划',
    type: 'itinerary'
  },
  {
    title: '精选旅游攻略',
    description: '来自真实旅行者的经验分享',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef281b399?w=1200&h=400&fit=crop',
    action: '查看攻略',
    type: 'guide'
  }
])

// 热门景点计算属性
const hotDestinations = computed(() => {
  return [...destinations.value]
    .sort((a, b) => {
      const scoreA = (a.rating || 0) * 10 + (a.likesCount || Math.random() * 50)
      const scoreB = (b.rating || 0) * 10 + (b.likesCount || Math.random() * 50)
      return scoreB - scoreA
    })
    .slice(0, 10)
})

// 热门行程规划计算属性
const hotItineraries = computed(() => {
  return [...itineraries.value]
    .sort((a, b) => {
      const scoreA = (a.likes || 0) + (a.views || 0) * 0.1
      const scoreB = (b.likes || 0) + (b.views || 0) * 0.1
      return scoreB - scoreA
    })
    .slice(0, 4)
})

// 热门旅游攻略计算属性
const hotGuides = computed(() => {
  return [...guides.value]
    .sort((a, b) => {
      const scoreA = (a.likes || 0) + (a.views || 0) * 0.1
      const scoreB = (b.likes || 0) + (b.views || 0) * 0.1
      return scoreB - scoreA
    })
    .slice(0, 4)
})
const handleCarouselAction = (item) => {
  if (item.type === 'destinations') {
    goToDestinations()
  } else if (item.type === 'itinerary') {
    goToItinerary()
  } else if (item.type === 'guide') {
    goToGuide()
  }
}

const goToDestinations = () => {
  router.push('/destinations')
}

const goToItinerary = () => {
  router.push('/itinerary')
}

const goToGuide = () => {
  router.push('/guide')
}

const goToNews = () => {
  router.push('/news')
}

const viewDestination = (id) => {
  router.push(`/destinations?id=${id}`)
}

const viewGuide = (id) => {
  router.push(`/guide-detail?id=${id}`)
}

const viewItinerary = (id) => {
  router.push(`/itinerary-detail?id=${id}`)
}

const viewNews = (id) => {
  router.push(`/news-detail?id=${id}`)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const processCardImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const loadDestinations = async () => {
  try {
    const res = await destinationAPI.getList({ page: 1, limit: 100 })
    if (res.code === 200) {
      destinations.value = res.data.list
    }
  } catch (error) {
    console.error('加载景点数据失败:', error)
  }
}

const loadItineraries = async () => {
  try {
    const res = await itineraryAPI.getPublicList({ page: 1, limit: 50 })
    if (res.code === 200) {
      itineraries.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载行程数据失败:', error)
  }
}

const loadGuides = async () => {
  try {
    const res = await guideAPI.getAll({ page: 1, limit: 50 })
    if (res.code === 200) {
      guides.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载攻略数据失败:', error)
  }
}

const loadNews = async () => {
  try {
    const res = await newsAPI.getAll({ page: 1, limit: 10 })
    if (res.code === 200) {
      newsList.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载资讯数据失败:', error)
  }
}

onMounted(() => {
  loadDestinations()
  loadItineraries()
  loadGuides()
  loadNews()
})
</script>

<style scoped>
.home {
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
  padding-top: 70px;
}

.carousel-section {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3));
}

.carousel-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 20px;
}

.carousel-content h2 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.carousel-content p {
  font-size: 18px;
  margin-bottom: 24px;
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(255, 255, 255, 0.5);
}

:deep(.el-carousel__indicator--active .el-carousel__button) {
  background-color: #409eff;
  width: 30px;
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

.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.section-block {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.see-more {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s;
}

.see-more:hover {
  color: #66b1ff;
}

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

.card-cover {
  position: relative;
  height: 180px;
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

.card-info {
  padding: 16px;
}

.card-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-item {
  display: flex;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.news-image {
  width: 160px;
  height: 120px;
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

.news-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.hot-destinations {
  margin-bottom: 30px;
}

.hot-destinations-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 0 12px 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.hot-destinations-scroll::-webkit-scrollbar {
  height: 8px;
}

.hot-destinations-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.hot-destinations-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.hot-destinations-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.hot-destination-card {
  flex-shrink: 0;
  width: 200px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.hot-card-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.hot-card-info {
  padding: 12px;
}

.hot-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.hot-card-rating {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
}

.hot-card-hot {
  font-size: 11px;
  color: #ef4444;
  background: #fef2f2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .home {
    padding-top: 70px;
  }
  
  .container {
    flex-direction: column;
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .home .container { margin-left: 0; }
  .home .main-content { padding-bottom: 60px; }
  .carousel-section .el-carousel { height: 200px !important; }
  .carousel-section .el-carousel__container { height: 200px !important; }
  .carousel-item { height: 200px !important; }
  .carousel-content h2 { font-size: 20px; }
  .carousel-content p { font-size: 13px; }
  .section-header h2 { font-size: 18px; }
  .content-grid { grid-template-columns: 1fr; }
  .content-area { padding: 15px; }
  .hot-destination-card { min-width: 160px; }
  .hot-card-img { height: 100px; }
  .hot-card-name { font-size: 14px; }
  .search-bar { flex-direction: column; }
  .search-input, .filter-select, .search-button { width: 100%; }
  .destination-hero { height: 200px; }
  .destination-title { font-size: 24px; }
  .destination-info { padding: 20px; }
}
</style>
