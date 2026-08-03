<template>
  <div class="destination-detail" v-if="destination">
    <!-- 图片轮播区域 -->
    <div class="hero-section">
      <div class="carousel-wrapper">
        <div class="carousel-container">
          <!-- 返回按钮 - 固定在图片左上角 -->
          <button class="back-btn" @click="$emit('back')">
            <span class="back-icon">←</span>
            <span>返回列表</span>
          </button>

          <!-- 图片显示 -->
          <div v-if="!showVideo" class="image-carousel">
            <div class="carousel-track">
              <img
                v-for="(img, index) in displayImages"
                :key="index"
                :src="img"
                :alt="`${destination.name} - ${index + 1}`"
                class="carousel-slide"
                :class="{ active: index === currentIndex }"
              />
            </div>
            
            <!-- 导航按钮 -->
            <button class="nav-btn nav-prev" @click="prevImage">
              <span class="nav-icon">❮</span>
            </button>
            <button class="nav-btn nav-next" @click="nextImage">
              <span class="nav-icon">❯</span>
            </button>
            
            <!-- 指示器 -->
            <div class="indicator-container">
              <div
                v-for="(_, index) in displayImages"
                :key="index"
                class="indicator"
                :class="{ active: index === currentIndex }"
                @click="currentIndex = index"
              >
                <span class="indicator-dot"></span>
              </div>
            </div>
          </div>
          
          <!-- 视频显示 -->
        <div v-if="destination.video && showVideo" class="video-carousel">
          <!-- YouTube 视频 -->
          <iframe 
            v-if="isYouTubeUrl(destination.video)"
            :src="getYouTubeEmbedUrl(destination.video)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-player"
          ></iframe>
          <!-- Bilibili 视频 -->
          <iframe 
            v-else-if="isBilibiliUrl(destination.video)"
            :src="getBilibiliEmbedUrl(destination.video)"
            frameborder="0"
            allowfullscreen
            class="video-player"
          ></iframe>
          <!-- 本地或其他视频 -->
          <div v-else class="local-video-container">
            <video 
              ref="videoPlayer"
              :src="displayVideoUrl" 
              controls 
              class="video-player"
              preload="auto"
              @error="handleVideoError"
              @loadeddata="handleVideoLoaded"
              @canplay="handleVideoCanPlay"
              @play="handleVideoPlay"
              @pause="handleVideoPause"
            >
              您的浏览器不支持视频播放
            </video>
            <!-- 中央播放按钮 -->
            <button 
              v-if="!isPlaying" 
              class="center-play-btn"
              @click="toggleVideoPlay"
            >
              <span class="play-icon">▶</span>
            </button>
          </div>
          <!-- 调试信息 - 仅在有错误时显示 -->
          <div v-if="videoDebugInfo" class="video-debug">
            <p>{{ videoDebugInfo }}</p>
            <p>视频地址: {{ displayVideoUrl }}</p>
          </div>
        </div>
          
          <!-- 媒体切换按钮 -->
          <div class="media-switch" v-if="destination.video">
            <button class="switch-btn" :class="{ active: !showVideo }" @click="showVideo = false">
              <span>图片</span>
            </button>
            <button class="switch-btn" :class="{ active: showVideo }" @click="showVideo = true">
              <span>视频</span>
            </button>
          </div>
          
          <!-- 景点信息悬浮层 -->
          <div class="hero-overlay">
            <div class="overlay-content">
              <h1 class="destination-title">{{ destination.name }}</h1>
              <div class="destination-meta">
                <span class="meta-item location">📍 {{ destination.location }}</span>
                <span class="meta-item rating">⭐ {{ destination.rating }}</span>
                <span class="meta-item">❤️ {{ destination.likeCount || 0 }}</span>
                <span class="meta-item">🔖 {{ destination.favoriteCount || 0 }}</span>
              </div>
              <div class="destination-tags">
                <span v-for="tag in destination.Tags" :key="tag.id" class="tag">{{ tag.name }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 缩略图列表 -->
        <div class="thumbnail-strip" v-if="displayImages.length > 1 && !showVideo">
          <div 
            v-for="(img, index) in displayImages" 
            :key="index" 
            class="thumbnail-wrapper"
            :class="{ active: index === currentIndex }"
            @click="currentIndex = index"
          >
            <img :src="img" :alt="`缩略图 ${index + 1}`" class="thumbnail" />
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="main-content">
        <!-- 操作栏 -->
        <div class="action-bar">
          <button 
            class="action-btn" 
            :class="{ active: destination.isFavorite }"
            @click="handleFavorite"
          >
            <span class="action-icon">{{ destination.isFavorite ? '🔖' : '🔖' }}</span>
            <span>{{ destination.isFavorite ? '已收藏' : '收藏' }}</span>
          </button>
          <button 
            class="action-btn" 
            :class="{ active: destination.isLiked }"
            @click="handleLike"
          >
            <span class="action-icon">{{ destination.isLiked ? '❤️' : '🤍' }}</span>
            <span>{{ destination.isLiked ? '已点赞' : '点赞' }}</span>
          </button>
          <button 
            class="action-btn share-btn"
            @click="showShareMenu = !showShareMenu"
          >
            <span class="action-icon">🔗</span>
            <span>分享</span>
          </button>
          <button 
            class="action-btn compare-btn"
            @click="handleAddToCompare"
          >
            <span class="action-icon">⚖️</span>
            <span>加入对比</span>
          </button>
        </div>

        <!-- 分享菜单 -->
        <div v-if="showShareMenu" class="share-menu">
          <div class="share-title">分享到</div>
          <div class="share-options">
            <button class="share-option" @click="copyShareLink">
              <span class="share-icon">📋</span>
              <span>复制链接</span>
            </button>
            <button class="share-option" @click="shareToWeChat">
              <span class="share-icon">💬</span>
              <span>微信</span>
            </button>
            <button class="share-option" @click="shareToWeibo">
              <span class="share-icon">📢</span>
              <span>微博</span>
            </button>
            <button class="share-option" @click="shareToQQ">
              <span class="share-icon">🐧</span>
              <span>QQ</span>
            </button>
          </div>
        </div>

        <!-- 景点介绍 -->
        <section class="content-card">
          <div class="card-header">
            <div class="header-icon">📖</div>
            <h2 class="card-title">景点介绍</h2>
          </div>
          <div class="card-body">
            <p class="description">{{ destination.description || '暂无详细介绍' }}</p>
          </div>
        </section>

        <!-- 位置地图 -->
        <section class="content-card" v-if="destination.latitude && destination.longitude">
          <div class="card-header">
            <div class="header-icon">🗺️</div>
            <h2 class="card-title">景点位置</h2>
          </div>
          <div class="card-body">
            <DestinationMap :latitude="destination.latitude" :longitude="destination.longitude" :title="destination.name" />
          </div>
        </section>

        <!-- 实用信息 -->
        <section class="content-card" v-if="hasUsefulInfo">
          <div class="card-header">
            <div class="header-icon">📋</div>
            <h2 class="card-title">实用信息</h2>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item" v-if="destination.openingHours">
                <div class="info-icon">⏰</div>
                <div class="info-content">
                  <div class="info-label">开放时间</div>
                  <div class="info-value">{{ destination.openingHours }}</div>
                </div>
              </div>
              <div class="info-item" v-if="destination.ticketPrice">
                <div class="info-icon">🎫</div>
                <div class="info-content">
                  <div class="info-label">门票价格</div>
                  <div class="info-value">{{ destination.ticketPrice }}</div>
                </div>
              </div>
              <div class="info-item" v-if="destination.duration">
                <div class="info-icon">⌚</div>
                <div class="info-content">
                  <div class="info-label">建议游玩</div>
                  <div class="info-value">{{ destination.duration }}</div>
                </div>
              </div>
              <div class="info-item" v-if="destination.bestTime">
                <div class="info-icon">🌤️</div>
                <div class="info-content">
                  <div class="info-label">最佳季节</div>
                  <div class="info-value">{{ destination.bestTime }}</div>
                </div>
              </div>
            </div>
            <div class="info-section" v-if="destination.transport">
              <div class="section-header">
                <span class="section-icon">🚗</span>
                <span class="section-title">交通指南</span>
              </div>
              <div class="section-content">{{ destination.transport }}</div>
            </div>
            <div class="info-section" v-if="destination.tips">
              <div class="section-header">
                <span class="section-icon">💡</span>
                <span class="section-title">温馨提示</span>
              </div>
              <div class="section-content">{{ destination.tips }}</div>
            </div>
          </div>
        </section>

        <!-- 用户评论 -->
        <section class="content-card">
          <div class="card-header">
            <div class="header-icon">💬</div>
            <h2 class="card-title">用户评论</h2>
            <span class="review-count">({{ reviews.length }})</span>
          </div>
          
          <!-- 添加评论表单 -->
          <div class="review-form-wrapper">
            <h3 class="form-title">发表评论</h3>
            <div v-if="!authStore.isUserLoggedIn" class="login-prompt">
              <p>请先登录后再发表评论</p>
              <button class="login-btn" @click="showAuthModal = true">登录 / 注册</button>
            </div>
            <div v-else>
              <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
                <div class="form-row">
                  <el-form-item label="评分" prop="rating" class="form-item">
                    <el-rate v-model="reviewForm.rating" allow-half class="form-rate" />
                  </el-form-item>
                </div>
                <el-form-item label="评论内容" prop="content" class="form-item-full">
                  <el-input
                    v-model="reviewForm.content"
                    type="textarea"
                    :rows="3"
                    placeholder="请分享您的旅行体验..."
                    class="form-textarea"
                  />
                </el-form-item>
                <el-form-item class="form-item-full form-actions">
                  <div class="form-actions-row">
                    <!-- 图片上传按钮 -->
                    <label class="upload-image-btn">
                      <input type="file" accept="image/*" class="upload-input-hidden" @change="handleUploadImage" />
                      <span>📷 图片</span>
                    </label>
                    <!-- 图片预览 -->
                    <div v-for="(img, idx) in uploadedImages" :key="idx" class="upload-preview-item">
                      <img :src="img" class="upload-preview-img" />
                      <button class="remove-preview-btn" @click="removeImage(idx)">×</button>
                    </div>
                    <el-button type="primary" @click="handleSubmitReview" :loading="submitting" class="submit-btn">
                      {{ replyingTo ? '发表回复' : '发表评论' }}
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 评论输入区回复提示 -->
          <div v-if="replyingTo && authStore.isUserLoggedIn" class="reply-indicator">
            <span>回复 @{{ replyingTo.user?.nickname || replyingTo.user_name }}</span>
            <button class="cancel-reply-btn" @click="cancelReply">取消回复</button>
          </div>

          <!-- 评论列表 -->
          <div class="review-list">
            <!-- 顶级评论 -->
            <div v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="reviewer-avatar">
                  <span class="avatar-text">{{ (review.user?.nickname || review.user_name).charAt(0).toUpperCase() }}</span>
                </div>
                <div class="reviewer-info">
                  <span class="reviewer-name">{{ review.user?.nickname || review.user_name }}</span>
                  <div class="review-meta">
                    <span v-if="review.rating" class="review-rating">⭐ {{ review.rating }}</span>
                    <span class="review-date">{{ formatDate(review.created_at) }}</span>
                  </div>
                </div>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <!-- 评论图片 -->
              <div v-if="review.images && review.images.length > 0" class="review-images">
                <div v-for="(img, imgIdx) in review.images" :key="imgIdx" class="review-image-wrapper">
                  <img :src="processImageUrl(img)" class="review-image" />
                </div>
              </div>
              <!-- 评论操作 -->
              <div class="review-actions">
                <button
                  class="like-review-btn"
                  :class="{ liked: review._liked }"
                  @click="handleLikeReview(review)"
                >
                  <span class="like-icon">{{ review._liked ? '❤️' : '🤍' }}</span>
                  <span class="like-count">{{ review.like_count || 0 }}</span>
                </button>
                <button class="reply-btn" @click="startReply(review)" v-if="authStore.isUserLoggedIn">
                  💬 回复
                </button>
              </div>

              <!-- 子评论（回复） -->
              <div v-if="review.replies && review.replies.length > 0" class="replies-container">
                <div v-for="reply in review.replies" :key="reply.id" class="reply-card">
                  <div class="review-header">
                    <div class="reviewer-avatar reply-avatar">
                      <span class="avatar-text">{{ (reply.user?.nickname || reply.user_name).charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{ reply.user?.nickname || reply.user_name }}</span>
                      <div class="review-meta">
                        <span class="review-date">{{ formatDate(reply.created_at) }}</span>
                      </div>
                    </div>
                  </div>
                  <p class="review-content">{{ reply.content }}</p>
                  <div v-if="reply.images && reply.images.length > 0" class="review-images">
                    <div v-for="(img, imgIdx) in reply.images" :key="imgIdx" class="review-image-wrapper">
                      <img :src="processImageUrl(img)" class="review-image" />
                    </div>
                  </div>
                  <div class="review-actions">
                    <button
                      class="like-review-btn"
                      :class="{ liked: reply._liked }"
                      @click="handleLikeReview(reply)"
                    >
                      <span class="like-icon">{{ reply._liked ? '❤️' : '🤍' }}</span>
                      <span class="like-count">{{ reply.like_count || 0 }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="reviews.length === 0" class="empty-state">
              <div class="empty-icon">💭</div>
              <p class="empty-text">暂无评论，快来发表第一条评论吧！</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" @success="onAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { reviewAPI } from '../api/reviews'
import { userAPI } from '../api/user'
import { useAuthStore } from '../stores/auth'
import AuthModal from './AuthModal.vue'
import DestinationMap from './DestinationMap.vue'

const props = defineProps({
  destination: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['back'])

const authStore = useAuthStore()
const reviews = ref([])
const reviewFormRef = ref(null)
const submitting = ref(false)
const currentIndex = ref(0)
const showVideo = ref(false)
const videoPlayer = ref(null)
const videoDebugInfo = ref('')
const isPlaying = ref(false)
const showAuthModal = ref(false)
const showShareMenu = ref(false)
const replyingTo = ref(null)
const uploadedImages = ref([])
const uploadingImage = ref(false)

const reviewForm = reactive({
  rating: 5,
  content: ''
})

const reviewRules = {
  content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }]
}

// 处理图片URL，支持相对路径和绝对路径
const processImageUrl = (url) => {
  if (!url) return url
  // 如果已经是绝对URL或data URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  // 如果是相对路径，拼接baseURL
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 视频平台检测和链接转换函数（放在前面，因为其他函数会调用）
const isYouTubeUrl = (url) => {
  return /(?:youtube\.com|youtu\.be)/.test(url)
}

const isBilibiliUrl = (url) => {
  return /bilibili\.com/.test(url)
}

const getYouTubeEmbedUrl = (url) => {
  // 匹配各种YouTube链接格式
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : null
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}

const getBilibiliEmbedUrl = (url) => {
  // 提取BV号或AV号
  const bvMatch = url.match(/BV([a-zA-Z0-9]+)/)
  const avMatch = url.match(/\/av(\d+)/)
  
  if (bvMatch) {
    return `https://player.bilibili.com/player.html?bvid=BV${bvMatch[1]}&autoplay=0`
  } else if (avMatch) {
    return `https://player.bilibili.com/player.html?aid=${avMatch[1]}&autoplay=0`
  }
  
  // 尝试直接转换为iframe链接
  return url.replace('www.bilibili.com/video/', 'player.bilibili.com/player.html?bvid=')
}

// 处理视频URL，支持相对路径和绝对路径
const processVideoUrl = (url) => {
  if (!url) return url
  // 如果是YouTube或B站链接，直接返回
  if (isYouTubeUrl(url) || isBilibiliUrl(url)) {
    return url
  }
  // 如果已经是绝对URL或data URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  // 如果是相对路径，拼接baseURL
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

// 规范化 images 字段：可能是数组，也可能是 JSON 字符串
const normalizeImages = (images) => {
  if (!images) return []
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

const displayImages = computed(() => {
  if (!props.destination) return []
  const images = normalizeImages(props.destination.images)
  if (images.length > 0) {
    return images.map(img => processImageUrl(img))
  }
  if (props.destination.image) {
    return [processImageUrl(props.destination.image)]
  }
  return ['https://via.placeholder.com/1920x600?text=No+Image']
})

// 处理后的视频URL
const displayVideoUrl = computed(() => {
  return props.destination?.video ? processVideoUrl(props.destination.video) : ''
})

// 检查是否有实用信息
const hasUsefulInfo = computed(() => {
  if (!props.destination) return false
  return props.destination.openingHours || 
         props.destination.ticketPrice || 
         props.destination.duration || 
         props.destination.bestTime || 
         props.destination.transport || 
         props.destination.tips
})

const prevImage = () => {
  currentIndex.value = currentIndex.value === 0
    ? displayImages.value.length - 1
    : currentIndex.value - 1
}

const nextImage = () => {
  currentIndex.value = currentIndex.value === displayImages.value.length - 1
    ? 0
    : currentIndex.value + 1
}

const loadReviews = async () => {
  if (!props.destination) return
  try {
    const res = await reviewAPI.getByDestination(props.destination.id)
    if (res.code === 200) {
      reviews.value = res.data.map(review => ({
        ...review,
        _liked: false,
        replies: (review.replies || []).map(reply => ({
          ...reply,
          _liked: false
        }))
      }))
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

const handleFavorite = async () => {
  if (!authStore.isUserLoggedIn) {
    showAuthModal.value = true
    return
  }

  try {
    const res = await userAPI.toggleFavorite(props.destination.id)
    if (res.code === 200) {
      props.destination.isFavorite = res.data.isFavorite
      if (res.data.isFavorite) {
        props.destination.favoriteCount = (props.destination.favoriteCount || 0) + 1
        ElMessage.success('收藏成功')
      } else {
        props.destination.favoriteCount = Math.max(0, (props.destination.favoriteCount || 1) - 1)
        ElMessage.success('已取消收藏')
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleLike = async () => {
  if (!authStore.isUserLoggedIn) {
    showAuthModal.value = true
    return
  }

  try {
    const res = await userAPI.toggleLike(props.destination.id)
    if (res.code === 200) {
      props.destination.isLiked = res.data.isLiked
      if (res.data.isLiked) {
        props.destination.likeCount = (props.destination.likeCount || 0) + 1
        ElMessage.success('点赞成功')
      } else {
        props.destination.likeCount = Math.max(0, (props.destination.likeCount || 1) - 1)
        ElMessage.success('已取消点赞')
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSubmitReview = async () => {
  if (!reviewFormRef.value) return

  await reviewFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (replyingTo.value) {
          const res = await reviewAPI.reply(replyingTo.value.id, {
            content: reviewForm.content,
            images: uploadedImages.value
          })
          if (res.code === 200) {
            ElMessage.success('回复成功')
            const parentReview = reviews.value.find(r => r.id === replyingTo.value.id)
            if (parentReview) {
              if (!parentReview.replies) parentReview.replies = []
              parentReview.replies.push({ ...res.data, _liked: false })
            }
            cancelReply()
          }
        } else {
          const res = await userAPI.addReview({
            destinationId: props.destination.id,
            content: reviewForm.content,
            rating: reviewForm.rating,
            images: uploadedImages.value
          })
          if (res.code === 200) {
            ElMessage.success('评论发表成功')
            loadReviews()
          }
        }
        reviewForm.content = ''
        reviewForm.rating = 5
        uploadedImages.value = []
      } catch (error) {
        ElMessage.error(replyingTo.value ? '回复失败' : '评论发表失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const startReply = (review) => {
  replyingTo.value = review
  reviewForm.content = ''
  reviewForm.rating = 5
  uploadedImages.value = []
}

const cancelReply = () => {
  replyingTo.value = null
  reviewForm.content = ''
  reviewForm.rating = 5
  uploadedImages.value = []
}

const handleLikeReview = async (review) => {
  if (!authStore.isUserLoggedIn) {
    showAuthModal.value = true
    return
  }
  try {
    const res = await reviewAPI.like(review.id)
    if (res.code === 200) {
      review._liked = res.data.liked
      review.like_count = res.data.like_count
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const handleUploadImage = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 3 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 3MB')
    return
  }
  uploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const res = await reviewAPI.uploadImage(formData)
    if (res.code === 200) {
      uploadedImages.value.push(res.data.url)
    }
  } catch (error) {
    ElMessage.error('图片上传失败')
  } finally {
    uploadingImage.value = false
    event.target.value = ''
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const onAuthSuccess = () => {
  showAuthModal.value = false
}

const getShareUrl = () => {
  return `${window.location.origin}/#/destination/${props.destination.id}`
}

const copyShareLink = async () => {
  const url = getShareUrl()
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
    showShareMenu.value = false
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('链接已复制到剪贴板')
    showShareMenu.value = false
  }
}

const shareToWeChat = () => {
  ElMessage.info('请打开微信，粘贴链接分享给好友')
  copyShareLink()
}

const shareToWeibo = () => {
  const url = getShareUrl()
  const title = props.destination.name
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title + ' - 旅游指南')}`
  window.open(weiboUrl, '_blank', 'width=600,height=400')
  showShareMenu.value = false
}

const shareToQQ = () => {
  const url = getShareUrl()
  const title = props.destination.name
  const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  window.open(qqUrl, '_blank', 'width=600,height=400')
  showShareMenu.value = false
}

const handleAddToCompare = () => {
  if (!props.destination) return

  const MAX_COMPARE = 4
  let compareList = []

  try {
    const saved = sessionStorage.getItem('compareDestinations')
    if (saved) {
      compareList = JSON.parse(saved)
    }
  } catch (e) {
    compareList = []
  }

  const exists = compareList.some(item => item.id === props.destination.id)
  if (exists) {
    ElMessage.info('该景点已在对比列表中')
    return
  }

  if (compareList.length >= MAX_COMPARE) {
    ElMessage.warning(`最多只能对比 ${MAX_COMPARE} 个景点`)
    return
  }

  compareList.push({
    id: props.destination.id,
    name: props.destination.name,
    image: props.destination.image,
    rating: props.destination.rating,
    location: props.destination.location,
    ticketPrice: props.destination.ticketPrice,
    bestTime: props.destination.bestTime,
    duration: props.destination.duration,
    openingHours: props.destination.openingHours,
    transport: props.destination.transport,
    Tags: props.destination.Tags
  })

  sessionStorage.setItem('compareDestinations', JSON.stringify(compareList))
  ElMessage.success(`已将「${props.destination.name}」加入对比列表`)

  // 返回列表页
  emit('back')
}

watch(showVideo, (newVal) => {
  if (!newVal && videoPlayer.value) {
    videoPlayer.value.pause()
  }
  if (newVal && props.destination?.video) {
    // 当切换到视频时重置调试信息
    videoDebugInfo.value = '正在加载视频...'
  }
})

const handleVideoError = (e) => {
  console.error('视频加载错误:', e)
  videoDebugInfo.value = '视频加载失败，请检查视频地址是否正确'
  isPlaying.value = false
}

const handleVideoLoaded = () => {
  console.log('视频数据已加载')
}

const handleVideoCanPlay = () => {
  console.log('视频可以播放了')
  videoDebugInfo.value = ''
}

const handleVideoPlay = () => {
  console.log('视频开始播放')
  isPlaying.value = true
}

const handleVideoPause = () => {
  console.log('视频暂停')
  isPlaying.value = false
}

const toggleVideoPlay = () => {
  if (!videoPlayer.value) return
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
  } else {
    videoPlayer.value.pause()
  }
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
/* 整体背景 - 浅灰色 */
.destination-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 英雄区域 */
.hero-section {
  width: 100%;
  position: relative;
}

.carousel-wrapper {
  width: 100%;
  overflow: hidden;
}

/* 轮播容器 - 降低高度，保证一屏可见 */
.carousel-container {
  position: relative;
  width: 100%;
  height: 380px;
  background: #1a1a1a;
}

/* 返回按钮 - 固定在图片左上角 */
.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #111;
  border: none;
  padding: 10px 18px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 100;
}

.back-btn:hover {
  background: white;
  transform: translateX(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.back-icon {
  font-size: 16px;
}

/* 图片轮播 */
.image-carousel {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-track {
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.carousel-slide.active {
  opacity: 1;
}

/* 导航按钮 - 黑白简约风格 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.25);
}

.nav-prev {
  left: 20px;
}

.nav-next {
  right: 20px;
}

.nav-icon {
  color: #111;
  font-size: 20px;
  font-weight: bold;
}

/* 指示器 */
.indicator-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.indicator {
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s ease;
}

.indicator-dot {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.indicator.active .indicator-dot {
  width: 20px;
  border-radius: 3px;
  background: white;
}

/* 视频播放 */
.video-carousel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.local-video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: none;
  background: #000;
}

.center-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 3px solid white;
  color: white;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 20;
}

.center-play-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  margin-left: 5px;
}

.video-debug {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 15;
}

/* 媒体切换 - 黑白风格 */
.media-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.switch-btn {
  background: rgba(255, 255, 255, 0.85);
  color: #111;
  border: none;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-btn:hover {
  background: white;
}

.switch-btn.active {
  background: #111;
  color: white;
}

/* 悬浮层信息 - 黑白渐变 */
.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px 40px 35px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  z-index: 5;
}

.overlay-content {
  max-width: 1000px;
  margin: 0 auto;
}

.destination-title {
  font-size: 38px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.destination-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.12);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: white;
}

.destination-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 缩略图条 - 深灰背景 */
.thumbnail-strip {
  display: flex;
  gap: 10px;
  padding: 15px;
  justify-content: center;
  background: #111;
}

.thumbnail-wrapper {
  position: relative;
  width: 65px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.45;
  transition: all 0.3s ease;
}

.thumbnail-wrapper:hover,
.thumbnail-wrapper.active {
  opacity: 1;
}

.thumbnail-wrapper.active {
  box-shadow: 0 0 0 2px white;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 内容区域 */
.content-wrapper {
  width: 100%;
  padding: 35px 20px;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #111;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.active {
  background: #111;
  border-color: #111;
  color: white;
}

.action-icon {
  font-size: 18px;
}

/* 内容卡片 - 纯白色+简约阴影 */
.content-card {
  background: white;
  border-radius: 14px;
  padding: 30px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid #eee;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.header-icon {
  width: 38px;
  height: 38px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.review-count {
  font-size: 13px;
  color: #888;
  font-weight: 400;
}

.card-body {
  color: #444;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  color: #333;
}

/* 登录提示 */
.login-prompt {
  text-align: center;
  padding: 30px;
  background: #fafafa;
  border-radius: 12px;
}

.login-prompt p {
  color: #666;
  margin: 0 0 15px 0;
  font-size: 14px;
}

.login-btn {
  padding: 10px 24px;
  background: #111;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

/* 评论表单 - 浅灰背景 */
.review-form-wrapper {
  background: #fafafa;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 25px;
}

.form-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 0 0 15px 0;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
}

.form-item {
  flex: 1;
}

.form-item-full {
  width: 100%;
}

.form-input {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: white;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #111;
  box-shadow: none;
}

.form-rate {
  background: transparent;
}

.form-textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: white;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  border-color: #111;
  box-shadow: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.submit-btn {
  background: #111;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

/* 评论列表 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.review-card:hover {
  background: #f5f5f5;
}

.review-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.reviewer-avatar {
  width: 38px;
  height: 38px;
  background: #111;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  display: block;
}

.review-meta {
  display: flex;
  gap: 10px;
  margin-top: 3px;
}

.review-rating {
  font-size: 11px;
  color: #666;
}

.review-date {
  font-size: 11px;
  color: #999;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin: 0;
}

/* 评论操作 */
.review-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
}

.like-review-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #888;
  transition: all 0.3s ease;
}

.like-review-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.like-review-btn.liked {
  border-color: #ff6b6b;
  color: #ff6b6b;
  background: #fff5f5;
}

.like-icon {
  font-size: 14px;
}

.like-count {
  font-size: 12px;
}

.reply-btn {
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #888;
  transition: all 0.3s ease;
}

.reply-btn:hover {
  border-color: #111;
  color: #111;
}

/* 回复指示 */
.reply-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f7ff;
  border-left: 3px solid #409eff;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #333;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
}

.cancel-reply-btn:hover {
  color: #ff6b6b;
}

/* 子评论区域 */
.replies-container {
  margin-top: 12px;
  padding-left: 40px;
  border-left: 2px solid #e5e5e5;
}

.reply-card {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 8px;
}

.reply-card:last-child {
  margin-bottom: 0;
}

.reply-avatar {
  width: 30px;
  height: 30px;
}

.reply-avatar .avatar-text {
  font-size: 12px;
}

/* 评论图片 */
.review-images {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.review-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.review-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 表单操作行 */
.form-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 图片上传按钮 */
.upload-image-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: #f0f0f0;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-image-btn:hover {
  background: #e8e8e8;
  border-color: #ccc;
}

.upload-input-hidden {
  display: none;
}

/* 图片预览 */
.upload-preview-item {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.upload-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-preview-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.remove-preview-btn:hover {
  background: rgba(255, 0, 0, 0.8);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #fafafa;
  border-radius: 12px;
}

.empty-icon {
  font-size: 42px;
  display: block;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .carousel-container {
    height: 320px;
  }

  .hero-overlay {
    padding: 50px 15px 30px;
  }

  .destination-title {
    font-size: 28px;
  }

  .meta-item {
    padding: 5px 12px;
    font-size: 12px;
  }

  .nav-btn {
    width: 42px;
    height: 42px;
  }

  .nav-prev {
    left: 10px;
  }

  .nav-next {
    right: 10px;
  }

  .media-switch {
    top: 12px;
    right: 12px;
  }

  .switch-btn {
    padding: 6px 12px;
    font-size: 11px;
  }

  .back-btn {
    top: 12px;
    left: 12px;
    padding: 8px 14px;
    font-size: 13px;
  }

  .thumbnail-strip {
    gap: 8px;
    padding: 12px;
  }

  .thumbnail-wrapper {
    width: 55px;
    height: 42px;
  }

  .content-wrapper {
    padding: 25px 12px;
  }

  .content-card {
    padding: 20px;
    border-radius: 12px;
  }

  .card-title {
    font-size: 16px;
  }

  .header-icon {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .form-row {
    flex-direction: column;
    gap: 12px;
  }

  .destination-meta {
    flex-wrap: wrap;
  }

  .action-bar {
    flex-direction: column;
  }
}

/* 分享菜单 */
.share-menu {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #eee;
}

.share-title {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
}

.share-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f8f8;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-option:hover {
  background: #111;
  color: white;
  transform: translateY(-2px);
}

.share-icon {
  font-size: 16px;
}

/* 实用信息样式 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: #fafafa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.info-icon {
  font-size: 24px;
  line-height: 1;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.section-content {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  padding-left: 26px;
}

/* 超大屏幕优化 */
@media (min-width: 1400px) {
  .carousel-container {
    height: 420px;
  }

  .destination-title {
    font-size: 44px;
  }
}
</style>
