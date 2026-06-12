<template>
  <header class="navbar">
    <div class="navbar-content">
      <div class="navbar-left">
        <router-link to="/" class="home-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </router-link>
        
        <div class="navbar-search">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="navbar-search-input"
              placeholder="搜索目的地..."
              v-model="searchQuery"
              @input="handleSearchInput"
              @keyup.enter="handleSearch"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
            >
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
          
          <div v-if="showSuggestions && searchSuggestions.length > 0" class="search-suggestions">
            <div
              v-for="dest in searchSuggestions"
              :key="dest.id"
              class="suggestion-item"
              @mousedown.prevent="selectSuggestion(dest)"
            >
              <img :src="processImageUrl(dest.image)" :alt="dest.name" class="suggestion-img" />
              <div class="suggestion-info">
                <div class="suggestion-name">{{ dest.name }}</div>
                <div class="suggestion-location">{{ dest.location }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="navbar-right">
        <div v-if="authStore.isUserLoggedIn" class="user-menu">
          <router-link to="/itinerary" class="itinerary-btn" title="我的行程">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"/>
            </svg>
            <span>行程</span>
          </router-link>
          <router-link to="/profile?tab=notifications" class="notification-btn" title="消息通知" @click="onNotificationClick">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
          <router-link to="/profile" class="user-info">
            <div class="user-avatar">
              <img v-if="authStore.user?.avatar" :src="processAvatarUrl(authStore.user.avatar)" alt="头像" />
              <span v-else>{{ (authStore.user?.nickname || authStore.user?.username || 'U').charAt(0).toUpperCase() }}</span>
            </div>
            <span class="user-name">{{ authStore.user?.nickname || authStore.user?.username }}</span>
          </router-link>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>

        <div v-else class="auth-buttons">
          <button class="auth-btn" @click="showAuthModal = true">登录 / 注册</button>
        </div>
        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span class="menu-line" :class="{ open: mobileMenuOpen }"></span>
        </button>
      </div>

      <!-- 移动端菜单 -->
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click="mobileMenuOpen = false">
        <div class="mobile-menu" @click.stop>
          <div
            v-for="menu in mobileMenus"
            :key="menu.id"
            class="mobile-menu-item"
            @click="navigateMobile(menu)"
          >
            <span class="mobile-menu-icon">{{ menu.icon }}</span>
            <span class="mobile-menu-text">{{ menu.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" @success="onAuthSuccess" />
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import AuthModal from './AuthModal.vue'
import { useRouter } from 'vue-router'
import { notificationAPI } from '../api/notifications'
import { destinationAPI } from '../api/destinations'

const authStore = useAuthStore()
const router = useRouter()
const showAuthModal = ref(false)
const unreadCount = ref(0)
const searchQuery = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const allDestinations = ref([])
const mobileMenuOpen = ref(false)

const mobileMenus = [
  { id: 1, name: '首页', icon: '🏠', path: '/' },
  { id: 2, name: '景点浏览', icon: '🗺️', path: '/destinations' },
  { id: 3, name: '行程规划', icon: '📅', path: '/itinerary' },
  { id: 4, name: '旅游攻略', icon: '📖', path: '/guide' },
  { id: 5, name: '旅游资讯', icon: '📰', path: '/news' },
  { id: 6, name: '个人中心', icon: '👤', path: '/profile' }
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const navigateMobile = (menu) => {
  mobileMenuOpen.value = false
  router.push(menu.path)
}

const processAvatarUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const fetchUnreadCount = async () => {
  if (!authStore.isUserLoggedIn) {
    unreadCount.value = 0
    return
  }
  try {
    const res = await notificationAPI.getUnreadCount()
    if (res.code === 200) {
      unreadCount.value = res.data.unreadCount
    }
  } catch (error) {
    console.error('获取未读消息失败:', error)
  }
}

const handleLogout = () => {
  authStore.logout()
  unreadCount.value = 0
  router.push('/')
}

const handleSearch = () => {
  showSuggestions.value = false
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { search: searchQuery.value.trim() } })
  } else {
    // 搜索框为空，直接返回主页
    router.push('/')
  }
}

const handleSearchInput = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    searchSuggestions.value = allDestinations.value.filter(dest =>
      dest.name.toLowerCase().includes(query) ||
      dest.location.toLowerCase().includes(query)
    ).slice(0, 6)
    showSuggestions.value = true
  } else {
    searchSuggestions.value = []
    showSuggestions.value = false
  }
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const selectSuggestion = (dest) => {
  showSuggestions.value = false
  searchQuery.value = ''
  searchSuggestions.value = []
  router.push({ path: '/', query: { id: dest.id } })
}

const processImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/60x60?text=No+Image'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const loadDestinations = async () => {
  try {
    const res = await destinationAPI.getList({ page: 1, limit: 100 })
    if (res.code === 200) {
      allDestinations.value = res.data.list
    }
  } catch (error) {
    console.error('加载景点列表失败:', error)
  }
}

const onAuthSuccess = () => {
  // 登录或注册成功后，获取未读消息
  fetchUnreadCount()
}

const onNotificationClick = () => {
  // 点击通知后，3秒后刷新未读数量（假设用户会查看一些通知）
  setTimeout(fetchUnreadCount, 3000)
}

// 监听登录状态变化
watch(() => authStore.isUserLoggedIn, () => {
  fetchUnreadCount()
})

onMounted(() => {
  fetchUnreadCount()
  loadDestinations()
  // 每30秒刷新一次未读消息
  setInterval(fetchUnreadCount, 30000)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 284px;
}

@media (max-width: 1200px) {
  .navbar-content {
    padding-left: 24px;
  }
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-search {
  position: relative;
  flex: 1;
  max-width: 700px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999;
  z-index: 1;
}

.navbar-search-input {
  width: 100%;
  padding: 10px 90px 10px 44px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.navbar-search-input:focus {
  outline: none;
  border-color: #333;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.navbar-search-input::placeholder {
  color: #999;
}

.search-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 20px;
  background: #111;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.search-btn:hover {
  background: #333;
  transform: translateY(-50%) scale(1.05);
}

.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-location {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-link {
  color: #111;
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
}

.home-link:hover {
  opacity: 0.7;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.itinerary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.itinerary-btn:hover {
  color: #111;
  background: #f5f5f5;
}

.notification-btn {
  position: relative;
  color: #555;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
}

.notification-btn:hover {
  color: #111;
  background: #f5f5f5;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
  transform: translate(25%, -25%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: opacity 0.3s ease;
}

.user-info:hover {
  opacity: 0.8;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.logout-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #333;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  border-color: #333;
  background: #f5f5f5;
}

.auth-btn {
  padding: 10px 20px;
  background: #111;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

/* 移动端汉堡菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  width: 36px;
  height: 36px;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu-btn .menu-line,
.mobile-menu-btn .menu-line::before,
.mobile-menu-btn .menu-line::after {
  display: block;
  width: 24px;
  height: 2.5px;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
  position: absolute;
  left: 6px;
}

.mobile-menu-btn .menu-line {
  top: 50%;
  transform: translateY(-50%);
}

.mobile-menu-btn .menu-line::before {
  content: '';
  top: -7px;
}

.mobile-menu-btn .menu-line::after {
  content: '';
  top: 7px;
}

.mobile-menu-btn .menu-line.open {
  background: transparent;
}

.mobile-menu-btn .menu-line.open::before {
  top: 0;
  transform: rotate(45deg);
}

.mobile-menu-btn .menu-line.open::after {
  top: 0;
  transform: rotate(-45deg);
}

/* 移动端菜单浮层 */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mobile-menu {
  position: absolute;
  top: 70px;
  right: 0;
  background: white;
  border-radius: 0 0 0 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu-item:hover {
  background: #f5f5f5;
}

.mobile-menu-item:active {
  background: #eee;
}

.mobile-menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.mobile-menu-text {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .navbar-left {
    width: 100%;
    gap: 16px;
  }

  .navbar-search {
    flex: 1;
    max-width: none;
  }

  .navbar-search-input {
    padding: 10px 70px 10px 40px;
    font-size: 14px;
  }

  .search-btn {
    padding: 6px 16px;
    font-size: 13px;
  }

  .search-icon {
    left: 12px;
    font-size: 14px;
  }

  .user-name {
    display: none;
  }

  .navbar-left svg {
    width: 28px;
    height: 28px;
  }

  .itinerary-btn span {
    display: none;
  }

  .search-suggestions {
    max-height: 300px;
  }

  .suggestion-img {
    width: 40px;
    height: 40px;
  }

  .suggestion-name {
    font-size: 13px;
  }

  .suggestion-location {
    font-size: 11px;
  }

  .logout-btn {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu-overlay {
    display: block;
  }

  .mobile-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    min-width: unset;
    max-height: none;
    border-radius: 0;
    padding: 8px 0 100px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-menu-item {
    padding: 16px 20px;
  }

  .navbar-right .auth-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1660px) {
  .navbar-content {
    padding: 16px 24px;
  }
}
</style>
