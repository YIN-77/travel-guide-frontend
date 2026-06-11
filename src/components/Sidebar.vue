<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-icon">🌍</div>
      <h1>旅游指南</h1>
    </div>
    <nav class="sidebar-nav">
      <!-- 主菜单 -->
      <div class="menu-section">
        <div
          v-for="menu in mainMenus"
          :key="menu.id"
          class="menu-item"
          :class="{ active: activeMenu === menu.id, disabled: menu.disabled }"
          @click="handleMenuClick(menu)"
        >
          <span class="menu-icon">{{ menu.icon }}</span>
          <span class="menu-text">{{ menu.name }}</span>
        </div>
      </div>
    </nav>
    <div class="sidebar-footer">
      <p>探索世界之美</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 根据路由自动计算当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return 1
  if (path === '/destinations') return 2
  if (path === '/itinerary') return 3
  if (path === '/guide') return 4
  if (path === '/news') return 5
  if (path === '/profile') return 6
  return 1
})

// 主菜单
const mainMenus = [
  { id: 1, name: '首页', icon: '🏠', path: '/' },
  { id: 2, name: '景点浏览', icon: '🗺️', path: '/destinations' },
  { id: 3, name: '行程规划', icon: '📅', path: '/itinerary' },
  { id: 4, name: '旅游攻略', icon: '📖', path: '/guide' },
  { id: 5, name: '旅游资讯', icon: '📰', path: '/news' },
  { id: 6, name: '个人中心', icon: '👤', path: '/profile' }
]

const handleMenuClick = (menu) => {
  if (menu.disabled) {
    return
  }
  
  router.push(menu.path)
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #1a1a1a;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 70px;
  bottom: 0;
  height: calc(100vh - 70px);
  overflow: hidden;
}

.sidebar-header {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.sidebar-header h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-section {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.menu-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.15);
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-footer p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 移动端适配 */
@media (max-width: 1200px) {
  .sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: flex;
    width: 100%;
    height: auto;
    position: relative;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 10px 0;
    top: auto;
    left: auto;
    bottom: auto;
  }

  .sidebar-header {
    width: 100%;
    padding: 15px;
    border-bottom: none;
  }

  .logo-icon {
    font-size: 32px;
    margin-bottom: 5px;
  }

  .sidebar-header h1 {
    font-size: 16px;
  }

  .sidebar-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 10px;
    gap: 5px;
    width: 100%;
  }

  .menu-item {
    padding: 10px 14px;
    border-radius: 20px;
    border-left: none;
  }

  .menu-item.active {
    background: rgba(255, 255, 255, 0.15);
  }

  .menu-icon {
    font-size: 16px;
    margin-right: 6px;
  }

  .menu-text {
    font-size: 13px;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
