<template>
  <div class="home">
    <Navbar />
    <div class="container">
      <Sidebar />

      <main class="main-content">
        <div class="scrollable-content">
          <!-- 搜索结果区域 -->
          <div v-if="searchQuery" class="search-results">
            <div class="search-results-header">
              <h2 class="search-results-title">🔍 搜索结果：{{ searchQuery }}</h2>
              <button class="clear-search-btn" @click="clearSearch">清除搜索</button>
            </div>
            
            <!-- 相关景点 -->
            <section v-if="searchedDestinations.length > 0" class="search-section">
              <h3 class="search-section-title">🗺️ 相关景点 <span class="result-count">({{ searchedDestinations.length }})</span></h3>
              <div class="search-grid">
                <div v-for="dest in searchedDestinations" :key="dest.id" class="search-card destination-card" @click="viewDestination(dest.id)">
                  <img :src="processCardImageUrl(dest.image)" :alt="dest.name" class="search-card-img" />
                  <div class="search-card-info">
                    <h4 v-html="highlightKeyword(dest.name)"></h4>
                    <p class="search-card-location" v-html="highlightKeyword('📍 ' + dest.location)"></p>
                    <div class="search-card-rating">⭐ {{ dest.rating }}</div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 相关行程规划 -->
            <section v-if="searchedItineraries.length > 0" class="search-section">
              <h3 class="search-section-title">📅 相关行程规划 <span class="result-count">({{ searchedItineraries.length }})</span></h3>
              <div class="search-grid">
                <div v-for="item in searchedItineraries" :key="item.id" class="search-card" @click="viewItinerary(item.id)">
                  <img :src="processCardImageUrl(item.coverImage || item.cover_image || item.image)" :alt="item.title" class="search-card-img" />
                  <div class="search-card-info">
                    <h4 v-html="highlightKeyword(item.title)"></h4>
                    <p class="search-card-desc" v-html="highlightKeyword((item.description || '').substring(0, 40) + '...')"></p>
                    <div class="search-card-meta">
                      <span>👤 {{ item.author_name || item.author || '匿名' }}</span>
                      <span>👍 {{ item.likes || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 相关旅游攻略 -->
            <section v-if="searchedGuides.length > 0" class="search-section">
              <h3 class="search-section-title">📖 相关旅游攻略 <span class="result-count">({{ searchedGuides.length }})</span></h3>
              <div class="search-grid">
                <div v-for="item in searchedGuides" :key="item.id" class="search-card" @click="viewGuide(item.id)">
                  <img :src="processCardImageUrl(item.cover_image || item.coverImage || item.image)" :alt="item.title" class="search-card-img" />
                  <div class="search-card-info">
                    <h4 v-html="highlightKeyword(item.title)"></h4>
                    <p class="search-card-desc" v-html="highlightKeyword((item.description || '').substring(0, 40) + '...')"></p>
                    <div class="search-card-meta">
                      <span>👤 {{ item.author_name || item.author || '匿名' }}</span>
                      <span>👍 {{ item.likes || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 相关旅游资讯 -->
            <section v-if="searchedNews.length > 0" class="search-section">
              <h3 class="search-section-title">📰 相关旅游资讯 <span class="result-count">({{ searchedNews.length }})</span></h3>
              <div class="search-grid news-grid">
                <div v-for="item in searchedNews" :key="item.id" class="search-card news-card" @click="viewNews(item.id)">
                  <img :src="processCardImageUrl(item.cover_image || item.coverImage || item.image)" :alt="item.title" class="search-card-img" />
                  <div class="search-card-info">
                    <h4 v-html="highlightKeyword(item.title)"></h4>
                    <p class="search-card-desc" v-html="highlightKeyword((item.description || '').substring(0, 40) + '...')"></p>
                    <div class="search-card-meta">
                      <span>{{ formatDate(item.created_at || item.date) }}</span>
                      <span>{{ item.category }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 无搜索结果 -->
            <div v-if="noSearchResults" class="no-results">
              <div class="no-results-icon">🔍</div>
              <p>未找到与"{{ searchQuery }}"相关的内容</p>
              <span>尝试其他关键词或浏览其他分类</span>
            </div>
          </div>

          <!-- 常规首页内容（无搜索时显示） -->
          <div v-if="!searchQuery">
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
        </div>
      </main>
      <MobileBottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { useSharedDestinations } from '../composables/useSharedDestinations'
import homeAPI from '../api/home'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { setDestinations } = useSharedDestinations()
const destinations = ref([])
const guides = ref([])
const itineraries = ref([])
const newsList = ref([])
const searchQuery = ref('')

// 搜索状态
watch(() => route.query.search, (newSearch) => {
  searchQuery.value = newSearch || ''
}, { immediate: true })

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  router.push('/')
}

// 搜索结果计算属性 - 景点
const searchedDestinations = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return destinations.value.filter(dest =>
    (dest.name && dest.name.toLowerCase().includes(query)) ||
    (dest.location && dest.location.toLowerCase().includes(query)) ||
    (dest.description && dest.description.toLowerCase().includes(query))
  )
})

// 搜索结果计算属性 - 行程规划
const searchedItineraries = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return itineraries.value.filter(item =>
    (item.title && item.title.toLowerCase().includes(query)) ||
    (item.description && item.description.toLowerCase().includes(query)) ||
    (item.destination && item.destination.toLowerCase().includes(query))
  )
})

// 搜索结果计算属性 - 旅游攻略
const searchedGuides = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return guides.value.filter(item =>
    (item.title && item.title.toLowerCase().includes(query)) ||
    (item.description && item.description.toLowerCase().includes(query)) ||
    (item.content && item.content.toLowerCase().includes(query))
  )
})

// 搜索结果计算属性 - 旅游资讯
const searchedNews = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return newsList.value.filter(item =>
    (item.title && item.title.toLowerCase().includes(query)) ||
    (item.description && item.description.toLowerCase().includes(query)) ||
    (item.category && item.category.toLowerCase().includes(query))
  )
})

// 无搜索结果
const noSearchResults = computed(() => {
  return searchQuery.value && 
    searchedDestinations.value.length === 0 &&
    searchedItineraries.value.length === 0 &&
    searchedGuides.value.length === 0 &&
    searchedNews.value.length === 0
})

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

// XSS 安全转义
const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 搜索关键词高亮（先转义再高亮）
const highlightKeyword = (text) => {
  if (!searchQuery.value || !text) return escapeHtml(text)
  const escapedText = escapeHtml(text)
  const escapedKeyword = escapeHtml(searchQuery.value)
  // 构建不区分大小写的正则替换
  try {
    const regex = new RegExp(`(${escapedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return escapedText.replace(regex, '<mark>$1</mark>')
  } catch (e) {
    return escapedText
  }
}

const loadHomeData = async () => {
  try {
    const res = await homeAPI.getHomeData()
    if (res.code === 200) {
      const { destinations: dests, itineraries: itins, guides: gds, newsList: nws } = res.data
      destinations.value = dests || []
      itineraries.value = itins || []
      guides.value = gds || []
      newsList.value = nws || []
      // 共享景点数据给 Navbar
      setDestinations(dests || [])
    }
  } catch (error) {
    console.error('加载首页数据失败:', error)
  }
}

onMounted(() => {
  loadHomeData()
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

/* 搜索结果区域样式 */
.search-results {
  padding: 0;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-results-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.clear-search-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.search-section {
  margin-bottom: 24px;
}

.search-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.result-count {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.search-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.search-card-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.search-card-info {
  padding: 14px;
}

.search-card-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-card-location {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 6px 0;
}

.search-card-rating {
  font-size: 14px;
  color: #f59e0b;
  font-weight: 600;
}

.search-card-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 搜索关键词高亮 */
.search-card-info mark,
.search-card-desc mark,
.search-card-location mark {
  background: #fef08a;
  color: #1e293b;
  padding: 1px 2px;
  border-radius: 2px;
}

.search-card-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.news-grid .search-card-img {
  height: 120px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results p {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.no-results span {
  font-size: 14px;
  color: #64748b;
}
</style>
