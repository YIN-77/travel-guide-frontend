<template>
  <div class="guide-detail-page">
    <Navbar />
    <div class="container">
      <Sidebar />
      
      <main class="main-content">
        <div class="scrollable-content">
          <!-- 返回按钮 -->
          <button class="back-btn" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回旅游攻略
          </button>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>

          <template v-else-if="guideData">
            <!-- 攻略头部 -->
            <div class="detail-header">
              <img :src="guideData.cover_image || 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=800&h=400&fit=crop'" :alt="guideData.title" class="detail-cover">
              <div class="detail-overlay">
                <div class="guide-tags">
                  <span v-for="(tag, idx) in (guideData.tags ? guideData.tags.split(',').map(t => t.trim()) : [])" :key="idx" class="guide-tag">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- 攻略信息 -->
            <div class="guide-info-card">
              <h1 class="guide-title">{{ guideData.title }}</h1>
              <div v-if="guideData.description" class="guide-description">
                {{ guideData.description }}
              </div>
              <div class="guide-meta">
                <div class="guide-author">
                  <div class="author-avatar">{{ (guideData.author_name || '作者')[0] }}</div>
                  <span class="author-name">{{ guideData.author_name || '作者' }}</span>
                </div>
                <div class="guide-stats">
                  <span>👁️ {{ guideData.views || 0 }} 浏览</span>
                </div>
              </div>
              
              <!-- 交互按钮 -->
              <div class="interaction-section">
                <InteractionButtons
                  targetType="guide"
                  :targetId="guideData.id"
                  :initialLikeCount="guideData.likes || 0"
                  :initialFavoriteCount="guideData.favorites || 0"
                  :initialShareCount="guideData.shares || 0"
                />
              </div>
            </div>

            <!-- 攻略正文 -->
            <div class="guide-content">
              <div v-if="guideData.content" class="content-section">
                <div class="section-body">
                  <p class="paragraph" v-for="(para, idx) in guideData.content.split('\n')" :key="idx">{{ para }}</p>
                </div>
              </div>
              <div v-else class="empty-state" style="text-align: center; padding: 40px;">
                <p>暂无内容</p>
              </div>
            </div>
          </template>

          <div v-else class="empty-state">
            <p>攻略不存在</p>
          </div>

          <!-- 底部操作 -->
          <div class="detail-footer">
            <button class="action-btn secondary" @click="goBack">
              返回列表
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import InteractionButtons from '../components/InteractionButtons.vue'
import { guideAPI } from '../api/guide'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const guideData = ref(null)

const loadGuideDetail = async () => {
  loading.value = true
  try {
    const id = route.query.id
    if (id) {
      const res = await guideAPI.getById(id)
      if (res.code === 200) {
        guideData.value = res.data
      }
    }
  } catch (error) {
    console.error('加载攻略详情失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadGuideDetail()
})
</script>

<style scoped>
.guide-detail-page {
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
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.back-btn:hover {
  background: #f5f5f5;
  transform: translateX(-4px);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-header {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.detail-cover {
  width: 100%;
  height: 350px;
  object-fit: cover;
}

.detail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 60px 24px 24px;
}

.guide-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.guide-tag {
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.guide-info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.guide-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.guide-description {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-left: 3px solid #667eea;
  border-radius: 4px;
}

.guide-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.guide-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.author-name {
  font-weight: 600;
  color: #334155;
}

.guide-stats {
  display: flex;
  gap: 20px;
  color: #64748b;
  font-size: 14px;
}

.interaction-section {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.guide-content {
  margin-bottom: 24px;
}

.content-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.section-body {
  padding-left: 0;
}

.paragraph {
  color: #475569;
  line-height: 1.8;
  margin: 0 0 16px 0;
  font-size: 15px;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-footer {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
  position: sticky;
  bottom: 20px;
}

.action-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .guide-detail-page {
    padding-top: 70px;
  }
  
  .container {
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }

  .detail-cover {
    height: 220px;
  }

  .guide-title {
    font-size: 22px;
  }

  .guide-meta {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .content-section {
    padding: 20px;
  }

  .detail-footer {
    flex-direction: column;
    gap: 12px;
    bottom: 12px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .guide-detail-page .container { margin-left: 0; }
  .guide-detail-page .main-content { padding-bottom: 60px; }
  .guide-detail-cover { height: 200px; }
  .guide-detail-title { font-size: 22px; }
  .guide-detail-content h2 { font-size: 18px; }
  .guide-detail-content { padding: 16px; }
  .scrollable-content { padding: 10px; }
}
</style>
