<template>
  <div class="interaction-buttons">
    <!-- 点赞按钮 -->
    <button
      class="interaction-btn like-btn"
      :class="{ active: isLiked }"
      @click="handleLike"
      :disabled="loading.like"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" :fill="isLiked ? '#ef4444' : 'none'" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span class="count">{{ formatCount(likeCount) }}</span>
    </button>

    <!-- 收藏按钮 -->
    <button
      class="interaction-btn favorite-btn"
      :class="{ active: isFavorited }"
      @click="handleFavorite"
      :disabled="loading.favorite"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorited ? '#f59e0b' : 'none'" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span class="count">{{ formatCount(favoriteCount) }}</span>
    </button>

    <!-- 分享按钮 -->
    <button
      class="interaction-btn share-btn"
      @click="handleShare"
      :disabled="loading.share"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      <span class="count">{{ formatCount(shareCount) }}</span>
    </button>

    <!-- 提示消息 -->
    <transition name="toast">
      <div v-if="toastMessage" class="toast-message" :class="toastType">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { interactionAPI } from '../api/interaction'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  targetType: {
    type: String,
    required: true,
    validator: (value) => ['destination', 'itinerary', 'guide', 'news'].includes(value)
  },
  targetId: {
    type: [Number, String],
    required: true
  },
  initialLikeCount: {
    type: Number,
    default: 0
  },
  initialFavoriteCount: {
    type: Number,
    default: 0
  },
  initialShareCount: {
    type: Number,
    default: 0
  }
})

const authStore = useAuthStore()

const isLiked = ref(false)
const isFavorited = ref(false)
const likeCount = ref(props.initialLikeCount)
const favoriteCount = ref(props.initialFavoriteCount)
const shareCount = ref(props.initialShareCount)

const loading = ref({
  like: false,
  favorite: false,
  share: false
})

const toastMessage = ref('')
const toastType = ref('success')

// 显示提示消息
const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

// 格式化数量显示
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 检查交互状态
const checkStatus = async () => {
  if (!authStore.isUserLoggedIn) return

  try {
    const res = await interactionAPI.check(props.targetType, props.targetId)
    if (res.code === 200) {
      isLiked.value = res.data.isLiked || false
      isFavorited.value = res.data.isFavorited || false
    }
  } catch (error) {
    console.error('检查交互状态失败:', error)
  }
}

// 点赞/取消点赞
const handleLike = async () => {
  if (!authStore.isUserLoggedIn) {
    showToast('请先登录', 'error')
    return
  }

  loading.value.like = true
  try {
    if (isLiked.value) {
      const res = await interactionAPI.unlike(props.targetType, props.targetId)
      if (res.code === 200) {
        isLiked.value = res.data?.isLiked ?? false
        if (!isLiked.value) {
          likeCount.value = Math.max(0, likeCount.value - 1)
          showToast('已取消点赞')
        } else {
          showToast('已点赞')
        }
      }
    } else {
      const res = await interactionAPI.like(props.targetType, props.targetId)
      if (res.code === 200) {
        isLiked.value = res.data?.isLiked ?? true
        if (isLiked.value) {
          likeCount.value += 1
          showToast('点赞成功')
        }
      }
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    showToast(error.response?.data?.message || '操作失败', 'error')
    // 失败时重新检查状态
    checkStatus()
  } finally {
    loading.value.like = false
  }
}

// 收藏/取消收藏
const handleFavorite = async () => {
  if (!authStore.isUserLoggedIn) {
    showToast('请先登录', 'error')
    return
  }

  loading.value.favorite = true
  try {
    if (isFavorited.value) {
      const res = await interactionAPI.unfavorite(props.targetType, props.targetId)
      if (res.code === 200) {
        isFavorited.value = res.data?.isFavorited ?? false
        if (!isFavorited.value) {
          favoriteCount.value = Math.max(0, favoriteCount.value - 1)
          showToast('已取消收藏')
        } else {
          showToast('已收藏')
        }
      }
    } else {
      const res = await interactionAPI.favorite(props.targetType, props.targetId)
      if (res.code === 200) {
        isFavorited.value = res.data?.isFavorited ?? true
        if (isFavorited.value) {
          favoriteCount.value += 1
          showToast('收藏成功')
        }
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    showToast(error.response?.data?.message || '操作失败', 'error')
    // 失败时重新检查状态
    checkStatus()
  } finally {
    loading.value.favorite = false
  }
}

// 分享
const handleShare = async () => {
  loading.value.share = true
  try {
    // 复制链接到剪贴板
    const url = window.location.href
    await navigator.clipboard.writeText(url)

    // 记录分享
    if (authStore.isUserLoggedIn) {
      await interactionAPI.share(props.targetType, props.targetId)
      shareCount.value += 1
    }

    showToast('链接已复制到剪贴板')
  } catch (error) {
    console.error('分享失败:', error)
    // 如果剪贴板API不可用，使用备用方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToast('链接已复制到剪贴板')
    } catch (e) {
      showToast('复制失败，请手动复制链接', 'error')
    }
  } finally {
    loading.value.share = false
  }
}

// 监听targetId变化，重新检查状态
watch(() => props.targetId, () => {
  checkStatus()
})

onMounted(() => {
  checkStatus()
})
</script>

<style scoped>
.interaction-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 14px;
}

.interaction-btn:hover {
  border-color: #999;
  background: #f8f8f8;
}

.interaction-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.interaction-btn svg {
  transition: all 0.3s ease;
}

.interaction-btn .count {
  font-weight: 500;
  min-width: 20px;
}

/* 点赞按钮激活状态 */
.like-btn.active {
  border-color: #ef4444;
  background: #fef2f2;
  color: #ef4444;
}

.like-btn.active:hover {
  background: #fee2e2;
}

/* 收藏按钮激活状态 */
.favorite-btn.active {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #f59e0b;
}

.favorite-btn.active:hover {
  background: #fef3c7;
}

/* 分享按钮 */
.share-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

/* 提示消息 */
.toast-message {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-message.success {
  background: #10b981;
  color: white;
}

.toast-message.error {
  background: #ef4444;
  color: white;
}

/* 提示消息动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@media (max-width: 768px) {
  .interaction-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  .interaction-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>