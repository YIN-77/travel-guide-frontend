<template>
  <div class="guide-page">
    <Navbar />
    <div class="container">
      <Sidebar />
      <main class="main-content">
        <div class="scrollable-content">
          <div class="page-header">
            <h1>📖 旅游攻略</h1>
            <p>来自真实旅行者的经验分享，助你规划完美旅程</p>
          </div>

          <div class="filters-bar">
            <div class="filter-group">
              <!-- 类型筛选 -->
              <div class="custom-select">
                <div class="select-trigger" @click="showTypeDropdown = !showTypeDropdown">
                  <span>{{ selectedType.label }}</span>
                  <span class="arrow" :class="{ rotated: showTypeDropdown }">▼</span>
                </div>
                <div v-if="showTypeDropdown" class="dropdown-menu">
                  <div 
                    v-for="type in typeOptions" 
                    :key="type.value" 
                    class="dropdown-item"
                    :class="{ active: selectedType.value === type.value }"
                    @click="selectType(type)"
                  >
                    {{ type.label }}
                  </div>
                </div>
              </div>
              
              <!-- 排序筛选 -->
              <div class="custom-select">
                <div class="select-trigger" @click="showSortDropdown = !showSortDropdown">
                  <span>{{ selectedSort.label }}</span>
                  <span class="arrow" :class="{ rotated: showSortDropdown }">▼</span>
                </div>
                <div v-if="showSortDropdown" class="dropdown-menu">
                  <div 
                    v-for="sort in sortOptions" 
                    :key="sort.value" 
                    class="dropdown-item"
                    :class="{ active: selectedSort.value === sort.value }"
                    @click="selectSort(sort)"
                  >
                    {{ sort.label }}
                  </div>
                </div>
              </div>
            </div>
            <div v-if="authStore.isUserLoggedIn">
              <el-button type="primary" @click="handleCreateGuide">
                + 发布攻略
              </el-button>
            </div>
          </div>

          <!-- 我的攻略（登录后可见） -->
          <div v-if="isLoggedIn && myGuides.length > 0" class="section">
            <div class="section-header">
              <h2 class="section-title">📋 我的攻略</h2>
              <span class="section-subtitle">我发布的旅游攻略</span>
            </div>
            <div class="guide-grid">
              <div v-for="(item, index) in myGuides" :key="item.id || index" class="guide-card" @click="openGuideDetail(item)">
                <div class="guide-cover">
                  <img :src="item.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=400&h=280&fit=crop'" :alt="item.title">
                  <div v-if="item.status !== 'published'" class="status-badge">{{ item.status === 'draft' ? '草稿' : '归档' }}</div>
                </div>
                <div class="guide-info">
                  <div class="guide-tags">
                    <span v-for="(tag, tagIndex) in (item.tags ? item.tags.split(',').map(t => t.trim()) : [])" :key="tagIndex" class="guide-tag">{{ tag }}</span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p class="guide-desc">{{ item.description }}</p>
                  <div class="guide-footer">
                    <div class="guide-author">
                      <div class="author-avatar">{{ (item.author_name || '我')[0] }}</div>
                      <span>{{ item.author_name || '我' }}</span>
                    </div>
                    <div class="guide-stats">
                      <span>👍 {{ item.likes || 0 }}</span>
                      <span>💬 {{ item.comments || 0 }}</span>
                      <span>👁️ {{ item.views || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 官方精选攻略 -->
          <div v-if="officialGuides.length > 0" class="section">
            <div class="section-header">
              <h2 class="section-title">⭐ 官方精选攻略</h2>
              <span class="section-subtitle">官方认证优质攻略</span>
            </div>
            <div class="guide-grid">
              <div v-for="(item, index) in officialGuides" :key="item.id || index" class="guide-card official" @click="openGuideDetail(item)">
                <div class="guide-cover">
                  <img :src="item.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=400&h=280&fit=crop'" :alt="item.title">
                  <div class="official-badge">官方</div>
                </div>
                <div class="guide-info">
                  <div class="guide-tags">
                    <span v-for="(tag, tagIndex) in (item.tags ? item.tags.split(',').map(t => t.trim()) : [])" :key="tagIndex" class="guide-tag official-tag">{{ tag }}</span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p class="guide-desc">{{ item.description }}</p>
                  <div class="guide-footer">
                    <div class="guide-author">
                      <div class="author-avatar official-avatar">官</div>
                      <span>官方平台</span>
                    </div>
                    <div class="guide-stats">
                      <span>👍 {{ item.likes || 0 }}</span>
                      <span>💬 {{ item.comments || 0 }}</span>
                      <span>👁️ {{ item.views || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 热门攻略 -->
          <div v-if="featuredGuides.length > 0" class="section">
            <div class="section-header">
              <h2 class="section-title">🔥 热门攻略</h2>
              <span class="section-subtitle">最受欢迎的旅行攻略</span>
            </div>
            <div class="guide-grid">
              <div v-for="(item, index) in featuredGuides" :key="item.id || index" class="guide-card featured" @click="openGuideDetail(item)">
                <div class="guide-cover">
                  <img :src="item.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=400&h=280&fit=crop'" :alt="item.title">
                  <div class="featured-badge">热门</div>
                </div>
                <div class="guide-info">
                  <div class="guide-tags">
                    <span v-for="(tag, tagIndex) in (item.tags ? item.tags.split(',').map(t => t.trim()) : [])" :key="tagIndex" class="guide-tag">{{ tag }}</span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p class="guide-desc">{{ item.description }}</p>
                  <div class="guide-footer">
                    <div class="guide-author">
                      <div class="author-avatar">{{ (item.author_name || '作')[0] }}</div>
                      <span>{{ item.author_name || '匿名' }}</span>
                    </div>
                    <div class="guide-stats">
                      <span>👍 {{ item.likes || 0 }}</span>
                      <span>💬 {{ item.comments || 0 }}</span>
                      <span>👁️ {{ item.views || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 全部攻略 -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">🌍 全部攻略</h2>
              <span class="section-subtitle">发现更多精彩攻略</span>
            </div>
            <div v-if="allGuides.length > 0" class="guide-grid">
              <div v-for="(item, index) in allGuides" :key="item.id || index" class="guide-card" @click="openGuideDetail(item)">
                <div class="guide-cover">
                  <img :src="item.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=400&h=280&fit=crop'" :alt="item.title">
                  <div v-if="item.is_official" class="official-badge small">官方</div>
                  <div v-else-if="item.is_featured" class="featured-badge small">热门</div>
                </div>
                <div class="guide-info">
                  <div class="guide-tags">
                    <span v-for="(tag, tagIndex) in (item.tags ? item.tags.split(',').map(t => t.trim()) : [])" :key="tagIndex" class="guide-tag">{{ tag }}</span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p class="guide-desc">{{ item.description }}</p>
                  <div class="guide-footer">
                    <div class="guide-author">
                      <div class="author-avatar">{{ (getAuthorName(item) || '作')[0] }}</div>
                      <span>{{ getAuthorName(item) }}</span>
                    </div>
                    <div class="guide-stats">
                      <span>👍 {{ item.likes || 0 }}</span>
                      <span>💬 {{ item.comments || 0 }}</span>
                      <span>👁️ {{ item.views || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📖</div>
              <p>暂无旅游攻略</p>
              <span>快来分享你的旅行经验吧！</span>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <AuthModal 
      v-if="authModalVisible" 
      @close="authModalVisible = false" 
      @success="handleAuthSuccess" 
    />
    <MobileBottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { guideAPI } from '../api/guide'
import { useAuthStore } from '../stores/auth'
import AuthModal from '../components/AuthModal.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const myGuides = ref([])
const officialGuides = ref([])
const featuredGuides = ref([])
const allGuides = ref([])
const authModalVisible = ref(false)

// 筛选状态
const showTypeDropdown = ref(false)
const showSortDropdown = ref(false)

// 类型选项（从现有攻略的标签中提取常见类型）
const typeOptions = ref([
  { label: '全部类型', value: 'all' },
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
])

// 排序选项
const sortOptions = [
  { label: '最新发布', value: 'latest' },
  { label: '最热点赞', value: 'hot' },
  { label: '最多评论', value: 'comments' },
  { label: '最多浏览', value: 'views' }
]

const selectedType = ref({ label: '全部类型', value: 'all' })
const selectedSort = ref({ label: '最新发布', value: 'latest' })

const isLoggedIn = computed(() => authStore.isUserLoggedIn)

const getAuthorName = (item) => {
  if (!item) return '匿名'
  if (item.is_official) return '官方平台'
  return item.author_name || '匿名'
}

const selectType = (type) => {
  selectedType.value = type
  showTypeDropdown.value = false
  loadAllGuides()
}

const selectSort = (sort) => {
  selectedSort.value = sort
  showSortDropdown.value = false
  loadAllGuides()
}

const loadMyGuides = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await guideAPI.getMyGuides()
    if (res.code === 200) {
      myGuides.value = res.data || []
    }
  } catch (error) {
    console.error('加载我的攻略失败:', error)
  }
}

const loadOfficialGuides = async () => {
  try {
    const res = await guideAPI.getOfficialGuides({ limit: 10 })
    if (res.code === 200) {
      officialGuides.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载官方攻略失败:', error)
  }
}

const loadFeaturedGuides = async () => {
  try {
    const res = await guideAPI.getFeaturedGuides({ limit: 10 })
    if (res.code === 200) {
      featuredGuides.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载热门攻略失败:', error)
  }
}

const loadAllGuides = async () => {
  loading.value = true
  try {
    // 构建筛选参数
    const params = {
      limit: 20,
      sort: selectedSort.value.value
    }
    
    // 如果选择了具体类型（不是全部），添加标签筛选
    if (selectedType.value.value !== 'all') {
      params.tag = selectedType.value.value
    }
    
    const res = await guideAPI.getAll(params)
    if (res.code === 200) {
      // 过滤掉官方和热门攻略，避免重复显示
      const officialIds = new Set(officialGuides.value.map(g => g.id))
      const featuredIds = new Set(featuredGuides.value.map(g => g.id))
      const myIds = new Set(myGuides.value.map(g => g.id))
      
      allGuides.value = (res.data.list || []).filter(g => 
        !officialIds.has(g.id) && !featuredIds.has(g.id) && !myIds.has(g.id)
      )
    }
  } catch (error) {
    console.error('加载攻略列表失败:', error)
  } finally {
    loading.value = false
  }
}

const openGuideDetail = (guide) => {
  router.push(`/guide-detail?id=${guide.id}`)
}

const handleCreateGuide = () => {
  if (!authStore.isUserLoggedIn) {
    authModalVisible.value = true
    return
  }
  router.push('/guide-edit')
}

const handleAuthSuccess = () => {
  authModalVisible.value = false
  ElMessage.success('登录成功')
  router.push('/guide-edit')
}

onMounted(() => {
  loadMyGuides()
  loadOfficialGuides()
  loadFeaturedGuides()
  loadAllGuides()
  
  // 点击外部关闭下拉框
  document.addEventListener('click', (e) => {
    const target = e.target
    if (!target.closest('.custom-select')) {
      showTypeDropdown.value = false
      showSortDropdown.value = false
    }
  })
})
</script>

<style scoped>
.guide-page {
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

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.custom-select {
  position: relative;
  min-width: 130px;
}

.select-trigger {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.select-trigger:hover {
  border-color: #1e293b;
}

.select-trigger.active {
  border-color: #1e293b;
  background: #f8fafc;
}

.arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f1f5f9;
}

.dropdown-item.active {
  background: #1e293b;
  color: white;
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

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.guide-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.guide-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.guide-card.official {
  border: 2px solid #ffd700;
}

.guide-card.featured {
  border: 2px solid #ff6b6b;
}

.guide-cover {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.guide-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.guide-card:hover .guide-cover img {
  transform: scale(1.1);
}

.status-badge,
.official-badge,
.featured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge {
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.official-badge {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #fff;
}

.featured-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: #fff;
}

.official-badge.small,
.featured-badge.small {
  font-size: 10px;
  padding: 2px 8px;
}

.guide-info {
  padding: 16px;
}

.guide-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.guide-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.guide-tag.official-tag {
  background: #fff3e0;
  color: #e65100;
}

.guide-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guide-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.guide-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.guide-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.author-avatar.official-avatar {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
}

.guide-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
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
  margin: 0 0 8px 0;
}

.empty-state span {
  color: #718096;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .guide-page .container { margin-left: 0; }
  .guide-page .main-content { padding-bottom: 60px; }
  .guide-page .page-header h1 { font-size: 20px; }
  .guide-page .page-header { padding: 15px; flex-direction: column; gap: 12px; align-items: flex-start; }
  .content-grid { grid-template-columns: 1fr; gap: 12px; }
  .content-area { padding: 15px; }
}
</style>