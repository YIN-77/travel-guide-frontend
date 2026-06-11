<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon destinations">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">景点总数</p>
            <p class="stat-value">{{ stats.destinationCount || 0 }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon reviews">
            <el-icon><Comment /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">评论总数</p>
            <p class="stat-value">{{ stats.reviewCount || 0 }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon tags">
            <el-icon><PriceTag /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">标签总数</p>
            <p class="stat-value">{{ stats.tagCount || 0 }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon admins">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">管理员</p>
            <p class="stat-value">{{ stats.adminCount || 0 }}</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近添加的景点</span>
          </template>
          <el-table :data="stats.recentDestinations" style="width: 100%">
            <el-table-column prop="name" label="景点名称" />
            <el-table-column prop="location" label="地址" />
            <el-table-column prop="rating" label="评分" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近收到的评论</span>
          </template>
          <el-table :data="stats.recentReviews" style="width: 100%">
            <el-table-column prop="user_name" label="用户名" width="100" />
            <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
            <el-table-column prop="Destination.name" label="景点" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statsAPI } from '../../api/stats'
import { Location, Comment, PriceTag, User } from '@element-plus/icons-vue'

const stats = ref({
  destinationCount: 0,
  reviewCount: 0,
  tagCount: 0,
  adminCount: 0,
  recentDestinations: [],
  recentReviews: []
})

const loadStats = async () => {
  try {
    const res = await statsAPI.getDashboard()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.destinations { background: #333; }
.stat-icon.reviews { background: #555; }
.stat-icon.tags { background: #666; }
.stat-icon.admins { background: #777; }

.stat-info {
  flex: 1;
}

.stat-label {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.stat-value {
  margin: 5px 0 0;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}
</style>
