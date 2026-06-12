<template>
  <div class="destinations-page">
    <Navbar />
    <div class="container">
      <Sidebar />

      <main class="main-content">
        <div class="scrollable-content">
          <DestinationDetail v-if="currentDestination" :destination="currentDestination" @back="goBack" />

          <div v-else>
            <div class="page-header">
              <h1>🗺️ 景点浏览</h1>
              <p>探索全球精彩景点，开启您的旅行之旅</p>
            </div>

            <div class="filters-bar">
              <div class="filter-group">
                <div class="custom-select" ref="filterRef">
                  <div class="select-trigger" @click="toggleFilterDropdown">
                    <span>{{ getFilterLabel }}</span>
                    <span class="arrow" :class="{ open: showFilterDropdown }">▼</span>
                  </div>
                  <div class="select-dropdown" v-show="showFilterDropdown">
                    <div class="options-grid">
                      <div
                        v-for="option in filterOptions"
                        :key="option.value"
                        class="option-item"
                        :class="{ selected: selectedFilter === option.value }"
                        @click="selectFilter(option.value)"
                      >
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="custom-select" ref="countryRef">
                  <div class="select-trigger" @click="toggleCountryDropdown">
                    <span>{{ getCountryLabel }}</span>
                    <span class="arrow" :class="{ open: showCountryDropdown }">▼</span>
                  </div>
                  <div class="select-dropdown" v-show="showCountryDropdown">
                    <div class="options-grid">
                      <div
                        v-for="option in countryOptions"
                        :key="option.value"
                        class="option-item"
                        :class="{ selected: selectedCountry === option.value }"
                        @click="selectCountry(option.value)"
                      >
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="custom-select" ref="sortRef">
                  <div class="select-trigger" @click="toggleSortDropdown">
                    <span>{{ getSortLabel }}</span>
                    <span class="arrow" :class="{ open: showSortDropdown }">▼</span>
                  </div>
                  <div class="select-dropdown small" v-show="showSortDropdown">
                    <div class="options-grid">
                      <div
                        v-for="option in sortOptions"
                        :key="option.value"
                        class="option-item"
                        :class="{ selected: sortBy === option.value }"
                        @click="selectSort(option.value)"
                      >
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button class="search-button" @click="handleSearch">筛选</button>
            </div>

            <div class="content-area">
              <div class="destinations-grid">
                <div v-if="paginatedDestinations.length === 0" class="empty-state">
                  <div class="empty-icon">🌍</div>
                  <p>暂无符合条件的景点</p>
                  <span>尝试其他筛选条件或搜索关键词</span>
                </div>

                <div
                  v-for="dest in paginatedDestinations"
                  :key="dest.id"
                  class="destination-card"
                  @click="viewDestination(dest.id)"
                >
                  <div class="card-image">
                    <img :src="processCardImageUrl(dest.image)" :alt="dest.name" />
                    <div class="card-rating">
                      <span>⭐ {{ dest.rating }}</span>
                    </div>
                    <div class="card-tags">
                      <span v-for="tag in dest.Tags" :key="tag.id" class="card-tag">{{ tag.name }}</span>
                    </div>
                  </div>
                  <div class="card-content">
                    <h3 class="card-title">{{ dest.name }}</h3>
                    <div class="card-location">
                      <span>📍 {{ dest.location }}</span>
                    </div>
                    <p class="card-desc">{{ dest.description ? dest.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                    <div class="card-footer">
                      <button class="detail-btn">查看详情 →</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="filteredDestinations.length > 0" class="pagination">
                <div class="pagination-info">
                  共 <span>{{ filteredDestinations.length }}</span> 个景点，
                  第 <span>{{ currentPage }}</span> / <span>{{ totalPages }}</span> 页
                </div>
                <div class="pagination-buttons">
                  <button
                    class="pagination-btn"
                    :disabled="currentPage === 1"
                    @click="goToPage(1)"
                  >
                    首页
                  </button>
                  <button
                    class="pagination-btn"
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                  >
                    上一页
                  </button>

                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    class="pagination-btn"
                    :class="{ active: page === currentPage }"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>

                  <button
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)"
                  >
                    下一页
                  </button>
                  <button
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="goToPage(totalPages)"
                  >
                    末页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import DestinationDetail from '../components/DestinationDetail.vue'
import Navbar from '../components/Navbar.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { destinationAPI } from '../api/destinations'
import { useRoute, useRouter } from 'vue-router'

const showFilterDropdown = ref(false)
const showCountryDropdown = ref(false)
const showSortDropdown = ref(false)
const filterRef = ref(null)
const countryRef = ref(null)
const sortRef = ref(null)
const route = useRoute()
const router = useRouter()

const getFilterLabel = computed(() => {
  const option = filterOptions.value.find(o => o.value === selectedFilter.value)
  return option ? option.label : '全部类型'
})

const getCountryLabel = computed(() => {
  const option = countryOptions.value.find(o => o.value === selectedCountry.value)
  return option ? option.label : '全部国家'
})

const getSortLabel = computed(() => {
  const option = sortOptions.value.find(o => o.value === sortBy.value)
  return option ? option.label : '评分排序'
})

const toggleFilterDropdown = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showCountryDropdown.value = false
  showSortDropdown.value = false
}

const toggleCountryDropdown = () => {
  showCountryDropdown.value = !showCountryDropdown.value
  showFilterDropdown.value = false
  showSortDropdown.value = false
}

const toggleSortDropdown = () => {
  showSortDropdown.value = !showSortDropdown.value
  showFilterDropdown.value = false
  showCountryDropdown.value = false
}

const selectFilter = (value) => {
  selectedFilter.value = value
  showFilterDropdown.value = false
}

const selectCountry = (value) => {
  selectedCountry.value = value
  showCountryDropdown.value = false
}

const selectSort = (value) => {
  sortBy.value = value
  showSortDropdown.value = false
}

const handleClickOutside = (event) => {
  if (filterRef.value && !filterRef.value.contains(event.target)) {
    showFilterDropdown.value = false
  }
  if (countryRef.value && !countryRef.value.contains(event.target)) {
    showCountryDropdown.value = false
  }
  if (sortRef.value && !sortRef.value.contains(event.target)) {
    showSortDropdown.value = false
  }
}

const filterOptions = ref([
  { value: '', label: '全部类型' },
  { value: '海滩度假', label: '海滩度假' },
  { value: '山川探险', label: '山川探险' },
  { value: '城市观光', label: '城市观光' },
  { value: '文化历史', label: '文化历史' },
  { value: '自然风光', label: '自然风光' },
  { value: '极限运动', label: '极限运动' },
  { value: '美食', label: '美食' },
  { value: '浪漫', label: '浪漫' }
])

const sortOptions = ref([
  { value: 'rating-desc', label: '评分从高到低' },
  { value: 'rating-asc', label: '评分从低到高' },
  { value: 'name-asc', label: '名称 A-Z' },
  { value: 'name-desc', label: '名称 Z-A' }
])

const searchQuery = ref('')
const selectedFilter = ref('')
const selectedCountry = ref('')
const sortBy = ref('rating-desc')
const currentDestination = ref(null)
const destinations = ref([])
const currentPage = ref(1)
const pageSize = ref(12)

const countryOptions = computed(() => {
  const countries = new Set()
  destinations.value.forEach(dest => {
    if (dest.location) {
      const parts = dest.location.split(',')
      if (parts.length > 1) {
        countries.add(parts[parts.length - 1].trim())
      } else {
        countries.add(parts[0].trim())
      }
    }
  })
  const sortedCountries = Array.from(countries).sort()
  return [
    { value: '', label: '全部国家' },
    ...sortedCountries.map(country => ({ value: country, label: country }))
  ]
})

const filteredDestinations = computed(() => {
  let result = destinations.value

  // 根据侧边栏景点类型筛选
  if (selectedFilter.value) {
    result = result.filter(dest =>
      dest.Tags && dest.Tags.some(tag => tag.name === selectedFilter.value)
    )
  }

  if (selectedCountry.value) {
    result = result.filter(dest =>
      dest.location && dest.location.includes(selectedCountry.value)
    )
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(dest =>
      dest.name.toLowerCase().includes(query) ||
      dest.location.toLowerCase().includes(query) ||
      (dest.Tags && dest.Tags.some(tag => tag.name.toLowerCase().includes(query)))
    )
  }

  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'rating-desc':
        return (b.rating || 0) - (a.rating || 0)
      case 'rating-asc':
        return (a.rating || 0) - (b.rating || 0)
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '')
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '')
      default:
        return 0
    }
  })

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredDestinations.value.length / pageSize.value) || 1
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const paginatedDestinations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDestinations.value.slice(start, end)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSearch = () => {
  currentDestination.value = null
  currentPage.value = 1
}

const viewDestination = async (id) => {
  const res = await destinationAPI.getById(id)
  if (res.code === 200) {
    currentDestination.value = res.data
  }
}

const goBack = () => {
  currentDestination.value = null
  router.push('/destinations')
}

const processCardImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const loadDestinations = async () => {
  const res = await destinationAPI.getList({ page: 1, limit: 1000 })
  if (res.code === 200) {
    destinations.value = res.data.list
    
    // 处理URL参数
    if (route.query.id) {
      const destId = parseInt(route.query.id)
      if (!isNaN(destId)) {
        await viewDestination(destId)
      }
    } else if (route.query.search) {
      searchQuery.value = route.query.search
      currentPage.value = 1
    }
  }
}

onMounted(() => {
  loadDestinations()
  document.addEventListener('click', handleClickOutside)
})

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.id) {
    const destId = parseInt(newQuery.id)
    if (!isNaN(destId)) {
      viewDestination(destId)
    }
  } else if (newQuery.search) {
    searchQuery.value = newQuery.search
    currentDestination.value = null
  } else {
    searchQuery.value = ''
    currentDestination.value = null
  }
}, { immediate: false })

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.destinations-page {
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

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 14px;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filters-bar .custom-select {
  position: relative;
  min-width: 130px;
}

.filters-bar .select-trigger {
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

.filters-bar .select-trigger:hover {
  border-color: #cbd5e0;
}

.filters-bar .arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.filters-bar .arrow.open {
  transform: rotate(180deg);
}

.filters-bar .select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 350px;
  max-height: 200px;
  overflow-y: auto;
}

.filters-bar .select-dropdown.small {
  min-width: 250px;
  max-height: 150px;
}

.filters-bar .options-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 10px;
}

.filters-bar .select-dropdown.small .options-grid {
  grid-template-columns: repeat(2, 1fr);
}

.filters-bar .option-item {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: #f8f9fa;
}

.filters-bar .option-item:hover {
  background: #e9ecef;
}

.filters-bar .option-item.selected {
  background: #333;
  color: white;
}

.filters-bar .search-button {
  padding: 10px 24px;
  background: #111;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filters-bar .search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.content-area {
  margin-top: 24px;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px;
}

.destination-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.destination-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.destination-card:hover .card-image img {
  transform: scale(1.1);
}

.card-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card-tags {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-tag {
  background: #333;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.card-location {
  color: #718096;
  font-size: 14px;
  margin-bottom: 12px;
}

.card-desc {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.detail-btn {
  background: #111;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.pagination {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  text-align: center;
  color: #718096;
  font-size: 14px;
  margin-bottom: 16px;
}

.pagination-info span {
  font-weight: 600;
  color: #111;
}

.pagination-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 16px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #111;
  color: #111;
  transform: translateY(-2px);
}

.pagination-btn.active {
  background: #111;
  color: white;
  border-color: #111;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .destinations-page {
    padding-top: 70px;
  }
  
  .container {
    flex-direction: column;
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }

  .destinations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-image {
    height: 180px;
  }

  .pagination {
    padding: 16px 12px;
    margin-top: 24px;
  }

  .pagination-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: 8px;
  }

  .pagination-info {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .destinations-page .container { margin-left: 0; }
  .destinations-page .main-content { padding-bottom: 60px; }
  .destinations-page .page-header h1 { font-size: 20px; }
  .destinations-page .page-header { padding: 15px; }
  .destinations-grid { grid-template-columns: 1fr; gap: 12px; }
  .destinations-page .content-area { padding: 15px; }
  .dest-card-img { height: 160px; }
  .dest-card-title { font-size: 16px; }
  .search-bar { flex-direction: column; gap: 8px; }
  .search-input, .filter-select, .search-button { width: 100%; }
}
</style>
