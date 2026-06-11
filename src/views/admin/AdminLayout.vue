<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <div class="logo">
        <h3>旅游指南</h3>
        <p>管理系统</p>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        router
      >
        <el-menu-item index="/admin">
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/destinations">
          <span>景点管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/destinations/create">
          <span>添加景点</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reviews">
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/itineraries">
          <span>行程管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/guides">
          <span>攻略管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/news">
          <span>资讯管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-left">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <span class="admin-name">{{ authStore.admin?.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles = {
    '/admin': '仪表盘',
    '/admin/destinations': '景点列表',
    '/admin/destinations/create': '添加景点',
    '/admin/users': '用户管理',
    '/admin/reviews': '评论管理',
    '/admin/tags': '标签管理',
    '/admin/itineraries': '行程管理',
    '/admin/guides': '攻略管理',
    '/admin/news': '资讯管理'
  }
  // 处理编辑页面的标题
  if (route.path.includes('/edit')) {
    return '编辑景点'
  }
  return titles[route.path] || '景点编辑'
})

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-aside {
  background: #304156;
  color: white;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #3d4a5c;
}

.logo h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.logo p {
  margin: 5px 0 0;
  color: #8999b4;
  font-size: 12px;
}

.admin-menu {
  border: none;
  background: transparent;
}

.admin-menu .el-menu-item {
  color: #bfcbd9;
}

.admin-menu .el-menu-item:hover,
.admin-menu .el-menu-item.is-active {
  background: #263445;
  color: #409eff;
}

.el-header {
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-name {
  color: #666;
}

.el-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
