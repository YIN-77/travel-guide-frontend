<template>
  <nav class="mobile-bottom-nav">
    <div
      v-for="menu in menus"
      :key="menu.id"
      class="bottom-nav-item"
      :class="{ active: activeMenu === menu.id }"
      @click="handleClick(menu)"
    >
      <span class="nav-icon">{{ menu.icon }}</span>
      <span class="nav-label">{{ menu.name }}</span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return 1
  if (path === '/destinations') return 2
  if (path.startsWith('/itinerary')) return 3
  if (path.startsWith('/guide')) return 4
  if (path.startsWith('/news')) return 5
  if (path.startsWith('/profile')) return 6
  return 1
})

const menus = [
  { id: 1, name: '首页', icon: '🏠', path: '/' },
  { id: 2, name: '景点', icon: '🗺️', path: '/destinations' },
  { id: 3, name: '行程', icon: '📅', path: '/itinerary' },
  { id: 4, name: '攻略', icon: '📖', path: '/guide' },
  { id: 5, name: '资讯', icon: '📰', path: '/news' }
]

const handleClick = (menu) => {
  router.push(menu.path)
}
</script>

<style scoped>
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-top: 1px solid #e8e8e8;
  padding: 6px 0;
  padding-bottom: env(safe-area-inset-bottom, 6px);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav-item .nav-icon {
  font-size: 22px;
  line-height: 1;
}

.bottom-nav-item .nav-label {
  font-size: 11px;
  font-weight: 500;
  color: #999;
  transition: color 0.2s ease;
}

.bottom-nav-item.active .nav-label {
  color: #667eea;
  font-weight: 600;
}

.bottom-nav-item.active .nav-icon {
  transform: scale(1.1);
}

.bottom-nav-item:active {
  opacity: 0.7;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
  }
}
</style>